'use server'

import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { getSessionProfile } from '@/lib/auth'
import { withdrawCommitment } from '@/lib/allocation'
import { notifyAdmin } from '@/lib/notifications'

// ── Update profile details ────────────────────────────────────────────────────

export async function updateProfile(
  _prev: string | null,
  formData: FormData,
): Promise<string> {
  const profile = await getSessionProfile()
  if (!profile) return 'error:Not signed in.'

  const name  = (formData.get('name')  as string | null)?.trim()
  const phone = (formData.get('phone') as string | null)?.trim() || null

  if (!name) return 'error:Name is required.'

  await db.profile.update({
    where: { id: profile.id },
    data:  { name, phone },
  })

  revalidatePath('/profile')
  return 'ok'
}

// ── Withdraw a commitment ─────────────────────────────────────────────────────

export async function withdrawCommitmentAction(commitmentId: string): Promise<{ error?: string }> {
  const profile = await getSessionProfile()
  if (!profile) return { error: 'Not signed in.' }

  // Ownership check — ensure the commitment belongs to this profile
  const commitment = await db.commitment.findUnique({
    where: { id: commitmentId },
    select: { profileId: true },
  })
  if (!commitment || commitment.profileId !== profile.id) {
    return { error: 'Commitment not found.' }
  }

  const result = await withdrawCommitment(commitmentId, db)
  if (!result.success) return { error: result.error }

  revalidatePath('/profile')
  return {}
}

// ── Upload bank payment receipt ───────────────────────────────────────────────

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024

export async function submitPaymentReceipt(
  formData: FormData,
): Promise<{ error: string } | void> {
  const profile = await getSessionProfile()
  if (!profile) return { error: 'Not signed in.' }

  const commitmentId = formData.get('commitmentId') as string | null
  const receipt      = formData.get('receipt') as File | null

  if (!commitmentId) return { error: 'Missing commitment.' }
  if (!receipt || receipt.size === 0) return { error: 'Please select a file.' }
  if (receipt.size > MAX_RECEIPT_BYTES) return { error: 'File too large (max 10 MB).' }

  const commitment = await db.commitment.findUnique({
    where:  { id: commitmentId },
    select: {
      profileId: true,
      status:    true,
      property:  { select: { id: true, title: true } },
    },
  })
  if (!commitment || commitment.profileId !== profile.id) return { error: 'Commitment not found.' }

  const allowedStatuses = ['allocated', 'partially_allocated', 'capped']
  if (!allowedStatuses.includes(commitment.status)) {
    return { error: 'This commitment is not awaiting payment.' }
  }

  const blob = await put(
    `receipts/${profile.id}/${Date.now()}-${receipt.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60)}`,
    receipt,
    { access: 'public', addRandomSuffix: true },
  )

  await db.commitment.update({
    where: { id: commitmentId },
    data: {
      status:            'payment_submitted',
      paymentReceiptUrl: blob.url,
      paymentSubmittedAt: new Date(),
    },
  })

  await notifyAdmin(
    db,
    'receipt_uploaded',
    'Payment receipt uploaded',
    `${profile.name} has uploaded a payment receipt for ${commitment.property.title}.`,
    `/admin/commitments/${commitmentId}`,
  )

  revalidatePath('/profile')
}
