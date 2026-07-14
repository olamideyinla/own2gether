/**
 * Currency formatting helpers for Own2gether.
 *
 * All property values are in Nigerian naira (NGN). USD and GBP figures are
 * informational approximations — never used for transactions (PRD 5.5).
 *
 * Exchange rates below are static placeholders. Replace with a live feed
 * (with timestamp display) before launch.
 */

// ─── Placeholder exchange rates ───────────────────────────────────────────────
// TODO: replace with a live exchange-rate API call, cached + timestamped.
const NGN_PER_USD = 1_600
const NGN_PER_GBP = 2_000

// ─── NGN formatting ───────────────────────────────────────────────────────────

/**
 * Compact display: ₦50M, ₦1.2B, ₦750K
 * Used in property cards where vertical space is tight.
 */
export function formatNGNCompact(amount: number | string): string {
  const n = Number(amount)
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000)         return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toFixed(0)}`
}

/**
 * Full NGN amount with thousand separators: ₦200,000,000
 * Used in detail pages and breakdowns.
 */
export function formatNGN(amount: number | string): string {
  // 'en' locale is universally available in all Node builds and always uses
  // comma thousand-separators (e.g. 200,000,000). We prepend ₦ manually so
  // the symbol is consistent regardless of ICU data.
  return '₦' + new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(Number(amount))
}

// ─── Approximate foreign-currency equivalents ─────────────────────────────────

export function toApproxUSD(ngnAmount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(ngnAmount) / NGN_PER_USD)
}

export function toApproxGBP(ngnAmount: number | string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Number(ngnAmount) / NGN_PER_GBP)
}

/**
 * Combined compact foreign-currency string for cards: "≈ $125k · £100k"
 */
export function approxFx(ngnAmount: number | string): string {
  const usd = toApproxUSD(ngnAmount)
  const gbp = toApproxGBP(ngnAmount)
  return `≈ ${usd} · ${gbp}`
}
