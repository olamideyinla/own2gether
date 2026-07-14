'use client'

import { useRef, useState, useTransition } from 'react'
import { submitPaymentReceipt } from './actions'

type Props = {
  commitmentId:  string
  propertyTitle: string
  alreadySubmitted: boolean
}

export function UploadReceiptButton({ commitmentId, propertyTitle, alreadySubmitted }: Props) {
  const [error,     setError]     = useState<string | null>(null)
  const [done,      setDone]      = useState(alreadySubmitted)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    startTransition(async () => {
      const form = new FormData()
      form.set('commitmentId', commitmentId)
      form.set('receipt', file)
      const result = await submitPaymentReceipt(form)
      if (result?.error) {
        setError(result.error)
      } else {
        setDone(true)
      }
    })
  }

  if (done) {
    return (
      <span className="text-xs text-teal font-medium">
        ✓ Receipt submitted — awaiting confirmation
      </span>
    )
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="text-xs font-medium border border-teal/40 text-teal rounded px-3 py-1.5 hover:bg-teal/5 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Uploading…' : 'Upload payment receipt'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-[11px] text-text-muted">JPG, PNG or PDF · max 10 MB</p>
    </div>
  )
}
