export type StepKey = 'confirm' | 'verify' | 'allocation' | 'payment' | 'status'

/**
 * All Prisma.Decimal and Date fields are converted to number / ISO string
 * before being passed as props so step components avoid serialization issues.
 */
export type CommitmentFlowData = {
  id:                    string
  amount:                number      // NGN
  allocatedAmount:       number | null
  status:                string      // CommitmentStatus value
  createdAt:             string      // ISO string
  allocationConfirmedAt: string | null
  paymentDueAt:          string | null
  paidAt:                string | null
  fxLine:                string      // "≈ $X · £Y" for commitment amount
  fxTimestamp:           string      // "rate as of 09:14 UTC" or "indicative rate"
  property: {
    id:         string
    title:      string
    location:   string
    totalRaise: number
    status:     string
  }
  profile: {
    id:                      string
    name:                    string
    email:                   string
    kycStatus:               string
    latestDocStatus:         string | null  // most recent IdentityDocument.status or null
    latestDocRejectionReason: string | null
  }
}
