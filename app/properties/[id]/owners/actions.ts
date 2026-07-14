'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSessionProfile } from '@/lib/auth'
import { notifyUser } from '@/lib/notifications'

export async function postMessage(
  propertyId: string,
  body: string,
): Promise<{ error?: string }> {
  const profile = await getSessionProfile()
  if (!profile) return { error: 'Not signed in.' }

  const trimmed = body.trim()
  if (!trimmed)          return { error: 'Message cannot be empty.' }
  if (trimmed.length > 2000) return { error: 'Message too long (max 2000 characters).' }

  // Verify the poster is a co-owner
  const stake = await db.stake.findFirst({
    where: { propertyId, profileId: profile.id },
  })
  if (!stake) return { error: 'You are not a co-owner of this property.' }

  await db.propertyMessage.create({
    data: { propertyId, profileId: profile.id, body: trimmed },
  })

  // Notify other co-owners (excluding sender and Own2gether's null-profileId stake)
  const otherStakes = await db.stake.findMany({
    where: {
      propertyId,
      AND: [
        { profileId: { not: null } },
        { profileId: { not: profile.id } },
      ],
    },
    select: { profileId: true },
  })

  const property = await db.property.findUnique({
    where:  { id: propertyId },
    select: { title: true },
  })

  await Promise.all(
    otherStakes
      .filter(s => s.profileId != null)
      .map(s =>
        notifyUser(
          db,
          s.profileId!,
          'message',
          `New message in ${property?.title ?? 'your property'}`,
          `${profile.name}: ${trimmed.slice(0, 120)}${trimmed.length > 120 ? '…' : ''}`,
          `/properties/${propertyId}/owners`,
        ),
      ),
  )

  revalidatePath(`/properties/${propertyId}/owners`)
  return {}
}
