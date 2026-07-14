export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { formatNGNCompact } from '@/lib/currency'

const STATUS_CLASSES: Record<string, string> = {
  coming_soon: 'bg-surface-info text-text-secondary',
  open:        'bg-teal-light text-teal',
  funded:      'bg-navy text-white',
  in_progress: 'bg-amber text-amber-text',
  completed:   'bg-teal text-white',
  cancelled:   'bg-surface-info text-text-muted',
}

const TYPE_LABELS: Record<string, string> = {
  rehabilitation: 'Rehab',
  ground_up:      'Ground-up',
  off_plan:       'Off-plan',
}

export default async function AdminDealsPage() {
  const deals = await db.deal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      commitments: {
        where:  { status: { notIn: ['withdrawn', 'refunded'] } },
        select: { amount: true, status: true },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-navy">Deals</h1>
          <p className="text-xs text-text-muted mt-0.5">{deals.length} total</p>
        </div>
        <Link
          href="/admin/deals/new"
          className="text-sm font-semibold text-white bg-navy rounded px-4 py-2 hover:bg-navy/90 transition-colors"
        >
          + New deal
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="border border-border rounded-xl p-10 text-center text-sm text-text-muted">
          No deals yet.{' '}
          <Link href="/admin/deals/new" className="text-teal hover:underline">
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-raised border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Deal</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Target</th>
                <th className="px-5 py-3 text-right">Funded</th>
                <th className="px-5 py-3 text-right">Investors</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {deals.map(d => {
                const totalCommitted = d.commitments.reduce((s, c) => s + Number(c.amount), 0)
                const pct = Number(d.targetRaise) > 0
                  ? Math.min(100, Math.round((totalCommitted / Number(d.targetRaise)) * 100))
                  : 0
                const paid = d.commitments.filter(c => c.status === 'paid').length

                return (
                  <tr key={d.id} className="border-t border-border hover:bg-surface-raised/50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-navy">{d.title}</p>
                      <p className="text-xs text-text-muted">{d.location}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-muted">
                      {TYPE_LABELS[d.dealType] ?? d.dealType}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${STATUS_CLASSES[d.status] ?? ''}`}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-text-secondary text-xs">
                      {formatNGNCompact(Number(d.targetRaise))}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs">
                      <span className="font-semibold text-navy">{pct}%</span>
                      <span className="text-text-muted ml-1">({formatNGNCompact(totalCommitted)})</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-text-secondary">
                      {d.commitments.length}
                      {paid > 0 && <span className="text-teal ml-1">· {paid} paid</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/deals/${d.id}`}
                        className="text-xs font-medium text-teal hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
