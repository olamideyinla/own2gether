'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function deleteSubscriberAction(id: string) {
  await db.subscriber.delete({ where: { id } })
  revalidatePath('/admin/subscribers')
}
