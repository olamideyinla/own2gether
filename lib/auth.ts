import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './db'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(profileId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  const session = await db.profileSession.create({
    data: { profileId, expiresAt },
  })
  return session.token
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('profile_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
    maxAge:   60 * 60 * 24 * 30, // 30 days
  })
}

export async function getSessionProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get('profile_session')?.value
  if (!token) return null

  const session = await db.profileSession.findUnique({
    where:   { token },
    include: { profile: true },
  })

  if (!session || session.expiresAt < new Date()) return null
  return session.profile
}
