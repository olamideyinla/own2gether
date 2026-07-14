export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { markAdminNotificationsRead } from './actions'

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({
    where:   { adminOnly: true, profileId: null },
    orderBy: { createdAt: 'desc' },
    take:    200,
    include: { profile: { select: { name: true, email: true } } },
  })

  // Mark all unread as read
  if (notifications.some(n => !n.read)) {
    await db.notification.updateMany({
      where: { adminOnly: true, profileId: null, read: false },
      data:  { read: true },
    })
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-navy">Admin notifications</h1>
        {notifications.length > 0 && (
          <form action={markAdminNotificationsRead}>
            <button type="submit" className="text-xs text-text-muted hover:text-navy transition-colors">
              Mark all read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border border-border rounded-lg px-6 py-10 text-center text-sm text-text-muted">
          No notifications.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`border rounded-lg p-4 ${!n.read ? 'border-amber-200 bg-amber-50/50' : 'border-border bg-white'}`}
            >
              <div className="flex items-start gap-3">
                {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-navy">{n.title}</p>
                    <span className="text-[10px] font-mono text-text-muted bg-surface-raised border border-border rounded px-1.5 py-0.5">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.body}</p>
                  {n.link && (
                    <Link href={n.link} className="inline-block mt-1.5 text-xs font-medium text-navy hover:underline">
                      View →
                    </Link>
                  )}
                </div>
                <p className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                  {new Date(n.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  <br />
                  {new Date(n.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
