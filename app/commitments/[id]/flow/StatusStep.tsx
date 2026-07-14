import Link from 'next/link'
import { formatNGN } from '@/lib/currency'
import type { CommitmentFlowData } from './types'

function formatDate(isoString: string | null): string {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

type CheckItem = {
  label:   string
  sub:     string
  done:    boolean
}

export function StatusStep({ commitment }: { commitment: CommitmentFlowData }) {
  const items: CheckItem[] = [
    {
      label: 'Commitment received',
      sub:   `Your ${formatNGN(commitment.amount)} commitment was recorded on ${formatDate(commitment.createdAt)}.`,
      done:  true,
    },
    {
      label: 'Allocation confirmed',
      sub:   commitment.allocationConfirmedAt
        ? `Confirmed on ${formatDate(commitment.allocationConfirmedAt)}.`
        : 'Awaiting allocation — we will notify you.',
      done:  !!commitment.allocationConfirmedAt,
    },
    {
      label: 'Payment received',
      sub:   commitment.paidAt
        ? `Received on ${formatDate(commitment.paidAt)}.`
        : 'Pending your bank transfer.',
      done:  !!commitment.paidAt,
    },
    {
      label: 'Company formation',
      sub:   'Will be initiated once all co-owner payments have cleared. Typically takes several weeks.',
      done:  false,
    },
  ]

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-navy">Commitment status</h1>
        <p className="text-sm text-text-muted mt-1">Track your co-ownership journey below.</p>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={[
              'flex gap-4 items-start border rounded-lg px-4 py-3',
              item.done
                ? 'border-teal/20 bg-teal-light'
                : 'border-border bg-surface',
            ].join(' ')}
          >
            <div
              className={[
                'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                item.done ? 'bg-teal text-white' : 'border-2 border-border text-text-muted',
              ].join(' ')}
            >
              {item.done ? '✓' : '○'}
            </div>
            <div>
              <p className={`text-sm font-medium ${item.done ? 'text-teal' : 'text-text-secondary'}`}>
                {item.label}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted leading-relaxed px-1">
        Payment confirmation may take 1–2 business days after your transfer. Your co-ownership position is secured once payment is confirmed.
      </p>

      <Link
        href={`/listings/${commitment.property.id}`}
        className="inline-block text-sm text-text-muted underline underline-offset-2 hover:text-navy"
      >
        ← Back to deal page
      </Link>
    </div>
  )
}
