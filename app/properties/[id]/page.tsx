export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { getFxRates, fxApproxLine, fxConvert, fxTimestampLabel } from '@/lib/fx'
import { formatNGN, formatNGNCompact } from '@/lib/currency'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  rankEntries,
  computeAllocation,
  CO_OWNER_POOL_FRACTION,
  type CommitmentInput,
  type RankedEntry,
} from '@/lib/allocation'
import { CommitmentForm } from './CommitmentForm'
import { ShareButton } from './ShareButton'

// ─── Types ─────────────────────────────────────────────────────────────────────

type DisplayRow =
  | { kind: 'cutoff' }
  | { kind: 'entry'; entry: RankedEntry; rank: number; status: 'in-pool' | 'capped' | 'over' }

// ─── Helpers ───────────────────────────────────────────────────────────────────

const GRADIENTS = [
  'linear-gradient(135deg, #1a3a52 0%, #2E6F5E 100%)',
  'linear-gradient(135deg, #2E6F5E 0%, #1a3a52 100%)',
  'linear-gradient(135deg, #142235 0%, #2a5f4f 100%)',
]

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  open:            { label: 'Open',           classes: 'bg-teal-light text-teal' },
  fully_allocated: { label: 'Fully allocated', classes: 'bg-navy text-white' },
  closed:          { label: 'Closed',          classes: 'bg-surface-info text-text-secondary' },
  cancelled:       { label: 'Cancelled',       classes: 'bg-amber text-amber-text' },
}

function buildDisplayRows(ranked: RankedEntry[], coOwnerPool: Prisma.Decimal): DisplayRow[] {
  const rows: DisplayRow[] = []
  let running = new Prisma.Decimal(0)
  let cutoffInserted = false

  for (const [idx, entry] of ranked.entries()) {
    const prevRunning = running
    running = running.add(entry.totalAmount)

    const isOver         = prevRunning.gte(coOwnerPool)
    const crossesBoundary = !isOver && running.gt(coOwnerPool)
    const needsCutoff    = (isOver || crossesBoundary) && !cutoffInserted

    if (needsCutoff) {
      rows.push({ kind: 'cutoff' })
      cutoffInserted = true
    }

    const status: 'in-pool' | 'capped' | 'over' =
      isOver ? 'over' : crossesBoundary ? 'capped' : 'in-pool'

    rows.push({ kind: 'entry', entry, rank: idx + 1, status })
  }

  return rows
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [property, rates] = await Promise.all([
    db.property.findUnique({
      where: { id },
      include: {
        commitments: {
          where: { status: { notIn: ['withdrawn'] } },
          include: { profile: { select: { id: true, name: true } } },
          orderBy: { amount: 'desc' },
        },
      },
    }),
    getFxRates(),
  ])

  if (!property) notFound()

  // ── Derived values ──────────────────────────────────────────────────────────

  const totalRaise   = property.totalRaise
  const coOwnerPool  = new Prisma.Decimal(totalRaise).mul(CO_OWNER_POOL_FRACTION)
  const own2Pool     = new Prisma.Decimal(totalRaise).mul('0.025')
  const fxLine       = fxApproxLine(Number(totalRaise), rates)
  const { usd, gbp } = fxConvert(Number(totalRaise), rates)

  const totalCommitted = property.commitments.reduce(
    (sum, c) => sum.add(c.amount),
    new Prisma.Decimal(0),
  )
  const pct = Math.min(
    100,
    Math.round(Number(totalCommitted.div(totalRaise)) * 100),
  )

  // ── Allocation simulation (pure, no DB writes) ──────────────────────────────

  const commitmentInputs: CommitmentInput[] = property.commitments.map((c) => ({
    id:                c.id,
    profileId:         c.profileId,
    amount:            c.amount,
    connectionGroupId: c.connectionGroupId,
  }))

  const ranked       = rankEntries(commitmentInputs)
  const allocation   = computeAllocation(ranked, coOwnerPool)
  const displayRows  = buildDisplayRows(ranked, coOwnerPool)

  // ── Presentation config ─────────────────────────────────────────────────────

  const gradient  = GRADIENTS[id.charCodeAt(id.length - 1) % 3]
  const statusCfg = STATUS_CONFIG[property.status] ?? {
    label: property.status,
    classes: 'bg-surface-info text-text-secondary',
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <Link
          href="/properties"
          className="text-teal text-sm font-medium hover:text-teal-dark transition-colors mb-6 inline-block"
        >
          ← All properties
        </Link>

        {/* Property header ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          {/* Hero image / photos */}
          <div className="lg:col-span-3">
            {property.photos.length > 0 ? (
              <div className="space-y-2">
                {/* Primary photo */}
                <div className="rounded-lg overflow-hidden h-64 relative bg-surface-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-3">
                    <span className="text-white/90 text-sm font-medium bg-black/40 rounded px-3 py-1 backdrop-blur-sm">
                      {property.location}
                    </span>
                    <span className={`font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded ${statusCfg.classes}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
                {/* Thumbnail strip */}
                {property.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-0.5">
                    {property.photos.slice(1).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="h-16 w-24 object-cover rounded flex-shrink-0 border border-border"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="rounded-lg overflow-hidden h-64 relative"
                style={{ background: gradient }}
              >
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-3">
                  <span className="text-white/90 text-sm font-medium bg-black/30 rounded px-3 py-1 backdrop-blur-sm">
                    {property.location}
                  </span>
                  <span className={`font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded ${statusCfg.classes}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-navy leading-tight mb-3">
              {property.title}
            </h1>
            <div className="font-mono text-3xl font-semibold text-navy">
              {formatNGNCompact(Number(totalRaise))}
            </div>
            <div className="mt-0.5 mb-5">
              <span className="font-mono text-xs text-text-muted">{fxLine}</span>
              <span className="font-mono text-[10px] text-disabled-text ml-1.5">· {fxTimestampLabel(rates)}</span>
            </div>

            <div className="flex justify-between text-xs text-text-secondary mb-1.5">
              <span className="font-semibold">{pct}% committed</span>
              <span className="text-text-muted">
                {property.commitments.length} co-owner{property.commitments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full origin-left animate-progress"
                style={{ width: `${pct}%` }}
              />
            </div>

            {property.status === 'open' && (
              <div className="mt-4">
                <ShareButton title={property.title} location={property.location} />
              </div>
            )}
          </div>
        </div>

        {/* Body: two-column ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left column ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-10">

            {/* Description */}
            {property.description && (
              <section>
                <h2 className="text-[15px] font-semibold text-navy mb-3">About this property</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </section>
            )}

            {/* Videos */}
            {property.videos.length > 0 && (
              <section>
                <h2 className="text-[15px] font-semibold text-navy mb-3">Videos</h2>
                <div className="space-y-4">
                  {property.videos.map((src, i) => (
                    <video
                      key={i}
                      src={src}
                      controls
                      className="w-full rounded-lg border border-border bg-black"
                      preload="metadata"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Raise structure */}
            <section>
              <h2 className="text-[15px] font-semibold text-navy mb-3">Raise structure</h2>
              <div className="border border-border rounded-lg overflow-hidden text-sm">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-text-secondary">Total raise</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-semibold text-navy">
                          {formatNGN(Number(totalRaise))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-text-muted">
                        {usd} · {gbp}
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-text-secondary">
                        Co-owner pool
                        <span className="ml-1.5 text-text-muted text-xs">97.5%</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-secondary">
                        {formatNGN(Number(coOwnerPool))}
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-text-secondary">
                        Own2gether stake
                        <span className="ml-1.5 text-text-muted text-xs">2.5%</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-secondary">
                        {formatNGN(Number(own2Pool))}
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Co-owners collectively raise 100% of the funds and own 97.5% of the company.
                Own2gether receives the remaining 2.5% equity in lieu of management fees — no cash fees are charged.
                Your individual equity % is your contribution divided by the total raise, multiplied by 97.5%.
              </p>
            </section>

            {/* Commitment ranking */}
            <section>
              <h2 className="text-[15px] font-semibold text-navy mb-1">
                Commitments
                <span className="ml-2 text-text-muted font-normal text-sm">
                  {ranked.length} {ranked.length === 1 ? 'entry' : 'entries'}
                </span>
              </h2>
              <p className="text-xs text-text-muted mb-3">
                Entries are ranked largest-first. Connection groups rank by their combined total.
              </p>

              {ranked.length === 0 ? (
                <div className="border border-border rounded-lg px-4 py-8 text-center text-sm text-text-muted">
                  No commitments yet — be the first.
                </div>
              ) : (
                <>
                  <div className="border border-border rounded-lg overflow-hidden text-sm">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-surface-raised border-b border-border text-xs text-text-muted uppercase tracking-wide">
                          <th className="px-4 py-2.5 text-left font-medium w-8">#</th>
                          <th className="px-4 py-2.5 text-left font-medium">Commitment</th>
                          <th className="px-4 py-2.5 text-right font-medium">Equity*</th>
                          <th className="px-4 py-2.5 text-right font-medium">Pool</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayRows.map((row, i) => {
                          if (row.kind === 'cutoff') {
                            return (
                              <tr key={`cutoff-${i}`}>
                                <td
                                  colSpan={4}
                                  className="px-4 py-2 text-xs text-center font-medium text-amber-text bg-amber/10 border-y border-amber/20"
                                >
                                  — allocation pool full —
                                </td>
                              </tr>
                            )
                          }

                          const { entry, rank, status } = row
                          const memberLabel =
                            entry.members.length > 1
                              ? `Group · ${entry.members.length} co-owners`
                              : 'Co-owner'

                          const equityPct = entry.totalAmount
                            .div(totalRaise)
                            .mul(97.5)
                            .toFixed(1)

                          return (
                            <tr
                              key={entry.members[0].id}
                              className={[
                                'border-b border-border last:border-0',
                                status === 'over' ? 'opacity-40' : '',
                              ].join(' ')}
                            >
                              <td className="px-4 py-3 font-mono text-xs text-text-muted">{rank}</td>
                              <td className="px-4 py-3">
                                <div className="font-mono font-semibold text-navy">
                                  {formatNGNCompact(Number(entry.totalAmount))}
                                </div>
                                <div className="text-xs text-text-muted mt-0.5">{memberLabel}</div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-text-secondary">
                                {equityPct}%
                              </td>
                              <td className="px-4 py-3 text-right">
                                {status === 'in-pool' && (
                                  <span className="text-xs font-medium text-teal">In pool</span>
                                )}
                                {status === 'capped' && (
                                  <span className="text-xs font-medium text-amber-text">Partial</span>
                                )}
                                {status === 'over' && (
                                  <span className="text-xs text-text-muted">Over cap</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-text-muted mt-2">
                    * Equity % is each contributor&apos;s share of the 97.5% co-owner pool, after Own2gether&apos;s 2.5% management stake.
                  </p>

                  {/* Allocation guidance */}
                  {allocation.ownTwogetherResidualPct.gt(0) && (
                    <div className="mt-3 rounded px-4 py-3 bg-teal-light text-xs text-teal leading-relaxed">
                      <span className="font-semibold">
                        {allocation.ownTwogetherResidualPct.toFixed(2)}% of the co-owner pool
                      </span>{' '}
                      is currently unfilled. If the raise closes without filling this capacity,
                      Own2gether acquires the residual stake in lieu of additional management.
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Disclosures */}
            <section className="text-xs text-text-muted space-y-2.5 pt-4 border-t border-border">
              <p>
                <span className="font-medium text-text-secondary">Exchange rates: </span>
                USD and GBP figures are indicative approximations ({fxTimestampLabel(rates)}).
                All transactions are in Nigerian naira (NGN).
              </p>
              <p>
                <span className="font-medium text-text-secondary">Ranking: </span>
                Commitment entries are ranked by amount, largest first.
                Allocation is not final until the raise closes and Own2gether runs the allocation.
                The table above is a simulation of the current ranking for guidance only.
              </p>
              <p>
                <span className="font-medium text-text-secondary">Withdrawals: </span>
                Up to 3 withdrawals are permitted per profile across all properties.
                After the third withdrawal, a 12-month lockout period applies before further
                withdrawals are possible.
              </p>
              <p>
                <span className="font-medium text-text-secondary">Payment: </span>
                Allocated co-owners have 10 days from allocation confirmation to initiate
                a bank transfer. Late payment may result in forfeiture of the allocation.
              </p>
              <p>
                <span className="font-medium text-text-secondary">Right of first refusal: </span>
                If a co-owner wishes to sell their stake, existing co-owners in the same
                property company have the right of first refusal — the selling co-owner must
                offer the stake to fellow co-owners at the proposed price before approaching
                any external buyer.
              </p>
            </section>
          </div>

          {/* Right column: commitment form ──────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <CommitmentForm
                propertyId={property.id}
                totalRaise={Number(totalRaise)}
                propertyStatus={property.status}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
