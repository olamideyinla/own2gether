export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getFxRates, fxApproxLine, fxTimestampLabel } from '@/lib/fx'
import { Header } from '@/components/Header'
import { StepBar } from './StepBar'
import { ConfirmStep } from './ConfirmStep'
import { VerifyStep } from './VerifyStep'
import { AllocationStep } from './AllocationStep'
import { PaymentStep } from './PaymentStep'
import { StatusStep } from './StatusStep'
import type { CommitmentFlowData, StepKey } from './types'

const VALID_STEPS: StepKey[] = ['confirm', 'verify', 'allocation', 'payment', 'status']

type PageProps = {
  params:      Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}

export default async function CommitmentFlowPage({ params, searchParams }: PageProps) {
  const { id }   = await params
  const { step } = await searchParams

  const currentStep: StepKey =
    VALID_STEPS.includes(step as StepKey) ? (step as StepKey) : 'confirm'

  // Parallel data fetch
  const [commitment, rates] = await Promise.all([
    db.commitment.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true, title: true, location: true, totalRaise: true, status: true },
        },
        profile: {
          select: {
            id: true, name: true, email: true, kycStatus: true,
            identityDocuments: {
              orderBy: { submittedAt: 'desc' },
              take: 1,
              select: { status: true, rejectionReason: true },
            },
          },
        },
      },
    }),
    getFxRates(),
  ])

  if (!commitment) notFound()

  // Convert Prisma.Decimal / Date → primitives
  const data: CommitmentFlowData = {
    id:                    commitment.id,
    amount:                Number(commitment.amount),
    allocatedAmount:       commitment.allocatedAmount ? Number(commitment.allocatedAmount) : null,
    status:                commitment.status,
    createdAt:             commitment.createdAt.toISOString(),
    allocationConfirmedAt: commitment.allocationConfirmedAt?.toISOString() ?? null,
    paymentDueAt:          commitment.paymentDueAt?.toISOString() ?? null,
    paidAt:                commitment.paidAt?.toISOString() ?? null,
    fxLine:                fxApproxLine(Number(commitment.amount), rates),
    fxTimestamp:           fxTimestampLabel(rates),
    property: {
      id:         commitment.property.id,
      title:      commitment.property.title,
      location:   commitment.property.location,
      totalRaise: Number(commitment.property.totalRaise),
      status:     commitment.property.status,
    },
    profile: {
      id:              commitment.profile.id,
      name:            commitment.profile.name,
      email:           commitment.profile.email,
      kycStatus:       commitment.profile.kycStatus,
      latestDocStatus:          commitment.profile.identityDocuments[0]?.status ?? null,
      latestDocRejectionReason: commitment.profile.identityDocuments[0]?.rejectionReason ?? null,
    },
  }

  // Withdrawn state — show a simple closed message
  if (commitment.status === 'withdrawn' && currentStep !== 'status') {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-12 text-center">
          <p className="text-sm text-text-muted">This commitment has been withdrawn.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <StepBar currentStep={currentStep} />

        {currentStep === 'confirm'    && <ConfirmStep    commitment={data} />}
        {currentStep === 'verify'     && <VerifyStep     commitment={data} />}
        {currentStep === 'allocation' && <AllocationStep commitment={data} />}
        {currentStep === 'payment'    && <PaymentStep    commitment={data} />}
        {currentStep === 'status'     && <StatusStep     commitment={data} />}
      </main>
    </>
  )
}
