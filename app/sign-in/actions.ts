'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'

export async function signIn(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const email    = (formData.get('email') as string | null)?.trim().toLowerCase()
  const password = formData.get('password') as string | null

  if (!email || !password) return 'Please fill in all fields.'

  const profile = await db.profile.findUnique({ where: { email } })
  if (!profile?.passwordHash) return 'Invalid email or password.'

  const valid = await verifyPassword(password, profile.passwordHash)
  if (!valid) return 'Invalid email or password.'

  const token = await createSession(profile.id)
  await setSessionCookie(token)

  redirect('/listings')
}
