'use client'

import { useState, useTransition } from 'react'
import { createCommitment, generateConnectionCode } from './actions'
import { formatNGNCompact } from '@/lib/currency'

// ─── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  propertyId:     string
  totalRaise:     number
  propertyStatus: string
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CommitmentForm({ propertyId, totalRaise, propertyStatus }: Props) {
  const [name,          setName]          = useState('')
  const [email,         setEmail]         = useState('')
  const [amount,        setAmount]        = useState('')
  const [code,          setCode]          = useState('')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [error,         setError]         = useState<string | null>(null)
  const [success,       setSuccess]       = useState<string | null>(null)
  const [isPending,     startTransition]  = useTransition()

  const minAmount   = totalRaise * 0.075
  const amountNum   = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0
  const equityPct   = amountNum > 0 ? ((amountNum / totalRaise) * 97.5).toFixed(1) : null
  const belowMin    = amountNum > 0 && amountNum < minAmount
  const canGenerate = name.trim().length > 0 && email.trim().includes('@')
  const canSubmit   = !isPending && name.trim() && email.trim().includes('@') && amountNum > 0 && !belowMin

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createCommitment(propertyId, name, email, amountNum, code || undefined)
      if (result.success) {
        setSuccess(result.commitmentId)
      } else {
        setError(result.error)
      }
    })
  }

  function handleGenerateCode() {
    setError(null)
    startTransition(async () => {
      const result = await generateConnectionCode(propertyId, name, email)
      if (result.success) {
        setGeneratedCode(result.code)
        setCode(result.code)
      } else {
        setError(result.error)
      }
    })
  }

  // ── Closed raise ────────────────────────────────────────────────────────────

  if (propertyStatus !== 'open') {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 text-center">
        <p className="text-sm text-text-muted">This raise is no longer accepting commitments.</p>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="bg-teal-light border border-teal/20 rounded-lg p-6">
        <div className="text-teal text-xl font-bold mb-2">Commitment received</div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Your commitment has been recorded. We'll contact you at{' '}
          <span className="font-medium">{email}</span> with bank transfer instructions
          once the raise closes and allocation is confirmed.
        </p>
        {generatedCode && (
          <div className="mt-5 p-4 bg-white rounded-lg border border-border">
            <p className="text-xs text-text-muted mb-1 font-medium uppercase tracking-wide">Your connection code</p>
            <p className="font-mono text-lg font-semibold text-navy">{generatedCode}</p>
            <p className="text-xs text-text-muted mt-2">
              Share this code with others so their commitments rank alongside yours as a combined entry.
            </p>
          </div>
        )}
        <a
          href={`/commitments/${success}/flow`}
          className="inline-block mt-4 text-sm font-semibold text-navy border border-navy rounded px-4 py-2 hover:bg-navy hover:text-white transition-colors"
        >
          Continue to next steps →
        </a>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h2 className="font-semibold text-navy text-[15px] mb-4">Make a commitment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Amara Okafor"
            required
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amara@example.com"
            required
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Commitment amount (NGN)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min. ${formatNGNCompact(minAmount)}`}
            required
            className="w-full border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
          {equityPct && !belowMin && (
            <p className="text-xs text-teal font-medium mt-1">
              ≈ {equityPct}% equity stake
              <span className="text-text-muted font-normal ml-1">(after Own2gether&apos;s 2.5%)</span>
            </p>
          )}
          {belowMin && (
            <p className="text-xs text-red-500 mt-1">
              Minimum is {formatNGNCompact(minAmount)} — commitments below 7.5% of the raise are not accepted.
            </p>
          )}
        </div>

        {/* Connection code */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Connection code{' '}
            <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="GRP-XXXXXX"
              className="flex-1 border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={!canGenerate || isPending}
              title={canGenerate ? 'Generate a new group code' : 'Enter your name and email first'}
              className="text-xs font-medium text-teal border border-teal/40 rounded px-3 py-2 hover:bg-teal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            Enter a code to join an existing group, or generate one to invite others.
            Grouped commitments are ranked by their combined total.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2.5 leading-relaxed">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Submitting…' : 'Submit commitment'}
        </button>

        <p className="text-[11px] text-text-muted text-center leading-relaxed">
          No payment is required now. Bank transfer instructions will be sent to your
          email after the raise closes and allocation is confirmed.
        </p>
      </form>
    </div>
  )
}
