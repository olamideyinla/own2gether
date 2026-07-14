/**
 * Live NGN → USD / GBP exchange rates with Postgres-backed caching.
 *
 * Cache strategy (multi-instance safe):
 *  1. Check Postgres singleton row (FxRateCache id=1). If < 1 h old → return it.
 *  2. Cache stale or missing → attempt live fetch from open.er-api.com.
 *  3. Live fetch succeeds → upsert Postgres row, return fresh rates.
 *  4. Live fetch fails, stale row exists → return stale row, isFallback=true.
 *  5. Live fetch fails, no row at all → return hardcoded indicative rates, isFallback=true.
 *
 * The hourly cron at /api/cron/refresh-fx calls refreshFxCache() so page loads
 * are rarely the trigger for a network fetch.
 *
 * Rates are informational only — never used in transactions (PRD 5.5).
 */

import { db as defaultDb } from '@/lib/db'
import type { PrismaClient } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FxRates = {
  usdPerNgn:  number
  gbpPerNgn:  number
  /** ISO timestamp: when this rate was last successfully fetched from the API. */
  fetchedAt:  string
  /** True when serving stale Postgres data or hardcoded fallback. */
  isFallback: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000  // 1 hour
const CACHE_ROW_ID = 1

/** Last-resort rates used only when Postgres has no row at all. */
const HARDCODED_FALLBACK = {
  usdPerNgn: 0.000625,  // 1 USD ≈ 1,600 NGN
  gbpPerNgn: 0.000490,  // 1 GBP ≈ 2,040 NGN
} as const

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns current NGN FX rates from the Postgres cache, refreshing if stale.
 * Accepts an optional PrismaClient for dependency injection in tests.
 */
export async function getFxRates(prisma: PrismaClient = defaultDb): Promise<FxRates> {
  // 1. Try Postgres cache
  const cached = await prisma.fxRateCache.findUnique({ where: { id: CACHE_ROW_ID } })

  if (cached) {
    const ageMs = Date.now() - cached.fetchedAt.getTime()
    if (ageMs < CACHE_TTL_MS) {
      return toRates(cached, false)
    }
  }

  // 2. Cache stale or absent → try live fetch
  const live = await fetchLiveRates()
  if (live) {
    const row = await prisma.fxRateCache.upsert({
      where:  { id: CACHE_ROW_ID },
      update: { usdPerNgn: live.usdPerNgn, gbpPerNgn: live.gbpPerNgn, fetchedAt: live.fetchedAt },
      create: { id: CACHE_ROW_ID, usdPerNgn: live.usdPerNgn, gbpPerNgn: live.gbpPerNgn, fetchedAt: live.fetchedAt },
    })
    return toRates(row, false)
  }

  // 3. Live fetch failed — serve stale Postgres row if one exists
  if (cached) {
    return toRates(cached, true)
  }

  // 4. Absolutely nothing — serve hardcoded rates
  return {
    ...HARDCODED_FALLBACK,
    fetchedAt:  new Date().toISOString(),
    isFallback: true,
  }
}

/**
 * Fetches live rates unconditionally and writes to Postgres.
 * Called by the hourly cron route (/api/cron/refresh-fx) to warm the cache
 * so page loads don't trigger network fetches.
 * Returns true on success, false if the live fetch failed.
 */
export async function refreshFxCache(prisma: PrismaClient = defaultDb): Promise<boolean> {
  const live = await fetchLiveRates()
  if (!live) return false
  await prisma.fxRateCache.upsert({
    where:  { id: CACHE_ROW_ID },
    update: { usdPerNgn: live.usdPerNgn, gbpPerNgn: live.gbpPerNgn, fetchedAt: live.fetchedAt },
    create: { id: CACHE_ROW_ID, usdPerNgn: live.usdPerNgn, gbpPerNgn: live.gbpPerNgn, fetchedAt: live.fetchedAt },
  })
  return true
}

// ─── Display helpers ──────────────────────────────────────────────────────────

const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
})
const fmtGBP = new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
})

export function fxConvert(
  ngnAmount: number,
  rates: FxRates,
): { usd: string; gbp: string } {
  return {
    usd: fmtUSD.format(ngnAmount * rates.usdPerNgn),
    gbp: fmtGBP.format(ngnAmount * rates.gbpPerNgn),
  }
}

/** Returns a compact secondary line: "≈ $125,000 · £100,000" */
export function fxApproxLine(ngnAmount: number, rates: FxRates): string {
  const { usd, gbp } = fxConvert(ngnAmount, rates)
  return `≈ ${usd} · ${gbp}`
}

/**
 * Returns a compact label for display next to FX figures.
 *   fresh:    "rate as of 09:14 UTC"          (same day)
 *   fresh:    "rate as of 29 Jun, 09:14 UTC"  (older day)
 *   fallback: "indicative rate"
 */
export function fxTimestampLabel(rates: FxRates): string {
  if (rates.isFallback) return 'indicative rate'

  const d    = new Date(rates.fetchedAt)
  const now  = new Date()
  const time = d.toLocaleTimeString('en-GB', {
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'UTC',
    hour12:   false,
  })

  const sameDay =
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth()    === now.getUTCMonth()    &&
    d.getUTCDate()     === now.getUTCDate()

  if (sameDay) return `rate as of ${time} UTC`

  const dateStr = d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', timeZone: 'UTC',
  })
  return `rate as of ${dateStr}, ${time} UTC`
}

// ─── Internal ─────────────────────────────────────────────────────────────────

type LiveResult = { usdPerNgn: number; gbpPerNgn: number; fetchedAt: Date }

async function fetchLiveRates(): Promise<LiveResult | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/NGN', {
      cache: 'no-store',  // Postgres is our cache; bypass Next.js data-cache
    })
    if (!res.ok) return null

    const data = await res.json() as {
      result:                string
      rates?:                Record<string, number>
    }

    if (data.result !== 'success' || !data.rates?.USD || !data.rates?.GBP) {
      return null
    }

    return {
      usdPerNgn: data.rates.USD,
      gbpPerNgn: data.rates.GBP,
      fetchedAt: new Date(),
    }
  } catch {
    return null
  }
}

function toRates(
  row: { usdPerNgn: number; gbpPerNgn: number; fetchedAt: Date },
  isFallback: boolean,
): FxRates {
  return {
    usdPerNgn:  row.usdPerNgn,
    gbpPerNgn:  row.gbpPerNgn,
    fetchedAt:  row.fetchedAt.toISOString(),
    isFallback,
  }
}
