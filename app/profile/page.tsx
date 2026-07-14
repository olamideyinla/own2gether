export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionProfile } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatNGN, formatNGNCompact } from '@/lib/currency'
import { EditProfileForm } from './EditProfileForm'
import { WithdrawButton } from './WithdrawButton'
import { ShareCode } from './ShareCode'
import { UploadReceiptButton } from './UploadReceiptButton'

// ─── KYC badge ────────────────────────────────────────────────────────────────

function KycBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    verified:   { label: 'KYC verified',   className: 'bg-teal/10 text-teal border-teal/20' },
    pending:    { label: 'KYC pending',     className: 'bg-amber-50 text-amber-700 border-amber-200' },
    unverified: { label: 'KYC unverified',  className: 'bg-surface-raised text-text-muted border-border' },
  }
  const { label, className } = map[status] ?? map.unverified
  return (
    <span className={`inline-block text-xs font-medium border rounded-full px-2.5 py-0.5 ${className}`}>
      {label}
    </span>
  )
}

// ─── Commitment status pill ───────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:             'bg-surface-raised text-text-muted border-border',
    allocated:           'bg-teal/10 text-teal border-teal/20',
    partially_allocated: 'bg-teal/10 text-teal border-teal/20',
    capped:              'bg-amber-50 text-amber-700 border-amber-200',
    paid:                'bg-navy/10 text-navy border-navy/20',
    withdrawn:           'bg-red-50 text-red-500 border-red-200',
  }
  const label = status.replace(/_/g, ' ')
  return (
    <span className={`inline-block text-[11px] font-medium border rounded-full px-2 py-0.5 capitalize ${map[status] ?? ''}`}>
      {label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const profile = await getSessionProfile()
  if (!profile) redirect('/sign-in')

  // Fetch commitments, stakes, connection groups, and withdrawal count in parallel
  const [commitments, stakes, connectionGroups, withdrawalCount] = await Promise.all([
    db.commitment.findMany({
      where:   { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id:                    true,
        amount:                true,
        allocatedAmount:       true,
        status:                true,
        createdAt:             true,
        allocationConfirmedAt: true,
        paymentDueAt:          true,
        paidAt:                true,
        paymentReceiptUrl:     true,
        paymentSubmittedAt:    true,
        connectionGroupId:     true,
        connectionGroup: {
          select: { code: true, createdByProfileId: true },
        },
        property: {
          select: {
            id:         true,
            title:      true,
            location:   true,
            totalRaise: true,
            status:     true,
          },
        },
      },
    }),
    db.stake.findMany({
      where:   { profileId: profile.id },
      select: {
        id:         true,
        percentage: true,
        source:     true,
        property: {
          select: { id: true, title: true, location: true, status: true },
        },
      },
    }),
    // Groups this profile created (so we can show them the codes)
    db.connectionGroup.findMany({
      where:   { createdByProfileId: profile.id },
      select: {
        code:       true,
        propertyId: true,
        property: { select: { title: true } },
        commitments: {
          select: { profileId: true, profile: { select: { name: true } } },
        },
      },
    }),
    db.withdrawal.count({ where: { profileId: profile.id } }),
  ])

  const withdrawableStatuses = new Set(['pending', 'allocated', 'partially_allocated', 'capped'])
  const receiptableStatuses  = new Set(['allocated', 'partially_allocated', 'capped'])
  const activeCommitments    = commitments.filter(c =>
    withdrawableStatuses.has(c.status) || c.status === 'payment_submitted'
  )
  const closedCommitments    = commitments.filter(c => !withdrawableStatuses.has(c.status))

  // Map propertyId → connection group code created by this user
  const myGroupByProperty = new Map(
    connectionGroups.map(g => [g.propertyId, g])
  )

  return (
    <>
      <Header />

      {/* Profile hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-1">My account</p>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-white/60 text-sm mt-0.5">{profile.email}</p>
          </div>
          <KycBadge status={profile.kycStatus} />
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-14">

        {/* ── My details ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-navy mb-1">My details</h2>
          <p className="text-sm text-text-muted mb-5">Update your name and phone number.</p>
          <div className="border border-border rounded-xl p-6 max-w-md">
            <EditProfileForm
              name={profile.name}
              phone={profile.phone ?? null}
              email={profile.email}
            />
          </div>
        </section>

        {/* ── KYC / identity verification ────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-navy mb-1">Identity verification</h2>
          <p className="text-sm text-text-muted mb-5">
            Required before any commitment can be allocated. Documents are used for CAC shareholder registration.
          </p>
          <div className="border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <KycBadge status={profile.kycStatus} />
              {profile.kycStatus === 'unverified' && (
                <Link
                  href="/profile/verify"
                  className="text-sm font-semibold text-white bg-navy rounded px-4 py-2 hover:bg-navy/90 transition-colors"
                >
                  Submit documents →
                </Link>
              )}
            </div>

            {profile.kycStatus === 'unverified' && (
              <p className="text-sm text-text-secondary leading-relaxed">
                You have not submitted identity documents yet. Own2gether requires a government-issued
                ID, proof of address, and personal details to register you as a shareholder in the
                property company (SPV) at the CAC.
              </p>
            )}
            {profile.kycStatus === 'pending' && (
              <p className="text-sm text-text-secondary leading-relaxed">
                Your documents are under review. Our team will verify them within 3 business days.
                You will be notified by email once the review is complete.
              </p>
            )}
            {profile.kycStatus === 'verified' && (
              <p className="text-sm text-text-secondary leading-relaxed">
                Your identity has been verified. You are eligible to receive allocations and be
                registered as a shareholder on any property you co-own.
              </p>
            )}
          </div>
        </section>

        {/* ── Active commitments ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-navy mb-1">Active commitments</h2>
          <p className="text-sm text-text-muted mb-1">
            Your pending or allocated commitments. You may withdraw before payment is made.
          </p>
          <p className="text-xs text-text-muted mb-5">
            Withdrawals used: <span className="font-medium">{withdrawalCount} / 3</span>
            {withdrawalCount >= 3 && (
              <span className="ml-2 text-amber-600 font-medium">
                — limit reached until 12 months after first withdrawal
              </span>
            )}
          </p>

          {activeCommitments.length === 0 ? (
            <div className="border border-border rounded-xl p-6 text-center text-sm text-text-muted">
              No active commitments.{' '}
              <Link href="/listings" className="text-navy font-medium hover:underline">
                Browse open listings →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCommitments.map(c => {
                const totalRaise  = Number(c.property.totalRaise)
                const amount      = Number(c.amount)
                const allocated   = c.allocatedAmount ? Number(c.allocatedAmount) : null
                const equityPct   = ((amount / totalRaise) * 97.5).toFixed(2)
                const allocPct    = allocated ? ((allocated / totalRaise) * 97.5).toFixed(2) : null
                const myGroup     = myGroupByProperty.get(c.property.id)
                const groupCode   = c.connectionGroup?.code ?? myGroup?.code ?? null
                const iGroupOwner = c.connectionGroup?.createdByProfileId === profile.id ||
                                    myGroup != null
                const groupMembers = myGroup?.commitments
                  .filter(cm => cm.profileId !== profile.id)
                  .map(cm => cm.profile.name) ?? []

                return (
                  <div key={c.id} className="border border-border rounded-xl overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 px-5 py-4 bg-surface-raised border-b border-border">
                      <div>
                        <Link
                          href={`/listings/${c.property.id}`}
                          className="text-sm font-semibold text-navy hover:underline"
                        >
                          {c.property.title}
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5">{c.property.location}</p>
                      </div>
                      <StatusPill status={c.status} />
                    </div>

                    {/* Detail grid */}
                    <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-text-muted mb-0.5">Committed</p>
                        <p className="font-semibold text-navy">{formatNGN(amount)}</p>
                        <p className="text-text-muted">≈ {equityPct}% equity*</p>
                      </div>
                      {allocated && (
                        <div>
                          <p className="text-text-muted mb-0.5">Allocated</p>
                          <p className="font-semibold text-teal">{formatNGN(allocated)}</p>
                          <p className="text-text-muted">≈ {allocPct}% equity*</p>
                        </div>
                      )}
                      <div>
                        <p className="text-text-muted mb-0.5">Property raise</p>
                        <p className="font-medium text-text-secondary">{formatNGNCompact(totalRaise)}</p>
                        <p className="text-text-muted capitalize">{c.property.status.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-0.5">Committed on</p>
                        <p className="font-medium text-text-secondary">
                          {new Date(c.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                        {c.paymentDueAt && (
                          <p className="text-amber-600 font-medium">
                            Pay by {new Date(c.paymentDueAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Connection code box */}
                    {groupCode && (
                      <div className="mx-5 mb-4 border border-teal/20 bg-teal/5 rounded-lg px-4 py-3 space-y-2">
                        <p className="text-xs font-semibold text-navy">Group connection code</p>
                        {iGroupOwner ? (
                          <>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              Share this code with friends and family. Anyone who enters it when
                              committing to <span className="font-medium">{c.property.title}</span> will
                              be paired with you — your combined total ranks higher together than alone.
                            </p>
                            <ShareCode
                              code={groupCode}
                              propertyTitle={c.property.title}
                              propertyId={c.property.id}
                            />
                          </>
                        ) : (
                          <p className="text-xs text-text-secondary">
                            You joined group{' '}
                            <span className="font-mono font-semibold text-teal">{groupCode}</span>.
                            Commitments in the same group rank by their combined total.
                          </p>
                        )}
                        {groupMembers.length > 0 && (
                          <p className="text-xs text-text-muted">
                            Group members: {groupMembers.join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
                      <Link
                        href={`/commitments/${c.id}/flow`}
                        className="text-xs font-medium text-navy border border-border rounded px-3 py-1.5 hover:border-navy transition-colors"
                      >
                        View commitment flow →
                      </Link>
                      {receiptableStatuses.has(c.status) && (
                        <UploadReceiptButton
                          commitmentId={c.id}
                          propertyTitle={c.property.title}
                          alreadySubmitted={false}
                        />
                      )}
                      {c.status === 'payment_submitted' && (
                        <span className="text-xs text-teal font-medium">
                          ✓ Receipt submitted — awaiting confirmation
                        </span>
                      )}
                      {withdrawableStatuses.has(c.status) && (
                        <WithdrawButton commitmentId={c.id} />
                      )}
                    </div>

                    <p className="px-5 pb-3 text-[11px] text-text-muted">
                      * Equity shown after Own2gether&apos;s 2.5% stake.
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Active stakes / property ownership ─────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-navy mb-1">My listing stakes</h2>
          <p className="text-sm text-text-muted mb-5">
            Properties where your allocation has been confirmed and shares issued.
          </p>

          {stakes.length === 0 ? (
            <div className="border border-border rounded-xl p-6 text-center text-sm text-text-muted">
              You do not hold any stakes yet. Stakes are created once a raise closes and allocation is confirmed.
            </div>
          ) : (
            <div className="space-y-3">
              {stakes.map(s => (
                <div key={s.id} className="border border-border rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <Link
                        href={`/listings/${s.property.id}`}
                        className="text-sm font-semibold text-navy hover:underline"
                      >
                        {s.property.title}
                      </Link>
                      <p className="text-xs text-text-muted mt-0.5">{s.property.location}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-secondary">
                        <span>
                          Your stake:{' '}
                          <span className="font-semibold text-teal text-sm">
                            {Number(s.percentage).toFixed(2)}%
                          </span>
                        </span>
                        <span>
                          Status:{' '}
                          <span className={`font-medium capitalize ${
                            s.property.status === 'closed'            ? 'text-navy' :
                            s.property.status === 'fully_allocated'   ? 'text-teal' : 'text-text-secondary'
                          }`}>
                            {s.property.status.replace(/_/g, ' ')}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link
                        href={`/listings/${s.property.id}`}
                        className="text-xs font-medium text-navy border border-border rounded px-3 py-1.5 hover:border-navy transition-colors whitespace-nowrap"
                      >
                        View listing →
                      </Link>
                      <Link
                        href={`/listings/${s.property.id}/owners`}
                        className="text-xs font-medium text-teal border border-teal/30 rounded px-3 py-1.5 hover:bg-teal/5 transition-colors whitespace-nowrap"
                      >
                        Co-owner hub →
                      </Link>
                    </div>
                  </div>

                  {/* Stake sale section */}
                  <div className="mt-4 border-t border-border pt-4">
                    <details className="group">
                      <summary className="text-xs font-medium text-text-muted hover:text-navy cursor-pointer transition-colors list-none flex items-center gap-1">
                        <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 4l4 4-4 4"/>
                        </svg>
                        Want to sell this stake?
                      </summary>
                      <div className="mt-3 space-y-2 text-xs text-text-secondary leading-relaxed">
                        <p>
                          Under Own2gether&apos;s rules, the other co-owners in this property company have
                          the <strong className="text-navy">right of first refusal</strong> — they may
                          purchase your stake at your proposed price before it is offered to anyone outside
                          the group.
                        </p>
                        <p>
                          Contact us with your asking price and we will notify the other co-owners and
                          manage the process.
                        </p>
                        <a
                          href={`mailto:sales@updates.own2gether.com?subject=Stake sale request — ${encodeURIComponent(s.property.title)}&body=Property: ${encodeURIComponent(s.property.title)}%0AStake: ${Number(s.percentage).toFixed(2)}%%0AAsking price (NGN): `}
                          className="inline-block mt-1 font-medium text-navy border border-navy/30 rounded px-3 py-1.5 hover:bg-navy hover:text-white transition-colors"
                        >
                          Request stake sale via email →
                        </a>
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Past commitments ────────────────────────────────────────────── */}
        {closedCommitments.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-navy mb-1">Past commitments</h2>
            <p className="text-sm text-text-muted mb-5">Withdrawn or paid commitments.</p>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-raised text-xs font-medium text-text-muted border-b border-border">
                    <th className="px-5 py-3 text-left">Property</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {closedCommitments.map(c => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-5 py-3">
                        <Link
                          href={`/listings/${c.property.id}`}
                          className="font-medium text-navy hover:underline text-xs"
                        >
                          {c.property.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-mono text-text-secondary">
                        {formatNGN(Number(c.amount))}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-text-muted">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  )
}
