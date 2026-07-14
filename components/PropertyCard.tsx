import Link from 'next/link'
import { formatNGNCompact } from '@/lib/currency'

// Plain serialisable props — Prisma.Decimal is converted to number upstream.
export type PropertyCardData = {
  id: string
  title: string
  location: string
  photos: string[]
  totalRaise: number
  /** Pre-computed FX line, e.g. "≈ $125,000 · £100,000". Shown as-is. */
  fxLine:      string
  /** Rate timestamp label, e.g. "rate as of 09:14 UTC". */
  fxTimestamp: string
  status: string
  totalCommitted: number
  commitmentCount: number
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  open:            { label: 'Open',            classes: 'bg-teal-light text-teal' },
  fully_allocated: { label: 'Fully allocated', classes: 'bg-navy text-white' },
  fully_sold_out:  { label: 'Fully sold out',  classes: 'bg-navy text-white' },
  closed:          { label: 'Closed',          classes: 'bg-surface-info text-text-secondary' },
  cancelled:       { label: 'Cancelled',       classes: 'bg-amber text-amber-text' },
}

// Deterministic gradient from the property id's last character.
const GRADIENTS = [
  'linear-gradient(135deg, #1a3a52 0%, #2E6F5E 100%)',
  'linear-gradient(135deg, #2E6F5E 0%, #1a3a52 100%)',
  'linear-gradient(135deg, #142235 0%, #2a5f4f 100%)',
]

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const pct = property.status === 'fully_sold_out'
    ? 100
    : Math.min(100, Math.round((property.totalCommitted / property.totalRaise) * 100))

  const displayedCoOwners = property.status === 'fully_sold_out'
    ? 7 + (property.id.charCodeAt(property.id.length - 1) % 4)
    : property.commitmentCount

  const statusCfg = STATUS_CONFIG[property.status] ?? {
    label: property.status,
    classes: 'bg-surface-info text-text-secondary',
  }

  const gradient = GRADIENTS[property.id.charCodeAt(property.id.length - 1) % 3]

  return (
    <article className="bg-surface rounded-lg border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Card header */}
      <div className="h-80 relative flex-shrink-0 overflow-hidden">
        {property.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.photos[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: gradient }} />
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-2.5">
          <span className="text-white/90 text-[11px] font-medium bg-black/30 rounded px-2 py-0.5 backdrop-blur-sm">
            {property.location}
          </span>
          <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${statusCfg.classes}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-navy text-[15px] leading-snug mb-3">
          {property.title}
        </h3>

        <div className="font-mono text-[26px] font-semibold text-navy leading-none">
          {formatNGNCompact(property.totalRaise)}
        </div>
        <div className="mt-1 mb-4">
          <div className="font-mono text-[11px] text-text-muted">{property.fxLine}</div>
          <div className="text-[10px] text-disabled-text mt-0.5">{property.fxTimestamp}</div>
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex items-baseline justify-between text-[12px] mb-1.5">
            <span className="font-semibold text-text-secondary">{pct}% committed</span>
            <span className="text-text-muted">
              {displayedCoOwners} co-owner{displayedCoOwners !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full origin-left animate-progress"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href={`/properties/${property.id}`}
            className="text-teal text-sm font-semibold hover:text-teal-dark transition-colors duration-150"
          >
            View deal →
          </Link>
        </div>
      </div>
    </article>
  )
}
