'use server'

import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { getSessionProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const VALID_TYPES = ['passport', 'drivers_license', 'national_id'] as const
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

export type VerifyState = { error: string } | { success: true } | null

export async function submitKycDocuments(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const profile = await getSessionProfile()
  if (!profile) return { error: 'Not signed in.' }

  // ── Personal details ──────────────────────────────────────────────────────
  const dateOfBirthRaw    = formData.get('dateOfBirth')    as string | null
  const nationality       = (formData.get('nationality')   as string | null)?.trim()
  const occupation        = (formData.get('occupation')    as string | null)?.trim()
  const residentialAddress = (formData.get('residentialAddress') as string | null)?.trim()

  if (!dateOfBirthRaw?.trim()) return { error: 'Date of birth is required.' }
  if (!nationality)            return { error: 'Nationality is required.' }
  if (!occupation)             return { error: 'Occupation is required.' }
  if (!residentialAddress)     return { error: 'Residential address is required.' }

  const dateOfBirth = new Date(dateOfBirthRaw)
  if (isNaN(dateOfBirth.getTime())) return { error: 'Invalid date of birth.' }

  // Must be at least 18
  const age = (Date.now() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  if (age < 18) return { error: 'You must be at least 18 years old.' }

  // ── Document details ──────────────────────────────────────────────────────
  const docType      = formData.get('type')           as string | null
  const docNumber    = (formData.get('documentNumber') as string | null)?.trim()
  const expiryRaw    = formData.get('expiryDate')      as string | null
  const idFile       = formData.get('idFile')          as File | null
  const proofFile    = formData.get('proofFile')       as File | null

  if (!docType?.trim() || !(VALID_TYPES as readonly string[]).includes(docType)) {
    return { error: 'Please select a valid document type.' }
  }
  if (!docNumber) return { error: 'Document number is required.' }

  let expiryDate: Date | null = null
  if (expiryRaw?.trim()) {
    expiryDate = new Date(expiryRaw)
    if (isNaN(expiryDate.getTime())) return { error: 'Invalid document expiry date.' }
    if (expiryDate < new Date()) return { error: 'Document has already expired. Please use a valid document.' }
  }

  if (!idFile || idFile.size === 0)    return { error: 'Please upload your identity document.' }
  if (!proofFile || proofFile.size === 0) return { error: 'Please upload proof of address.' }
  if (idFile.size > MAX_FILE_BYTES)    return { error: 'Identity document file is too large (max 10 MB).' }
  if (proofFile.size > MAX_FILE_BYTES) return { error: 'Proof of address file is too large (max 10 MB).' }

  // ── Upload files ──────────────────────────────────────────────────────────
  const [idBlob, proofBlob] = await Promise.all([
    put(
      `kyc/${profile.id}/${Date.now()}-id-${sanitize(idFile.name)}`,
      idFile,
      { access: 'public', addRandomSuffix: true },
    ),
    put(
      `kyc/${profile.id}/${Date.now()}-proof-${sanitize(proofFile.name)}`,
      proofFile,
      { access: 'public', addRandomSuffix: true },
    ),
  ])

  // ── Persist in a transaction ──────────────────────────────────────────────
  await db.$transaction(async (tx) => {
    // Update personal CAC details on the profile
    await tx.profile.update({
      where: { id: profile.id },
      data: {
        dateOfBirth,
        nationality,
        occupation,
        residentialAddress,
      },
    })

    // Create identity document record
    await tx.identityDocument.create({
      data: {
        profileId:         profile.id,
        type:              docType as 'passport' | 'drivers_license' | 'national_id',
        documentNumber:    docNumber,
        expiryDate,
        fileUrl:           idBlob.url,
        proofOfAddressUrl: proofBlob.url,
      },
    })

    // Advance KYC status to pending (only if not already verified)
    const fresh = await tx.profile.findUniqueOrThrow({
      where: { id: profile.id },
      select: { kycStatus: true },
    })
    if (fresh.kycStatus === 'unverified') {
      await tx.profile.update({
        where: { id: profile.id },
        data: { kycStatus: 'pending' },
      })
    }
  })

  revalidatePath('/profile')

  const returnTo = formData.get('returnTo') as string | null
  redirect(returnTo?.startsWith('/') ? returnTo : '/profile')
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}
