'use client'

import { useState, useTransition, useRef } from 'react'
import { postMessage } from './actions'

export function MessageForm({ propertyId }: { propertyId: string }) {
  const [body,      setBody]      = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await postMessage(propertyId, body)
      if (result.error) {
        setError(result.error)
      } else {
        setBody('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value)
    // Auto-grow
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Write a message to your co-owners…"
        rows={3}
        maxLength={2000}
        className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none overflow-hidden"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-text-muted">Ctrl+Enter to send · {body.length}/2000</p>
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="text-sm font-semibold bg-navy text-white rounded px-4 py-2 hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
