export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { markReadAction, deleteMessageAction } from './actions'

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const unread = messages.filter(m => !m.read).length

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-lg font-bold text-navy">Contact messages</h1>
        <span className="text-xs text-text-muted">{unread} unread · {messages.length} total</span>
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-text-muted py-16 text-center border border-border rounded-xl">
          No messages yet.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div
              key={m.id}
              className={`rounded-xl border p-5 ${m.read ? 'border-border bg-white' : 'border-teal/30 bg-teal/5'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-navy">{m.name}</span>
                    {!m.read && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-teal bg-teal/10 rounded-full px-2 py-0.5">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="text-xs text-text-muted hover:text-navy transition-colors">
                        {m.email}
                      </a>
                    )}
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="text-xs text-text-muted hover:text-navy transition-colors">
                        {m.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-text-muted shrink-0">
                  {m.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap mb-4">
                {m.message}
              </p>

              <div className="flex gap-3">
                {!m.read && (
                  <form action={markReadAction.bind(null, m.id)}>
                    <button
                      type="submit"
                      className="text-xs font-semibold text-teal border border-teal/30 rounded px-3 py-1.5 hover:bg-teal/10 transition-colors"
                    >
                      Mark as read
                    </button>
                  </form>
                )}
                <form action={deleteMessageAction.bind(null, m.id)}>
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-600 border border-red-200 rounded px-3 py-1.5 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
