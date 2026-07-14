export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { DealCard, type DealCardData } from '@/components/DealCard'

export const metadata: Metadata = {
  title: 'Development Deals | Own2gether',
  description:
    'Co-invest in Nigerian property development and rehabilitation projects. Pool capital with other investors and share 60% of net profits on exit.',
  openGraph: {
    title: 'Development Deals | Own2gether',
    description:
      'Co-invest in Nigerian property development and rehabilitation projects. Pool capital with other investors and share 60% of net profits on exit.',
    url: 'https://www.own2gether.com/deals',
  },
}

const TYPE_LABELS: Record<string, string> = {
  rehabilitation: 'Rehabilitation',
  ground_up:      'Ground-up build',
  off_plan:       'Off-plan',
}

export default async function DealsPage() {
  const deals = await db.deal.findMany({
    where:   { status: { not: 'cancelled' } },
    orderBy: { createdAt: 'desc' },
    include: {
      commitments: {
        where:  { status: { notIn: ['withdrawn', 'refunded'] } },
        select: { amount: true },
      },
    },
  })

  const cards: DealCardData[] = deals.map(d => ({
    id:                      d.id,
    title:                   d.title,
    location:                d.location,
    photos:                  d.photos,
    dealType:                d.dealType,
    status:                  d.status,
    targetRaise:             Number(d.targetRaise),
    projectedReturnPct:      d.projectedReturnPct ? Number(d.projectedReturnPct) : null,
    projectedDurationMonths: d.projectedDurationMonths,
    totalCommitted:          d.commitments.reduce((sum, c) => sum + Number(c.amount), 0),
  }))

  const openCount = cards.filter(d => d.status === 'open').length

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-teal text-xs font-semibold uppercase tracking-widest mb-3">Deals</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Development joint ventures
          </h1>
          <p className="text-white/70 text-base max-w-2xl leading-relaxed">
            Pool capital with other investors to fund property development and rehabilitation projects.
            Own2gether manages the deal end-to-end; investors share <strong className="text-white">60%</strong> of
            the net profit on exit.
          </p>
        </div>
      </section>

      {/* How Deals differ from Listings */}
      <div className="bg-surface-raised border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            {[
              { icon: '🏗️', label: 'Development focus', detail: 'Rehabilitation, ground-up builds, and off-plan acquisitions — not ready-made properties.' },
              { icon: '📈', label: '60 / 40 profit split', detail: 'Investors receive 60% of net proceeds on exit. Own2gether earns 40% as the technical and deal partner.' },
              { icon: '🗓️', label: 'Milestone-driven', detail: 'Funds are deployed in stages. Track progress through defined project milestones.' },
            ].map(({ icon, label, detail }) => (
              <div key={label} className="flex gap-3">
                <span className="text-xl shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-navy text-xs">{label}</p>
                  <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-[22px] font-bold text-navy leading-tight">All deals</h2>
            <p className="text-text-muted text-[13px] mt-1">
              {openCount} open · {cards.length} total
            </p>
          </div>
          {/* Type filter pills */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const count = cards.filter(d => d.dealType === key).length
              if (count === 0) return null
              return (
                <span
                  key={key}
                  className="text-[11px] font-medium text-text-muted bg-surface-raised border border-border rounded-full px-3 py-1"
                >
                  {label} · {count}
                </span>
              )
            })}
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-xl">
            <p className="text-text-muted text-sm mb-2">No deals are currently active.</p>
            <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
              Own2gether periodically opens co-investment opportunities in Nigerian property development.{' '}
              <a href="/#subscribe" className="text-teal underline underline-offset-2">
                Subscribe
              </a>{' '}
              to be notified when the next deal launches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
