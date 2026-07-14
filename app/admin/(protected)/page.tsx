export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { formatNGN } from '@/lib/currency'

export default async function AdminDashboard() {
  const properties = await db.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      commitments: {
        where: { status: { notIn: ['withdrawn'] } },
        select: { amount: true, status: true },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-navy">Listings</h1>
        <Link
          href="/admin/listings/new"
          className="text-xs bg-navy text-white font-semibold px-3 py-1.5 rounded hover:bg-navy/90 transition-colors"
        >
          + New listing
        </Link>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs text-text-muted">
            <th className="pb-2 pr-4 font-medium">Title</th>
            <th className="pb-2 pr-4 font-medium">Location</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium text-right">Target</th>
            <th className="pb-2 pr-4 font-medium text-right">Committed</th>
            <th className="pb-2 pr-4 font-medium text-right">#</th>
            <th className="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => {
            const totalCommitted = p.commitments.reduce(
              (sum, c) => sum + Number(c.amount), 0
            )
            const paidCount  = p.commitments.filter(c => c.status === 'paid').length
            const totalCount = p.commitments.length

            return (
              <tr key={p.id} className="border-b border-border/50 hover:bg-white/50">
                <td className="py-2.5 pr-4 font-medium text-navy">{p.title}</td>
                <td className="py-2.5 pr-4 text-text-secondary">{p.location}</td>
                <td className="py-2.5 pr-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-text-secondary">
                  {formatNGN(Number(p.totalRaise))}
                </td>
                <td className="py-2.5 pr-4 text-right font-mono">
                  {formatNGN(totalCommitted)}
                  {' '}
                  <span className="text-text-muted text-xs">
                    ({((totalCommitted / Number(p.totalRaise)) * 100).toFixed(0)}%)
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right text-text-secondary">
                  {totalCount}
                  {paidCount > 0 && (
                    <span className="text-text-muted text-xs ml-1">({paidCount} paid)</span>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/admin/listings/${p.id}`}
                    className="text-xs text-navy underline underline-offset-2 hover:text-teal"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            )
          })}
          {properties.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-sm text-text-muted">
                No listings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open:             'bg-green-50 text-green-700 border-green-200',
    fully_allocated:  'bg-teal-light text-teal border-teal/20',
    closed:           'bg-surface-info text-text-secondary border-border',
    cancelled:        'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded border font-mono ${styles[status] ?? 'bg-surface border-border text-text-muted'}`}>
      {status}
    </span>
  )
}
