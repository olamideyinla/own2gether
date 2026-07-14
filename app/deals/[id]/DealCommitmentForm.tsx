'use client'

import { useActionState, useState } from 'react'
import { formatNGN } from '@/lib/currency'
import { placeDealCommitment, type DealCommitmentResult } from './actions'

const INITIAL: DealCommitmentResult = { success: false, error: '' }

export function DealCommitmentForm({
  dealId,
  targetRaise,
  totalCommitted,
  minCommitment,
  dealStatus,
}: {
  dealId:         string
  targetRaise:    number
  totalCommitted: number
  minCommitment:  number
  dealStatus:     string
}) {
  const [result, action, pending] = useActionState(
    (_: DealCommitmentResult, form: FormData) =>
      placeDealCommitment(dealId, form),
    INITIAL,
  )

  const [amount, setAmount] = useState('')
  const remaining = Math.max(0, targetRaise - totalCommitted)

  if (dealStatus === 'coming_soon') {
    return (
      <div className="border border-border rounded-xl p-6 text-center">
        <p className="text-sm font-semibold text-navy mb-2">Coming soon</p>
        <p className="text-xs text-text-muted leading-relaxed">
          This deal is not yet open for commitments. Sign up to be notified when it opens.
        </p>
      </div>
    )
  }

  if (dealStatus === 'funded' || dealStatus === 'in_progress' || dealStatus === 'completed') {
    return (
      <div className="border border-border rounded-xl p-6 text-center">
        <p className="text-sm font-semibold text-navy mb-2">
          {dealStatus === 'completed' ? 'Deal completed' : 'Fully funded'}
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          {dealStatus === 'completed'
            ? 'This project has been completed and profits distributed.'
            : 'This deal has reached its funding target. No further commitments are being accepted.'}
        </p>
      </div>
    )
  }

  if (dealStatus === 'cancelled') {
    return (
      <div className="border border-border rounded-xl p-6 text-center">
        <p className="text-sm font-semibold text-navy mb-2">Deal cancelled</p>
        <p className="text-xs text-text-muted">This deal has been cancelled.</p>
      </div>
    )
  }

  if (result.success) {
    return (
      <div className="border border-teal/20 bg-teal/5 rounded-xl p-6 text-center space-y-2">
        <div className="text-2xl">✓</div>
        <p className="text-sm font-semibold text-navy">Commitment received</p>
        <p className="text-xs text-text-secondary leading-relaxed">
          We&apos;ve recorded your interest. Our team will contact you to confirm your allocation and
          provide payment instructions.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-navy mb-1">Express your commitment</p>
      <p className="text-xs text-text-muted mb-5 leading-relaxed">
        Minimum: {formatNGN(minCommitment)} (15% of raise) · Remaining capacity: {formatNGN(remaining)}
      </p>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-navy mb-1.5" htmlFor="dc-name">
            Full name
          </label>
          <input
            id="dc-name"
            name="name"
            type="text"
            required
            placeholder="Adewale Okonkwo"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-navy mb-1.5" htmlFor="dc-email">
            Email address
          </label>
          <input
            id="dc-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-navy mb-1.5" htmlFor="dc-amount">
            Commitment amount (NGN)
          </label>
          <input
            id="dc-amount"
            name="amount"
            type="number"
            required
            min={minCommitment}
            max={remaining}
            step="1000"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={`Min ${formatNGN(minCommitment)}`}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-navy placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
          />
          {amount && Number(amount) >= minCommitment && (
            <p className="text-[11px] text-text-muted mt-1.5">
              Your projected 60% share · {formatNGN(Number(amount))} capital + profits on exit
            </p>
          )}
        </div>

        {result.error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {result.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-navy text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
        >
          {pending ? 'Submitting…' : 'Submit commitment'}
        </button>

        <p className="text-[10px] text-text-muted leading-relaxed text-center">
          This is a non-binding expression of interest. Your capital is not charged at this stage.
          Own2gether will contact you to confirm your slot and provide payment details.
        </p>
      </form>
    </div>
  )
}
