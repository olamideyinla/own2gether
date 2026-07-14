'use client'

import { useTransition } from 'react'

export function DeleteListingButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Delete this listing permanently? This cannot be undone.')) return
        startTransition(() => action())
      }}
      className="text-xs text-red-600 hover:text-red-700 underline underline-offset-2 disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
