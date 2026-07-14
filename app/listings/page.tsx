export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { getFxRates, fxApproxLine, fxTimestampLabel } from '@/lib/fx'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PropertyCard, type PropertyCardData } from '@/components/PropertyCard'
import { FilterPills } from '@/components/FilterPills'

export const metadata: Metadata = {
  title: 'Property Listings | Own2gether',
  description:
    'Browse co-ownership opportunities for real Nigerian property. Pool your money with others to jointly own land and homes — no fund, no fees in cash.',
  openGraph: {
    title: 'Property Listings | Own2gether',
    description:
      'Browse co-ownership opportunities for real Nigerian property. Pool your money with others to jointly own land and homes — no fund, no fees in cash.',
    url: 'https://www.own2gether.com/listings',
  },
}

// ─── Filter helpers ────────────────────────────────────────────────────────────

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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ListingsPage({
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

  const [rates, properties] = await Promise.all([
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
  ])

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

  const openCount  = cards.filter((c) => c.status === 'open').length
  const totalCount = cards.length

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-6 mb-7 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-navy leading-tight">Listings</h1>
            <p className="text-text-muted text-[13px] mt-1">
              {openCount} open raise{openCount !== 1 ? 's' : ''} · {totalCount} total
            </p>
          </div>

          <Suspense fallback={<div className="h-9" />}>
            <FilterPills />
          </Suspense>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-sm mb-2">
              {priceParam || statusParam
                ? 'No listings match the selected filters.'
                : 'No listings are available right now.'}
            </p>
            <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
              Own2gether lists co-ownership opportunities for real Nigerian property — land, residential,
              and mixed-use. Check back soon or{' '}
              <a href="/#subscribe" className="text-teal underline underline-offset-2">
                subscribe
              </a>{' '}
              to be notified when new listings go live.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <p className="mt-10 text-[11px] text-disabled-text text-center">
          USD and GBP figures are indicative approximations ({fxTimestampLabel(rates)}).
          All transactions are in Nigerian naira (NGN).
        </p>
      </main>
      <Footer />
    </>
  )
}
