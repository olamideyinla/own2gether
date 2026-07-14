'use server'

import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { MIN_ENTRY_FRACTION } from '@/lib/allocation'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CommitmentResult =
  | { success: true; commitmentId: string }
  | { success: false; error: string }

export type CodeResult =
  | { success: true; code: string }
  | { success: false; error: string }

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = 'GRP-'
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

async function findOrCreateProfile(name: string, email: string) {
  const normalised = email.trim().toLowerCase()
  const existing = await db.profile.findUnique({ where: { email: normalised } })
  if (existing) return existing
  return db.profile.create({ data: { name: name.trim(), email: normalised } })
}

// ─── Actions ───────────────────────────────────────────────────────────────────

/**
 * Records a commitment from a named individual.
 *
 * The profile is found by e-mail or created if it doesn't exist.
 * This is a pre-auth MVP pattern — once authentication is in place the
 * profile will come from the session and name/email will not be collected here.
 *
 * If connectionCode is supplied, the commitment is linked to that group.
 * An unknown code returns an error so the user can correct it.
 */
export async function createCommitment(
  propertyId: string,
  name: string,
  email: string,
  amountNGN: number,
  connectionCode?: string,
): Promise<CommitmentResult> {
  if (!name.trim())                           return { success: false, error: 'Full name is required.' }
  if (!email.trim() || !email.includes('@'))  return { success: false, error: 'A valid email address is required.' }
  if (!amountNGN || amountNGN <= 0)           return { success: false, error: 'Please enter a valid amount.' }

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { status: true, totalRaise: true },
  })
  if (!property)                  return { success: false, error: 'Property not found.' }
  if (property.status !== 'open') return { success: false, error: 'This raise is no longer accepting commitments.' }

  const minAmount = property.totalRaise.mul(MIN_ENTRY_FRACTION)
  if (new Prisma.Decimal(amountNGN).lt(minAmount)) {
    return {
      success: false,
      error: `Minimum commitment is ₦${Number(minAmount).toLocaleString()} (7.5% of the raise).`,
    }
  }

  const profile = await findOrCreateProfile(name, email)

  let connectionGroupId: string | null = null
  if (connectionCode?.trim()) {
    const group = await db.connectionGroup.findUnique({
      where: { code: connectionCode.trim().toUpperCase() },
    })
    if (!group) {
      return { success: false, error: `Connection code "${connectionCode.trim().toUpperCase()}" not found.` }
    }
    if (group.propertyId !== propertyId) {
      return { success: false, error: 'That connection code belongs to a different property.' }
    }
    connectionGroupId = group.id
  }

  const commitment = await db.commitment.create({
    data: {
      profileId:         profile.id,
      propertyId,
      amount:            new Prisma.Decimal(amountNGN),
      connectionGroupId,
    },
  })

  return { success: true, commitmentId: commitment.id }
}

/**
 * Creates a new ConnectionGroup for the given property and returns its code.
 * The group is owned by the profile identified by name/email (created if needed).
 * The caller can immediately enter the returned code in the commitment form, or
 * share it with others before submitting.
 */
export async function generateConnectionCode(
  propertyId: string,
  name: string,
  email: string,
): Promise<CodeResult> {
  if (!name.trim())                           return { success: false, error: 'Full name is required to generate a code.' }
  if (!email.trim() || !email.includes('@'))  return { success: false, error: 'A valid email is required to generate a code.' }

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { status: true },
  })
  if (!property)                  return { success: false, error: 'Property not found.' }
  if (property.status !== 'open') return { success: false, error: 'This raise is closed.' }

  const profile = await findOrCreateProfile(name, email)

  // Try up to 5 random codes in case of collision (astronomically unlikely)
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
