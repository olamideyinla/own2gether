/**
 * Generates the human-readable payment reference code for a commitment.
 * Format: OWN-XXXX-XXXX derived from the commitment ID.
 * Used in PaymentStep (customer flow) and the admin reconciliation view.
 */
export function makeCommitmentRef(id: string): string {
  const upper = id.toUpperCase()
  return `OWN-${upper.slice(1, 5)}-${upper.slice(5, 9)}`
}
