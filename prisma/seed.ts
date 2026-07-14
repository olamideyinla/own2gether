/**
 * Seed script — 3 sample properties with commitments at varying stages.
 *
 * Property 1 (Lekki)      — fully_allocated, all co-owners paid, cap table set
 * Property 2 (Victoria Is.) — open, mix of allocated + pending commitments,
 *                             one connection group, one prior withdrawal
 * Property 3 (Ikoyi)      — open, early stage, two pending commitments
 *
 * Monetary amounts are in Nigerian naira (NGN).
 * Stake percentages follow PRD 4.2:
 *   co_owner_pct = (contribution / totalRaise) * 97.5
 * Own2gether always holds ≥ 2.5% (management_fee source).
 */

import {
  PrismaClient,
  KycStatus,
  PropertyStatus,
  CommitmentStatus,
  StakeSource,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database…\n')

  // ── Profiles ──────────────────────────────────────────────────────────────

  const amara = await prisma.profile.create({
    data: {
      name: 'Amara Okonkwo',
      email: 'amara.okonkwo@example.com',
      phone: '+447911123456',   // UK diaspora
      kycStatus: KycStatus.verified,
      createdAt: new Date('2026-02-10'),
    },
  })

  const chukwuemeka = await prisma.profile.create({
    data: {
      name: 'Chukwuemeka Adeyemi',
      email: 'chukwuemeka.adeyemi@example.com',
      phone: '+2348012345678',
      kycStatus: KycStatus.verified,
      createdAt: new Date('2026-02-14'),
    },
  })

  const ngozi = await prisma.profile.create({
    data: {
      name: 'Ngozi Eze',
      email: 'ngozi.eze@example.com',
      phone: '+2348098765432',
      kycStatus: KycStatus.verified,
      createdAt: new Date('2026-02-20'),
    },
  })

  const babatunde = await prisma.profile.create({
    data: {
      name: 'Babatunde Osei',
      email: 'babatunde.osei@example.com',
      phone: '+2347034567890',
      kycStatus: KycStatus.verified,
      createdAt: new Date('2026-03-01'),
    },
  })

  const kemi = await prisma.profile.create({
    data: {
      name: 'Kemi Adesanya',
      email: 'kemi.adesanya@example.com',
      phone: '+447922987654',   // UK diaspora
      kycStatus: KycStatus.pending, // submitted docs, under review
      createdAt: new Date('2026-03-05'),
    },
  })

  console.log('  Created 5 profiles')

  // ── Properties ────────────────────────────────────────────────────────────

  // Property 1: totalRaise = ₦200,000,000 (fully allocated, all paid)
  //   propertyPrice + legalFees + otherCosts = totalRaise
  //   185,000,000  +  8,500,000  +  6,500,000  = 200,000,000
  const property1 = await prisma.property.create({
    data: {
      title: 'Lekki Phase 1 Townhouse',
      location: 'Lekki Phase 1, Lagos',
      photos: [
        'https://example.com/photos/lekki-1.jpg',
        'https://example.com/photos/lekki-2.jpg',
        'https://example.com/photos/lekki-3.jpg',
      ],
      propertyPrice: '185000000',
      legalFees: '8500000',
      otherCosts: '6500000',
      totalRaise: '200000000',
      status: PropertyStatus.fully_allocated,
      createdAt: new Date('2026-03-01'),
    },
  })

  // Property 2: totalRaise = ₦350,000,000 (open, partially committed)
  //   318,000,000  +  19,000,000  +  13,000,000  = 350,000,000
  const property2 = await prisma.property.create({
    data: {
      title: 'Victoria Island Mixed-Use Development',
      location: 'Victoria Island, Lagos',
      photos: [
        'https://example.com/photos/vi-1.jpg',
        'https://example.com/photos/vi-2.jpg',
      ],
      propertyPrice: '318000000',
      legalFees: '19000000',
      otherCosts: '13000000',
      totalRaise: '350000000',
      status: PropertyStatus.open,
      createdAt: new Date('2026-05-01'),
    },
  })

  // Property 3: totalRaise = ₦250,000,000 (open, early stage)
  //   226,500,000  +  13,000,000  +  10,500,000  = 250,000,000
  const property3 = await prisma.property.create({
    data: {
      title: 'Ikoyi Serviced Apartments',
      location: 'Ikoyi, Lagos',
      photos: [
        'https://example.com/photos/ikoyi-1.jpg',
        'https://example.com/photos/ikoyi-2.jpg',
        'https://example.com/photos/ikoyi-3.jpg',
      ],
      propertyPrice: '226500000',
      legalFees: '13000000',
      otherCosts: '10500000',
      totalRaise: '250000000',
      status: PropertyStatus.open,
      createdAt: new Date('2026-06-15'),
    },
  })

  console.log('  Created 3 properties')

  // ── Property 1 commitments (all paid, totalRaise = 200,000,000) ───────────
  //
  // Five co-owners cover 100% of the raise. Their equity in the company is
  // calculated against the 97.5% co-owner pool (Own2gether takes 2.5%):
  //
  //   Amara        ₦60,000,000  (30% of raise) → 30% × 97.5% = 29.2500%
  //   Chukwuemeka  ₦50,000,000  (25%)          → 25% × 97.5% = 24.3750%
  //   Ngozi        ₦40,000,000  (20%)          → 20% × 97.5% = 19.5000%
  //   Babatunde    ₦30,000,000  (15%)          → 15% × 97.5% = 14.6250%
  //   Kemi         ₦20,000,000  (10%)          → 10% × 97.5% =  9.7500%
  //   Own2gether                                              =  2.5000%
  //                                                    Total = 100.0000%

  const allocDate1 = new Date('2026-03-15')
  const payDue1    = new Date('2026-03-25') // + 10 days

  await prisma.commitment.createMany({
    data: [
      {
        profileId: amara.id,
        propertyId: property1.id,
        amount: '60000000',
        status: CommitmentStatus.paid,
        allocatedAmount: '60000000',
        createdAt: new Date('2026-03-05'),
        allocationConfirmedAt: allocDate1,
        paymentDueAt: payDue1,
        paidAt: new Date('2026-03-20'),
      },
      {
        profileId: chukwuemeka.id,
        propertyId: property1.id,
        amount: '50000000',
        status: CommitmentStatus.paid,
        allocatedAmount: '50000000',
        createdAt: new Date('2026-03-06'),
        allocationConfirmedAt: allocDate1,
        paymentDueAt: payDue1,
        paidAt: new Date('2026-03-19'),
      },
      {
        profileId: ngozi.id,
        propertyId: property1.id,
        amount: '40000000',
        status: CommitmentStatus.paid,
        allocatedAmount: '40000000',
        createdAt: new Date('2026-03-07'),
        allocationConfirmedAt: allocDate1,
        paymentDueAt: payDue1,
        paidAt: new Date('2026-03-21'),
      },
      {
        profileId: babatunde.id,
        propertyId: property1.id,
        amount: '30000000',
        status: CommitmentStatus.paid,
        allocatedAmount: '30000000',
        createdAt: new Date('2026-03-08'),
        allocationConfirmedAt: allocDate1,
        paymentDueAt: payDue1,
        paidAt: new Date('2026-03-22'),
      },
      {
        profileId: kemi.id,
        propertyId: property1.id,
        amount: '20000000',
        status: CommitmentStatus.paid,
        allocatedAmount: '20000000',
        createdAt: new Date('2026-03-09'),
        allocationConfirmedAt: allocDate1,
        paymentDueAt: payDue1,
        paidAt: new Date('2026-03-23'),
      },
    ],
  })

  // ── Property 1 stakes (cap table) ─────────────────────────────────────────
  await prisma.stake.createMany({
    data: [
      // Own2gether — 2.5% baseline for deal structuring + ongoing management
      { propertyId: property1.id, profileId: null,             percentage: '2.5',    source: StakeSource.management_fee },
      // Co-owners — proportional shares of the 97.5% pool
      { propertyId: property1.id, profileId: amara.id,         percentage: '29.25',  source: StakeSource.co_owner },
      { propertyId: property1.id, profileId: chukwuemeka.id,   percentage: '24.375', source: StakeSource.co_owner },
      { propertyId: property1.id, profileId: ngozi.id,         percentage: '19.5',   source: StakeSource.co_owner },
      { propertyId: property1.id, profileId: babatunde.id,     percentage: '14.625', source: StakeSource.co_owner },
      { propertyId: property1.id, profileId: kemi.id,          percentage: '9.75',   source: StakeSource.co_owner },
      // Stakes sum: 2.5 + 29.25 + 24.375 + 19.5 + 14.625 + 9.75 = 100.000
    ],
  })

  console.log('  Created 5 commitments + cap table for property 1 (Lekki)')

  // ── Property 2 commitments (open, totalRaise = 350,000,000) ───────────────
  //
  // Ngozi committed ₦70,000,000 earlier but withdrew — this becomes a
  // withdrawal record (her first, so the 12-month lockout clock starts here).
  //
  // Active commitments (ranked by amount, largest first):
  //   Chukwuemeka  ₦105,000,000  (30%) — allocated, awaiting payment
  //   Babatunde+Kemi connection group:
  //     Babatunde  ₦ 52,500,000  }  combined ₦105,000,000 (30%) — pending
  //     Kemi       ₦ 52,500,000  }
  //   Amara        ₦ 87,500,000  (25%) — pending
  //   Total active: ₦297,500,000 of ₦350,000,000 (85.0% funded)
  //   Remaining:    ₦ 52,500,000 still open

  // Ngozi's withdrawn commitment
  const withdrawnCommitment = await prisma.commitment.create({
    data: {
      profileId: ngozi.id,
      propertyId: property2.id,
      amount: '70000000',
      status: CommitmentStatus.withdrawn,
      createdAt: new Date('2026-05-08'),
    },
  })

  await prisma.withdrawal.create({
    data: {
      profileId: ngozi.id,
      commitmentId: withdrawnCommitment.id,
      withdrawnAt: new Date('2026-05-20'),
    },
  })

  // Connection group: Babatunde created the code; Kemi joined with it
  const group = await prisma.connectionGroup.create({
    data: {
      propertyId: property2.id,
      code: 'GRP-VI-2026',
      createdByProfileId: babatunde.id,
    },
  })

  const allocDate2 = new Date('2026-06-24')
  const payDue2    = new Date('2026-07-04') // + 10 days

  await prisma.commitment.createMany({
    data: [
      // Chukwuemeka: largest solo commitment, ranked #1, already allocated
      {
        profileId: chukwuemeka.id,
        propertyId: property2.id,
        amount: '105000000',
        status: CommitmentStatus.allocated,
        allocatedAmount: '105000000',
        createdAt: new Date('2026-05-10'),
        allocationConfirmedAt: allocDate2,
        paymentDueAt: payDue2,
      },
      // Amara: ranked after the connection group (87.5M < 105M combined)
      {
        profileId: amara.id,
        propertyId: property2.id,
        amount: '87500000',
        status: CommitmentStatus.pending,
        createdAt: new Date('2026-05-12'),
      },
      // Babatunde + Kemi: combined 105M, ranked equal to Chukwuemeka
      {
        profileId: babatunde.id,
        propertyId: property2.id,
        connectionGroupId: group.id,
        amount: '52500000',
        status: CommitmentStatus.pending,
        createdAt: new Date('2026-05-15'),
      },
      {
        profileId: kemi.id,
        propertyId: property2.id,
        connectionGroupId: group.id,
        amount: '52500000',
        status: CommitmentStatus.pending,
        createdAt: new Date('2026-05-15'),
      },
    ],
  })

  console.log('  Created 4 active commitments + 1 withdrawal for property 2 (Victoria Island)')

  // ── Property 3 commitments (open, totalRaise = 250,000,000) ───────────────
  //
  //   Ngozi        ₦50,000,000  (20%) — pending
  //   Chukwuemeka  ₦37,500,000  (15%) — pending
  //   Total: ₦87,500,000 of ₦250,000,000 (35.0% funded)

  await prisma.commitment.createMany({
    data: [
      {
        profileId: ngozi.id,
        propertyId: property3.id,
        amount: '50000000',
        status: CommitmentStatus.pending,
        createdAt: new Date('2026-06-20'),
      },
      {
        profileId: chukwuemeka.id,
        propertyId: property3.id,
        amount: '37500000',
        status: CommitmentStatus.pending,
        createdAt: new Date('2026-06-22'),
      },
    ],
  })

  console.log('  Created 2 commitments for property 3 (Ikoyi)')
  console.log('\nSeed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
