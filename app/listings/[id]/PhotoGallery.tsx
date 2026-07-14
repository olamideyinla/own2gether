'use client'

import { useState } from 'react'

type Props = {
  photos:    string[]
  title:     string
  location:  string
  statusLabel: string
  statusClasses: string
}

export function PhotoGallery({ photos, title, location, statusLabel, statusClasses }: Props) {
  const [active, setActive] = useState(0)

  return (
    <div className="space-y-2">
      {/* Main photo */}
      <div className="rounded-lg overflow-hidden h-64 relative bg-surface-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[active]}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-200"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-3">
          <span className="text-white/90 text-sm font-medium bg-black/40 rounded px-3 py-1 backdrop-blur-sm">
            {location}
          </span>
          <span className={`font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded ${statusClasses}`}>
            {statusLabel}
          </span>
        </div>
        {photos.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
            {active + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`flex-shrink-0 rounded overflow-hidden border-2 transition-colors focus:outline-none ${
                i === active
                  ? 'border-teal'
                  : 'border-border hover:border-teal/50'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-16 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
