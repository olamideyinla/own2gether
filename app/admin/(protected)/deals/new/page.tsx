'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createDealAction } from './actions'

export default function NewDealPage() {
  const [state, action, pending] = useActionState(createDealAction, null)
  const [targetRaise, setTargetRaise] = useState('')

  const minSuggested = targetRaise && Number(targetRaise) > 0
    ? Math.ceil(Number(targetRaise) * 0.15)
    : null

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/deals" className="text-xs text-text-muted hover:text-navy transition-colors">
          ← Deals
        </Link>
        <h1 className="text-lg font-bold text-navy">New deal</h1>
      </div>

      {state?.error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">Title *</label>
            <input name="title" type="text" required placeholder="e.g. 4-bedroom terrace rehab, Ikoyi"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">Location *</label>
            <input name="location" type="text" required placeholder="e.g. Ikoyi, Lagos"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">Deal type *</label>
          <select name="dealType" required
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal">
            <option value="">Select type…</option>
            <option value="rehabilitation">Rehabilitation</option>
            <option value="ground_up">Ground-up build</option>
            <option value="off_plan">Off-plan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">Description</label>
          <textarea name="description" rows={4} placeholder="Describe the deal, opportunity, and key details…"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-teal" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">Target raise (NGN) *</label>
            <input
              name="targetRaise"
              type="number"
              required
              min="1"
              step="1000"
              placeholder="e.g. 150000000"
              value={targetRaise}
              onChange={e => setTargetRaise(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">
              Min commitment (NGN) *
              <span className="font-normal text-text-muted ml-1">— minimum 15% of raise</span>
            </label>
            <input
              name="minCommitment"
              type="number"
              required
              min="1"
              step="1000"
              placeholder={minSuggested ? minSuggested.toString() : 'e.g. 22500000'}
              defaultValue={minSuggested ?? undefined}
              key={minSuggested}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal"
            />
            {minSuggested && (
              <p className="text-[11px] text-text-muted mt-1">
                15% of ₦{Number(targetRaise).toLocaleString()} = ₦{minSuggested.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">Projected return (%)</label>
            <input name="projectedReturnPct" type="number" min="0" step="0.1" placeholder="e.g. 35"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">Projected duration (months)</label>
            <input name="projectedDurationMonths" type="number" min="1" step="1" placeholder="e.g. 18"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">Photos</label>
          <input name="photos" type="file" multiple accept="image/*"
            className="w-full text-sm text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-raised file:text-navy hover:file:bg-border" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">
            Deal documents
            <span className="font-normal text-text-muted ml-1">(pitch deck, feasibility study, QS report, planning approval…)</span>
          </label>
          <input name="documents" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="w-full text-sm text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-surface-raised file:text-navy hover:file:bg-border" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={pending}
            className="bg-navy text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50">
            {pending ? 'Creating…' : 'Create deal'}
          </button>
          <Link href="/admin/deals"
            className="text-sm text-text-muted px-5 py-2.5 rounded-lg border border-border hover:border-navy transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
