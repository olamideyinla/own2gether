export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { formatNGN } from '@/lib/currency'
import { checkPaymentWindowExpiry } from '@/lib/allocation'

export default async function LapsedPage() {
  const now = new Date()

  // Fetch allocated/capped commitments that have allocationConfirmedAt set
  const candidates = await db.commitment.findMany({
    where: {
      allocationConfirmedAt: { not: null },
      status: { in: ['allocated', 'capped'] },
    },
    orderBy: { paymentDueAt: 'asc' },
    include: {
      property: { select: { id: true, title: true } },
      profile:  { select: { name: true, email: true } },
    },
  })

  // Filter to only lapsed ones using the allocation engine's pure function
  const lapsed = candidates
    .map((c) => ({
      ...c,
      window: checkPaymentWindowExpiry(c.allocationConfirmedAt, now),
    }))
    .filter((c) => c.window.lapsed)

  // Days overdue per entry
  function daysOverdue(paymentDueAt: Date | null): number {
    if (!paymentDueAt) return 0
    return Math.floor((now.getTime() - paymentDueAt.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold text-navy">Lapsed payment windows</h1>
        {lapsed.length > 0 && (
          <span className="text-xs font-medium bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5">
            {lapsed.length} overdue
          </span>
        )}
      </div>

      <p className="text-sm text-text-secondary">
        Commitments whose 10-day payment window has passed. Do not auto-withdraw — contact the co-owner to arrange payment or discuss next steps.
      </p>

      {lapsed.length === 0 ? (
        <p className="text-sm text-text-muted py-4">No lapsed payment windows.</p>
      ) : (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="pb-2 pr-3 font-medium">Property</th>
              <th className="pb-2 pr-3 font-medium">Name</th>
              <th className="pb-2 pr-3 font-medium">Email</th>
              <th className="pb-2 pr-3 font-medium text-right">Allocated</th>
              <th className="pb-2 pr-3 font-medium">Status</th>
              <th className="pb-2 pr-3 font-medium">Due date</th>
              <th className="pb-2 pr-3 font-medium text-right">Days overdue</th>
              <th className="pb-2 font-medium">Links</th>
            </tr>
          </thead>
          <tbody>
            {lapsed.map((c) => {
              const overdue = daysOverdue(c.paymentDueAt)
              return (
                <tr key={c.id} className="border-b border-border/40">
                  <td className="py-2.5 pr-3 font-medium text-navy">
                    <Link
                      href={`/admin/listings/${c.property.id}`}
                      className="underline underline-offset-1 hover:text-teal"
                    >
                      {c.property.title}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3">{c.profile.name}</td>
                  <td className="py-2.5 pr-3 text-text-secondary">{c.profile.email}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">
                    {c.allocatedAmount ? formatNGN(Number(c.allocatedAmount)) : '—'}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-text-secondary">{c.status}</td>
                  <td className="py-2.5 pr-3 text-red-600 whitespace-nowrap">
                    {c.paymentDueAt
                      ? new Date(c.paymentDueAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-red-600 font-medium">
                    {overdue}d
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/listings/${c.property.id}`}
                        className="text-navy underline underline-offset-1 hover:text-teal"
                      >
                        property
                      </Link>
                      <Link
                        href={`/commitments/${c.id}/flow?step=payment`}
                        className="text-text-muted underline underline-offset-1 hover:text-navy"
                        target="_blank"
                      >
                        flow ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
