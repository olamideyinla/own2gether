import { describe, it, expect } from 'vitest'
import { Prisma } from '@prisma/client'
import {
  rankEntries,
  computeAllocation,
  checkWithdrawalEligibility,
  checkPaymentWindowExpiry,
  CO_OWNER_POOL_FRACTION,
  MAX_WITHDRAWALS,
  PAYMENT_WINDOW_DAYS,
  type CommitmentInput,
  type WithdrawalInput,
} from './allocation'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const D = (n: string | number) => new Prisma.Decimal(n)

/** Build a CommitmentInput with sensible defaults. */
function commitment(
  id: string,
  amount: number,
  connectionGroupId: string | null = null,
  profileId = `profile-${id}`,
): CommitmentInput {
  return { id, profileId, amount: D(amount), connectionGroupId }
}

/** Shorthand: totalRaise → coOwnerPool */
const pool = (totalRaise: number) =>
  D(totalRaise).mul(CO_OWNER_POOL_FRACTION)

// ─── rankEntries ─────────────────────────────────────────────────────────────

describe('rankEntries', () => {
  it('returns an empty list when given no commitments', () => {
    expect(rankEntries([])).toEqual([])
  })

  it('sorts solo commitments descending by amount', () => {
    const entries = rankEntries([
      commitment('c', 30),
      commitment('a', 50),
      commitment('b', 40),
    ])
    expect(entries.map((e) => Number(e.totalAmount))).toEqual([50, 40, 30])
  })

  it('combines group members into one entry ranked by their combined amount', () => {
    // Two solos (45 and 40) plus a group of two (25 + 25 = 50)
    const entries = rankEntries([
      commitment('solo-A', 45),
      commitment('grp-E', 25, 'grp1'),
      commitment('grp-F', 25, 'grp1'),
      commitment('solo-B', 40),
    ])

    // Group (50) > solo-A (45) > solo-B (40)
    expect(entries).toHaveLength(3)
    expect(Number(entries[0].totalAmount)).toBe(50)
    expect(entries[0].connectionGroupId).toBe('grp1')
    expect(entries[0].members).toHaveLength(2)

    expect(Number(entries[1].totalAmount)).toBe(45)
    expect(entries[1].connectionGroupId).toBeNull()

    expect(Number(entries[2].totalAmount)).toBe(40)
  })

  it('treats a group with a single member the same as a solo', () => {
    // One person joined a group code but no one else did
    const entries = rankEntries([
      commitment('a', 30, 'grp-lonely'),
    ])
    expect(entries).toHaveLength(1)
    expect(entries[0].connectionGroupId).toBe('grp-lonely')
    expect(Number(entries[0].totalAmount)).toBe(30)
  })
})

// ─── computeAllocation ───────────────────────────────────────────────────────

describe('computeAllocation — normal full allocation', () => {
  // totalRaise = 100 (arbitrary units), coOwnerPool = 97.5
  // Three solo commitments that together exactly fill the pool
  const entries = rankEntries([
    commitment('A', 50),
    commitment('B', 30),
    commitment('C', 17.5),
  ])
  const result = computeAllocation(entries, pool(100))

  it('returns one decision per commitment', () => {
    expect(result.decisions).toHaveLength(3)
  })

  it('marks all decisions as fully allocated', () => {
    expect(result.decisions.every((d) => d.status === 'allocated')).toBe(true)
  })

  it('allocates each commitment at its full requested amount', () => {
    const byId = Object.fromEntries(result.decisions.map((d) => [d.commitmentId, d]))
    expect(Number(byId['A'].allocatedAmount)).toBe(50)
    expect(Number(byId['B'].allocatedAmount)).toBe(30)
    expect(Number(byId['C'].allocatedAmount)).toBe(17.5)
  })

  it('has zero excess for every decision', () => {
    expect(result.decisions.every((d) => d.excessAmount.eq(0))).toBe(true)
  })

  it('has no Own2gether residual when pool is exactly consumed', () => {
    expect(result.ownTwogetherResidualPct.eq(0)).toBe(true)
  })
})

describe('computeAllocation — oversubscribed raise', () => {
  // totalRaise = 100, coOwnerPool = 97.5
  // A=50, B=40, C=30  →  A+B+C = 120 > 97.5
  // Walk: A (50) → remaining 47.5; B (40) → remaining 7.5; C (30) capped at 7.5
  const entries = rankEntries([
    commitment('A', 50),
    commitment('B', 40),
    commitment('C', 30),
  ])
  const result = computeAllocation(entries, pool(100))

  it('fully allocates entries that fit', () => {
    const byId = Object.fromEntries(result.decisions.map((d) => [d.commitmentId, d]))
    expect(byId['A'].status).toBe('allocated')
    expect(Number(byId['A'].allocatedAmount)).toBe(50)
    expect(byId['B'].status).toBe('allocated')
    expect(Number(byId['B'].allocatedAmount)).toBe(40)
  })

  it('caps the last entry at the pool remainder', () => {
    const byId = Object.fromEntries(result.decisions.map((d) => [d.commitmentId, d]))
    expect(byId['C'].status).toBe('capped')
    expect(Number(byId['C'].allocatedAmount)).toBe(7.5)
  })

  it('records the correct excess amount for the capped entry', () => {
    const byId = Object.fromEntries(result.decisions.map((d) => [d.commitmentId, d]))
    // excess = requested (30) - allocated (7.5) = 22.5
    expect(Number(byId['C'].excessAmount)).toBe(22.5)
  })

  it('does not allocate entries below the capped one', () => {
    // Three entries supplied, all three returned but only three in result
    expect(result.decisions).toHaveLength(3)
  })

  it('has no Own2gether residual when oversubscribed', () => {
    expect(result.ownTwogetherResidualPct.eq(0)).toBe(true)
  })
})

describe('computeAllocation — residual below 7.5% goes to Own2gether', () => {
  // totalRaise = 100, coOwnerPool = 97.5
  // A=50, B=44  → A+B = 94, remaining = 97.5 - 94 = 3.5
  // 3.5 < 7.5% of totalRaise (7.5) → no commitment can enter for the residual
  // Own2gether takes the 3.5 as residual_buy_in
  // residualPct = (3.5 / 100) × 100 = 3.5%
  const entries = rankEntries([
    commitment('A', 50),
    commitment('B', 44),
  ])
  const result = computeAllocation(entries, pool(100))

  it('allocates both entries in full', () => {
    expect(result.decisions).toHaveLength(2)
    expect(result.decisions.every((d) => d.status === 'allocated')).toBe(true)
  })

  it('returns the unfilled remainder as Own2gether residual %', () => {
    // remaining = 3.5, totalRaise = 100 → residualPct = 3.5%
    expect(Number(result.ownTwogetherResidualPct)).toBeCloseTo(3.5, 6)
  })

  it('residual + co-owner allocations account for the full pool', () => {
    const totalRaise = D(100)
    const allocatedSum = result.decisions.reduce(
      (s, d) => s.add(d.allocatedAmount),
      D(0),
    )
    const residualAmount = result.ownTwogetherResidualPct
      .div(100)
      .mul(totalRaise)

    // allocatedSum + residualAmount should equal coOwnerPool
    expect(Number(allocatedSum.add(residualAmount))).toBeCloseTo(97.5, 6)
  })
})

describe('computeAllocation — residual when no commitments exist at all', () => {
  it('assigns the entire pool as Own2gether residual when there are no entries', () => {
    const result = computeAllocation([], pool(100))
    expect(result.decisions).toHaveLength(0)
    // 97.5 / 100 * 100 = 97.5%
    expect(Number(result.ownTwogetherResidualPct)).toBeCloseTo(97.5, 6)
  })
})

describe('computeAllocation — connection group ranks as one combined entry', () => {
  // totalRaise = 100, coOwnerPool = 97.5
  //   Group [E=30, F=25] combined = 55  ← ranked #1 (55 > 50)
  //   Solo  D = 50                       ← ranked #2
  // Walk: group (55) → remaining 42.5; D (50) capped at 42.5
  const entries = rankEntries([
    commitment('D', 50),
    commitment('E', 30, 'grp1', 'pE'),
    commitment('F', 25, 'grp1', 'pF'),
  ])
  const result = computeAllocation(entries, pool(100))

  it('produces three decisions (one per commitment, not one per entry)', () => {
    expect(result.decisions).toHaveLength(3)
  })

  it('allocates group members at their full amounts (group fit in pool)', () => {
    const byId = Object.fromEntries(result.decisions.map((d) => [d.commitmentId, d]))
    expect(byId['E'].status).toBe('allocated')
    expect(Number(byId['E'].allocatedAmount)).toBe(30)
    expect(byId['F'].status).toBe('allocated')
    expect(Number(byId['F'].allocatedAmount)).toBe(25)
  })

  it('caps the solo entry that follows at the pool remainder', () => {
    const byId = Object.fromEntries(result.decisions.map((d) => [d.commitmentId, d]))
    // remaining after group = 97.5 - 55 = 42.5
    expect(byId['D'].status).toBe('capped')
    expect(Number(byId['D'].allocatedAmount)).toBe(42.5)
    expect(Number(byId['D'].excessAmount)).toBe(7.5)
  })

  it('has no residual because the pool is fully consumed', () => {
    // 30 + 25 + 42.5 = 97.5 = pool
    expect(result.ownTwogetherResidualPct.eq(0)).toBe(true)
  })
})

describe('computeAllocation — capped group splits proportionally', () => {
  // Group [A=60, B=40] combined = 100, pool = 97.5
  // Group exceeds pool → cap at 97.5, split: A gets 60/100 × 97.5 = 58.5, B gets 39
  // (last member absorbs rounding: 97.5 - 58.5 = 39.0 exactly)
  const entries = rankEntries([
    commitment('A', 60, 'grp'),
    commitment('B', 40, 'grp'),
  ])
  const result = computeAllocation(entries, pool(100))

  it('marks both group members as capped', () => {
    expect(result.decisions.every((d) => d.status === 'capped')).toBe(true)
  })

  it('splits the cap proportionally among members', () => {
    const byId = Object.fromEntries(result.decisions.map((d) => [d.commitmentId, d]))
    // A: 60/100 × 97.5 = 58.5; B: 39.0 (exact remainder)
    expect(Number(byId['A'].allocatedAmount)).toBeCloseTo(58.5, 6)
    expect(Number(byId['B'].allocatedAmount)).toBeCloseTo(39.0, 6)
  })

  it('allocated amounts sum exactly to the pool cap', () => {
    const total = result.decisions.reduce(
      (s, d) => s.add(d.allocatedAmount),
      D(0),
    )
    expect(Number(total)).toBeCloseTo(97.5, 6)
  })
})

// ─── checkWithdrawalEligibility ──────────────────────────────────────────────

describe('checkWithdrawalEligibility', () => {
  const W = (id: string, daysAgo: number): WithdrawalInput => {
    const d = new Date('2026-06-29T00:00:00Z')
    d.setDate(d.getDate() - daysAgo)
    return { id, withdrawnAt: d }
  }

  it('allows the first withdrawal (no history)', () => {
    const result = checkWithdrawalEligibility([])
    expect(result.blocked).toBe(false)
  })

  it(`allows up to ${MAX_WITHDRAWALS} withdrawals without lockout`, () => {
    // Two existing → this would be the third; still allowed
    const result = checkWithdrawalEligibility([W('w1', 60), W('w2', 30)])
    expect(result.blocked).toBe(false)
  })

  it('blocks the 4th withdrawal when lockout window has not elapsed', () => {
    // 3 existing; first was 180 days ago → lockout ends at first + 12 months
    // 12 months ≈ 365 days; 180 < 365 → still within lockout
    const result = checkWithdrawalEligibility(
      [W('w1', 180), W('w2', 120), W('w3', 60)],
      new Date('2026-06-29T00:00:00Z'),
    )
    expect(result.blocked).toBe(true)
    if (result.blocked) {
      expect(result.reason).toContain('12 months')
    }
  })

  it('includes the lockout-end date in the error message', () => {
    const firstDate = new Date('2026-01-01T00:00:00Z')
    const now = new Date('2026-06-29T00:00:00Z')
    const result = checkWithdrawalEligibility(
      [
        { id: 'w1', withdrawnAt: firstDate },
        { id: 'w2', withdrawnAt: new Date('2026-02-01') },
        { id: 'w3', withdrawnAt: new Date('2026-03-01') },
      ],
      now,
    )
    expect(result.blocked).toBe(true)
    if (result.blocked) {
      // Lockout ends 2027-01-01
      expect(result.reason).toContain('2027-01-01')
      expect(result.reason).toContain('2026-01-01')
    }
  })

  it('allows withdrawal once the 12-month lockout has elapsed', () => {
    // First withdrawal was 400 days ago → lockout ended ~35 days ago
    const result = checkWithdrawalEligibility(
      [W('w1', 400), W('w2', 300), W('w3', 200)],
      new Date('2026-06-29T00:00:00Z'),
    )
    expect(result.blocked).toBe(false)
  })

  it('uses the FIRST (earliest) withdrawal as the lockout anchor, not the latest', () => {
    // If the lockout were anchored to the most-recent withdrawal (w3, 30 days ago),
    // it would not have expired. But anchored to w1 (380 days ago), it has.
    const result = checkWithdrawalEligibility(
      [W('w1', 380), W('w2', 200), W('w3', 30)],
      new Date('2026-06-29T00:00:00Z'),
    )
    // 380 days > 365 → lockout elapsed from first withdrawal
    expect(result.blocked).toBe(false)
  })
})

// ─── checkPaymentWindowExpiry ─────────────────────────────────────────────────

describe('checkPaymentWindowExpiry', () => {
  it('returns null paymentDueAt and no lapse when not yet allocated', () => {
    const result = checkPaymentWindowExpiry(null)
    expect(result.lapsed).toBe(false)
    expect(result.paymentDueAt).toBeNull()
    expect(result.hoursRemaining).toBeNull()
  })

  it(`sets paymentDueAt to allocationConfirmedAt + ${PAYMENT_WINDOW_DAYS} days`, () => {
    const confirmed = new Date('2026-06-19T12:00:00Z')
    const result = checkPaymentWindowExpiry(confirmed, new Date('2026-06-20T12:00:00Z'))
    const expected = new Date('2026-06-29T12:00:00Z')
    expect(result.paymentDueAt?.getTime()).toBe(expected.getTime())
  })

  it('returns lapsed=false and positive hoursRemaining when inside the window', () => {
    const confirmed = new Date('2026-06-25T00:00:00Z')
    const now = new Date('2026-06-29T00:00:00Z') // 4 days in, 6 remaining
    const result = checkPaymentWindowExpiry(confirmed, now)
    expect(result.lapsed).toBe(false)
    expect(result.hoursRemaining).toBeGreaterThan(0)
    // 6 days = 144 hours remaining
    expect(result.hoursRemaining).toBeCloseTo(144, 0)
  })

  it('returns lapsed=true and hoursRemaining=0 when deadline has passed', () => {
    const confirmed = new Date('2026-06-01T00:00:00Z')
    const now = new Date('2026-06-29T00:00:00Z') // 28 days later (> 10)
    const result = checkPaymentWindowExpiry(confirmed, now)
    expect(result.lapsed).toBe(true)
    expect(result.hoursRemaining).toBe(0)
  })

  it('returns lapsed=true at exactly the deadline moment', () => {
    const confirmed = new Date('2026-06-19T00:00:00Z')
    // now = confirmed + exactly 10 days
    const now = new Date(confirmed)
    now.setDate(now.getDate() + PAYMENT_WINDOW_DAYS)
    const result = checkPaymentWindowExpiry(confirmed, now)
    expect(result.lapsed).toBe(true)
  })
})
