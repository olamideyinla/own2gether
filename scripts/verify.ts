/**
 * Prints property 1 (Lekki) with its commitments (ranked by amount) and
 * computed totals, then shows the cap table.
 *
 * Run: npm run verify
 */

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const NGN = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

function fmtNGN(v: Prisma.Decimal | null | undefined): string {
  if (v == null) return '—'
  return NGN.format(Number(v))
}

function fmtPct(v: Prisma.Decimal | null | undefined): string {
  if (v == null) return '—'
  return `${Number(v).toFixed(4)}%`
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

async function main() {
  const property = await prisma.property.findFirst({
    where: { title: { contains: 'Lekki' } },
    include: {
      commitments: {
        include: { profile: true, connectionGroup: true },
        orderBy: { amount: 'desc' },
      },
      stakes: {
        include: { profile: true },
        orderBy: { percentage: 'desc' },
      },
    },
  })

  if (!property) {
    console.error('Property not found — run `npm run db:seed` first.')
    process.exit(1)
  }

  const divider = '═'.repeat(68)
  const rule    = '─'.repeat(68)

  console.log(`\n${divider}`)
  console.log(`  ${property.title}`)
  console.log(`  ${property.location}`)
  console.log(divider)
  console.log(`  Status         : ${property.status}`)
  console.log(`  Property price : ${fmtNGN(property.propertyPrice)}`)
  console.log(`  Legal fees     : ${fmtNGN(property.legalFees)}`)
  console.log(`  Other costs    : ${fmtNGN(property.otherCosts)}`)
  console.log(`  Total raise    : ${fmtNGN(property.totalRaise)}`)
  console.log()

  // ── Commitments ─────────────────────────────────────────────────────────

  const active = property.commitments.filter((c) => c.status !== 'withdrawn')
  const totalCommitted = active.reduce(
    (s, c) => s.add(c.amount),
    new Prisma.Decimal(0),
  )
  const totalPaid = active
    .filter((c) => c.status === 'paid')
    .reduce((s, c) => s.add(c.amount), new Prisma.Decimal(0))

  const pctFunded = totalCommitted
    .div(property.totalRaise)
    .mul(100)

  console.log(`  Commitments — ranked by amount (largest → allocated first)`)
  console.log(`  ${rule.slice(2)}`)
  console.log(
    `  ${pad('Co-owner', 24)} ${pad('Amount', 22)} ${pad('Status', 20)} Group`,
  )
  console.log(`  ${rule.slice(2)}`)

  for (const c of active) {
    const name   = pad(c.profile.name, 24)
    const amount = pad(fmtNGN(c.amount), 22)
    const status = pad(c.status, 20)
    const group  = c.connectionGroup ? `[${c.connectionGroup.code}]` : ''
    console.log(`  ${name} ${amount} ${status} ${group}`)
  }

  console.log(`  ${rule.slice(2)}`)
  console.log(
    `  ${pad('TOTAL COMMITTED', 24)} ${pad(fmtNGN(totalCommitted), 22)} ` +
    `${Number(pctFunded).toFixed(2)}% of raise`,
  )
  console.log(
    `  ${pad('TOTAL PAID', 24)} ${fmtNGN(totalPaid)}`,
  )
  console.log()

  // ── Cap table ────────────────────────────────────────────────────────────

  if (property.stakes.length === 0) {
    console.log(`  Cap table: not yet set (raise still open)`)
  } else {
    const totalPct = property.stakes.reduce(
      (s, st) => s.add(st.percentage),
      new Prisma.Decimal(0),
    )

    console.log(`  Cap table (property's dedicated company)`)
    console.log(`  ${rule.slice(2)}`)
    console.log(
      `  ${pad('Holder', 24)} ${pad('Stake', 12)} Source`,
    )
    console.log(`  ${rule.slice(2)}`)

    for (const st of property.stakes) {
      const holder = pad(st.profile?.name ?? 'Own2gether', 24)
      const pct    = pad(fmtPct(st.percentage), 12)
      console.log(`  ${holder} ${pct} ${st.source}`)
    }

    console.log(`  ${rule.slice(2)}`)
    console.log(
      `  ${pad('TOTAL', 24)} ${pad(fmtPct(totalPct), 12)}` +
      ` (must equal 100.0000%)`,
    )
  }

  console.log(`\n${divider}\n`)
}

main()
  .catch((e) => {
    console.error('Verify failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
