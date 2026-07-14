'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export async function markCommitmentPaidFromRecon(commitmentId: string): Promise<void> {
  await db.commitment.update({
    where: { id: commitmentId },
    data: { status: 'paid', paidAt: new Date() },
  })
  redirect('/admin/reconciliation?paid=1')
}
