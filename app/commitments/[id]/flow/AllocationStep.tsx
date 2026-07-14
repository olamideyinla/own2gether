import Link from 'next/link'
import { formatNGN } from '@/lib/currency'
import type { CommitmentFlowData } from './types'

export function AllocationStep({ commitment }: { commitment: CommitmentFlowData }) {
  const { property } = commitment

  // ── Withdrawn ───────────────────────────────────────────────────────────────
  if (commitment.status === 'withdrawn') {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-navy">Allocation</h1>
        <div className="bg-surface border border-border rounded-lg px-4 py-4 text-sm text-text-muted">
          This commitment was withdrawn.
        </div>
      </div>
    )
  }

  // ── Paid ────────────────────────────────────────────────────────────────────
  if (commitment.status === 'paid') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-navy">Allocation</h1>
        <div className="bg-teal-light border border-teal/20 rounded-lg px-4 py-4 text-sm text-teal font-medium">
          ✓ Payment has been received for this commitment.
        </div>
        <Link
          href={`/commitments/${commitment.id}/flow?step=status`}
          className="block w-full text-center bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors"
        >
          View status →
        </Link>
      </div>
    )
  }

  // ── Pending ─────────────────────────────────────────────────────────────────
  if (commitment.status === 'pending') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-navy">Allocation</h1>
        <div className="bg-surface border border-border rounded-lg px-4 py-5 text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-sm font-medium text-text-primary mb-1">Allocation not yet run</p>
          <p className="text-xs text-text-muted">The raise is still open. Allocation will be triggered once the raise closes. Check back here for updates.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/commitments/${commitment.id}/flow?step=verify`}
            className="flex-1 text-center border border-border text-sm font-medium text-text-secondary py-2.5 rounded hover:bg-surface transition-colors"
          >
            ← Back
          </Link>
          <Link
            href={`/commitments/${commitment.id}/flow?step=status`}
            className="flex-1 text-center bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors"
          >
            View status
          </Link>
        </div>
      </div>
    )
  }

  // ── Allocated (full) ────────────────────────────────────────────────────────
  if (commitment.status === 'allocated') {
    const equityPct = ((commitment.amount / property.totalRaise) * 97.5).toFixed(2)
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-navy">Allocation</h1>
        <div className="bg-teal-light border border-teal/20 rounded-lg px-4 py-5">
          <div className="text-teal text-lg font-bold mb-2">✓ Fully allocated</div>
          <p className="text-sm text-text-primary">
            Your full commitment of <strong className="font-mono">{formatNGN(commitment.amount)}</strong> was allocated.
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Equity stake: <strong className="text-teal">{equityPct}%</strong> of the property company.
          </p>
        </div>
        <Link
          href={`/commitments/${commitment.id}/flow?step=payment`}
          className="block w-full text-center bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors"
        >
          Continue to Payment →
        </Link>
      </div>
    )
  }

  // ── Capped or partially allocated ───────────────────────────────────────────
  if (commitment.status === 'capped' || commitment.status === 'partially_allocated') {
    const allocated = commitment.allocatedAmount ?? 0
    const remainder = commitment.amount - allocated
    const equityPct = ((allocated / property.totalRaise) * 97.5).toFixed(2)

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-navy">Allocation</h1>

        {/* Side-by-side amounts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-border rounded-lg px-4 py-4 text-center">
            <p className="text-xs text-text-muted mb-1">Requested</p>
            <p className="font-mono text-sm font-semibold text-navy">{formatNGN(commitment.amount)}</p>
          </div>
          <div className="bg-teal-light border border-teal/20 rounded-lg px-4 py-4 text-center">
            <p className="text-xs text-text-muted mb-1">Allocated</p>
            <p className="font-mono text-sm font-semibold text-teal">{formatNGN(allocated)}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg px-4 py-4 text-sm space-y-2 text-text-primary">
          <p>
            Your commitment secures a position in the raise with an equity stake of <strong className="text-teal">{equityPct}%</strong>.
          </p>
          <p className="text-text-muted text-xs">
            The remainder of <strong className="font-mono">{formatNGN(remainder)}</strong> was not placed in this allocation round.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 space-y-1">
          <p className="font-medium">What happens to the remainder?</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Hold the position for consideration in another property</li>
            <li>Release the remainder and adjust your stake</li>
          </ul>
          <p className="mt-2">Our team will contact you at <strong>{commitment.profile.email}</strong> to discuss your preference.</p>
        </div>

        <Link
          href={`/commitments/${commitment.id}/flow?step=payment`}
          className="block w-full text-center bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors"
        >
          Continue to Payment →
        </Link>
      </div>
    )
  }

  return null
}
