export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Prisma } from '@prisma/client'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getFxRates, fxApproxLine, fxTimestampLabel } from '@/lib/fx'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PropertyCard, type PropertyCardData } from '@/components/PropertyCard'
import { DealCard, type DealCardData } from '@/components/DealCard'
import { FilterPills } from '@/components/FilterPills'
import { SubscribeForm } from '@/components/SubscribeForm'
import { uniqueCities, formatCityList } from '@/lib/location'

export async function generateMetadata(): Promise<Metadata> {
  const properties = await db.property.findMany({
    where:  { status: { not: 'cancelled' } },
    select: { location: true },
  })
  const cities = uniqueCities(properties.map((p) => p.location))
  const geo = cities.length ? `${cities.join(', ')} and across Nigeria` : 'Nigeria'

  const description =
    `Fractional property ownership in ${geo}. Browse open raises to co-own real estate — pool funds with other local and diaspora investors, get registered shares in a property company, and co-invest in development deals. No fund, no cash fees.`

  return {
    title: 'Fractional Property Ownership in Nigeria — Co-Own Real Estate',
    description,
    keywords: [
      'fractional property ownership Nigeria',
      ...cities.map((c) => `fractional property ownership ${c}`),
      ...cities.map((c) => `co-own property in ${c}`),
    ],
    alternates: { canonical: '/' },
    openGraph: {
      title: 'Fractional Property Ownership in Nigeria — Co-Own Real Estate | Own2gether',
      description,
      url: 'https://www.own2gether.com',
    },
  }
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

type PriceWhere = {
  gte?: Prisma.Decimal
  lte?: Prisma.Decimal
}

function parsePriceFilter(value: string): PriceWhere {
  if (value === 'under-200m') return { lte: new Prisma.Decimal('200000000') }
  if (value === '200m-400m')  return { gte: new Prisma.Decimal('200000000'), lte: new Prisma.Decimal('400000000') }
  if (value === 'over-400m')  return { gte: new Prisma.Decimal('400000000') }
  return {}
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const priceParam  = typeof params.price  === 'string' ? params.price  : ''
  const statusParam = typeof params.status === 'string' ? params.status : ''

  const priceWhere = parsePriceFilter(priceParam)
  const where: Prisma.PropertyWhereInput = {
    ...(Object.keys(priceWhere).length ? { totalRaise: priceWhere } : {}),
    ...(statusParam === 'open' ? { status: 'open' } : {}),
  }

  const [rates, properties, rawDeals] = await Promise.all([
    getFxRates(),
    db.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        commitments: {
          where: { status: { notIn: ['withdrawn'] } },
          select: { amount: true },
        },
      },
    }),
    db.deal.findMany({
      where:   { status: { notIn: ['cancelled'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id:                      true,
        title:                   true,
        location:                true,
        photos:                  true,
        dealType:                true,
        status:                  true,
        targetRaise:             true,
        projectedReturnPct:      true,
        projectedDurationMonths: true,
        commitments: {
          where:  { status: { notIn: ['withdrawn', 'refunded'] } },
          select: { amount: true },
        },
      },
    }).catch(() => [] as {
      id: string; title: string; location: string; photos: string[]
      dealType: string; status: string; targetRaise: Prisma.Decimal
      projectedReturnPct: Prisma.Decimal | null; projectedDurationMonths: number | null
      commitments: { amount: Prisma.Decimal }[]
    }[]),
  ])

  // Listings
  const cards: PropertyCardData[] = properties.map((p) => {
    const totalCommitted = p.commitments.reduce(
      (sum, c) => sum.add(c.amount),
      new Prisma.Decimal(0),
    )
    return {
      id:              p.id,
      title:           p.title,
      location:        p.location,
      photos:          p.photos,
      totalRaise:      Number(p.totalRaise),
      fxLine:          fxApproxLine(Number(p.totalRaise), rates),
      fxTimestamp:     fxTimestampLabel(rates),
      status:          p.status,
      totalCommitted:  Number(totalCommitted),
      commitmentCount: p.commitments.length,
    }
  })

  // Deals
  const dealCards: DealCardData[] = rawDeals.map(d => ({
    id:                      d.id,
    title:                   d.title,
    location:                d.location,
    photos:                  d.photos,
    dealType:                d.dealType,
    status:                  d.status,
    targetRaise:             Number(d.targetRaise),
    projectedReturnPct:      d.projectedReturnPct != null ? Number(d.projectedReturnPct) : null,
    projectedDurationMonths: d.projectedDurationMonths,
    totalCommitted:          d.commitments.reduce((s, c) => s + Number(c.amount), 0),
  }))

  const openCount  = cards.filter((c) => c.status === 'open').length
  const totalCount = cards.length

  const cities = uniqueCities([
    ...properties.map((p) => p.location),
    ...rawDeals.map((d) => d.location),
  ])

  return (
    <>
      <Header />

      {/* Explainer strip */}
      <div className="bg-navy text-white/80 text-[13px] text-center py-2.5 px-4 font-medium tracking-tight">
        Pool your money. Co-own real property. No fund, no fees in cash.
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Page hero ── */}
        <div className="mb-10 max-w-3xl">
          <h1 className="text-[28px] sm:text-[34px] font-bold text-navy leading-tight tracking-tight">
            Co-own real property in Nigeria
          </h1>
          <p className="text-text-secondary text-[15px] mt-3 leading-relaxed">
            Own2gether lets local and diaspora investors pool funds to jointly buy
            real property through fractional co-ownership. Commit in naira, receive
            registered shares in a dedicated property company, and co-invest in
            development deals — no fund, no cash fees.
          </p>
          {cities.length > 0 && (
            <p className="text-text-muted text-[13px] mt-3">
              Currently raising in {formatCityList(cities)}.
            </p>
          )}
        </div>

        {/* ── Listings ── */}
        <div className="flex items-start justify-between gap-6 mb-7 flex-wrap">
          <div>
            <h2 className="text-[22px] font-bold text-navy leading-tight">Property listings</h2>
            <p className="text-text-muted text-[13px] mt-1">
              {openCount} open raise{openCount !== 1 ? 's' : ''} · {totalCount} total
            </p>
          </div>
          <Suspense fallback={<div className="h-9" />}>
            <FilterPills />
          </Suspense>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-24 text-text-muted text-sm">
            No listings match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <p className="mt-6 text-[11px] text-disabled-text text-center">
          USD and GBP figures are indicative approximations ({fxTimestampLabel(rates)}).
          All transactions are in Nigerian naira (NGN).
        </p>

        {/* ── Subscribe ── */}
        <section className="mt-16 pt-10 border-t border-border">
          <div className="max-w-2xl">
            <h2 className="text-[18px] font-bold text-navy mb-1">Stay updated</h2>
            <p className="text-text-muted text-[13px] mb-6">
              Get notified by email when new listings or deals are posted.
            </p>
            <SubscribeForm />
          </div>
        </section>

        {/* ── Deals ── */}
        <section className="mt-16 pt-10 border-t border-border">
          <div className="flex items-start justify-between gap-6 mb-7 flex-wrap">
            <div>
              <h2 className="text-[22px] font-bold text-navy leading-tight">Deals</h2>
              <p className="text-text-muted text-[13px] mt-1">
                Co-invest in development projects. 60% of profits go to investors.
              </p>
            </div>
            <Link
              href="/deals"
              className="text-sm font-medium text-teal hover:text-teal-dark transition-colors"
            >
              All deals →
            </Link>
          </div>

          {dealCards.length === 0 ? (
            <div className="border border-border rounded-xl p-10 text-center">
              <p className="text-sm font-semibold text-navy mb-2">Deals coming soon</p>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                Our first development deals are in preparation. Co-invest in rehabilitation,
                ground-up builds, and off-plan projects — 60% of net profits go to investors.
              </p>
              <Link
                href="/how-it-works#deals"
                className="mt-4 inline-block text-xs font-medium text-teal hover:underline"
              >
                Learn how deals work →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dealCards.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </>
  )
}
