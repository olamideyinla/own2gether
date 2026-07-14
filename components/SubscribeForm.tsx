'use client'

import { useState } from 'react'

type State = 'idle' | 'loading' | 'success' | 'error'

export function SubscribeForm() {
  const [state,   setState]   = useState<State>('idle')
  const [message, setMessage] = useState('')
  const [listings, setListings] = useState(true)
  const [deals,    setDeals]    = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')

    const form  = new FormData(e.currentTarget)
    const email = (form.get('email') as string).trim()
    const name  = (form.get('name')  as string).trim() || null

    const res = await fetch('/api/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, name, listings, deals }),
    })
    const data = await res.json()

    if (res.ok) {
      setState('success')
    } else {
      setState('error')
      setMessage(data.error ?? 'Something went wrong. Please try again.')
    }
  }

  if (state === 'success') {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-navy mb-1">You&apos;re subscribed</p>
        <p className="text-xs text-text-muted">We&apos;ll email you when new listings or deals are posted.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="sub-name" className="block text-xs font-medium text-navy mb-1.5">
            Name <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            id="sub-name"
            name="name"
            type="text"
            placeholder="Adewale Okonkwo"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
          />
        </div>
        <div>
          <label htmlFor="sub-email" className="block text-xs font-medium text-navy mb-1.5">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="sub-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <p className="text-xs font-medium text-navy">Notify me about:</p>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={listings}
            onChange={e => setListings(e.target.checked)}
            className="w-4 h-4 rounded border-border text-teal focus:ring-teal"
          />
          <span className="text-xs text-text-secondary">New listings</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={deals}
            onChange={e => setDeals(e.target.checked)}
            className="w-4 h-4 rounded border-border text-teal focus:ring-teal"
          />
          <span className="text-xs text-text-secondary">New deals</span>
        </label>
      </div>

      {state === 'error' && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{message}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading' || (!listings && !deals)}
        className="bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
      >
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      <p className="text-[11px] text-text-muted">
        You can unsubscribe at any time via the link in any notification email.
      </p>
    </form>
  )
}
