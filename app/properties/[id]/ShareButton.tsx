'use client'

import { useState } from 'react'

export function ShareButton({ title, location }: { title: string; location: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url  = window.location.href
    const text = `${title} · ${location} — co-own real property on Own2gether`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // User cancelled or share not supported — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      title="Share this deal"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary border border-border rounded px-2.5 py-1.5 hover:border-navy hover:text-navy transition-colors"
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="12.5" cy="3.5" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12.5" cy="12.5" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="3.5"  cy="8"    r="1.75" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="5.19" y1="7.07" x2="10.81" y2="4.43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="5.19" y1="8.93" x2="10.81" y2="11.57" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Share
        </>
      )}
    </button>
  )
}
