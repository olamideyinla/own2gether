import Link from 'next/link'
import { formatNGN } from '@/lib/currency'
import { makeCommitmentRef } from '@/lib/commitmentRef'
import type { CommitmentFlowData } from './types'

export function PaymentStep({ commitment }: { commitment: CommitmentFlowData }) {
  // Guard: allocation not yet confirmed
  if (!commitment.allocationConfirmedAt) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-navy">Payment</h1>
        <div className="bg-surface border border-border rounded-lg px-4 py-5 text-center text-sm text-text-muted">
          <p className="font-medium text-text-primary mb-1">Allocation not yet confirmed</p>
          <p>Payment instructions will appear here once allocation has been run.</p>
        </div>
        <Link
          href={`/commitments/${commitment.id}/flow?step=allocation`}
          className="inline-block text-sm text-text-muted underline underline-offset-2 hover:text-navy"
        >
          ← Back to allocation
        </Link>
      </div>
    )
  }

  const amountDue   = commitment.allocatedAmount ?? commitment.amount
  const refCode     = makeCommitmentRef(commitment.id)

  // Countdown computed at render time
  const now         = new Date()
  const dueAt       = commitment.paymentDueAt ? new Date(commitment.paymentDueAt) : null
  const msRemaining = dueAt ? dueAt.getTime() - now.getTime() : null
  const lapsed      = msRemaining !== null && msRemaining <= 0

  let countdownText = ''
  if (dueAt) {
    if (lapsed) {
      countdownText = 'Payment window has lapsed — contact Own2gether immediately.'
    } else if (msRemaining !== null) {
      const totalHours  = Math.floor(msRemaining / (1000 * 60 * 60))
      const daysLeft    = Math.floor(totalHours / 24)
      const hoursLeft   = totalHours % 24
      countdownText = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} remaining`
    }
  }

  const dueDateStr = dueAt
    ? dueAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy">Payment instructions</h1>
        <p className="text-sm text-text-muted mt-1">Transfer the amount below by bank transfer only.</p>
      </div>

      {/* Reference + amount */}
      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Reference code</span>
          <span className="font-mono font-semibold text-navy tracking-wider">{refCode}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Amount due</span>
          <span className="font-mono font-semibold text-navy">{formatNGN(amountDue)}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Payment due</span>
          <span className="font-medium text-text-primary">{dueDateStr}</span>
        </div>
        {countdownText && (
          <div className={`px-4 py-3 text-xs font-medium ${lapsed ? 'text-red-600 bg-red-50' : 'text-teal'}`}>
            {countdownText}
          </div>
        )}
      </div>

      {/* Payment instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 text-sm text-amber-800 space-y-2">
        <p className="font-semibold">Bank transfer only</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>Bank account details will be emailed to <strong>{commitment.profile.email}</strong>.</li>
          <li>Payment goes directly to the seller — no escrow, no card payments, no cash.</li>
          <li>Use the reference code <strong>{refCode}</strong> in your transfer description.</li>
        </ul>
      </div>

      <Link
        href={`/commitments/${commitment.id}/flow?step=status`}
        className="block w-full text-center bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors"
      >
        Continue to Status →
      </Link>
    </div>
  )
}
