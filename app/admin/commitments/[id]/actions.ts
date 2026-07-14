'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { allocate } from '@/lib/allocation'

export async function runAllocation(commitmentId: string): Promise<void> {
  const commitment = await db.commitment.findUnique({
    where: { id: commitmentId },
    select: { propertyId: true },
  })
  if (!commitment) return
  await allocate(commitment.propertyId, db)
  redirect(`/admin/commitments/${commitmentId}?ran=1`)
}

export async function markCommitmentPaid(commitmentId: string): Promise<void> {
  await db.commitment.update({
    where: { id: commitmentId },
    data: { status: 'paid', paidAt: new Date() },
  })
  redirect(`/admin/commitments/${commitmentId}?paid=1`)
}
