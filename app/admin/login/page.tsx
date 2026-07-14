'use client'

import { useActionState } from 'react'
import { adminLogin } from './actions'

export default function AdminLoginPage() {
  const [error, action, isPending] = useActionState(adminLogin, null)

  return (
    <div className="min-h-screen bg-surface-raised flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-1">Own2gether</p>
          <h1 className="text-xl font-semibold text-navy">Admin access</h1>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors font-mono"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-navy text-white py-2.5 rounded text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
