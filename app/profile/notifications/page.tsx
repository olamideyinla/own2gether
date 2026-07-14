export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionProfile } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/Header'

export default async function NotificationsPage() {
  const profile = await getSessionProfile()
  if (!profile) redirect('/sign-in')

  // Fetch notifications, then mark them all as read
  const notifications = await db.notification.findMany({
    where:   { profileId: profile.id },
    orderBy: { createdAt: 'desc' },
    take:    100,
  })

  // Mark all unread as read
  if (notifications.some(n => !n.read)) {
    await db.notification.updateMany({
      where: { profileId: profile.id, read: false },
      data:  { read: true },
    })
  }

  return (
    <>
      <Header />

      <section className="bg-navy text-white">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Link href="/profile" className="text-white/50 text-xs hover:text-white/80 transition-colors">
            ← My account
          </Link>
          <h1 className="text-xl font-bold mt-2">Notifications</h1>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {notifications.length === 0 ? (
          <div className="border border-border rounded-xl p-8 text-center text-sm text-text-muted">
            No notifications yet. You will be notified here when there are updates on your commitments or identity verification.
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`border rounded-xl p-4 ${!n.read ? 'border-teal/30 bg-teal/5' : 'border-border bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.body}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="inline-block mt-2 text-xs font-medium text-navy hover:underline"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-text-muted whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    {!n.read && (
                      <span className="inline-block mt-1 w-2 h-2 rounded-full bg-teal ml-auto" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
