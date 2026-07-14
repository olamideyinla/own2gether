export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatNGN } from '@/lib/currency'
import { checkPaymentWindowExpiry } from '@/lib/allocation'
import {
  runAllocationAction,
  markCommitmentPaidAction,
  approveDocAction,
  rejectDocAction,
  deletePropertyAction,
} from './actions'
import { DeleteListingButton } from './DeleteListingButton'

type PageProps = {
  params:      Promise<{ id: string }>
  searchParams: Promise<{ ran?: string; paid?: string; approved?: string; rejected?: string; created?: string; updated?: string; deleteError?: string }>
}

export default async function AdminListingPage({ params, searchParams }: PageProps) {
  const { id }                           = await params
  const { ran, paid, approved, rejected, created, updated, deleteError } = await searchParams

  const [property, pendingDocs] = await Promise.all([
    db.property.findUnique({
      where: { id },
      include: {
        commitments: {
          orderBy: { amount: 'desc' },
          include: {
            profile:         { select: { id: true, name: true, email: true, kycStatus: true } },
            connectionGroup: { select: { code: true } },
          },
        },
      },
    }),
    db.identityDocument.findMany({
      where: {
        status: 'pending',
        profile: { commitments: { some: { propertyId: id } } },
      },
      orderBy: { submittedAt: 'asc' },
      include: {
        profile: { select: { id: true, name: true, email: true } },
      },
    }),
  ])

  if (!property) notFound()

  const now            = new Date()
  const totalCommitted = property.commitments
    .filter(c => c.status !== 'withdrawn')
    .reduce((sum, c) => sum + Number(c.amount), 0)

  // Bind actions that don't need extra form data
  const boundRunAlloc  = runAllocationAction.bind(null, id)
  const boundDelete    = deletePropertyAction.bind(null, id)

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Flash messages */}
      {created     && <Flash msg="Property created." />}
      {updated     && <Flash msg="Property updated." />}
      {ran         && <Flash msg="Allocation run successfully." />}
      {paid        && <Flash msg="Commitment marked as paid." />}
      {approved    && <Flash msg="Document approved — profile set to verified." />}
      {rejected    && <Flash msg="Document rejected." variant="warn" />}
      {deleteError && <Flash msg="Cannot delete — listing has active commitments." variant="warn" />}

      {/* Property summary */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-navy">{property.title}</h1>
            <p className="text-sm text-text-secondary">{property.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono px-2 py-1 rounded border ${statusStyle(property.status)}`}>
              {property.status}
            </span>
            <Link
              href={`/admin/listings/${id}/edit`}
              className="text-xs text-navy underline underline-offset-2 hover:text-teal"
            >
              Edit →
            </Link>
            <DeleteListingButton action={boundDelete} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="Total raise"   value={formatNGN(Number(property.totalRaise))} />
          <Stat label="Committed"     value={formatNGN(totalCommitted)} />
          <Stat label="Commitments"   value={String(property.commitments.filter(c => c.status !== 'withdrawn').length)} />
        </div>
      </div>

      {/* Media preview */}
      {(property.photos.length > 0 || property.videos.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Media</h2>

          {property.photos.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2">Photos ({property.photos.length})</p>
              <div className="flex flex-wrap gap-2">
                {property.photos.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-32 h-24 rounded overflow-hidden border border-border hover:border-teal transition-colors shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {property.videos.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2">Videos ({property.videos.length})</p>
              <ul className="space-y-1.5">
                {property.videos.map((url, i) => (
                  <li key={url} className="flex items-center gap-2 text-xs">
                    <span className="text-text-muted font-mono w-5">{i + 1}.</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy underline underline-offset-1 hover:text-teal truncate max-w-sm"
                    >
                      {url.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Run allocation */}
      {property.status === 'open' && (
        <div>
          <form action={boundRunAlloc}>
            <button
              type="submit"
              className="text-sm bg-navy text-white px-4 py-2 rounded hover:bg-navy/90 transition-colors"
            >
              Run allocation for this listing
            </button>
          </form>
          <p className="text-xs text-text-muted mt-1">
            This will compute and persist allocation decisions for all active commitments.
          </p>
        </div>
      )}

      {/* Commitments table */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Commitments ({property.commitments.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="pb-2 pr-3 font-medium w-6">#</th>
                <th className="pb-2 pr-3 font-medium">Name</th>
                <th className="pb-2 pr-3 font-medium">Email</th>
                <th className="pb-2 pr-3 font-medium">Group</th>
                <th className="pb-2 pr-3 font-medium text-right">Requested</th>
                <th className="pb-2 pr-3 font-medium text-right">Allocated</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 font-medium">KYC</th>
                <th className="pb-2 pr-3 font-medium">Due</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {property.commitments.map((c, idx) => {
                const window    = checkPaymentWindowExpiry(c.allocationConfirmedAt, now)
                const canPay    = c.status === 'allocated' || c.status === 'capped'
                const boundPay  = markCommitmentPaidAction.bind(null, c.id, id)

                return (
                  <tr key={c.id} className={`border-b border-border/40 ${c.status === 'withdrawn' ? 'opacity-40' : ''}`}>
                    <td className="py-2 pr-3 text-text-muted">{idx + 1}</td>
                    <td className="py-2 pr-3 font-medium text-navy">{c.profile.name}</td>
                    <td className="py-2 pr-3 text-text-secondary">{c.profile.email}</td>
                    <td className="py-2 pr-3 font-mono text-text-muted">
                      {c.connectionGroup?.code ?? '—'}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono">{formatNGN(Number(c.amount))}</td>
                    <td className="py-2 pr-3 text-right font-mono">
                      {c.allocatedAmount ? formatNGN(Number(c.allocatedAmount)) : '—'}
                    </td>
                    <td className="py-2 pr-3">
                      <CommitmentBadge status={c.status} />
                    </td>
                    <td className="py-2 pr-3">
                      <KycBadge status={c.profile.kycStatus} />
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {c.paymentDueAt ? (
                        <span className={window.lapsed ? 'text-red-600 font-medium' : 'text-text-secondary'}>
                          {fmtDate(c.paymentDueAt)}
                          {window.lapsed && ' ⚠'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2 items-center">
                        {canPay && (
                          <form action={boundPay}>
                            <button
                              type="submit"
                              className="text-xs bg-teal text-white px-2 py-1 rounded hover:bg-teal/80 transition-colors"
                            >
                              Mark paid
                            </button>
                          </form>
                        )}
                        {c.status === 'paid' && (
                          <span className="text-xs text-teal font-medium">✓ paid</span>
                        )}
                        <Link
                          href={`/commitments/${c.id}/flow`}
                          className="text-xs text-text-muted underline underline-offset-1 hover:text-navy"
                          target="_blank"
                        >
                          flow ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {property.commitments.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-4 text-center text-text-muted">No commitments yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending KYC documents */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Pending identity documents ({pendingDocs.length})
        </h2>
        {pendingDocs.length === 0 ? (
          <p className="text-sm text-text-muted">No pending documents.</p>
        ) : (
          <div className="space-y-4">
            {pendingDocs.map((doc) => {
              const boundApprove = approveDocAction.bind(null, doc.id, id)
              return (
                <div key={doc.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-navy">{doc.profile.name}</p>
                      <p className="text-xs text-text-secondary">{doc.profile.email}</p>
                    </div>
                    <div className="text-right text-xs text-text-muted">
                      <p className="font-mono">{doc.type}</p>
                      <p>Submitted {fmtDate(doc.submittedAt)}</p>
                    </div>
                  </div>

                  {/* Document viewer links — served through admin proxy */}
                  <div className="flex gap-4 text-xs">
                    <a
                      href={`/api/admin/blob?docId=${doc.id}&field=id`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy underline underline-offset-1 hover:text-teal"
                    >
                      View ID document ↗
                    </a>
                    <a
                      href={`/api/admin/blob?docId=${doc.id}&field=proof`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy underline underline-offset-1 hover:text-teal"
                    >
                      View proof of address ↗
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end gap-3">
                    <form action={boundApprove}>
                      <button
                        type="submit"
                        className="text-xs bg-teal text-white px-3 py-1.5 rounded hover:bg-teal/80 transition-colors"
                      >
                        Approve
                      </button>
                    </form>

                    <form action={rejectDocAction} className="flex items-end gap-2 flex-1">
                      <input type="hidden" name="docId" value={doc.id} />
                      <input type="hidden" name="propertyId" value={id} />
                      <input
                        type="text"
                        name="reason"
                        required
                        placeholder="Rejection reason (required)…"
                        className="flex-1 text-xs border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
                      />
                      <button
                        type="submit"
                        className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-500 transition-colors whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Link
        href="/admin"
        className="text-xs text-text-muted underline underline-offset-2 hover:text-navy"
      >
        ← Back to listings
      </Link>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function statusStyle(s: string): string {
  const m: Record<string, string> = {
    open:            'bg-green-50 text-green-700 border-green-200',
    fully_allocated: 'bg-teal-light text-teal border-teal/20',
    closed:          'bg-surface-info text-text-secondary border-border',
    cancelled:       'bg-red-50 text-red-700 border-red-200',
  }
  return m[s] ?? 'bg-surface border-border text-text-muted'
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-border rounded px-3 py-2">
      <p className="text-text-muted text-xs mb-0.5">{label}</p>
      <p className="font-mono text-sm font-semibold text-navy">{value}</p>
    </div>
  )
}

function Flash({ msg, variant = 'ok' }: { msg: string; variant?: 'ok' | 'warn' }) {
  const cls = variant === 'ok'
    ? 'bg-teal-light border-teal/20 text-teal'
    : 'bg-amber-50 border-amber-200 text-amber-800'
  return (
    <div className={`border rounded px-4 py-2.5 text-sm font-medium ${cls}`}>{msg}</div>
  )
}

function CommitmentBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    pending:             'bg-surface-info text-text-secondary border-border',
    allocated:           'bg-teal-light text-teal border-teal/20',
    capped:              'bg-amber-50 text-amber-800 border-amber-200',
    partially_allocated: 'bg-amber-50 text-amber-800 border-amber-200',
    paid:                'bg-green-50 text-green-700 border-green-200',
    withdrawn:           'bg-surface text-text-muted border-border',
  }
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded border font-mono ${m[status] ?? ''}`}>
      {status}
    </span>
  )
}

function KycBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    unverified: 'bg-surface text-text-muted border-border',
    pending:    'bg-amber-50 text-amber-800 border-amber-200',
    verified:   'bg-teal-light text-teal border-teal/20',
  }
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded border font-mono ${m[status] ?? ''}`}>
      {status}
    </span>
  )
}
