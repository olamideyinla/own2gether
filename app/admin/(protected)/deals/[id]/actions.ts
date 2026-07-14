'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notifications'

// ─── Update deal metadata / status ────────────────────────────────────────────

export async function updateDealAction(
  dealId: string,
  form: FormData,
): Promise<{ error?: string }> {

  const status       = form.get('status')      as string | null
  const title        = (form.get('title')      as string | null)?.trim()
  const description  = (form.get('description')as string | null)?.trim() || null
  const location     = (form.get('location')   as string | null)?.trim()
  const projReturn   = form.get('projectedReturnPct')       ? Number(form.get('projectedReturnPct'))       : undefined
  const projDuration = form.get('projectedDurationMonths')  ? Number(form.get('projectedDurationMonths'))  : undefined

  // Upload new photos if any
  const photoFiles = (form.getAll('newPhotos') as File[]).filter(f => f.size > 0)
  const newPhotoUrls: string[] = []
  for (const file of photoFiles) {
    const blob = await put(`deals/${Date.now()}-${file.name}`, file, { access: 'public' })
    newPhotoUrls.push(blob.url)
  }

  // Upload new documents if any
  const docFiles = (form.getAll('newDocuments') as File[]).filter(f => f.size > 0)
  const newDocUrls: string[] = []
  for (const file of docFiles) {
    const blob = await put(`deals/docs/${Date.now()}-${file.name}`, file, { access: 'public' })
    newDocUrls.push(blob.url)
  }

  const deal = await db.deal.findUnique({ where: { id: dealId }, select: { photos: true, documents: true, status: true } })
  if (!deal) return { error: 'Deal not found.' }

  const nextStatus = (status ?? deal.status) as typeof deal.status
  const statusTimestamps: Record<string, unknown> = {}
  if (nextStatus === 'open'        && deal.status !== 'open')        statusTimestamps.openedAt    = new Date()
  if (nextStatus === 'funded'      && deal.status !== 'funded')      statusTimestamps.fundedAt    = new Date()
  if (nextStatus === 'completed'   && deal.status !== 'completed')   statusTimestamps.completedAt = new Date()

  await db.deal.update({
    where: { id: dealId },
    data: {
      ...(title       ? { title }       : {}),
      ...(location    ? { location }    : {}),
      description,
      ...(status      ? { status: nextStatus } : {}),
      ...(projReturn   !== undefined ? { projectedReturnPct: projReturn }           : {}),
      ...(projDuration !== undefined ? { projectedDurationMonths: projDuration }    : {}),
      ...(newPhotoUrls.length ? { photos: [...deal.photos, ...newPhotoUrls] }       : {}),
      ...(newDocUrls.length   ? { documents: [...deal.documents, ...newDocUrls] }   : {}),
      ...statusTimestamps,
    },
  })

  redirect(`/admin/deals/${dealId}?updated=1`)
}

// ─── Confirm investor commitment ───────────────────────────────────────────────

export async function confirmDealCommitmentAction(commitmentId: string): Promise<{ error?: string }> {

  const commitment = await db.dealCommitment.findUnique({
    where:  { id: commitmentId },
    select: { id: true, profileId: true, dealId: true, deal: { select: { title: true } } },
  })
  if (!commitment) return { error: 'Commitment not found.' }

  const paymentDueAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days

  await db.dealCommitment.update({
    where: { id: commitmentId },
    data:  { status: 'allocated', allocationConfirmedAt: new Date(), paymentDueAt },
  })

  await notifyUser(
    db,
    commitment.profileId,
    'deal_allocation',
    `Deal commitment confirmed — ${commitment.deal.title}`,
    'Your commitment has been confirmed. Please make your bank transfer within 10 days.',
    `/deals/${commitment.dealId}`,
  )

  revalidatePath(`/admin/deals/${commitment.dealId}`)
  return {}
}

// ─── Mark commitment as paid ──────────────────────────────────────────────────

export async function markDealPaidAction(commitmentId: string): Promise<{ error?: string }> {

  const commitment = await db.dealCommitment.findUnique({
    where:  { id: commitmentId },
    select: { id: true, profileId: true, dealId: true, deal: { select: { title: true } } },
  })
  if (!commitment) return { error: 'Commitment not found.' }

  await db.dealCommitment.update({
    where: { id: commitmentId },
    data:  { status: 'paid', paidAt: new Date() },
  })

  await notifyUser(
    db,
    commitment.profileId,
    'deal_payment',
    `Payment confirmed — ${commitment.deal.title}`,
    'Your payment has been confirmed. You will receive project updates as the deal progresses.',
    `/deals/${commitment.dealId}`,
  )

  revalidatePath(`/admin/deals/${commitment.dealId}`)
  return {}
}

// ─── Add milestone ─────────────────────────────────────────────────────────────

export async function addMilestoneAction(
  dealId: string,
  form: FormData,
): Promise<{ error?: string }> {

  const title       = (form.get('title')       as string | null)?.trim() ?? ''
  const description = (form.get('description') as string | null)?.trim() || null
  const targetDate  = (form.get('targetDate')  as string | null) || null
  const sortOrder   = Number(form.get('sortOrder') ?? 0)

  if (!title) return { error: 'Milestone title is required.' }

  await db.dealMilestone.create({
    data: {
      dealId,
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : null,
      sortOrder,
    },
  })

  revalidatePath(`/admin/deals/${dealId}`)
  revalidatePath(`/deals/${dealId}`)
  return {}
}

// ─── Update milestone status ───────────────────────────────────────────────────

export async function updateMilestoneAction(
  milestoneId: string,
  dealId: string,
  status: 'upcoming' | 'in_progress' | 'completed' | 'delayed',
): Promise<{ error?: string }> {

  await db.dealMilestone.update({
    where: { id: milestoneId },
    data:  {
      status,
      completedAt: status === 'completed' ? new Date() : null,
    },
  })

  revalidatePath(`/admin/deals/${dealId}`)
  revalidatePath(`/deals/${dealId}`)
  return {}
}

// ─── Post deal update ──────────────────────────────────────────────────────────

export async function postDealUpdateAction(
  dealId: string,
  form: FormData,
): Promise<{ error?: string }> {

  const title = (form.get('title') as string | null)?.trim() ?? ''
  const body  = (form.get('body')  as string | null)?.trim() ?? ''

  if (!title) return { error: 'Update title is required.' }
  if (!body)  return { error: 'Update body is required.' }

  // Upload update photos
  const photoFiles = (form.getAll('photos') as File[]).filter(f => f.size > 0)
  const photoUrls: string[] = []
  for (const file of photoFiles) {
    const blob = await put(`deals/updates/${Date.now()}-${file.name}`, file, { access: 'public' })
    photoUrls.push(blob.url)
  }

  await db.dealUpdate.create({
    data: { dealId, title, body, photoUrls },
  })

  // Notify all paid/allocated investors
  const investors = await db.dealCommitment.findMany({
    where:  { dealId, status: { in: ['allocated', 'payment_submitted', 'paid'] } },
    select: { profileId: true },
  })

  const deal = await db.deal.findUnique({ where: { id: dealId }, select: { title: true } })

  await Promise.all(
    investors.map(inv =>
      notifyUser(db, inv.profileId, 'deal_update', `Update: ${deal?.title ?? 'Your deal'}`, title, `/deals/${dealId}`),
    ),
  )

  revalidatePath(`/admin/deals/${dealId}`)
  revalidatePath(`/deals/${dealId}`)
  return {}
}
