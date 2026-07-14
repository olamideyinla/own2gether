'use client'

import { useState } from 'react'

type Props = {
  code:         string
  propertyTitle: string
  propertyId:   string
}

export function ShareCode({ code, propertyTitle, propertyId }: Props) {
  const [copied, setCopied] = useState<'code' | 'message' | null>(null)

  const propertyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/listings/${propertyId}`
    : `/listings/${propertyId}`

  const inviteMessage =
    `Hi! I'm co-investing in a property through Own2gether and I think you should join me.\n\n` +
    `The property is: ${propertyTitle}\n` +
    `View it here: ${propertyUrl}\n\n` +
    `When you make your commitment, enter my group code: ${code}\n\n` +
    `By using the code, our commitments are combined and we rank together as joint co-owners — ` +
    `giving us a stronger position in the allocation. No extra cost to you.\n\n` +
    `Own2gether lets you co-own real property in Nigeria with registered shares. ` +
    `Check it out at own2gether.com`

  async function copyText(text: string, key: 'code' | 'message') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback for browsers that block clipboard without user gesture
    }
  }

  const whatsappUrl =
    `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`

  return (
    <div className="space-y-3">
      {/* Code display + copy */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-base font-bold text-teal tracking-wider bg-teal/5 border border-teal/20 rounded px-3 py-1.5">
          {code}
        </span>
        <button
          type="button"
          onClick={() => copyText(code, 'code')}
          className="text-xs font-medium text-text-muted border border-border rounded px-2.5 py-1.5 hover:border-navy hover:text-navy transition-colors"
        >
          {copied === 'code' ? 'Copied!' : 'Copy code'}
        </button>
      </div>

      {/* Invite message preview */}
      <details className="group">
        <summary className="text-xs font-medium text-text-muted hover:text-navy cursor-pointer transition-colors list-none flex items-center gap-1">
          <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
          Show invite message
        </summary>
        <div className="mt-2 space-y-2">
          <pre className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-wrap bg-surface-raised border border-border rounded p-3 font-sans">
            {inviteMessage}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(inviteMessage, 'message')}
              className="text-xs font-medium text-navy border border-border rounded px-3 py-1.5 hover:border-navy transition-colors"
            >
              {copied === 'message' ? 'Copied!' : 'Copy message'}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-white bg-[#25D366] rounded px-3 py-1.5 hover:opacity-90 transition-opacity"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>
      </details>
    </div>
  )
}
