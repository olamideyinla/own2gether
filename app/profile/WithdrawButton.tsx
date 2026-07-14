'use client'

import { useState, useTransition } from 'react'
import { withdrawCommitmentAction } from './actions'

type Props = {
  commitmentId: string
}

export function WithdrawButton({ commitmentId }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()

  function handleClick() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await withdrawCommitmentAction(commitmentId)
      if (result.error) {
        setError(result.error)
        setConfirming(false)
      }
    })
  }

  return (
    <div className="space-y-1">
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={handleClick}
          disabled={isPending}
          className={`text-xs font-medium rounded px-3 py-1.5 transition-colors disabled:opacity-50 ${
            confirming
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border border-border text-text-secondary hover:border-red-300 hover:text-red-600'
          }`}
        >
          {isPending ? 'Withdrawing…' : confirming ? 'Confirm withdrawal' : 'Withdraw'}
        </button>
        {confirming && !isPending && (
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-text-muted hover:text-navy transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
