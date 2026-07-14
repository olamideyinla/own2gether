import { getSessionProfile } from '@/lib/auth'
import { db } from '@/lib/db'
import { HeaderClient } from './HeaderClient'

export async function Header() {
  const profile = await getSessionProfile()

  const unreadCount = profile
    ? await db.notification.count({
        where: { profileId: profile.id, read: false },
      })
    : 0

  return (
    <HeaderClient
      profile={profile ? { name: profile.name } : null}
      unreadCount={unreadCount}
    />
  )
}
