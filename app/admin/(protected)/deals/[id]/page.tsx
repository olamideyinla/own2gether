export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { formatNGN, formatNGNCompact } from '@/lib/currency'
import {
  confirmDealCommitmentAction,
  markDealPaidAction,
  addMilestoneAction,
  updateMilestoneAction,
  postDealUpdateAction,
  updateDealAction,
} from './actions'

const STATUS_CLASSES: Record<string, string> = {
  coming_soon: 'bg-surface-info text-text-secondary',
  open:        'bg-teal-light text-teal',
  funded:      'bg-navy text-white',
  in_progress: 'bg-amber text-amber-text',
  completed:   'bg-teal text-white',
  cancelled:   'bg-surface-info text-text-muted',
}

const COMMITMENT_STATUS_CLASSES: Record<string, string> = {
  pending:           'text-text-muted',
  allocated:         'text-teal font-medium',
  payment_submitted: 'text-amber-text font-medium',
  paid:              'text-teal font-semibold',
  withdrawn:         'text-text-muted line-through',
  refunded:          'text-text-muted',
}

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }

export default async function AdminDealPage({ params, searchParams }: PageProps) {
  const { id }    = await params
  const sp        = await searchParams
  const flash     = sp.created ? 'Deal created.' : sp.updated ? 'Deal updated.' : null

  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      commitments: {
        orderBy: { createdAt: 'asc' },
        include: { profile: { select: { name: true, email: true } } },
      },
      milestones: { orderBy: { sortOrder: 'asc' } },
      updates:    { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!deal) notFound()

  const activeCommitments = deal.commitments.filter(c => !['withdrawn', 'refunded'].includes(c.status))
  const totalCommitted    = activeCommitments.reduce((s, c) => s + Number(c.amount), 0)
  const pct               = Number(deal.targetRaise) > 0
    ? Math.min(100, Math.round((totalCommitted / Number(deal.targetRaise)) * 100))
    : 0

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Flash */}
      {flash && (
        <div className="bg-teal/10 border border-teal/20 text-teal text-sm rounded-lg px-4 py-3">{flash}</div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/deals" className="text-xs text-text-muted hover:text-navy transition-colors">
            ← Deals
          </Link>
          <h1 className="text-lg font-bold text-navy mt-1">{deal.title}</h1>
          <p className="text-xs text-text-muted">{deal.location}</p>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded ${STATUS_CLASSES[deal.status] ?? ''}`}>
          {deal.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Target raise', value: formatNGNCompact(Number(deal.targetRaise)) },
          { label: 'Funded',       value: `${pct}% (${formatNGNCompact(totalCommitted)})` },
          { label: 'Investors',    value: String(activeCommitments.length) },
          { label: 'Profit split', value: `${Number(deal.investorProfitSplitPct).toFixed(0)}% / ${(100 - Number(deal.investorProfitSplitPct)).toFixed(0)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border rounded-xl px-4 py-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold text-navy mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick status change */}
      <section className="border border-border rounded-xl p-5">
        <h2 className="text-sm font-bold text-navy mb-3">Update deal status</h2>
        <form
          action={async (form: FormData) => {
            'use server'
            await updateDealAction(id, form)
          }}
          className="flex flex-wrap gap-2 items-center"
        >
          <select name="status" defaultValue={deal.status}
            className="border border-border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal">
            <option value="coming_soon">Coming soon</option>
            <option value="open">Open</option>
            <option value="funded">Funded</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button type="submit"
            className="bg-navy text-white text-xs font-semibold px-4 py-2 rounded hover:bg-navy/90 transition-colors">
            Save status
          </button>
        </form>
      </section>

      {/* Commitments */}
      <section>
        <h2 className="text-sm font-bold text-navy mb-3">
          Investor commitments
          <span className="ml-2 font-normal text-text-muted text-xs">{activeCommitments.length} active</span>
        </h2>
        {deal.commitments.length === 0 ? (
          <div className="border border-border rounded-xl p-6 text-sm text-text-muted text-center">No commitments yet.</div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-xs text-text-muted uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Investor</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {deal.commitments.map(c => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{c.profile.name}</p>
                      <p className="text-xs text-text-muted">{c.profile.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatNGN(Number(c.amount))}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${COMMITMENT_STATUS_CLASSES[c.status] ?? ''}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-text-muted">
                      {new Date(c.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {c.status === 'pending' && (
                          <form action={async () => { 'use server'; await confirmDealCommitmentAction(c.id) }}>
                            <button className="text-xs font-medium text-teal border border-teal/30 rounded px-2 py-1 hover:bg-teal/5">
                              Confirm
                            </button>
                          </form>
                        )}
                        {c.status === 'payment_submitted' && (
                          <form action={async () => { 'use server'; await markDealPaidAction(c.id) }}>
                            <button className="text-xs font-medium text-navy border border-navy/30 rounded px-2 py-1 hover:bg-navy/5">
                              Mark paid
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Milestones */}
      <section>
        <h2 className="text-sm font-bold text-navy mb-3">Milestones</h2>
        {deal.milestones.length > 0 && (
          <div className="border border-border rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-xs text-text-muted uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Target date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {deal.milestones.map(m => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-navy">{m.title}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {m.targetDate ? new Date(m.targetDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-xs capitalize text-text-secondary">{m.status.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {(['upcoming', 'in_progress', 'completed', 'delayed'] as const).map(s => (
                          <form key={s} action={async () => { 'use server'; await updateMilestoneAction(m.id, id, s) }}>
                            <button
                              type="submit"
                              className={`text-[10px] px-2 py-1 rounded border transition-colors ${m.status === s ? 'bg-navy text-white border-navy' : 'border-border text-text-muted hover:border-navy'}`}
                            >
                              {s.replace(/_/g, ' ')}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add milestone */}
        <form
          action={async (form: FormData) => { 'use server'; await addMilestoneAction(id, form) }}
          className="border border-border rounded-xl p-4 space-y-3"
        >
          <p className="text-xs font-semibold text-navy">Add milestone</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input name="title" type="text" required placeholder="Milestone title"
              className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal" />
            <input name="targetDate" type="month"
              className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal" />
            <input name="sortOrder" type="number" placeholder="Sort order (0, 1, 2…)"
              className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal" />
          </div>
          <textarea name="description" rows={2} placeholder="Optional description"
            className="w-full border border-border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-teal" />
          <button type="submit"
            className="bg-navy text-white text-xs font-semibold px-4 py-2 rounded hover:bg-navy/90 transition-colors">
            Add milestone
          </button>
        </form>
      </section>

      {/* Post update */}
      <section>
        <h2 className="text-sm font-bold text-navy mb-3">Post a project update</h2>
        <form
          action={async (form: FormData) => { 'use server'; await postDealUpdateAction(id, form) }}
          className="border border-border rounded-xl p-5 space-y-3"
        >
          <input name="title" type="text" required placeholder="Update headline"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal" />
          <textarea name="body" rows={4} required placeholder="Update body…"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-teal" />
          <div>
            <p className="text-xs text-text-muted mb-1.5">Photos (optional)</p>
            <input name="photos" type="file" multiple accept="image/*"
              className="w-full text-sm text-text-muted file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-raised file:text-navy" />
          </div>
          <button type="submit"
            className="bg-navy text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-navy/90 transition-colors">
            Post update
          </button>
        </form>

        {deal.updates.length > 0 && (
          <div className="mt-4 space-y-3">
            {deal.updates.map(u => (
              <div key={u.id} className="border border-border rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-navy">{u.title}</p>
                  <span className="text-[11px] text-text-muted">{new Date(u.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{u.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
