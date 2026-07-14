'use server'

import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notifications'

export type DealCommitmentResult =
  | { success: true }
  | { success: false; error: string }

export async function placeDealCommitment(
  dealId: string,
  form: FormData,
): Promise<DealCommitmentResult> {
  const name   = (form.get('name')   as string | null)?.trim()  ?? ''
  const email  = (form.get('email')  as string | null)?.trim().toLowerCase() ?? ''
  const amount = Number(form.get('amount'))

  if (!name)               return { success: false, error: 'Name is required.' }
  if (!email)              return { success: false, error: 'Email is required.' }
  if (!amount || amount <= 0) return { success: false, error: 'Please enter a valid amount.' }

  const deal = await db.deal.findUnique({
    where:  { id: dealId },
    select: { id: true, title: true, status: true, targetRaise: true, minCommitment: true },
  })
  if (!deal) return { success: false, error: 'Deal not found.' }
  if (deal.status !== 'open') return { success: false, error: 'This deal is not currently accepting commitments.' }

  if (amount < Number(deal.minCommitment)) {
    return {
      success: false,
      error: `Minimum commitment is ₦${Number(deal.minCommitment).toLocaleString()}.`,
    }
  }

  // Find or create profile
  let profile = await db.profile.findUnique({ where: { email } })
  if (!profile) {
    profile = await db.profile.create({ data: { name, email } })
  }

  // Check for duplicate active commitment on this deal
  const existing = await db.dealCommitment.findFirst({
    where: {
      dealId,
      profileId: profile.id,
      status: { notIn: ['withdrawn', 'refunded'] },
    },
  })
  if (existing) {
    return { success: false, error: 'You already have an active commitment on this deal.' }
  }

  // Check remaining capacity
  const committed = await db.dealCommitment.aggregate({
    where:  { dealId, status: { notIn: ['withdrawn', 'refunded'] } },
    _sum:   { amount: true },
  })
  const totalCommitted = Number(committed._sum.amount ?? 0)
  const remaining = Number(deal.targetRaise) - totalCommitted

  if (amount > remaining) {
    return {
      success: false,
      error: `Only ₦${remaining.toLocaleString()} of capacity remains. Please reduce your amount.`,
    }
  }

  await db.dealCommitment.create({
    data: { dealId, profileId: profile.id, amount },
  })

  await notifyAdmin(
    db,
    'deal_commitment',
    `New deal commitment — ${deal.title}`,
    `${name} committed ₦${amount.toLocaleString()} to ${deal.title}`,
    `/admin/deals/${dealId}`,
  )

  return { success: true }
}
