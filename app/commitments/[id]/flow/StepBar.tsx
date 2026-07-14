import type { StepKey } from './types'

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'confirm',    label: 'Confirm'    },
  { key: 'verify',     label: 'Verify'     },
  { key: 'allocation', label: 'Allocation' },
  { key: 'payment',    label: 'Payment'    },
  { key: 'status',     label: 'Status'     },
]

export function StepBar({ currentStep }: { currentStep: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <nav className="flex items-center justify-center gap-0 mb-8" aria-label="Progress">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx
        const isActive    = idx === currentIdx

        return (
          <div key={step.key} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                  isCompleted
                    ? 'bg-teal border-teal text-white'
                    : isActive
                    ? 'bg-white border-navy text-navy'
                    : 'bg-white border-border text-text-muted',
                ].join(' ')}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={[
                  'text-[10px] mt-1 font-medium hidden sm:block',
                  isCompleted ? 'text-teal' : isActive ? 'text-navy' : 'text-text-muted',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  'w-8 sm:w-12 h-0.5 mx-1 mb-4',
                  idx < currentIdx ? 'bg-teal' : 'bg-border',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
