export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { formatNGN } from '@/lib/currency'
import { makeCommitmentRef } from '@/lib/commitmentRef'
import { checkPaymentWindowExpiry } from '@/lib/allocation'
import { markCommitmentPaidFromRecon } from './actions'

type PageProps = {
  searchParams: Promise<{ paid?: string }>
}

export default async function ReconciliationPage({ searchParams }: PageProps) {
  const { paid } = await searchParams
  const now      = new Date()

  // All commitments that have gone through allocation — unpaid first, paid after
  const commitments = await db.commitment.findMany({
    where: {
      allocatedAmount: { not: null },
      status: { in: ['allocated', 'capped', 'paid'] },
    },
    orderBy: [
      // paid goes to the bottom; allocated/capped stay at top
      { paidAt:      { sort: 'asc', nulls: 'first' } },
      { paymentDueAt: 'asc' },
    ],
    include: {
      property: { select: { id: true, title: true } },
      profile:  { select: { name: true, email: true } },
    },
  })

  const unpaid = commitments.filter(c => c.status !== 'paid')
  const paid_  = commitments.filter(c => c.status === 'paid')

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold text-navy">Reconciliation</h1>
        <span className="text-xs text-text-muted">
          {unpaid.length} awaiting payment · {paid_.length} paid
        </span>
      </div>

      <p className="text-sm text-text-secondary">
        Match incoming bank transfers to the reference codes below. Use <strong>Mark paid</strong> once you confirm a transfer has cleared.
      </p>

      {paid && (
        <div className="border rounded px-4 py-2.5 text-sm font-medium bg-teal-light border-teal/20 text-teal">
          ✓ Commitment marked as paid.
        </div>
      )}

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-text-muted">
            <th className="pb-2 pr-3 font-medium">Ref code</th>
            <th className="pb-2 pr-3 font-medium">Property</th>
            <th className="pb-2 pr-3 font-medium">Name</th>
            <th className="pb-2 pr-3 font-medium">Email</th>
            <th className="pb-2 pr-3 font-medium text-right">Amount due</th>
            <th className="pb-2 pr-3 font-medium">Payment due</th>
            <th className="pb-2 pr-3 font-medium">State</th>
            <th className="pb-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {commitments.map((c) => {
            const ref     = makeCommitmentRef(c.id)
            const window  = checkPaymentWindowExpiry(c.allocationConfirmedAt, now)
            const isPaid  = c.status === 'paid'
            const isLapse = !isPaid && window.lapsed

            const boundMarkPaid = markCommitmentPaidFromRecon.bind(null, c.id)

            let stateLabel: string
            let stateCls: string
            if (isPaid) {
              stateLabel = 'paid'
              stateCls   = 'bg-green-50 text-green-700 border-green-200'
            } else if (isLapse) {
              stateLabel = 'lapsed'
              stateCls   = 'bg-red-50 text-red-700 border-red-200'
            } else {
              stateLabel = 'awaiting'
              stateCls   = 'bg-amber-50 text-amber-800 border-amber-200'
            }

            return (
              <tr
                key={c.id}
                className={`border-b border-border/40 ${isPaid ? 'opacity-50' : ''}`}
              >
                <td className="py-2.5 pr-3 font-mono font-semibold text-navy tracking-wider">
                  {ref}
                </td>
                <td className="py-2.5 pr-3">{c.property.title}</td>
                <td className="py-2.5 pr-3">{c.profile.name}</td>
                <td className="py-2.5 pr-3 text-text-secondary">{c.profile.email}</td>
                <td className="py-2.5 pr-3 text-right font-mono">
                  {formatNGN(Number(c.allocatedAmount))}
                </td>
                <td className={`py-2.5 pr-3 whitespace-nowrap ${isLapse ? 'text-red-600' : 'text-text-secondary'}`}>
                  {c.paymentDueAt
                    ? new Date(c.paymentDueAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : '—'}
                  {isLapse && ' ⚠'}
                </td>
                <td className="py-2.5 pr-3">
                  <span className={`inline-block text-xs px-1.5 py-0.5 rounded border font-mono ${stateCls}`}>
                    {stateLabel}
                  </span>
                </td>
                <td className="py-2.5">
                  {!isPaid && (
                    <form action={boundMarkPaid}>
                      <button
                        type="submit"
                        className="text-xs bg-teal text-white px-2 py-1 rounded hover:bg-teal/80 transition-colors"
                      >
                        Mark paid
                      </button>
                    </form>
                  )}
                  {isPaid && c.paidAt && (
                    <span className="text-text-muted">
                      {new Date(c.paidAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
          {commitments.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-text-muted">
                No allocated commitments yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {paid_.length > 0 && (
        <p className="text-xs text-text-muted">
          Paid entries are shown dimmed at the bottom of the table.
        </p>
      )}
    </div>
  )
}
