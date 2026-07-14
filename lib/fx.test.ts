import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { getFxRates, refreshFxCache } from './fx'

// ─── Mock DB helpers ──────────────────────────────────────────────────────────

type FxRow = { id: number; usdPerNgn: number; gbpPerNgn: number; fetchedAt: Date }

/**
 * Returns a minimal PrismaClient stub with only the fxRateCache methods.
 * All other Prisma methods are irrelevant to the FX module.
 */
function makeDb(cacheRow: FxRow | null, upsertResult?: FxRow): PrismaClient {
  const upserted = upsertResult ?? {
    id: 1, usdPerNgn: 0.000630, gbpPerNgn: 0.000495, fetchedAt: new Date(),
  }
  return {
    fxRateCache: {
      findUnique: vi.fn().mockResolvedValue(cacheRow),
      upsert:     vi.fn().mockResolvedValue(upserted),
    },
  } as unknown as PrismaClient
}

/** A cache row written 10 seconds ago — well within TTL. */
function freshRow(overrides?: Partial<FxRow>): FxRow {
  return {
    id:        1,
    usdPerNgn: 0.000625,
    gbpPerNgn: 0.000490,
    fetchedAt: new Date(Date.now() - 10_000),
    ...overrides,
  }
}

/** A cache row written 2 hours ago — past the 1-hour TTL. */
function staleRow(overrides?: Partial<FxRow>): FxRow {
  return {
    id:        1,
    usdPerNgn: 0.000600,
    gbpPerNgn: 0.000480,
    fetchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ...overrides,
  }
}

const LIVE_RESPONSE = {
  result: 'success',
  rates:  { USD: 0.000630, GBP: 0.000495 },
}

// ─── getFxRates ───────────────────────────────────────────────────────────────

describe('getFxRates', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns fresh cache without calling the API', async () => {
    const db    = makeDb(freshRow())
    const rates = await getFxRates(db)

    expect(rates.usdPerNgn).toBe(0.000625)
    expect(rates.gbpPerNgn).toBe(0.000490)
    expect(rates.isFallback).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not call upsert when cache is fresh', async () => {
    const db = makeDb(freshRow())
    await getFxRates(db)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((db.fxRateCache as any).upsert).not.toHaveBeenCalled()
  })

  it('fetches live and updates Postgres when cache is stale', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok:   true,
      json: () => Promise.resolve(LIVE_RESPONSE),
    } as Response)

    const db    = makeDb(staleRow())
    const rates = await getFxRates(db)

    expect(fetch).toHaveBeenCalledOnce()
    expect(rates.usdPerNgn).toBe(0.000630)  // from LIVE_RESPONSE
    expect(rates.isFallback).toBe(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((db.fxRateCache as any).upsert).toHaveBeenCalledOnce()
  })

  it('fetches live and updates Postgres when no cache row exists', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok:   true,
      json: () => Promise.resolve(LIVE_RESPONSE),
    } as Response)

    const db    = makeDb(null)
    const rates = await getFxRates(db)

    expect(fetch).toHaveBeenCalledOnce()
    expect(rates.usdPerNgn).toBe(0.000630)
    expect(rates.isFallback).toBe(false)
  })

  it('falls back to stale Postgres row when live fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    const db    = makeDb(staleRow())
    const rates = await getFxRates(db)

    expect(rates.usdPerNgn).toBe(0.000600)  // stale row values
    expect(rates.gbpPerNgn).toBe(0.000480)
    expect(rates.isFallback).toBe(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((db.fxRateCache as any).upsert).not.toHaveBeenCalled()
  })

  it('falls back to stale Postgres row when API returns non-success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok:   true,
      json: () => Promise.resolve({ result: 'error' }),
    } as Response)

    const db    = makeDb(staleRow())
    const rates = await getFxRates(db)

    expect(rates.usdPerNgn).toBe(0.000600)
    expect(rates.isFallback).toBe(true)
  })

  it('falls back to stale Postgres row when API returns a non-OK HTTP status', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    const db    = makeDb(staleRow())
    const rates = await getFxRates(db)

    expect(rates.isFallback).toBe(true)
    expect(rates.usdPerNgn).toBe(0.000600)
  })

  it('returns hardcoded fallback when no cache exists and live fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    const db    = makeDb(null)
    const rates = await getFxRates(db)

    // Hardcoded constants
    expect(rates.usdPerNgn).toBe(0.000625)
    expect(rates.gbpPerNgn).toBe(0.000490)
    expect(rates.isFallback).toBe(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((db.fxRateCache as any).upsert).not.toHaveBeenCalled()
  })

  it('sets isFallback=false on a fresh successful live fetch (no prior cache)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok:   true,
      json: () => Promise.resolve(LIVE_RESPONSE),
    } as Response)

    const db    = makeDb(null)
    const rates = await getFxRates(db)

    expect(rates.isFallback).toBe(false)
  })
})

// ─── refreshFxCache ───────────────────────────────────────────────────────────

describe('refreshFxCache', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns true and upserts cache on a successful live fetch', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok:   true,
      json: () => Promise.resolve(LIVE_RESPONSE),
    } as Response)

    const db     = makeDb(null)
    const result = await refreshFxCache(db)

    expect(result).toBe(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((db.fxRateCache as any).upsert).toHaveBeenCalledOnce()
  })

  it('returns false and does not upsert when live fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    const db     = makeDb(null)
    const result = await refreshFxCache(db)

    expect(result).toBe(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((db.fxRateCache as any).upsert).not.toHaveBeenCalled()
  })

  it('returns false and does not upsert when API returns a non-OK status', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    const db     = makeDb(null)
    const result = await refreshFxCache(db)

    expect(result).toBe(false)
  })

  it('returns false when API result field is not "success"', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok:   true,
      json: () => Promise.resolve({ result: 'error', rates: {} }),
    } as Response)

    const db     = makeDb(null)
    const result = await refreshFxCache(db)

    expect(result).toBe(false)
  })
})
