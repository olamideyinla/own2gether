export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { deleteSubscriberAction } from './actions'

export default async function AdminSubscribersPage() {
  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const listingsCount = subscribers.filter(s => s.subscribeListings).length
  const dealsCount    = subscribers.filter(s => s.subscribeDeals).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-navy">Subscribers</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {subscribers.length} total · {listingsCount} listings · {dealsCount} deals
          </p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="border border-border rounded-xl p-10 text-center text-sm text-text-muted">
          No subscribers yet.
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-raised border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-center">Listings</th>
                <th className="px-5 py-3 text-center">Deals</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} className="border-t border-border hover:bg-surface-raised/50">
                  <td className="px-5 py-3 font-medium text-navy">{s.email}</td>
                  <td className="px-5 py-3 text-text-secondary">{s.name ?? <span className="text-text-muted">—</span>}</td>
                  <td className="px-5 py-3 text-center">
                    {s.subscribeListings
                      ? <span className="inline-block w-2 h-2 rounded-full bg-teal" title="Yes" />
                      : <span className="inline-block w-2 h-2 rounded-full bg-border" title="No" />}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {s.subscribeDeals
                      ? <span className="inline-block w-2 h-2 rounded-full bg-teal" title="Yes" />
                      : <span className="inline-block w-2 h-2 rounded-full bg-border" title="No" />}
                  </td>
                  <td className="px-5 py-3 text-xs text-text-muted">
                    {s.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteSubscriberAction.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
