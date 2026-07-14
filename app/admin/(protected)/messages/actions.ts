'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function markReadAction(id: string) {
  await db.contactMessage.update({ where: { id }, data: { read: true } })
  revalidatePath('/admin/messages')
}

export async function deleteMessageAction(id: string) {
  await db.contactMessage.delete({ where: { id } })
  revalidatePath('/admin/messages')
}
