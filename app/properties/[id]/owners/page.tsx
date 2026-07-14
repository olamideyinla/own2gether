export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSessionProfile } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { formatNGN } from '@/lib/currency'
import { MessageForm } from './MessageForm'

type PageProps = { params: Promise<{ id: string }> }

export default async function OwnersPage({ params }: PageProps) {
  const { id: propertyId } = await params
  const profile = await getSessionProfile()
  if (!profile) redirect(`/sign-in?returnTo=/properties/${propertyId}/owners`)

  // Load property + verify the current user holds a stake
  const [property, myStake] = await Promise.all([
    db.property.findUnique({
      where:  { id: propertyId },
      select: { id: true, title: true, location: true, status: true, totalRaise: true },
    }),
    db.stake.findFirst({
      where: { propertyId, profileId: profile.id },
    }),
  ])

  if (!property) notFound()
  if (!myStake) {
    // Not a co-owner — redirect to the public property page
    redirect(`/properties/${propertyId}`)
  }

  // Fetch co-owners and messages in parallel
  const [stakes, messages] = await Promise.all([
    db.stake.findMany({
      where:   { propertyId, source: 'co_owner' },
      orderBy: { percentage: 'desc' },
      select: {
        id:         true,
        percentage: true,
        profileId:  true,
        profile:    { select: { id: true, name: true, email: true } },
      },
    }),
    db.propertyMessage.findMany({
      where:   { propertyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id:        true,
        body:      true,
        createdAt: true,
        profile:   { select: { id: true, name: true } },
      },
    }),
  ])

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link
            href={`/properties/${propertyId}`}
            className="text-white/50 text-xs hover:text-white/80 transition-colors"
          >
            ← {property.title}
          </Link>
          <h1 className="text-xl font-bold mt-2">Co-owner hub</h1>
          <p className="text-white/60 text-sm mt-1">
            Visible only to co-owners of this property.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ── Co-owner roster ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">Your co-owners</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-xs font-medium text-text-muted">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-right">Stake</th>
                  <th className="px-5 py-3 text-right">Est. value (NGN)</th>
                </tr>
              </thead>
              <tbody>
                {stakes.map(s => {
                  const isMe = s.profileId === profile.id
                  const pct  = Number(s.percentage)
                  const val  = (pct / 97.5) * Number(property.totalRaise)
                  return (
                    <tr key={s.id} className={`border-t border-border ${isMe ? 'bg-teal/5' : ''}`}>
                      <td className="px-5 py-3 font-medium text-navy">
                        {s.profile?.name ?? '—'}
                        {isMe && <span className="ml-2 text-xs text-teal font-normal">you</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-teal">
                        {pct.toFixed(2)}%
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-text-secondary text-xs">
                        {formatNGN(val)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Stake values are based on the total raise of {formatNGN(Number(property.totalRaise))} and shown for reference only. Actual property value may differ.
          </p>
        </section>

        {/* ── Message board ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-bold text-navy mb-1">Messages</h2>
          <p className="text-sm text-text-muted mb-5">
            All co-owners can read and post messages here. Use this space to coordinate, ask questions, or share updates about the property.
          </p>

          {/* Thread */}
          <div className="space-y-3 mb-6">
            {messages.length === 0 ? (
              <div className="border border-border rounded-xl p-6 text-center text-sm text-text-muted">
                No messages yet. Be the first to post.
              </div>
            ) : (
              messages.map(m => {
                const isMe = m.profile.id === profile.id
                return (
                  <div
                    key={m.id}
                    className={`border rounded-xl px-4 py-3 ${isMe ? 'border-teal/20 bg-teal/5 ml-8' : 'border-border bg-white mr-8'}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-navy">
                        {m.profile.name}{isMe && <span className="font-normal text-teal ml-1">(you)</span>}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {new Date(m.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}{' '}
                        {new Date(m.createdAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  </div>
                )
              })
            )}
          </div>

          {/* Compose */}
          <div className="border border-border rounded-xl p-5">
            <p className="text-xs font-semibold text-navy mb-3">Post a message</p>
            <MessageForm propertyId={propertyId} />
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
