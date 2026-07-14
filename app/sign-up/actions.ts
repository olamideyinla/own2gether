'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth'

export async function signUp(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const name     = (formData.get('name') as string | null)?.trim()
  const email    = (formData.get('email') as string | null)?.trim().toLowerCase()
  const password = formData.get('password') as string | null

  if (!name || !email || !password) return 'Please fill in all fields.'
  if (password.length < 8) return 'Password must be at least 8 characters.'

  const existing = await db.profile.findUnique({ where: { email } })
  if (existing) return 'An account with this email already exists.'

  const passwordHash = await hashPassword(password)
  const profile = await db.profile.create({
    data: { name, email, passwordHash },
  })

  const token = await createSession(profile.id)
  await setSessionCookie(token)

  redirect('/listings')
}
