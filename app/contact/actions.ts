'use server'

import { db } from '@/lib/db'

type State = { error?: string; success?: boolean }

export async function submitContactAction(_prev: State, formData: FormData): Promise<State> {
  const name    = (formData.get('name')    as string | null)?.trim() ?? ''
  const email   = (formData.get('email')   as string | null)?.trim() ?? ''
  const phone   = (formData.get('phone')   as string | null)?.trim() ?? ''
  const message = (formData.get('message') as string | null)?.trim() ?? ''

  if (!name)    return { error: 'Name is required.' }
  if (!message) return { error: 'Message is required.' }
  if (!email && !phone) {
    return { error: 'Please provide at least an email address or phone number so we can reply.' }
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  await db.contactMessage.create({
    data: {
      name,
      email:   email || null,
      phone:   phone || null,
      message,
    },
  })

  return { success: true }
}
