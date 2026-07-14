import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendListingNotification, sendDealNotification } from '@/lib/email'

/**
 * GET /api/cron/notify-subscribers
 *
 * Finds listings and deals created 60+ minutes ago that have not yet triggered
 * subscriber notifications, sends emails to opted-in subscribers, then marks
 * each item as notified.
 *
 * Invoked every 30 minutes by Vercel Cron (see vercel.json).
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const cutoff = new Date(Date.now() - 60 * 60 * 1000) // 60 minutes ago

  // Find pending listings
  const listings = await db.property.findMany({
    where: {
      subscriberNotifiedAt: null,
      createdAt: { lte: cutoff },
      status: { not: 'cancelled' },
    },
    select: { id: true, title: true, location: true, totalRaise: true },
  })

  // Find pending deals
  const deals = await db.deal.findMany({
    where: {
      subscriberNotifiedAt: null,
      createdAt: { lte: cutoff },
      status: { not: 'cancelled' },
    },
    select: {
      id: true, title: true, location: true, dealType: true,
      targetRaise: true, projectedReturnPct: true, projectedDurationMonths: true,
    },
  })

  if (listings.length === 0 && deals.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // Subscribers for listings
  const listingSubscribers = listings.length > 0
    ? await db.subscriber.findMany({ where: { subscribeListings: true } })
    : []

  // Subscribers for deals
  const dealSubscribers = deals.length > 0
    ? await db.subscriber.findMany({ where: { subscribeDeals: true } })
    : []

  let sent = 0

  // Send listing notifications
  for (const listing of listings) {
    await Promise.allSettled(
      listingSubscribers.map(sub =>
        sendListingNotification({
          to:      sub.email,
          name:    sub.name,
          token:   sub.unsubscribeToken,
          listing: {
            id:         listing.id,
            title:      listing.title,
            location:   listing.location,
            totalRaise: Number(listing.totalRaise),
          },
        })
      )
    )
    sent += listingSubscribers.length
    await db.property.update({
      where: { id: listing.id },
      data:  { subscriberNotifiedAt: new Date() },
    })
  }

  // Send deal notifications
  for (const deal of deals) {
    await Promise.allSettled(
      dealSubscribers.map(sub =>
        sendDealNotification({
          to:    sub.email,
          name:  sub.name,
          token: sub.unsubscribeToken,
          deal: {
            id:                      deal.id,
            title:                   deal.title,
            location:                deal.location,
            dealType:                deal.dealType,
            targetRaise:             Number(deal.targetRaise),
            projectedReturnPct:      deal.projectedReturnPct != null ? Number(deal.projectedReturnPct) : null,
            projectedDurationMonths: deal.projectedDurationMonths,
          },
        })
      )
    )
    sent += dealSubscribers.length
    await db.deal.update({
      where: { id: deal.id },
      data:  { subscriberNotifiedAt: new Date() },
    })
  }

  return NextResponse.json({
    ok:       true,
    sent,
    listings: listings.length,
    deals:    deals.length,
  })
}
