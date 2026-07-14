'use server'

import { Prisma } from '@prisma/client'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { MIN_ENTRY_FRACTION } from '@/lib/allocation'
import { getSessionProfile } from '@/lib/auth'
import type { DocumentType } from '@prisma/client'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CommitmentResult =
  | { success: true;  commitmentId: string }
  | { success: false; error: string }

export type CodeResult =
  | { success: true;  code: string }
  | { success: false; error: string }

// ─── Helpers ───────────────────────────────────────────────────────────────────

const VALID_DOC_TYPES: DocumentType[] = ['passport', 'drivers_license', 'national_id']
const MAX_KYC_BYTES = 10 * 1024 * 1024 // 10 MB

function makeGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = 'GRP-'
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

// ─── Actions ───────────────────────────────────────────────────────────────────

export async function createCommitment(
  propertyId: string,
  _prev: CommitmentResult | null,
  formData: FormData,
): Promise<CommitmentResult> {
  // Auth — profile from session
  const profile = await getSessionProfile()
  if (!profile) {
    return { success: false, error: 'You must be signed in to make a commitment.' }
  }

  // Amount
  const amountRaw = (formData.get('amount') as string | null) ?? ''
  const amountNum = parseFloat(amountRaw.replace(/[^0-9.]/g, ''))
  if (!amountNum || amountNum <= 0) {
    return { success: false, error: 'Please enter a valid amount.' }
  }

  // Property
  const property = await db.property.findUnique({
    where:  { id: propertyId },
    select: { status: true, totalRaise: true },
  })
  if (!property)                  return { success: false, error: 'Property not found.' }
  if (property.status !== 'open') return { success: false, error: 'This raise is no longer accepting commitments.' }

  const minAmount = property.totalRaise.mul(MIN_ENTRY_FRACTION)
  if (new Prisma.Decimal(amountNum).lt(minAmount)) {
    return {
      success: false,
      error: `Minimum commitment is ₦${Number(minAmount).toLocaleString()} (7.5% of the raise).`,
    }
  }

  // KYC — required if profile is unverified
  if (profile.kycStatus === 'unverified') {
    const docType   = (formData.get('docType')    as string | null)?.trim()
    const docNumber = (formData.get('docNumber')  as string | null)?.trim() || null
    const expiryRaw = (formData.get('expiryDate') as string | null)?.trim()
    const idFile    = formData.get('idFile')    as File | null
    const proofFile = formData.get('proofFile') as File | null

    if (!docType || !VALID_DOC_TYPES.includes(docType as DocumentType)) {
      return { success: false, error: 'Please select a valid document type.' }
    }
    if (!idFile || idFile.size === 0) {
      return { success: false, error: 'Please upload your identity document.' }
    }
    if (!proofFile || proofFile.size === 0) {
      return { success: false, error: 'Please upload your proof of address.' }
    }
    if (idFile.size > MAX_KYC_BYTES || proofFile.size > MAX_KYC_BYTES) {
      return { success: false, error: 'Each document must be under 10 MB.' }
    }

    try {
      const ts = Date.now()
      const [idBlob, proofBlob] = await Promise.all([
        put(`kyc/${profile.id}/${ts}-id-${sanitize(idFile.name)}`,    idFile,    { access: 'private', addRandomSuffix: true }),
        put(`kyc/${profile.id}/${ts}-proof-${sanitize(proofFile.name)}`, proofFile, { access: 'private', addRandomSuffix: true }),
      ])

      await db.$transaction([
        db.identityDocument.create({
          data: {
            profileId:         profile.id,
            type:              docType as DocumentType,
            documentNumber:    docNumber,
            expiryDate:        expiryRaw ? new Date(expiryRaw) : null,
            fileUrl:           idBlob.url,
            proofOfAddressUrl: proofBlob.url,
          },
        }),
        db.profile.update({
          where: { id: profile.id },
          data:  { kycStatus: 'pending' },
        }),
      ])
    } catch (err) {
      console.error('[createCommitment] KYC upload failed:', err)
      return {
        success: false,
        error: `Document upload failed: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  }

  // Connection code (optional)
  const connectionCode = (formData.get('code') as string | null)?.trim()
  let connectionGroupId: string | null = null
  if (connectionCode) {
    const group = await db.connectionGroup.findUnique({
      where: { code: connectionCode.toUpperCase() },
    })
    if (!group) {
      return { success: false, error: `Connection code "${connectionCode.toUpperCase()}" not found.` }
    }
    if (group.propertyId !== propertyId) {
      return { success: false, error: 'That connection code belongs to a different property.' }
    }
    connectionGroupId = group.id
  }

  const commitment = await db.commitment.create({
    data: {
      profileId: profile.id,
      propertyId,
      amount:    new Prisma.Decimal(amountNum),
      connectionGroupId,
    },
  })

  return { success: true, commitmentId: commitment.id }
}

export async function generateConnectionCode(propertyId: string): Promise<CodeResult> {
  const profile = await getSessionProfile()
  if (!profile) return { success: false, error: 'Sign in to generate a code.' }

  const property = await db.property.findUnique({
    where:  { id: propertyId },
    select: { status: true },
  })
  if (!property)                  return { success: false, error: 'Property not found.' }
  if (property.status !== 'open') return { success: false, error: 'This raise is closed.' }

  let code = makeGroupCode()
  for (let i = 0; i < 5; i++) {
    const clash = await db.connectionGroup.findUnique({ where: { code } })
    if (!clash) break
    code = makeGroupCode()
  }

  const group = await db.connectionGroup.create({
    data: { propertyId, code, createdByProfileId: profile.id },
  })

  return { success: true, code: group.code }
}
