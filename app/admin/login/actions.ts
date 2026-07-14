'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLogin(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const password      = formData.get('password') as string | null
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return 'ADMIN_PASSWORD environment variable is not configured.'
  }
  if (!password?.trim()) {
    return 'Please enter a password.'
  }
  if (password !== adminPassword) {
    return 'Incorrect password.'
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', adminPassword, {
    httpOnly: true,
    sameSite: 'strict',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/admin',
    maxAge:   60 * 60 * 8, // 8 hours
  })

  redirect('/admin')
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}
