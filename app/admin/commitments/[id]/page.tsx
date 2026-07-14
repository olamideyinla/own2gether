export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { formatNGN } from '@/lib/currency'
import { runAllocation, markCommitmentPaid } from './actions'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ran?: string; paid?: string }>
}

export default async function AdminCommitmentPage({ params, searchParams }: PageProps) {
  const { id }                = await params
  const { ran, paid: paidQs } = await searchParams

  const commitment = await db.commitment.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, title: true, location: true, status: true, totalRaise: true } },
      profile:  { select: { id: true, name: true, email: true } },
    },
  })

  if (!commitment) notFound()

  const { property, profile } = commitment

  const canRunAllocation = property.status === 'open'
  const canMarkPaid      = commitment.status === 'allocated' || commitment.status === 'capped'

  // Bind server actions to this commitment id
  const boundRunAllocation  = runAllocation.bind(null, id)
  const boundMarkPaid       = markCommitmentPaid.bind(null, id)

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Dev warning */}
      <div className="bg-amber-50 border border-amber-300 rounded px-4 py-3 text-xs text-amber-800 font-medium">
        Dev/Admin only — no authentication
      </div>

      <h1 className="text-xl font-semibold text-navy">Admin: Commitment</h1>

      {/* Flash messages */}
      {ran && (
        <div className="bg-teal-light border border-teal/20 rounded px-4 py-3 text-sm text-teal font-medium">
          ✓ Allocation run successfully.
        </div>
      )}
      {paidQs && (
        <div className="bg-teal-light border border-teal/20 rounded px-4 py-3 text-sm text-teal font-medium">
          ✓ Commitment marked as paid.
        </div>
      )}

      {/* Commitment details */}
      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Commitment ID</span>
          <span className="font-mono text-xs text-text-primary">{commitment.id}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Property</span>
          <span className="text-text-primary">{property.title}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Location</span>
          <span className="text-text-primary">{property.location}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Property status</span>
          <span className="font-mono text-xs text-text-primary">{property.status}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Commitment amount</span>
          <span className="font-mono font-semibold text-navy">{formatNGN(Number(commitment.amount))}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Allocated amount</span>
          <span className="font-mono text-text-primary">
            {commitment.allocatedAmount ? formatNGN(Number(commitment.allocatedAmount)) : '—'}
          </span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Status</span>
          <span className="font-mono text-xs font-semibold text-navy">{commitment.status}</span>
        </div>
        {commitment.paidAt && (
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-text-secondary">Paid at</span>
            <span className="text-text-primary">
              {new Date(commitment.paidAt).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
        )}
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Profile</span>
          <span className="text-text-primary">{profile.name}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <span className="text-text-secondary">Email</span>
          <span className="text-text-primary">{profile.email}</span>
        </div>
      </div>

      {/* Admin actions */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Actions</h2>

        {/* Run allocation */}
        <form action={boundRunAllocation}>
          <button
            type="submit"
            disabled={!canRunAllocation}
            className="w-full py-2.5 rounded text-sm font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-navy text-white hover:bg-navy/90"
          >
            Run allocation for this property
          </button>
          {!canRunAllocation && (
            <p className="text-xs text-text-muted mt-1">
              Only available when property status is &quot;open&quot; (currently: {property.status}).
            </p>
          )}
        </form>

        {/* Mark as paid */}
        <form action={boundMarkPaid}>
          <button
            type="submit"
            disabled={!canMarkPaid}
            className="w-full py-2.5 rounded text-sm font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-teal text-white hover:bg-teal/90"
          >
            Mark commitment as paid
          </button>
          {!canMarkPaid && (
            <p className="text-xs text-text-muted mt-1">
              Only available when status is &quot;allocated&quot; or &quot;capped&quot; (currently: {commitment.status}).
            </p>
          )}
        </form>
      </div>

      {/* Links */}
      <div className="flex gap-4 text-sm">
        <a href={`/commitments/${id}/flow`} className="text-teal underline underline-offset-2 hover:text-teal/80">
          View commitment flow →
        </a>
        <a href={`/properties/${property.id}`} className="text-text-muted underline underline-offset-2 hover:text-navy">
          View deal page →
        </a>
      </div>
    </main>
  )
}
