'use server'

import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'

const MAX_PHOTO_BYTES = 10  * 1024 * 1024  // 10 MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024  // 200 MB

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

export async function createPropertyAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const title        = (formData.get('title')    as string | null)?.trim()
  const location     = (formData.get('location') as string | null)?.trim()
  const description  = (formData.get('description') as string | null)?.trim() || null
  const propertyPrice = (formData.get('propertyPrice') as string | null)?.trim()
  const legalFees    = (formData.get('legalFees')    as string | null)?.trim()
  const otherCosts   = (formData.get('otherCosts')   as string | null)?.trim()
  const propertyType = (formData.get('propertyType') as string | null)?.trim() || null
  const areaSize     = (formData.get('areaSize')     as string | null)?.trim() || null
  const bedroomsRaw  = (formData.get('bedrooms')     as string | null)?.trim()
  const bathroomsRaw = (formData.get('bathrooms')    as string | null)?.trim()
  const bedrooms     = bedroomsRaw  ? parseInt(bedroomsRaw,  10) : null
  const bathrooms    = bathroomsRaw ? parseInt(bathroomsRaw, 10) : null

  if (!title || !location || !propertyPrice || !legalFees || !otherCosts) {
    return 'Please fill in all required fields.'
  }

  const price = Number(propertyPrice)
  const fees  = Number(legalFees)
  const costs = Number(otherCosts)

  if (isNaN(price) || isNaN(fees) || isNaN(costs) || price <= 0) {
    return 'Please enter valid amounts.'
  }

  const photoFiles = (formData.getAll('photos') as File[]).filter(f => f.size > 0)
  const videoFiles = (formData.getAll('videos') as File[]).filter(f => f.size > 0)

  for (const f of photoFiles) {
    if (f.size > MAX_PHOTO_BYTES) return `Photo "${f.name}" exceeds 10 MB.`
  }
  for (const f of videoFiles) {
    if (f.size > MAX_VIDEO_BYTES) return `Video "${f.name}" exceeds 200 MB.`
  }

  const ts = Date.now()

  let photoUrls: string[] = []
  let videoUrls: string[] = []

  try {
    const [photoBlobs, videoBlobs] = await Promise.all([
      Promise.all(photoFiles.map((f, i) =>
        put(`properties/${ts}-photo-${i}-${sanitize(f.name)}`, f, { access: 'public', addRandomSuffix: true })
      )),
      Promise.all(videoFiles.map((f, i) =>
        put(`properties/${ts}-video-${i}-${sanitize(f.name)}`, f, { access: 'public', addRandomSuffix: true })
      )),
    ])
    photoUrls = photoBlobs.map(b => b.url)
    videoUrls = videoBlobs.map(b => b.url)
  } catch (err) {
    console.error('[createPropertyAction] blob upload failed:', err)
    return `Media upload failed: ${err instanceof Error ? err.message : String(err)}`
  }

  const property = await db.property.create({
    data: {
      title,
      location,
      description,
      photos:        photoUrls,
      videos:        videoUrls,
      propertyPrice: price,
      legalFees:     fees,
      otherCosts:    costs,
      totalRaise:    price + fees + costs,
      propertyType,
      areaSize,
      bedrooms,
      bathrooms,
    },
  })

  redirect(`/admin/listings/${property.id}?created=1`)
}
