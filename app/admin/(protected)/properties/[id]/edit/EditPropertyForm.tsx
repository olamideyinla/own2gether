'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { updatePropertyAction } from '../actions'

const STATUSES = [
  { value: 'open',            label: 'Open' },
  { value: 'fully_allocated', label: 'Fully allocated' },
  { value: 'closed',          label: 'Closed' },
  { value: 'cancelled',       label: 'Cancelled' },
]

type Props = {
  property: {
    id:            string
    title:         string
    location:      string
    description:   string | null
    photos:        string[]
    videos:        string[]
    propertyPrice: number
    legalFees:     number
    otherCosts:    number
    status:        string
  }
}

export function EditPropertyForm({ property }: Props) {
  const boundAction = updatePropertyAction.bind(null, property.id)
  const [error, action, isPending] = useActionState(boundAction, null)

  const [keepPhotos, setKeepPhotos] = useState<string[]>(property.photos)
  const [keepVideos, setKeepVideos] = useState<string[]>(property.videos)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/properties/${property.id}`}
          className="text-xs text-text-muted hover:text-navy underline underline-offset-2"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-semibold text-navy">Edit property</h1>
      </div>

      <form action={action} className="space-y-6" encType="multipart/form-data">
        {/* Hidden inputs for kept existing media */}
        {keepPhotos.map(url => (
          <input key={url} type="hidden" name="keepPhotos" value={url} />
        ))}
        {keepVideos.map(url => (
          <input key={url} type="hidden" name="keepVideos" value={url} />
        ))}

        {/* Basic info */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Details</h2>
          <Field label="Title"    name="title"    defaultValue={property.title}    required />
          <Field label="Location" name="location" defaultValue={property.location} required />
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Description <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={4}
              defaultValue={property.description ?? ''}
              placeholder="Describe the property — size, bedrooms, key features, development stage…"
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors resize-y"
            />
          </div>
        </section>

        {/* Financials */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Financials (NGN)</h2>
          <div className="grid grid-cols-3 gap-3">
            <MoneyField label="Property price" name="propertyPrice" defaultValue={property.propertyPrice} required />
            <MoneyField label="Legal fees"     name="legalFees"     defaultValue={property.legalFees}     required />
            <MoneyField label="Other costs"    name="otherCosts"    defaultValue={property.otherCosts}    required />
          </div>
          <p className="text-xs text-text-muted">Total raise = property price + legal fees + other costs.</p>
        </section>

        {/* Status */}
        <section>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Status</h2>
          <select
            name="status"
            defaultValue={property.status}
            className="w-48 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors bg-white"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </section>

        {/* Photos */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Photos</h2>

          {keepPhotos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keepPhotos.map(url => (
                <div key={url} className="relative group w-24 h-24 rounded overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setKeepPhotos(v => v.filter(u => u !== url))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Add photos <span className="text-text-muted font-normal">(JPEG / PNG / WebP · max 10 MB each)</span>
            </label>
            <input
              type="file"
              name="newPhotos"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-border file:text-xs file:font-medium file:bg-surface file:text-navy hover:file:border-navy file:transition-colors"
            />
          </div>
        </section>

        {/* Videos */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Videos</h2>

          {keepVideos.length > 0 && (
            <ul className="space-y-1.5">
              {keepVideos.map((url, i) => (
                <li key={url} className="flex items-center gap-3 text-sm">
                  <span className="text-text-muted font-mono text-xs w-5">{i + 1}.</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-navy underline underline-offset-2 hover:text-teal text-xs"
                  >
                    {url.split('/').pop()}
                  </a>
                  <button
                    type="button"
                    onClick={() => setKeepVideos(v => v.filter(u => u !== url))}
                    className="text-xs text-red-600 hover:text-red-700 font-medium shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Add videos <span className="text-text-muted font-normal">(MP4 / MOV · max 200 MB each)</span>
            </label>
            <input
              type="file"
              name="newVideos"
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
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
          <Link
            href={`/admin/properties/${property.id}`}
            className="text-sm text-text-secondary px-5 py-2 rounded border border-border hover:border-navy transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, defaultValue, required }: {
  label: string; name: string; defaultValue?: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        id={name} type="text" name={name} defaultValue={defaultValue} required={required}
        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
      />
    </div>
  )
}

function MoneyField({ label, name, defaultValue, required }: {
  label: string; name: string; defaultValue?: number; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        id={name} type="number" name={name} min="0" step="1" defaultValue={defaultValue} required={required}
        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors font-mono"
      />
    </div>
  )
}
