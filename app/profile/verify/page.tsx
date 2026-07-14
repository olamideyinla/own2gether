export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionProfile } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/Header'
import { VerifyForm } from './VerifyForm'

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const [profile, { returnTo }] = await Promise.all([
    getSessionProfile(),
    searchParams,
  ])

  if (!profile) redirect('/sign-in')

  // Already verified — nothing to do here
  if (profile.kycStatus === 'verified') {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-teal/5 border border-teal/20 rounded-xl px-6 py-8 text-center space-y-3">
            <p className="text-teal font-semibold">Your identity has already been verified.</p>
            <Link
              href={returnTo?.startsWith('/') ? returnTo : '/profile'}
              className="inline-block text-sm font-medium text-navy border border-border rounded px-4 py-2 hover:border-navy transition-colors"
            >
              {returnTo ? 'Continue →' : 'Back to account'}
            </Link>
          </div>
        </main>
      </>
    )
  }

  // Pending — show waiting message
  if (profile.kycStatus === 'pending') {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-8 text-center space-y-3">
            <p className="text-sm font-semibold text-amber-800">Your documents are under review.</p>
            <p className="text-xs text-amber-700">
              Our team typically completes reviews within 3 business days.
              You will be notified by email once approved.
            </p>
            <Link
              href="/profile"
              className="inline-block text-sm font-medium text-navy border border-border rounded px-4 py-2 hover:border-navy transition-colors"
            >
              Back to account
            </Link>
          </div>
        </main>
      </>
    )
  }

  // Fetch latest document to check if it was rejected
  const latestDoc = await db.identityDocument.findFirst({
    where:   { profileId: profile.id },
    orderBy: { submittedAt: 'desc' },
    select:  { status: true, rejectionReason: true },
  })

  const isResubmission = latestDoc?.status === 'rejected'

  return (
    <>
      <Header />

      <section className="bg-navy text-white">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <Link href="/profile" className="text-white/50 text-xs hover:text-white/80 transition-colors">
            ← My account
          </Link>
          <h1 className="text-xl font-bold mt-3">Identity verification</h1>
          <p className="text-white/60 text-sm mt-1">
            Submit your documents so Own2gether can register you as a shareholder
            in the property company (SPV) for any deal you participate in.
          </p>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* What this is used for */}
        <div className="mb-8 border border-border rounded-xl p-5 text-xs text-text-secondary leading-relaxed space-y-2">
          <p className="font-semibold text-navy text-sm">Why we need this information</p>
          <p>
            Each property on Own2gether is held by a dedicated Special Purpose Vehicle (SPV) — a
            Nigerian limited company registered with the <strong className="text-navy">Corporate
            Affairs Commission (CAC)</strong>. To add you as a registered shareholder, the CAC
            requires your full legal name, date of birth, nationality, occupation, residential
            address, and a valid means of identification.
          </p>
          <p>
            Your documents are reviewed by our team and never shared with other co-owners.
          </p>
        </div>

        <VerifyForm
          profile={{
            name:               profile.name,
            dateOfBirth:        profile.dateOfBirth
              ? (profile.dateOfBirth as Date).toISOString().split('T')[0]
              : null,
            nationality:        profile.nationality ?? null,
            occupation:         profile.occupation ?? null,
            residentialAddress: profile.residentialAddress ?? null,
          }}
          returnTo={returnTo?.startsWith('/') ? returnTo : undefined}
          isResubmission={isResubmission}
          rejectionReason={latestDoc?.rejectionReason ?? null}
        />
      </main>

      <footer className="border-t border-border mt-10">
        <div className="max-w-2xl mx-auto px-6 py-6 text-xs text-text-muted">
          <p>All documents are stored securely and used solely for shareholder registration purposes.</p>
        </div>
      </footer>
    </>
  )
}
