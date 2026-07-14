'use server'

import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'

export async function createDealAction(
  _: unknown,
  form: FormData,
): Promise<{ error: string }> {

  const title        = (form.get('title')       as string | null)?.trim() ?? ''
  const location     = (form.get('location')    as string | null)?.trim() ?? ''
  const description  = (form.get('description') as string | null)?.trim() || null
  const dealType     = (form.get('dealType')    as string | null) ?? ''
  const targetRaise  = Number(form.get('targetRaise'))
  const minCommit    = Number(form.get('minCommitment'))
  const projReturn   = form.get('projectedReturnPct')  ? Number(form.get('projectedReturnPct'))  : null
  const projDuration = form.get('projectedDurationMonths') ? Number(form.get('projectedDurationMonths')) : null

  if (!title)              return { error: 'Title is required.' }
  if (!location)           return { error: 'Location is required.' }
  if (!dealType)           return { error: 'Deal type is required.' }
  if (!targetRaise || targetRaise <= 0) return { error: 'Target raise is required.' }
  if (!minCommit   || minCommit   <= 0) return { error: 'Minimum commitment is required.' }
  if (!['rehabilitation', 'ground_up', 'off_plan'].includes(dealType)) {
    return { error: 'Invalid deal type.' }
  }
  if (minCommit < targetRaise * 0.15) {
    return { error: `Minimum commitment must be at least 15% of the target raise (₦${(targetRaise * 0.15).toLocaleString()}).` }
  }

  // Upload photos
  const photoFiles = form.getAll('photos') as File[]
  const photoUrls: string[] = []
  for (const file of photoFiles) {
    if (file.size === 0) continue
    const ts   = Date.now()
    const blob = await put(`deals/${ts}-${file.name}`, file, { access: 'public' })
    photoUrls.push(blob.url)
  }

  // Upload documents
  const docFiles = form.getAll('documents') as File[]
  const docUrls: string[] = []
  for (const file of docFiles) {
    if (file.size === 0) continue
    const ts   = Date.now()
    const blob = await put(`deals/docs/${ts}-${file.name}`, file, { access: 'public' })
    docUrls.push(blob.url)
  }

  const deal = await db.deal.create({
    data: {
      title,
      location,
      description,
      dealType:               dealType as 'rehabilitation' | 'ground_up' | 'off_plan',
      targetRaise,
      minCommitment:          minCommit,
      projectedReturnPct:     projReturn,
      projectedDurationMonths: projDuration,
      photos:                 photoUrls,
      documents:              docUrls,
    },
  })

  redirect(`/admin/deals/${deal.id}?created=1`)
}
