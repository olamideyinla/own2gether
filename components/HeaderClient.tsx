'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/sign-out/actions'

const NAV_LINKS = [
  { label: 'About',        href: '/about' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Listings',     href: '/listings' },
  { label: 'Deals',        href: '/deals' },
  { label: 'Contact us',   href: '/contact' },
]

type Props = {
  profile:     { name: string } | null
  unreadCount: number
}

function BellIcon({ count }: { count: number }) {
  return (
    <Link
      href="/profile/notifications"
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
      className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-surface-raised transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-secondary" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}

export function HeaderClient({ profile, unreadCount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-navy font-bold text-[17px] tracking-tight leading-none select-none"
        >
          Own<span className="text-teal">2</span>gether
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-text-secondary hover:text-navy transition-colors duration-150"
            >
              {label}
            </Link>
          ))}

          {profile ? (
            <div className="ml-2 flex items-center gap-1">
              <BellIcon count={unreadCount} />
              <Link
                href="/profile"
                className="text-sm font-semibold text-navy border border-border rounded px-3 py-1.5 hover:border-navy transition-colors duration-150 ml-1"
              >
                My account
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm font-medium text-text-muted hover:text-navy transition-colors duration-150 px-2 py-1.5"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="ml-2 text-sm font-semibold text-navy border border-border rounded px-3 py-1.5 hover:border-navy transition-colors duration-150"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded hover:bg-surface-raised transition-colors"
        >
          <span className={`block h-0.5 w-5 bg-navy transition-all duration-200 origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-5 bg-navy transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-navy transition-all duration-200 origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="max-w-6xl mx-auto px-6 py-3 flex flex-col">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-text-secondary hover:text-navy transition-colors duration-150 border-b border-border"
              >
                {label}
              </Link>
            ))}
            {profile ? (
              <>
                <Link
                  href="/profile/notifications"
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-medium text-text-secondary hover:text-navy transition-colors duration-150 border-b border-border flex items-center justify-between"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm font-medium text-text-secondary hover:text-navy transition-colors duration-150 border-b border-border"
                >
                  My account
                </Link>
                <form action={signOut} className="mt-3 mb-1">
                  <button
                    type="submit"
                    className="w-full text-sm font-semibold text-text-muted border border-border rounded px-3 py-2 text-center hover:border-navy hover:text-navy transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="mt-3 mb-1 text-sm font-semibold text-navy border border-border rounded px-3 py-2 text-center hover:border-navy transition-colors duration-150"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
