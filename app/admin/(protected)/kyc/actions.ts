'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { notifyUser, notifyAdmin } from '@/lib/notifications'

export async function approveKycDocAction(formData: FormData): Promise<void> {
  const docId = (formData.get('docId') as string | null)?.trim()
  if (!docId) return

  const doc = await db.identityDocument.findUniqueOrThrow({
    where:   { id: docId },
    select:  { profileId: true, profile: { select: { name: true } } },
  })

  await db.$transaction([
    db.identityDocument.update({
      where: { id: docId },
      data: {
        status:         'approved',
        reviewedAt:     new Date(),
        reviewedByName: 'Admin',
      },
    }),
    db.profile.update({
      where: { id: doc.profileId },
      data:  { kycStatus: 'verified' },
    }),
  ])

  await notifyUser(
    db,
    doc.profileId,
    'kyc_approved',
    'Identity verified',
    'Your identity documents have been reviewed and approved. You are now eligible to receive property allocations.',
    '/profile',
  )

  redirect('/admin/kyc?approved=1')
}

export async function rejectKycDocAction(formData: FormData): Promise<void> {
  const docId  = (formData.get('docId') as string | null)?.trim()
  const reason = (formData.get('reason') as string | null)?.trim() ?? ''

  if (!docId) return

  const doc = await db.identityDocument.findUniqueOrThrow({
    where:  { id: docId },
    select: { profileId: true },
  })

  await db.identityDocument.update({
    where: { id: docId },
    data: {
      status:          'rejected',
      reviewedAt:      new Date(),
      reviewedByName:  'Admin',
      rejectionReason: reason || null,
    },
  })

  await notifyUser(
    db,
    doc.profileId,
    'kyc_rejected',
    'Identity verification unsuccessful',
    reason
      ? `Your documents were not accepted: ${reason}. Please resubmit with a clearer copy or a different document.`
      : 'Your documents were not accepted. Please resubmit with a clearer copy or a different document.',
    '/profile/verify',
  )

  redirect('/admin/kyc?rejected=1')
}
