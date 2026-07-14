'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function markAdminNotificationsRead() {
  await db.notification.updateMany({
    where: { adminOnly: true, profileId: null, read: false },
    data:  { read: true },
  })
  revalidatePath('/admin/notifications')
}
