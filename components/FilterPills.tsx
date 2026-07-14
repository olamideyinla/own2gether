'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const PRICE_FILTERS = [
  { label: 'All prices',      value: '' },
  { label: 'Under ₦200M',    value: 'under-200m' },
  { label: '₦200M – ₦400M', value: '200m-400m' },
  { label: 'Over ₦400M',     value: 'over-400m' },
]

const STATUS_FILTERS = [
  { label: 'Open only', value: 'open' },
  { label: 'All',       value: '' },
]

function Pill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded text-[13px] font-medium transition-colors duration-150',
        active
          ? 'bg-navy text-white'
          : 'bg-surface text-text-secondary border border-border hover:border-navy hover:text-navy',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export function FilterPills() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const activePrice  = searchParams.get('price')  ?? ''
  const activeStatus = searchParams.get('status') ?? ''

  function set(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRICE_FILTERS.map((f) => (
        <Pill
          key={f.value || '__all-prices__'}
          label={f.label}
          active={activePrice === f.value}
          onClick={() => set('price', f.value)}
        />
      ))}

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      {STATUS_FILTERS.map((f) => (
        <Pill
          key={f.value || '__all-statuses__'}
          label={f.label}
          active={activeStatus === f.value}
          onClick={() => set('status', f.value)}
        />
      ))}
    </div>
  )
}
