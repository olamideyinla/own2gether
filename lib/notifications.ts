import type { PrismaClient } from '@prisma/client'

/**
 * Create a notification for a specific profile (shown in their notification centre).
 */
export async function notifyUser(
  db: PrismaClient,
  profileId: string,
  type: string,
  title: string,
  body: string,
  link?: string,
) {
  await db.notification.create({
    data: { profileId, adminOnly: false, type, title, body, link: link ?? null },
  })
}

/**
 * Create an admin-only notification (no profileId — visible only in admin panel).
 */
export async function notifyAdmin(
  db: PrismaClient,
  type: string,
  title: string,
  body: string,
  link?: string,
) {
  await db.notification.create({
    data: { profileId: null, adminOnly: true, type, title, body, link: link ?? null },
  })
}
