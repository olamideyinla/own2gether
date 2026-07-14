/**
 * Own2gether allocation engine.
 *
 * Pure functions (no I/O — unit-testable in isolation):
 *   rankEntries                  group + sort commitment rows
 *   computeAllocation            walk ranked list, allocate or cap
 *   checkWithdrawalEligibility   enforce 3-withdrawal limit + 12-month lockout
 *   checkPaymentWindowExpiry     10-day payment window check
 *
 * DB-aware orchestrators (accept PrismaClient for dependency injection):
 *   rankCommitments              fetch rows → rankEntries
 *   allocate                     fetch → compute → persist in a transaction
 *   withdrawCommitment           validate → persist withdrawal
 *   checkPaymentWindow           fetch → checkPaymentWindowExpiry
 */

import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Own2gether's baseline equity stake in every property company (PRD 4.2). */
export const OWN2GETHER_STAKE_PCT = new Prisma.Decimal('2.5')

/**
 * Fraction of totalRaise that forms the co-owner equity pool.
 * Co-owners collectively own 97.5% of the company; Own2gether takes 2.5%
 * as compensation for deal structuring and ongoing management (PRD 4.1, 4.2).
 */
export const CO_OWNER_POOL_FRACTION = new Prisma.Decimal('0.975')

/**
 * Minimum commitment size as a fraction of totalRaise (PRD 5.2).
 * Applies to new entries entering a raise — NOT to the allocation math itself.
 * A final capped entry may receive less than 7.5% as an automatic consequence
 * of whatever balance remains.
 */
export const MIN_ENTRY_FRACTION = new Prisma.Decimal('0.075')

/** Max free withdrawals before the lockout kicks in (PRD 5.2a). */
export const MAX_WITHDRAWALS = 3

/** Lockout duration in calendar months, anchored to FIRST withdrawal (PRD 5.2a). */
export const WITHDRAWAL_LOCKOUT_MONTHS = 12

/** Days a co-owner has to initiate payment after allocation is confirmed (PRD 7.2). */
export const PAYMENT_WINDOW_DAYS = 10

// ─── Types ───────────────────────────────────────────────────────────────────

/** One commitment row as consumed by the pure ranking/allocation functions. */
export type CommitmentInput = {
  id: string
  profileId: string
  amount: Prisma.Decimal
  connectionGroupId: string | null
}

/**
 * A single entry in the ranked list.
 * Solo commitments have one member; connected groups have one member per
 * co-owner who joined via the group code (PRD 2.2, 5.3).
 */
export type RankedEntry = {
  members: CommitmentInput[]
  connectionGroupId: string | null
  /** Sum of all member amounts — the figure used for ranking. */
  totalAmount: Prisma.Decimal
}

/**
 * The allocation decision for a single commitment (never aggregated at group
 * level, so callers can write DB rows directly without extra logic).
 */
export type CommitmentDecision = {
  commitmentId: string
  profileId: string
  requestedAmount: Prisma.Decimal
  allocatedAmount: Prisma.Decimal
  /** requestedAmount − allocatedAmount; non-zero only when status is 'capped'. */
  excessAmount: Prisma.Decimal
  /** 'allocated' = full amount placed; 'capped' = truncated at pool boundary. */
  status: 'allocated' | 'capped'
}

export type AllocationResult = {
  decisions: CommitmentDecision[]
  /**
   * Unfilled co-owner pool remainder expressed as a percentage of the property
   * company, to be recorded as Own2gether's residual_buy_in stake (PRD 4.2, 5.2).
   * Zero when co-owner commitments consume the entire pool.
   */
  ownTwogetherResidualPct: Prisma.Decimal
}

export type WithdrawalInput = {
  id: string
  withdrawnAt: Date
}

export type WithdrawalCheck =
  | { blocked: false }
  | { blocked: true; reason: string }

export type PaymentWindowResult = {
  lapsed: boolean
  paymentDueAt: Date | null
  /** Positive hours remaining, 0 if lapsed, null if not yet allocated. */
  hoursRemaining: number | null
}

// ─── Pure functions ───────────────────────────────────────────────────────────

/**
 * Groups commitment rows by connectionGroupId and returns entries sorted
 * descending by combined amount.
 *
 * A connected group ranks as one entry sized at the sum of its members'
 * amounts (PRD 5.3). Solo commitments (connectionGroupId = null) each form
 * their own single-member entry.
 */
export function rankEntries(commitments: CommitmentInput[]): RankedEntry[] {
  const buckets = new Map<string, CommitmentInput[]>()

  for (const c of commitments) {
    // Unique bucket key: group id for linked commitments, solo key otherwise
    const key = c.connectionGroupId ?? `__solo__${c.id}`
    const existing = buckets.get(key)
    if (existing) {
      existing.push(c)
    } else {
      buckets.set(key, [c])
    }
  }

  const entries: RankedEntry[] = []
  for (const [, members] of buckets) {
    const totalAmount = members.reduce(
      (sum, c) => sum.add(c.amount),
      new Prisma.Decimal(0),
    )
    entries.push({
      members,
      connectionGroupId: members[0].connectionGroupId,
      totalAmount,
    })
  }

  // Largest first (PRD 5.3: "starting with the largest and proceeding downward")
  entries.sort((a, b) => b.totalAmount.comparedTo(a.totalAmount))

  return entries
}

/**
 * Walks down ranked entries, allocating from the co-owner pool until it is
 * exhausted or entries are consumed.
 *
 * Allocation rules (PRD 5.2, 5.3, 5.4):
 *
 * – Full entry fits in remaining pool → allocate all members at their full
 *   requested amounts (status 'allocated').
 *
 * – Entry would exceed the remaining pool → cap each member at their
 *   proportional share of whatever remains (status 'capped'). The last member
 *   in the group absorbs any rounding delta so the total allocated equals the
 *   pool remainder exactly. Entries below this point are NOT allocated.
 *
 * – Pool remainder after all entries → Own2gether residual_buy_in stake,
 *   returned as a percentage of the property company so the caller can create
 *   the Stake record directly.
 *
 * Returns pure data — no DB writes.
 */
export function computeAllocation(
  entries: RankedEntry[],
  coOwnerPool: Prisma.Decimal,
): AllocationResult {
  const ZERO = new Prisma.Decimal(0)
  let remaining = coOwnerPool
  const decisions: CommitmentDecision[] = []

  for (const entry of entries) {
    if (remaining.lte(ZERO)) break

    if (entry.totalAmount.lte(remaining)) {
      // ── Full allocation ──────────────────────────────────────────────────
      for (const member of entry.members) {
        decisions.push({
          commitmentId: member.id,
          profileId: member.profileId,
          requestedAmount: member.amount,
          allocatedAmount: member.amount,
          excessAmount: ZERO,
          status: 'allocated',
        })
      }
      remaining = remaining.sub(entry.totalAmount)
    } else {
      // ── Capped at pool boundary (oversubscription / final residual fill) ─
      // Split the cap among group members proportionally to their amounts.
      // The last member receives the exact remainder so rounding never drifts.
      const capTotal = remaining
      let distributed = ZERO

      for (let i = 0; i < entry.members.length; i++) {
        const member = entry.members[i]
        const isLast = i === entry.members.length - 1

        const memberShare = isLast
          ? capTotal.sub(distributed)
          : member.amount.div(entry.totalAmount).mul(capTotal)

        decisions.push({
          commitmentId: member.id,
          profileId: member.profileId,
          requestedAmount: member.amount,
          allocatedAmount: memberShare,
          excessAmount: member.amount.sub(memberShare),
          status: 'capped',
        })

        distributed = distributed.add(memberShare)
      }

      remaining = ZERO
      break // pool exhausted — entries below are not processed
    }
  }

  // Any pool left after all entries becomes Own2gether's residual stake.
  // Expressed as % of the company:
  //   residualPct = (remaining / totalRaise) × 100
  //   totalRaise  = coOwnerPool / CO_OWNER_POOL_FRACTION
  let ownTwogetherResidualPct = ZERO
  if (remaining.gt(ZERO)) {
    const totalRaise = coOwnerPool.div(CO_OWNER_POOL_FRACTION)
    ownTwogetherResidualPct = remaining.div(totalRaise).mul(100)
  }

  return { decisions, ownTwogetherResidualPct }
}

/**
 * Returns whether a withdrawal attempt should be blocked.
 *
 * Rules (PRD 5.2a):
 * – Fewer than MAX_WITHDRAWALS (3) existing withdrawals → always allow.
 * – 3 or more existing withdrawals → check whether 12 months have elapsed
 *   since the FIRST withdrawal in the sequence.
 *   • Lockout still active  → block with reason string.
 *   • Lockout elapsed       → allow (implicit reset; the spec leaves this
 *     as an open item — this implementation resolves it as a reset).
 */
export function checkWithdrawalEligibility(
  existingWithdrawals: WithdrawalInput[],
  now: Date = new Date(),
): WithdrawalCheck {
  if (existingWithdrawals.length < MAX_WITHDRAWALS) {
    return { blocked: false }
  }

  // Sort chronologically so sorted[0] is definitively the earliest
  const sorted = [...existingWithdrawals].sort(
    (a, b) => a.withdrawnAt.getTime() - b.withdrawnAt.getTime(),
  )

  const firstWithdrawalDate = sorted[0].withdrawnAt
  const lockoutEnd = new Date(firstWithdrawalDate)
  lockoutEnd.setMonth(lockoutEnd.getMonth() + WITHDRAWAL_LOCKOUT_MONTHS)

  if (now >= lockoutEnd) {
    // Lockout elapsed — allow (treat as implicit reset of the sequence)
    return { blocked: false }
  }

  const remainingDays = Math.ceil(
    (lockoutEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )

  return {
    blocked: true,
    reason:
      `Withdrawal limit reached (${MAX_WITHDRAWALS} withdrawals used). ` +
      `You cannot withdraw again until ` +
      `${lockoutEnd.toISOString().split('T')[0]} ` +
      `— 12 months from your first withdrawal on ` +
      `${firstWithdrawalDate.toISOString().split('T')[0]}. ` +
      `${remainingDays} day(s) remaining.`,
  }
}

/**
 * Checks whether the 10-day payment window has elapsed for an allocated
 * commitment.
 *
 * Returns pure data — does NOT mutate anything. Lapsed commitments are
 * flagged for admin review; auto-reversion is not implemented here because
 * the handling of lapsed payments is an open item (PRD 7.2).
 */
export function checkPaymentWindowExpiry(
  allocationConfirmedAt: Date | null,
  now: Date = new Date(),
): PaymentWindowResult {
  if (!allocationConfirmedAt) {
    return { lapsed: false, paymentDueAt: null, hoursRemaining: null }
  }

  const paymentDueAt = new Date(allocationConfirmedAt)
  paymentDueAt.setDate(paymentDueAt.getDate() + PAYMENT_WINDOW_DAYS)

  const msRemaining = paymentDueAt.getTime() - now.getTime()

  return {
    lapsed: msRemaining <= 0,
    paymentDueAt,
    hoursRemaining: msRemaining > 0 ? msRemaining / (1000 * 60 * 60) : 0,
  }
}

// ─── DB-aware orchestrators ───────────────────────────────────────────────────

/**
 * Fetches all non-withdrawn, non-paid commitments for a property and returns
 * them in ranked order alongside the co-owner pool size.
 */
export async function rankCommitments(
  propertyId: string,
  db: PrismaClient,
): Promise<{ coOwnerPool: Prisma.Decimal; entries: RankedEntry[] }> {
  const property = await db.property.findUniqueOrThrow({
    where: { id: propertyId },
    select: { totalRaise: true },
  })

  const rows = await db.commitment.findMany({
    where: {
      propertyId,
      status: { in: ['pending', 'allocated', 'capped', 'partially_allocated'] },
    },
    select: { id: true, profileId: true, amount: true, connectionGroupId: true },
  })

  const coOwnerPool = property.totalRaise.mul(CO_OWNER_POOL_FRACTION)
  return { coOwnerPool, entries: rankEntries(rows) }
}

/**
 * Runs allocation for a property and persists all results atomically:
 *
 *  1. Rank all non-paid, non-withdrawn commitments
 *  2. Compute allocation decisions
 *  3. Update each commitment (status, allocatedAmount, dates)
 *  4. Create per-co-owner Stake records
 *     Stake% = (allocatedAmount / totalRaise) × 97.5
 *  5. Create Own2gether management_fee stake (2.5%, idempotent)
 *  6. Create Own2gether residual_buy_in stake if pool has unfilled capacity
 *  7. Set property status to 'fully_allocated' when pool is consumed
 */
export async function allocate(
  propertyId: string,
  db: PrismaClient,
  now: Date = new Date(),
): Promise<AllocationResult> {
  const property = await db.property.findUniqueOrThrow({
    where: { id: propertyId },
    select: { totalRaise: true },
  })

  const totalRaise = property.totalRaise
  const coOwnerPool = totalRaise.mul(CO_OWNER_POOL_FRACTION)

  const rows = await db.commitment.findMany({
    where: {
      propertyId,
      status: { in: ['pending', 'allocated', 'capped', 'partially_allocated'] },
    },
    select: { id: true, profileId: true, amount: true, connectionGroupId: true },
  })

  const result = computeAllocation(rankEntries(rows), coOwnerPool)

  const paymentDueAt = new Date(now)
  paymentDueAt.setDate(paymentDueAt.getDate() + PAYMENT_WINDOW_DAYS)

  await db.$transaction(async (tx) => {
    // 1. Write commitment decisions
    for (const d of result.decisions) {
      await tx.commitment.update({
        where: { id: d.commitmentId },
        data: {
          status: d.status,
          allocatedAmount: d.allocatedAmount,
          allocationConfirmedAt: now,
          paymentDueAt,
        },
      })
    }

    // 2. Co-owner stakes — stakePct = (allocatedAmount / totalRaise) × 97.5
    for (const d of result.decisions) {
      await tx.stake.create({
        data: {
          propertyId,
          profileId: d.profileId,
          percentage: d.allocatedAmount
            .div(totalRaise)
            .mul(100)
            .mul(CO_OWNER_POOL_FRACTION),
          source: 'co_owner',
        },
      })
    }

    // 3. Own2gether management_fee stake — create once per property
    const existingMgmt = await tx.stake.findFirst({
      where: { propertyId, source: 'management_fee' },
    })
    if (!existingMgmt) {
      await tx.stake.create({
        data: {
          propertyId,
          profileId: null,
          percentage: OWN2GETHER_STAKE_PCT,
          source: 'management_fee',
        },
      })
    }

    // 4. Own2gether residual_buy_in stake if pool has unfilled capacity
    if (result.ownTwogetherResidualPct.gt(0)) {
      await tx.stake.create({
        data: {
          propertyId,
          profileId: null,
          percentage: result.ownTwogetherResidualPct,
          source: 'residual_buy_in',
        },
      })
    }

    // 5. Mark property fully_allocated when pool is consumed
    const totalAllocated = result.decisions.reduce(
      (s, d) => s.add(d.allocatedAmount),
      new Prisma.Decimal(0),
    )
    if (totalAllocated.gte(coOwnerPool) || result.ownTwogetherResidualPct.gt(0)) {
      await tx.property.update({
        where: { id: propertyId },
        data: { status: 'fully_allocated' },
      })
    }
  })

  return result
}

/**
 * Withdraws a commitment and creates a Withdrawal record.
 *
 * Allowed at any point before payment, including after allocation is confirmed.
 * Freed capacity returns to the raise generally — no auto-cascade to the
 * next-ranked entry; re-running allocate() picks it up naturally (PRD 5.2a).
 */
export async function withdrawCommitment(
  commitmentId: string,
  db: PrismaClient,
  now: Date = new Date(),
): Promise<{ success: true } | { success: false; error: string }> {
  const commitment = await db.commitment.findUniqueOrThrow({
    where: { id: commitmentId },
    select: { id: true, profileId: true, status: true },
  })

  if (commitment.status === 'paid') {
    return {
      success: false,
      error: 'Cannot withdraw: payment has already been made for this commitment.',
    }
  }
  if (commitment.status === 'withdrawn') {
    return { success: false, error: 'Commitment is already withdrawn.' }
  }

  const previousWithdrawals = await db.withdrawal.findMany({
    where: { profileId: commitment.profileId },
    select: { id: true, withdrawnAt: true },
  })

  const check = checkWithdrawalEligibility(previousWithdrawals, now)
  if (check.blocked) {
    return { success: false, error: check.reason }
  }

  await db.$transaction(async (tx) => {
    await tx.commitment.update({
      where: { id: commitmentId },
      data: {
        status: 'withdrawn',
        allocatedAmount: null,
        allocationConfirmedAt: null,
        paymentDueAt: null,
      },
    })
    await tx.withdrawal.create({
      data: { profileId: commitment.profileId, commitmentId, withdrawnAt: now },
    })
  })

  return { success: true }
}

/**
 * Checks whether the 10-day payment window has lapsed for a commitment.
 * Returns the result without writing to the DB.
 * Lapsed commitments should be reviewed by an admin (open item PRD 7.2).
 */
export async function checkPaymentWindow(
  commitmentId: string,
  db: PrismaClient,
  now: Date = new Date(),
): Promise<PaymentWindowResult & { commitmentId: string; commitmentStatus: string }> {
  const commitment = await db.commitment.findUniqueOrThrow({
    where: { id: commitmentId },
    select: { id: true, allocationConfirmedAt: true, status: true },
  })

  return {
    ...checkPaymentWindowExpiry(commitment.allocationConfirmedAt, now),
    commitmentId,
    commitmentStatus: commitment.status,
  }
}
