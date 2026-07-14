import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const email    = typeof body.email    === 'string' ? body.email.trim().toLowerCase() : ''
  const name     = typeof body.name     === 'string' ? body.name.trim() || null : null
  const listings = body.listings !== false
  const deals    = body.deals    !== false

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }
  if (!listings && !deals) {
    return NextResponse.json({ error: 'Please select at least one notification type.' }, { status: 400 })
  }

  await db.subscriber.upsert({
    where:  { email },
    create: { email, name, subscribeListings: listings, subscribeDeals: deals },
    update: { name: name ?? undefined, subscribeListings: listings, subscribeDeals: deals },
  })

  return NextResponse.json({ ok: true })
}
