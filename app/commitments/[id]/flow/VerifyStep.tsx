'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { submitIdentityDocument } from './actions'
import type { CommitmentFlowData } from './types'

export function VerifyStep({ commitment }: { commitment: CommitmentFlowData }) {
  const [state, action, isPending] = useActionState(submitIdentityDocument, null)
  const { profile } = commitment

  // ── Already verified ────────────────────────────────────────────────────────
  if (profile.kycStatus === 'verified') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-navy">Identity verification</h1>
        </div>
        <div className="bg-teal-light border border-teal/20 rounded-lg px-4 py-4 text-sm text-teal font-medium">
          ✓ Your identity has already been verified.
        </div>
        <Link
          href={`/commitments/${commitment.id}/flow?step=allocation`}
          className="block w-full text-center bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors"
        >
          Continue to Allocation →
        </Link>
      </div>
    )
  }

  // ── Under review — must wait for approval before proceeding ─────────────────
  if (profile.kycStatus === 'pending') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-navy">Identity verification</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Your documents are under review</p>
          <p className="text-xs">
            Our team typically completes reviews within 3 business days.
            You will be able to proceed once your identity is confirmed.
          </p>
        </div>
        <div className="text-xs text-text-muted text-center">
          You cannot continue to the next step until your documents are approved.
        </div>
      </div>
    )
  }

  // ── Show upload form (unverified, or rejected doc) ──────────────────────────
  const isRejected = profile.latestDocStatus === 'rejected'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy">Identity verification</h1>
        <p className="text-sm text-text-muted mt-1">
          We need to verify your identity before confirming your allocation.
        </p>
      </div>

      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Document not accepted — please resubmit</p>
          {profile.latestDocRejectionReason && (
            <p className="text-xs mt-1 font-medium">
              Reason: {profile.latestDocRejectionReason}
            </p>
          )}
          <p className="text-xs mt-1">Please upload a clearer copy or a different document.</p>
        </div>
      )}

      <form action={action} className="space-y-4" encType="multipart/form-data">
        <input type="hidden" name="commitmentId" value={commitment.id} />

        {/* Document type */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Document type
          </label>
          <select
            name="type"
            required
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors bg-white"
          >
            <option value="">Select a document type…</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver&apos;s licence</option>
            <option value="national_id">National ID card</option>
          </select>
        </div>

        {/* ID document file */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            ID document
            <span className="ml-1 text-text-muted font-normal">(photo or scan, max 10 MB)</span>
          </label>
          <input
            type="file"
            name="idFile"
            required
            accept="image/*,application/pdf"
            className="w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-surface-raised file:text-navy hover:file:bg-surface-info"
          />
        </div>

        {/* Proof of address file */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Proof of address
            <span className="ml-1 text-text-muted font-normal">(utility bill or bank statement, max 10 MB)</span>
          </label>
          <input
            type="file"
            name="proofFile"
            required
            accept="image/*,application/pdf"
            className="w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-surface-raised file:text-navy hover:file:bg-surface-info"
          />
        </div>

        <p className="text-xs text-text-muted">
          Documents are reviewed within 3 business days. You will be notified once approved.
        </p>

        {state?.error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2.5 leading-relaxed">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Uploading…' : 'Submit documents'}
        </button>
      </form>
    </div>
  )
}
