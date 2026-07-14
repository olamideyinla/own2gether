export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { approveKycDocAction, rejectKycDocAction } from './actions'

const SLA_DAYS = 3

type PageProps = {
  searchParams: Promise<{ approved?: string; rejected?: string }>
}

export default async function AdminKycPage({ searchParams }: PageProps) {
  const { approved, rejected } = await searchParams

  const docs = await db.identityDocument.findMany({
    where: { status: 'pending' },
    orderBy: { submittedAt: 'asc' },
    include: {
      profile: {
        select: {
          id:                 true,
          name:               true,
          email:              true,
          phone:              true,
          kycStatus:          true,
          dateOfBirth:        true,
          nationality:        true,
          occupation:         true,
          residentialAddress: true,
        },
      },
    },
  })

  const now = new Date()

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-navy">KYC Review Queue</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {docs.length} pending · oldest first · SLA {SLA_DAYS} days
          </p>
        </div>
        <span className="text-xs text-text-muted font-mono">
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Flash messages */}
      {approved && (
        <div className="border rounded px-4 py-2.5 text-sm font-medium bg-teal-light border-teal/20 text-teal">
          Document approved — profile set to verified.
        </div>
      )}
      {rejected && (
        <div className="border rounded px-4 py-2.5 text-sm font-medium bg-amber-50 border-amber-200 text-amber-800">
          Document rejected.
        </div>
      )}

      {docs.length === 0 ? (
        <div className="border border-border rounded-lg px-6 py-12 text-center text-sm text-text-muted">
          No documents pending review.
        </div>
      ) : (
        <div className="space-y-6">
          {docs.map((doc) => {
            const submittedAt = new Date(doc.submittedAt)
            const ageMs       = now.getTime() - submittedAt.getTime()
            const ageDays     = Math.floor(ageMs / (1000 * 60 * 60 * 24))
            const slaBreached = ageDays >= SLA_DAYS

            return (
              <div
                key={doc.id}
                className={`border rounded-lg overflow-hidden ${slaBreached ? 'border-red-300' : 'border-border'}`}
              >
                {/* Header */}
                <div className={`px-5 py-3 flex items-center justify-between gap-4 border-b ${slaBreached ? 'bg-red-50/50 border-red-200' : 'bg-surface-raised border-border'}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-navy">{doc.profile.name}</p>
                    {slaBreached && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                        SLA breached
                      </span>
                    )}
                  </div>
                  <div className="text-right text-xs text-text-muted shrink-0">
                    <p>Submitted {submittedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className={slaBreached ? 'text-red-600 font-medium' : ''}>
                      {ageDays === 0 ? 'Today' : `${ageDays}d ago`}
                    </p>
                  </div>
                </div>

                {/* ── CAC registration details ── */}
                <div className="px-5 py-4 space-y-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">CAC shareholder details</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-xs">
                    <div>
                      <p className="text-text-muted mb-0.5">Full legal name</p>
                      <p className="font-medium text-navy">{doc.profile.name}</p>
                    </div>
                    <div>
                      <p className="text-text-muted mb-0.5">Email</p>
                      <p className="font-medium">{doc.profile.email}</p>
                    </div>
                    {doc.profile.phone && (
                      <div>
                        <p className="text-text-muted mb-0.5">Phone</p>
                        <p className="font-medium">{doc.profile.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-text-muted mb-0.5">Date of birth</p>
                      <p className="font-medium">
                        {doc.profile.dateOfBirth
                          ? new Date(doc.profile.dateOfBirth).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })
                          : <span className="text-amber-600">Not provided</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted mb-0.5">Nationality</p>
                      <p className="font-medium">{doc.profile.nationality ?? <span className="text-amber-600">Not provided</span>}</p>
                    </div>
                    <div>
                      <p className="text-text-muted mb-0.5">Occupation</p>
                      <p className="font-medium">{doc.profile.occupation ?? <span className="text-amber-600">Not provided</span>}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-text-muted mb-0.5">Residential address</p>
                      <p className="font-medium whitespace-pre-line">
                        {doc.profile.residentialAddress ?? <span className="text-amber-600">Not provided</span>}
                      </p>
                    </div>
                  </div>

                  {/* ── Document details ── */}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Identity document</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-xs">
                      <div>
                        <p className="text-text-muted mb-0.5">Document type</p>
                        <p className="font-medium capitalize">{doc.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-0.5">Document number</p>
                        <p className="font-mono font-medium">{doc.documentNumber ?? <span className="text-amber-600">Not provided</span>}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-0.5">Expiry date</p>
                        <p className="font-medium">
                          {doc.expiryDate
                            ? new Date(doc.expiryDate).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })
                            : 'None / N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Document preview links ── */}
                  <div className="border-t border-border pt-4 flex gap-4 text-xs flex-wrap">
                    <a
                      href={`/api/admin/blob?docId=${doc.id}&field=id`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-navy border border-border rounded px-3 py-1.5 hover:bg-surface-raised transition-colors"
                    >
                      View ID document ↗
                    </a>
                    <a
                      href={`/api/admin/blob?docId=${doc.id}&field=proof`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-navy border border-border rounded px-3 py-1.5 hover:bg-surface-raised transition-colors"
                    >
                      View proof of address ↗
                    </a>
                  </div>

                  {/* ── Approve / Reject ── */}
                  <div className="border-t border-border pt-4 flex items-end gap-3">
                    <form action={approveKycDocAction}>
                      <input type="hidden" name="docId" value={doc.id} />
                      <button
                        type="submit"
                        className="text-xs bg-teal text-white px-4 py-2 rounded hover:bg-teal/80 transition-colors font-medium"
                      >
                        Approve
                      </button>
                    </form>

                    <form action={rejectKycDocAction} className="flex items-end gap-2 flex-1">
                      <input type="hidden" name="docId" value={doc.id} />
                      <input
                        type="text"
                        name="reason"
                        required
                        placeholder="Rejection reason (required)…"
                        className="flex-1 text-xs border border-border rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
                      />
                      <button
                        type="submit"
                        className="text-xs bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition-colors font-medium whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
