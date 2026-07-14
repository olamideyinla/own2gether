'use client'

import { useState, useTransition, useActionState } from 'react'
import Link from 'next/link'
import { createCommitment, generateConnectionCode, type CommitmentResult } from './actions'
import { formatNGNCompact } from '@/lib/currency'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Profile = {
  id:        string
  name:      string
  email:     string
  kycStatus: string
}

type Props = {
  propertyId:     string
  totalRaise:     number
  propertyStatus: string
  profile:        Profile | null
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function CommitmentForm({ propertyId, totalRaise, propertyStatus, profile }: Props) {
  const [amount,        setAmount]        = useState('')
  const [code,          setCode]          = useState('')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [codeError,     setCodeError]     = useState<string | null>(null)
  const [isCodePending, startCodeTransition] = useTransition()

  const [result, formAction, isPending] = useActionState<CommitmentResult | null, FormData>(
    createCommitment.bind(null, propertyId),
    null,
  )

  const minAmount = totalRaise * 0.075
  const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0
  const equityPct = amountNum > 0 ? ((amountNum / totalRaise) * 97.5).toFixed(1) : null
  const belowMin  = amountNum > 0 && amountNum < minAmount

  function handleGenerateCode() {
    setCodeError(null)
    startCodeTransition(async () => {
      const res = await generateConnectionCode(propertyId)
      if (res.success) {
        setGeneratedCode(res.code)
        setCode(res.code)
      } else {
        setCodeError(res.error)
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

  // ── Not signed in ───────────────────────────────────────────────────────────

  if (!profile) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 text-center space-y-4">
        <p className="text-sm text-text-secondary">Sign in to make a commitment.</p>
        <div className="flex gap-2 justify-center">
          <Link
            href="/auth/signin"
            className="text-sm font-semibold text-white bg-navy rounded px-4 py-2 hover:bg-navy/90 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-medium text-navy border border-navy rounded px-4 py-2 hover:bg-surface-raised transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────

  if (result?.success) {
    return (
      <div className="bg-teal-light border border-teal/20 rounded-lg p-6">
        <div className="text-teal text-xl font-bold mb-2">Commitment received</div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Your commitment has been recorded. We&apos;ll contact you at{' '}
          <span className="font-medium">{profile.email}</span> with bank transfer instructions
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
          href={`/commitments/${result.commitmentId}/flow`}
          className="inline-block mt-4 text-sm font-semibold text-navy border border-navy rounded px-4 py-2 hover:bg-navy hover:text-white transition-colors"
        >
          Continue to next steps →
        </a>
      </div>
    )
  }

  const error = result && !result.success ? result.error : null

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h2 className="font-semibold text-navy text-[15px] mb-4">Make a commitment</h2>

      <form action={formAction} encType="multipart/form-data" className="space-y-4">

        {/* Name (read-only from profile) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-text-secondary">Full name</label>
            <Link href="/profile" className="text-[10px] text-teal hover:underline">
              Edit profile
            </Link>
          </div>
          <div className="w-full border border-border rounded px-3 py-2 text-sm bg-surface-raised text-text-secondary select-none">
            {profile.name}
          </div>
        </div>

        {/* Email (read-only from profile) */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
          <div className="w-full border border-border rounded px-3 py-2 text-sm bg-surface-raised text-text-secondary select-none">
            {profile.email}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Commitment amount (NGN)
          </label>
          <input
            type="text"
            name="amount"
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

        {/* KYC — only shown when profile is unverified */}
        {profile.kycStatus === 'unverified' && (
          <div className="border border-amber/30 bg-amber/5 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-amber-text">Identity verification required</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Please provide your identity documents to submit a commitment.
              These are reviewed privately by Own2gether staff.
            </p>

            {/* Document type */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Document type <span className="text-red-500">*</span>
              </label>
              <select
                name="docType"
                required
                defaultValue=""
                className="w-full border border-border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              >
                <option value="" disabled>Select…</option>
                <option value="passport">International Passport</option>
                <option value="drivers_license">Driver&apos;s Licence</option>
                <option value="national_id">National ID Card</option>
              </select>
            </div>

            {/* Document number */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Document number{' '}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="docNumber"
                placeholder="A12345678"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>

            {/* Expiry date */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Expiry date{' '}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>

            {/* Identity document */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Identity document scan <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="idFile"
                accept="image/*,.pdf"
                required
                className="w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-surface-raised file:text-navy hover:file:bg-surface-info"
              />
            </div>

            {/* Proof of address */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Proof of address <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="proofFile"
                accept="image/*,.pdf"
                required
                className="w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-surface-raised file:text-navy hover:file:bg-surface-info"
              />
              <p className="text-[10px] text-text-muted mt-1">
                Utility bill, bank statement or government letter · Max 10 MB each
              </p>
            </div>
          </div>
        )}

        {/* KYC pending banner */}
        {profile.kycStatus === 'pending' && (
          <div className="border border-amber/30 bg-amber/5 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-amber-text">Documents under review</p>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Your identity documents have been submitted and are being reviewed by our team.
              You can still submit your commitment.
            </p>
          </div>
        )}

        {/* KYC verified badge */}
        {profile.kycStatus === 'verified' && (
          <div className="flex items-center gap-1.5 text-teal text-xs font-medium">
            <span>✓</span>
            <span>Identity verified</span>
          </div>
        )}

        {/* Connection code */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Connection code{' '}
            <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="GRP-XXXXXX"
              className="flex-1 border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={isCodePending}
              className="text-xs font-medium text-teal border border-teal/40 rounded px-3 py-2 hover:bg-teal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isCodePending ? '…' : 'Generate'}
            </button>
          </div>
          {codeError && (
            <p className="text-xs text-red-500 mt-1">{codeError}</p>
          )}
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
          disabled={isPending || belowMin || amountNum <= 0}
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
