import Link from 'next/link'
import { formatNGN } from '@/lib/currency'
import type { CommitmentFlowData } from './types'

export function ConfirmStep({ commitment }: { commitment: CommitmentFlowData }) {
  const { property, profile } = commitment
  const equityPct = ((commitment.amount / property.totalRaise) * 97.5).toFixed(2)
  const nextStep  = profile.kycStatus === 'verified' ? 'allocation' : 'verify'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy">Confirm your commitment</h1>
        <p className="text-sm text-text-muted mt-1">Review the details below before continuing.</p>
      </div>

      {/* Commitment summary */}
      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Property</span>
          <span className="font-medium text-navy text-right">{property.title}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Location</span>
          <span className="text-text-primary">{property.location}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Amount</span>
          <div className="text-right">
            <span className="font-mono font-semibold text-navy">{formatNGN(commitment.amount)}</span>
            <span className="block text-xs text-text-muted">{commitment.fxLine}</span>
            <span className="block text-[11px] text-disabled-text">{commitment.fxTimestamp}</span>
          </div>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Equity stake</span>
          <div className="text-right">
            <span className="font-semibold text-teal">{equityPct}%</span>
            <span className="block text-xs text-text-muted">(if fully allocated)</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 leading-relaxed">
        <p className="font-medium mb-1">Important — please read</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>This commitment is <strong>not binding</strong> until allocation is confirmed.</li>
          <li>No payment is required at this stage.</li>
          <li>Bank transfer instructions will be sent to <strong>{profile.email}</strong> after allocation.</li>
          <li>You have 10 days to complete payment once allocation is confirmed.</li>
        </ul>
      </div>

      <Link
        href={`/commitments/${commitment.id}/flow?step=${nextStep}`}
        className="block w-full text-center bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors"
      >
        Continue →
      </Link>
    </div>
  )
}
