'use client'

import { useActionState } from 'react'
import { submitKycDocuments, type VerifyState } from './actions'

type Props = {
  profile: {
    name:               string
    dateOfBirth:        string | null   // ISO date string or null
    nationality:        string | null
    occupation:         string | null
    residentialAddress: string | null
  }
  returnTo?: string
  isResubmission: boolean
  rejectionReason?: string | null
}

export function VerifyForm({ profile, returnTo, isResubmission, rejectionReason }: Props) {
  const [state, action, isPending] = useActionState<VerifyState, FormData>(submitKycDocuments, null)

  return (
    <form action={action} className="space-y-8" encType="multipart/form-data">
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

      {/* Resubmission notice */}
      {isResubmission && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <p className="font-medium mb-0.5">Previous submission was not accepted — please resubmit</p>
          {rejectionReason && (
            <p className="text-xs">Reason: {rejectionReason}</p>
          )}
        </div>
      )}

      {/* ── Section 1: Personal details ──────────────────────────────────── */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-semibold text-navy">Personal details</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Required for CAC shareholder registration. Must match your identity document exactly.
          </p>
        </div>

        {/* Full name — read-only, taken from profile */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Full legal name <span className="text-text-muted font-normal">(from your account)</span>
          </label>
          <input
            type="text"
            value={profile.name}
            readOnly
            className="w-full border border-border rounded px-3 py-2 text-sm bg-surface-raised text-text-muted cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date of birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-xs font-medium text-text-secondary mb-1.5">
              Date of birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              defaultValue={profile.dateOfBirth ?? ''}
              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-xs font-medium text-text-secondary mb-1.5">
              Nationality
            </label>
            <input
              id="nationality"
              name="nationality"
              type="text"
              required
              defaultValue={profile.nationality ?? 'Nigerian'}
              placeholder="Nigerian"
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>
        </div>

        {/* Occupation */}
        <div>
          <label htmlFor="occupation" className="block text-xs font-medium text-text-secondary mb-1.5">
            Occupation
          </label>
          <input
            id="occupation"
            name="occupation"
            type="text"
            required
            defaultValue={profile.occupation ?? ''}
            placeholder="e.g. Software Engineer, Accountant, Business Owner"
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>

        {/* Residential address */}
        <div>
          <label htmlFor="residentialAddress" className="block text-xs font-medium text-text-secondary mb-1.5">
            Residential address <span className="text-text-muted font-normal">(full address including state)</span>
          </label>
          <textarea
            id="residentialAddress"
            name="residentialAddress"
            required
            rows={3}
            defaultValue={profile.residentialAddress ?? ''}
            placeholder={"12 Victoria Street, Lekki Phase 1\nLagos, Lagos State\nNigeria"}
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
          />
        </div>
      </section>

      {/* ── Section 2: Identity document ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-semibold text-navy">Identity document</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Upload a valid government-issued photo ID. Details must be clearly readable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Document type */}
          <div>
            <label htmlFor="type" className="block text-xs font-medium text-text-secondary mb-1.5">
              Document type
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors bg-white"
            >
              <option value="">Select…</option>
              <option value="passport">International passport</option>
              <option value="drivers_license">Driver&apos;s licence</option>
              <option value="national_id">National ID card (NIN slip)</option>
            </select>
          </div>

          {/* Document number */}
          <div>
            <label htmlFor="documentNumber" className="block text-xs font-medium text-text-secondary mb-1.5">
              Document number
            </label>
            <input
              id="documentNumber"
              name="documentNumber"
              type="text"
              required
              placeholder="e.g. A12345678 / NIN: 12345678901"
              className="w-full border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
          </div>
        </div>

        {/* Expiry date */}
        <div className="max-w-xs">
          <label htmlFor="expiryDate" className="block text-xs font-medium text-text-secondary mb-1.5">
            Document expiry date <span className="text-text-muted font-normal">(leave blank if none)</span>
          </label>
          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
          />
        </div>

        {/* ID file upload */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Upload identity document <span className="text-text-muted font-normal">(photo or scan — JPG, PNG, or PDF, max 10 MB)</span>
          </label>
          <input
            type="file"
            name="idFile"
            required
            accept="image/*,application/pdf"
            className="w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-surface-raised file:text-navy hover:file:bg-surface-info"
          />
        </div>
      </section>

      {/* ── Section 3: Proof of address ───────────────────────────────────── */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-semibold text-navy">Proof of address</h2>
          <p className="text-xs text-text-muted mt-0.5">
            A utility bill, bank statement, or tenancy agreement dated within the last 3 months.
            Must show your name and residential address.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Upload proof of address <span className="text-text-muted font-normal">(JPG, PNG, or PDF, max 10 MB)</span>
          </label>
          <input
            type="file"
            name="proofFile"
            required
            accept="image/*,application/pdf"
            className="w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-surface-raised file:text-navy hover:file:bg-surface-info"
          />
        </div>
      </section>

      {/* ── Declaration ───────────────────────────────────────────────────── */}
      <div className="bg-surface-raised border border-border rounded-lg px-4 py-3 text-xs text-text-muted leading-relaxed">
        By submitting these documents you confirm that all information provided is accurate
        and that the documents are genuine. This information will be used to register you
        as a shareholder in the Special Purpose Vehicle company created for any property
        you co-own through Own2gether.
      </div>

      {/* Error */}
      {state && 'error' in state && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2.5 leading-relaxed">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Uploading and submitting…' : 'Submit verification documents'}
      </button>
    </form>
  )
}
