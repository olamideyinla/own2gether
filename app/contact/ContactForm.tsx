'use client'

import { useActionState } from 'react'
import { submitContactAction } from './actions'

const initialState: { error?: string; success?: boolean } = {}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, initialState)

  if (state.success) {
    return (
      <div className="rounded-xl border border-teal/30 bg-teal/5 px-6 py-8 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-teal mx-auto mb-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p className="text-sm font-semibold text-navy mb-1">Message sent</p>
        <p className="text-xs text-text-muted">
          Thank you for reaching out. We will get back to you as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-navy mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your full name"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder:text-text-muted focus:outline-none focus:border-navy transition-colors"
        />
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-navy mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder:text-text-muted focus:outline-none focus:border-navy transition-colors"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-navy mb-1.5">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+234 800 000 0000"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder:text-text-muted focus:outline-none focus:border-navy transition-colors"
          />
        </div>
      </div>
      <p className="text-[11px] text-text-muted -mt-1">
        At least one of email or phone is required so we can reply.
      </p>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-navy mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-navy placeholder:text-text-muted focus:outline-none focus:border-navy transition-colors resize-none"
        />
      </div>

      {/* Error */}
      {state.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-navy text-white text-sm font-semibold rounded-lg px-4 py-3 hover:bg-navy/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
