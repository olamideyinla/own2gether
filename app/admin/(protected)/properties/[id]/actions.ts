'use server'

import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { allocate } from '@/lib/allocation'
import type { PropertyStatus } from '@prisma/client'

const MAX_PHOTO_BYTES = 10  * 1024 * 1024  // 10 MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024  // 200 MB

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

export async function updatePropertyAction(
  propertyId: string,
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const title         = (formData.get('title') as string | null)?.trim()
  const location      = (formData.get('location') as string | null)?.trim()
  const description   = (formData.get('description') as string | null)?.trim() || null
  const propertyPrice = (formData.get('propertyPrice') as string | null)?.trim()
  const legalFees     = (formData.get('legalFees') as string | null)?.trim()
  const otherCosts    = (formData.get('otherCosts') as string | null)?.trim()
  const status        = (formData.get('status') as string | null) as PropertyStatus | null

  if (!title || !location || !propertyPrice || !legalFees || !otherCosts || !status) {
    return 'Please fill in all required fields.'
  }

  const price = Number(propertyPrice)
  const fees  = Number(legalFees)
  const costs = Number(otherCosts)

  if (isNaN(price) || isNaN(fees) || isNaN(costs) || price <= 0) {
    return 'Please enter valid amounts.'
  }

  // Existing URLs the admin chose to keep (sent as hidden inputs)
  const keepPhotos = (formData.getAll('keepPhotos') as string[]).filter(Boolean)
  const keepVideos = (formData.getAll('keepVideos') as string[]).filter(Boolean)

  // New files to upload
  const newPhotoFiles = (formData.getAll('newPhotos') as File[]).filter(f => f.size > 0)
  const newVideoFiles = (formData.getAll('newVideos') as File[]).filter(f => f.size > 0)

  for (const f of newPhotoFiles) {
    if (f.size > MAX_PHOTO_BYTES) return `Photo "${f.name}" exceeds 10 MB.`
  }
  for (const f of newVideoFiles) {
    if (f.size > MAX_VIDEO_BYTES) return `Video "${f.name}" exceeds 200 MB.`
  }

  const ts = Date.now()

  const [photoBlobs, videoBlobs] = await Promise.all([
    Promise.all(newPhotoFiles.map((f, i) =>
      put(`properties/${ts}-photo-${i}-${sanitize(f.name)}`, f, { access: 'public', addRandomSuffix: true })
    )),
    Promise.all(newVideoFiles.map((f, i) =>
      put(`properties/${ts}-video-${i}-${sanitize(f.name)}`, f, { access: 'public', addRandomSuffix: true })
    )),
  ])

  await db.property.update({
    where: { id: propertyId },
    data: {
      title,
      location,
      description,
      photos:        [...keepPhotos, ...photoBlobs.map(b => b.url)],
      videos:        [...keepVideos, ...videoBlobs.map(b => b.url)],
      propertyPrice: price,
      legalFees:     fees,
      otherCosts:    costs,
      totalRaise:    price + fees + costs,
      status,
    },
  })

  redirect(`/admin/properties/${propertyId}?updated=1`)
}

export async function runAllocationAction(propertyId: string): Promise<void> {
  await allocate(propertyId, db)
  redirect(`/admin/properties/${propertyId}?ran=1`)
}

export async function markCommitmentPaidAction(
  commitmentId: string,
  propertyId: string,
): Promise<void> {
  await db.commitment.update({
    where: { id: commitmentId },
    data: { status: 'paid', paidAt: new Date() },
  })
  redirect(`/admin/properties/${propertyId}?paid=1`)
}

export async function approveDocAction(
  docId: string,
  propertyId: string,
): Promise<void> {
  const doc = await db.identityDocument.findUniqueOrThrow({
    where: { id: docId },
    select: { profileId: true },
  })

  await db.$transaction([
    db.identityDocument.update({
      where: { id: docId },
      data: {
        status:         'approved',
        reviewedAt:     new Date(),
        reviewedByName: 'Admin',
      },
    }),
    db.profile.update({
      where: { id: doc.profileId },
      data: { kycStatus: 'verified' },
    }),
  ])

  redirect(`/admin/properties/${propertyId}?approved=1`)
}

export async function rejectDocAction(formData: FormData): Promise<void> {
  const docId      = formData.get('docId') as string | null
  const propertyId = formData.get('propertyId') as string | null
  const reason     = (formData.get('reason') as string | null)?.trim() ?? ''

  if (!docId || !propertyId) return

  await db.identityDocument.update({
    where: { id: docId },
    data: {
      status:          'rejected',
      reviewedAt:      new Date(),
      reviewedByName:  'Admin',
      rejectionReason: reason || null,
    },
  })

  redirect(`/admin/properties/${propertyId}?rejected=1`)
}
