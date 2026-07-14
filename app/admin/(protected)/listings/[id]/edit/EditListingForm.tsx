'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { updatePropertyAction } from '../actions'

const STATUSES = [
  { value: 'open',            label: 'Open' },
  { value: 'fully_allocated', label: 'Fully allocated' },
  { value: 'fully_sold_out',  label: 'Fully sold out' },
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
    propertyType:  string | null
    bedrooms:      number | null
    bathrooms:     number | null
    areaSize:      string | null
  }
}

export function EditListingForm({ property }: Props) {
  const boundAction = updatePropertyAction.bind(null, property.id)
  const [error, action, isPending] = useActionState(boundAction, null)

  const [keepPhotos, setKeepPhotos] = useState<string[]>(property.photos)
  const [keepVideos, setKeepVideos] = useState<string[]>(property.videos)
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null)

  function movePhoto(from: number, to: number) {
    setKeepPhotos(v => {
      if (to < 0 || to >= v.length) return v
      const next = [...v]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function reorderPhotos(draggedUrl: string, targetUrl: string) {
    if (draggedUrl === targetUrl) return
    setKeepPhotos(v => {
      const from = v.indexOf(draggedUrl)
      const to = v.indexOf(targetUrl)
      if (from === -1 || to === -1) return v
      const next = [...v]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/listings/${property.id}`}
          className="text-xs text-text-muted hover:text-navy underline underline-offset-2"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-semibold text-navy">Edit listing</h1>
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
                defaultValue={property.propertyType ?? ''}
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
                defaultValue={property.areaSize ?? ''}
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
                defaultValue={property.bedrooms ?? ''}
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
                defaultValue={property.bathrooms ?? ''}
                placeholder="e.g. 3"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors font-mono"
              />
            </div>
          </div>
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
            <>
              <p className="text-xs text-text-muted">
                Drag to reorder. The first photo is the spotlight image shown on the homepage.
              </p>
              <div className="flex flex-wrap gap-2">
                {keepPhotos.map((url, i) => (
                  <div
                    key={url}
                    draggable
                    onDragStart={() => setDraggedPhoto(url)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (draggedPhoto) reorderPhotos(draggedPhoto, url)
                      setDraggedPhoto(null)
                    }}
                    onDragEnd={() => setDraggedPhoto(null)}
                    className={`relative group w-24 h-24 rounded overflow-hidden border cursor-grab active:cursor-grabbing transition-opacity ${
                      draggedPhoto === url ? 'opacity-40' : 'opacity-100'
                    } ${i === 0 ? 'border-teal ring-1 ring-teal' : 'border-border'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />

                    {i === 0 && (
                      <span className="absolute top-0.5 left-0.5 bg-teal text-white text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded">
                        Spotlight
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setKeepPhotos(v => v.filter(u => u !== url))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>

                    <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => movePhoto(i, i - 1)}
                        disabled={i === 0}
                        aria-label="Move photo earlier"
                        className="w-5 h-5 rounded bg-black/60 text-white text-xs flex items-center justify-center disabled:opacity-30"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(i, i + 1)}
                        disabled={i === keepPhotos.length - 1}
                        aria-label="Move photo later"
                        className="w-5 h-5 rounded bg-black/60 text-white text-xs flex items-center justify-center disabled:opacity-30"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
            href={`/admin/listings/${property.id}`}
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
