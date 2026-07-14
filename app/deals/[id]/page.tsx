export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { formatNGN, formatNGNCompact } from '@/lib/currency'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { DealCommitmentForm } from './DealCommitmentForm'
import { SharePanel } from '@/components/SharePanel'

const DEAL_TYPE_LABELS: Record<string, string> = {
  rehabilitation: 'Rehabilitation',
  ground_up:      'Ground-up build',
  off_plan:       'Off-plan',
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  coming_soon:  { label: 'Coming soon',  classes: 'bg-surface-info text-text-secondary' },
  open:         { label: 'Open',         classes: 'bg-teal-light text-teal' },
  funded:       { label: 'Funded',       classes: 'bg-navy text-white' },
  in_progress:  { label: 'In progress',  classes: 'bg-amber text-amber-text' },
  completed:    { label: 'Completed',    classes: 'bg-teal text-white' },
  cancelled:    { label: 'Cancelled',    classes: 'bg-surface-info text-text-muted' },
}

const MILESTONE_STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  upcoming:    { dot: 'bg-border',      label: 'Upcoming' },
  in_progress: { dot: 'bg-amber-text',  label: 'In progress' },
  completed:   { dot: 'bg-teal',        label: 'Completed' },
  delayed:     { dot: 'bg-red-400',     label: 'Delayed' },
}

type PageProps = { params: Promise<{ id: string }> }

export default async function DealPage({ params }: PageProps) {
  const { id } = await params

  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      commitments: {
        where:   { status: { notIn: ['withdrawn', 'refunded'] } },
        select:  { amount: true },
        orderBy: { createdAt: 'asc' },
      },
      milestones: {
        orderBy: { sortOrder: 'asc' },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!deal) notFound()

  const totalCommitted = deal.commitments.reduce((sum, c) => sum + Number(c.amount), 0)
  const targetRaise    = Number(deal.targetRaise)
  const minCommitment  = Number(deal.minCommitment)
  const pct            = targetRaise > 0 ? Math.min(100, Math.round((totalCommitted / targetRaise) * 100)) : 0
  const statusCfg      = STATUS_CONFIG[deal.status] ?? { label: deal.status, classes: 'bg-surface-info text-text-secondary' }
  const own2getherPct  = 100 - Number(deal.investorProfitSplitPct)

  return (
    <>
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <Link
          href="/deals"
          className="text-teal text-sm font-medium hover:text-teal-dark transition-colors mb-6 inline-block"
        >
          ← All deals
        </Link>

        {/* Deal header */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          {/* Hero image */}
          <div className="lg:col-span-3">
            {deal.photos.length > 0 ? (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden h-64 relative bg-surface-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={deal.photos[0]}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-3">
                    <span className="text-white/90 text-sm font-medium bg-black/40 rounded px-3 py-1 backdrop-blur-sm">
                      {deal.location}
                    </span>
                    <span className={`font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded ${statusCfg.classes}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
                {deal.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-0.5">
                    {deal.photos.slice(1).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="h-16 w-24 object-cover rounded flex-shrink-0 border border-border" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg h-64 relative bg-gradient-to-br from-navy to-teal-dark flex items-end">
                <div className="w-full flex items-end justify-between px-4 pb-3">
                  <span className="text-white/90 text-sm font-medium bg-black/30 rounded px-3 py-1 backdrop-blur-sm">
                    {deal.location}
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
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-semibold text-teal bg-teal/10 border border-teal/20 rounded px-2 py-0.5 uppercase tracking-wide">
                {DEAL_TYPE_LABELS[deal.dealType] ?? deal.dealType}
              </span>
              <SharePanel title={deal.title} location={deal.location} type="deal" />
            </div>
            <h1 className="text-2xl font-bold text-navy leading-tight mb-3">{deal.title}</h1>
            <div className="font-mono text-3xl font-semibold text-navy">
              {formatNGNCompact(targetRaise)}
            </div>
            <p className="text-xs text-text-muted mt-0.5 mb-5">Target raise</p>

            {deal.status !== 'coming_soon' && (
              <>
                <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                  <span className="font-semibold">{pct}% funded</span>
                  <span className="text-text-muted">{deal.commitments.length} investor{deal.commitments.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full origin-left animate-progress"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {deal.projectedReturnPct != null && (
                <div className="bg-teal/5 border border-teal/20 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Proj. return</p>
                  <p className="text-lg font-bold text-teal mt-0.5">+{Number(deal.projectedReturnPct).toFixed(0)}%</p>
                </div>
              )}
              {deal.projectedDurationMonths != null && (
                <div className="bg-surface-raised border border-border rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Timeline</p>
                  <p className="text-lg font-bold text-navy mt-0.5">{deal.projectedDurationMonths}mo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left */}
          <div className="lg:col-span-3 space-y-10">

            {/* Description */}
            {deal.description && (
              <section>
                <h2 className="text-[15px] font-semibold text-navy mb-3">About this deal</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {deal.description}
                </p>
              </section>
            )}

            {/* Return structure */}
            <section>
              <h2 className="text-[15px] font-semibold text-navy mb-3">Return structure</h2>
              <div className="border border-border rounded-lg overflow-hidden text-sm">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-text-secondary">Target raise</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-navy">
                        {formatNGN(targetRaise)}
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-text-secondary">
                        Investor profit share
                        <span className="ml-1.5 text-text-muted text-xs">{Number(deal.investorProfitSplitPct).toFixed(0)}%</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-teal text-sm">
                        {Number(deal.investorProfitSplitPct).toFixed(0)}% of net profit
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-text-secondary">
                        Own2gether share
                        <span className="ml-1.5 text-text-muted text-xs">{own2getherPct.toFixed(0)}%</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-secondary">
                        {own2getherPct.toFixed(0)}% of net profit
                      </td>
                    </tr>
                    {deal.minCommitment && (
                      <tr>
                        <td className="px-4 py-3 text-text-secondary">Minimum commitment</td>
                        <td className="px-4 py-3 text-right font-mono text-text-secondary">
                          {formatNGN(minCommitment)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Investors recover their full capital first. Net profit (proceeds minus total project cost)
                is then split {Number(deal.investorProfitSplitPct).toFixed(0)}% to investors
                (proportional to each investor&apos;s share of the raise) and {own2getherPct.toFixed(0)}% to
                Own2gether as the deal and technical partner.
              </p>
            </section>

            {/* Milestones */}
            {deal.milestones.length > 0 && (
              <section>
                <h2 className="text-[15px] font-semibold text-navy mb-4">Project milestones</h2>
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-6">
                    {deal.milestones.map(m => {
                      const cfg = MILESTONE_STATUS_CONFIG[m.status] ?? { dot: 'bg-border', label: m.status }
                      return (
                        <div key={m.id} className="relative">
                          <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-navy">{m.title}</p>
                              <span className="text-[10px] font-medium text-text-muted capitalize">{cfg.label}</span>
                            </div>
                            {m.description && (
                              <p className="text-xs text-text-secondary leading-relaxed">{m.description}</p>
                            )}
                            {m.targetDate && (
                              <p className="text-[11px] text-text-muted mt-1">
                                Target: {new Date(m.targetDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                              </p>
                            )}
                            {m.completedAt && (
                              <p className="text-[11px] text-teal mt-0.5">
                                Completed: {new Date(m.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Documents */}
            {deal.documents.length > 0 && (
              <section>
                <h2 className="text-[15px] font-semibold text-navy mb-3">Deal documents</h2>
                <div className="space-y-2">
                  {deal.documents.map((url, i) => {
                    const name = url.split('/').pop() ?? `Document ${i + 1}`
                    return (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 text-sm text-navy hover:border-teal/40 hover:bg-teal/5 transition-colors"
                      >
                        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true">
                          <path d="M4 4h8l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                          <path d="M12 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        <span className="truncate">{decodeURIComponent(name)}</span>
                        <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 text-text-muted shrink-0 ml-auto" aria-hidden="true">
                          <path d="M5 15L15 5M15 5H8M15 5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Updates */}
            {deal.updates.length > 0 && (
              <section>
                <h2 className="text-[15px] font-semibold text-navy mb-4">Project updates</h2>
                <div className="space-y-4">
                  {deal.updates.map(u => (
                    <div key={u.id} className="border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-navy">{u.title}</p>
                        <span className="text-[11px] text-text-muted whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{u.body}</p>
                      {u.photoUrls.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto">
                          {u.photoUrls.map((src, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={src} alt="" className="h-20 w-28 object-cover rounded border border-border shrink-0" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Disclosures */}
            <section className="text-xs text-text-muted space-y-2.5 pt-4 border-t border-border">
              <p>
                <span className="font-medium text-text-secondary">Risk: </span>
                Property development carries significant risk. Projected returns are estimates only and
                not guaranteed. The value of your investment can fall as well as rise. You may lose some
                or all of your committed capital. This is not financial advice.
              </p>
              <p>
                <span className="font-medium text-text-secondary">Profit split: </span>
                {Number(deal.investorProfitSplitPct).toFixed(0)}% of net proceeds (after return of capital
                and project costs) are distributed to investors in proportion to their share of the raise.
                Own2gether receives the remaining {own2getherPct.toFixed(0)}%.
              </p>
              <p>
                <span className="font-medium text-text-secondary">Capital lock-up: </span>
                Committed capital is deployed on project commencement and cannot be withdrawn once the
                deal moves to &apos;In progress&apos; status. Only invest funds you can commit for the full
                projected duration.
              </p>
              <p>
                <span className="font-medium text-text-secondary">Commitment: </span>
                Submitting this form is a non-binding expression of interest. A binding commitment arises
                only when allocation is confirmed in writing by Own2gether and payment is received.
              </p>
            </section>
          </div>

          {/* Right: commitment form */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <DealCommitmentForm
                dealId={deal.id}
                targetRaise={targetRaise}
                totalCommitted={totalCommitted}
                minCommitment={minCommitment}
                dealStatus={deal.status}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
