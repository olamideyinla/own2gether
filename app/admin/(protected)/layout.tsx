export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { adminLogout } from '../login/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [unreadCount, unreadMessages] = await Promise.all([
    db.notification.count({ where: { adminOnly: true, profileId: null, read: false } }),
    db.contactMessage.count({ where: { read: false } }).catch(() => 0),
  ])

  return (
    <div className="min-h-screen bg-surface-raised">
      <nav className="bg-navy text-white px-4 py-0 flex items-center gap-0 h-10 text-sm sticky top-0 z-10">
        <span className="font-bold text-xs tracking-wider mr-5 opacity-70">OWN2GETHER ADMIN</span>
        <Link href="/admin"                className="px-3 h-10 flex items-center hover:bg-white/10 transition-colors">Listings</Link>
        <Link href="/admin/deals"          className="px-3 h-10 flex items-center hover:bg-white/10 transition-colors">Deals</Link>
        <Link href="/admin/kyc"            className="px-3 h-10 flex items-center hover:bg-white/10 transition-colors">KYC</Link>
        <Link href="/admin/lapsed"         className="px-3 h-10 flex items-center hover:bg-white/10 transition-colors">Lapsed</Link>
        <Link href="/admin/reconciliation" className="px-3 h-10 flex items-center hover:bg-white/10 transition-colors">Reconciliation</Link>
        <Link href="/admin/subscribers" className="px-3 h-10 flex items-center hover:bg-white/10 transition-colors">Subscribers</Link>
        <Link href="/admin/messages"    className="px-3 h-10 flex items-center gap-1.5 hover:bg-white/10 transition-colors">
          Messages
          {unreadMessages > 0 && (
            <span className="min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full inline-flex items-center justify-center px-1">
              {unreadMessages > 99 ? '99+' : unreadMessages}
            </span>
          )}
        </Link>

        {/* Notification bell */}
        <Link
          href="/admin/notifications"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          className="relative ml-2 px-3 h-10 flex items-center hover:bg-white/10 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span className="ml-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full inline-flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <form action={adminLogout} className="ml-auto">
          <button
            type="submit"
            className="px-3 h-10 flex items-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs"
          >
            Log out
          </button>
        </form>
      </nav>
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  )
}
