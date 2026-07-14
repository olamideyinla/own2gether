'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'

type Props = {
  name:  string
  phone: string | null
  email: string
}

export function EditProfileForm({ name, phone, email }: Props) {
  const [result, action, isPending] = useActionState(updateProfile, null)

  const isError   = result?.startsWith('error:')
  const isSuccess = result === 'ok'

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-xs font-medium text-text-secondary mb-1.5">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={name}
          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
          Email <span className="text-text-muted font-normal">(cannot be changed)</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="w-full border border-border rounded px-3 py-2 text-sm bg-surface-raised text-text-muted cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-medium text-text-secondary mb-1.5">
          Phone number <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ''}
          placeholder="+234 800 000 0000"
          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
        />
      </div>

      {isError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {result!.slice(6)}
        </p>
      )}
      {isSuccess && (
        <p className="text-xs text-teal bg-teal/5 border border-teal/20 rounded px-3 py-2">
          Details saved.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-navy text-white rounded px-4 py-2 text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
