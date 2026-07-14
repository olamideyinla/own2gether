'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signIn } from './actions'

export default function SignInPage() {
  const [error, action, isPending] = useActionState(signIn, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-surface-raised flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-1">Own2gether</p>
          <h1 className="text-xl font-semibold text-navy">Sign in</h1>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoFocus
              autoComplete="email"
              className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                className="w-full border border-border rounded px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-navy px-2 py-1 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
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
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-navy font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
