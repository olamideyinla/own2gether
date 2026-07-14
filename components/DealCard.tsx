import Link from 'next/link'
import { formatNGNCompact } from '@/lib/currency'

const DEAL_TYPE_LABELS: Record<string, string> = {
  rehabilitation: 'Rehabilitation',
  ground_up:      'Ground-up build',
  off_plan:       'Off-plan',
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  coming_soon:  { label: 'Coming soon',  classes: 'bg-surface-info text-text-secondary' },
  open:         { label: 'Open',         classes: 'bg-teal-light text-teal' },
  funded:       { label: 'Funded',       classes: 'bg-navy text-white' },
  in_progress:  { label: 'In progress',  classes: 'bg-amber text-amber-text' },
  completed:    { label: 'Completed',    classes: 'bg-teal text-white' },
  cancelled:    { label: 'Cancelled',    classes: 'bg-surface-info text-text-muted' },
}

const GRADIENTS = [
  'linear-gradient(135deg, #1a3a52 0%, #2E6F5E 100%)',
  'linear-gradient(135deg, #2c5446 0%, #142235 100%)',
  'linear-gradient(135deg, #142235 0%, #2a5f4f 100%)',
]

export type DealCardData = {
  id:                     string
  title:                  string
  location:               string
  photos:                 string[]
  dealType:               string
  status:                 string
  targetRaise:            number
  projectedReturnPct:     number | null
  projectedDurationMonths: number | null
  totalCommitted:         number
}

export function DealCard({ deal }: { deal: DealCardData }) {
  const gradient  = GRADIENTS[deal.id.charCodeAt(deal.id.length - 1) % 3]
  const statusCfg = STATUS_CONFIG[deal.status] ?? { label: deal.status, classes: 'bg-surface-info text-text-secondary' }
  const pct       = deal.targetRaise > 0
    ? Math.min(100, Math.round((deal.totalCommitted / deal.targetRaise) * 100))
    : 0

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="block border border-border rounded-xl overflow-hidden hover:border-teal/40 hover:shadow-sm transition-all group"
    >
      {/* Cover */}
      <div className="relative h-80 overflow-hidden">
        {deal.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={deal.photos[0]}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full" style={{ background: gradient }} />
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-2.5">
          <span className="text-white/90 text-xs font-medium bg-black/40 rounded px-2.5 py-1 backdrop-blur-sm">
            {deal.location}
          </span>
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded ${statusCfg.classes}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-navy leading-snug group-hover:text-teal transition-colors">
            {deal.title}
          </h2>
          <span className="text-[10px] font-medium text-text-muted bg-surface-raised border border-border rounded px-1.5 py-0.5 whitespace-nowrap shrink-0">
            {DEAL_TYPE_LABELS[deal.dealType] ?? deal.dealType}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs mb-3">
          <div>
            <p className="text-text-muted">Target raise</p>
            <p className="font-mono font-semibold text-navy">{formatNGNCompact(deal.targetRaise)}</p>
          </div>
          {deal.projectedReturnPct != null && (
            <div>
              <p className="text-text-muted">Proj. return</p>
              <p className="font-mono font-semibold text-teal">+{Number(deal.projectedReturnPct).toFixed(0)}%</p>
            </div>
          )}
          {deal.projectedDurationMonths != null && (
            <div>
              <p className="text-text-muted">Timeline</p>
              <p className="font-mono font-semibold text-navy">{deal.projectedDurationMonths}mo</p>
            </div>
          )}
        </div>

        {/* Progress */}
        {deal.status !== 'coming_soon' && (
          <div>
            <div className="flex justify-between text-[11px] text-text-muted mb-1">
              <span>{pct}% funded</span>
              <span className="text-teal font-medium">60% investor share</span>
            </div>
            <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full origin-left animate-progress"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
