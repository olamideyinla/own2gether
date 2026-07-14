'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createPropertyAction } from './actions'

export default function NewListingPage() {
  const [error, action, isPending] = useActionState(createPropertyAction, null)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-xs text-text-muted hover:text-navy underline underline-offset-2">
          ← Listings
        </Link>
        <h1 className="text-lg font-semibold text-navy">New listing</h1>
      </div>

      <form action={action} className="space-y-6" encType="multipart/form-data">
        {/* Basic info */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Details</h2>
          <Field label="Title"    name="title"    placeholder="e.g. Lekki Phase 1 Terrace" required />
          <Field label="Location" name="location" placeholder="e.g. Lekki, Lagos"          required />
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Description <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe the property — size, bedrooms, key features, development stage…"
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors resize-y"
            />
          </div>
        </section>

        {/* Financials */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Financials (NGN)</h2>
          <div className="grid grid-cols-3 gap-3">
            <MoneyField label="Property price" name="propertyPrice" required />
            <MoneyField label="Legal fees"     name="legalFees"     required />
            <MoneyField label="Other costs"    name="otherCosts"    required />
          </div>
          <p className="text-xs text-text-muted">Total raise = property price + legal fees + other costs.</p>
        </section>

        {/* Property attributes */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Property attributes</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="propertyType" className="block text-xs font-medium text-text-secondary mb-1.5">
                Property type <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <select
                id="propertyType"
                name="propertyType"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors bg-white"
              >
                <option value="">— Select —</option>
                {['Residential', 'Commercial', 'Land', 'Mixed-use', 'Industrial'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="areaSize" className="block text-xs font-medium text-text-secondary mb-1.5">
                Area size <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                id="areaSize"
                name="areaSize"
                type="text"
                placeholder="e.g. 250 sqm"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bedrooms" className="block text-xs font-medium text-text-secondary mb-1.5">
                Bedrooms <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 4"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors font-mono"
              />
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-xs font-medium text-text-secondary mb-1.5">
                Bathrooms <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 3"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors font-mono"
              />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Media</h2>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Photos <span className="text-text-muted font-normal">(JPEG / PNG / WebP · max 10 MB each)</span>
            </label>
            <input
              type="file"
              name="photos"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-border file:text-xs file:font-medium file:bg-surface file:text-navy hover:file:border-navy file:transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Videos <span className="text-text-muted font-normal">(MP4 / MOV · max 200 MB each)</span>
            </label>
            <input
              type="file"
              name="videos"
              multiple
              accept="video/mp4,video/quicktime,video/webm"
              className="block w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-border file:text-xs file:font-medium file:bg-surface file:text-navy hover:file:border-navy file:transition-colors"
            />
          </div>
        </section>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="bg-navy text-white text-sm font-semibold px-5 py-2 rounded hover:bg-navy/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Uploading & creating…' : 'Create listing'}
          </button>
          <Link
            href="/admin"
            className="text-sm text-text-secondary px-5 py-2 rounded border border-border hover:border-navy transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, placeholder, required }: {
  label: string; name: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        id={name} type="text" name={name} placeholder={placeholder} required={required}
        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
      />
    </div>
  )
}

function MoneyField({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        id={name} type="number" name={name} min="0" step="1" placeholder="0" required={required}
        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors font-mono"
      />
    </div>
  )
}
