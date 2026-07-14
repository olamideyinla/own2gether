import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { refreshFxCache } from '@/lib/fx'

/**
 * GET /api/cron/refresh-fx
 *
 * Fetches live NGN rates from open.er-api.com and writes the result to the
 * Postgres FxRateCache singleton, so subsequent page loads hit the warm cache.
 *
 * Invoked hourly by Vercel Cron (see vercel.json).
 * In production, Vercel sends `Authorization: Bearer <CRON_SECRET>`.
 * Set CRON_SECRET in your Vercel project environment variables.
 */
export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  // In production, always require the Vercel-supplied cron secret.
  // In development, allow unauthenticated calls for easy testing.
  if (process.env.NODE_ENV === 'production') {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── Refresh ─────────────────────────────────────────────────────────────────
  const refreshed = await refreshFxCache(db)

  return NextResponse.json({
    ok:        refreshed,
    timestamp: new Date().toISOString(),
    message:   refreshed
      ? 'FX cache refreshed successfully.'
      : 'Live fetch failed — Postgres cache unchanged. Existing cached rates remain in effect.',
  })
}
