'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  title:    string
  location: string
  type:     'listing' | 'deal'
}

export function SharePanel({ title, location, type }: Props) {
  const [open,   setOpen]   = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const url = typeof window !== 'undefined' ? window.location.href : ''

  const shareText = type === 'listing'
    ? `I found a property co-ownership opportunity on Own2gether — ${title} in ${location}. Pool your money to co-own real Nigerian property. No fund, no fees in cash.`
    : `New property development deal on Own2gether — ${title} in ${location}. Co-invest and earn 60% of net profits. Minimum 15% stake per investor.`

  const encoded    = encodeURIComponent(shareText + '\n\n' + url)
  const encodedUrl = encodeURIComponent(url)

  const socials = [
    {
      label: 'WhatsApp',
      href:  `https://wa.me/?text=${encoded}`,
      color: '#25D366',
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.118 1.529 5.845L.057 23.882l6.198-1.625A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-5.001-1.369l-.359-.213-3.713.974.992-3.62-.234-.372A9.82 9.82 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818 5.418 0 9.818 4.4 9.818 9.818 0 5.419-4.4 9.818-9.818 9.818z"/>
        </svg>
      ),
    },
    {
      label: 'X (Twitter)',
      href:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`,
      color: '#000000',
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href:  `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: '#1877F2',
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href:  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0A66C2',
      icon:  (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
  ]

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary border border-border rounded px-2.5 py-1.5 hover:border-navy hover:text-navy transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="12.5" cy="3.5"  r="1.75" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12.5" cy="12.5" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="3.5"  cy="8"    r="1.75" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="5.19" y1="7.07"  x2="10.81" y2="4.43"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="5.19" y1="8.93"  x2="10.81" y2="11.57" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Share
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-border rounded-xl shadow-lg z-20 p-4">
          <p className="text-[11px] font-semibold text-navy uppercase tracking-wide mb-1">
            Share with your network
          </p>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Know someone who might want to{' '}
            {type === 'listing' ? 'co-own this property' : 'invest in this deal'}?
            Share it with friends, family, and your network.
          </p>

          {/* Social buttons */}
          <div className="flex gap-2 mb-4">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Share on ${s.label}`}
                style={{ color: s.color }}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-current transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex items-center gap-2 bg-surface-raised rounded-lg px-3 py-2 border border-border">
            <span className="text-xs text-text-muted truncate flex-1 font-mono">{url}</span>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-teal hover:text-teal-dark transition-colors shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
