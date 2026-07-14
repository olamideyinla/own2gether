'use server'

import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'

const VALID_TYPES = ['passport', 'drivers_license', 'national_id'] as const
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function submitIdentityDocument(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const commitmentId = formData.get('commitmentId') as string | null
  const type         = formData.get('type') as string | null
  const idFile       = formData.get('idFile') as File | null
  const proofFile    = formData.get('proofFile') as File | null

  if (!commitmentId?.trim()) return { error: 'Missing commitment ID.' }
  if (!type?.trim())         return { error: 'Please select a document type.' }
  if (!idFile || idFile.size === 0)    return { error: 'Please upload your ID document.' }
  if (!proofFile || proofFile.size === 0) return { error: 'Please upload your proof of address.' }

  if (!(VALID_TYPES as readonly string[]).includes(type)) {
    return { error: 'Invalid document type.' }
  }

  if (idFile.size > MAX_FILE_BYTES) {
    return { error: 'ID document file is too large (max 10 MB).' }
  }
  if (proofFile.size > MAX_FILE_BYTES) {
    return { error: 'Proof of address file is too large (max 10 MB).' }
  }

  const commitment = await db.commitment.findUnique({
    where: { id: commitmentId },
    select: { profileId: true },
  })
  if (!commitment) return { error: 'Commitment not found.' }

  const { profileId } = commitment

  // Upload both files to Vercel Blob.
  // Paths include a segment from profileId to make them unguessable.
  // These URLs are stored in DB only and never returned to profile-facing responses.
  const [idBlob, proofBlob] = await Promise.all([
    put(
      `kyc/${profileId}/${Date.now()}-id-${sanitizeFilename(idFile.name)}`,
      idFile,
      { access: 'public', addRandomSuffix: true },
    ),
    put(
      `kyc/${profileId}/${Date.now()}-proof-${sanitizeFilename(proofFile.name)}`,
      proofFile,
      { access: 'public', addRandomSuffix: true },
    ),
  ])

  await db.$transaction(async (tx) => {
    await tx.identityDocument.create({
      data: {
        profileId,
        type:             type as 'passport' | 'drivers_license' | 'national_id',
        fileUrl:          idBlob.url,
        proofOfAddressUrl: proofBlob.url,
      },
    })

    // Only move to 'pending' if currently 'unverified'; don't downgrade
    const profile = await tx.profile.findUniqueOrThrow({
      where: { id: profileId },
      select: { kycStatus: true },
    })
    if (profile.kycStatus === 'unverified') {
      await tx.profile.update({
        where: { id: profileId },
        data: { kycStatus: 'pending' },
      })
    }
  })

  redirect(`/commitments/${commitmentId}/flow?step=verify`)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}
