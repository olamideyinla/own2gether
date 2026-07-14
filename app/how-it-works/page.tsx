export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// ─── Listings steps ───────────────────────────────────────────────────────────

const LISTING_STEPS = [
  {
    number: '01',
    title: 'Browse open raises',
    body: 'Explore properties currently seeking co-owners. Each listing shows the total raise target, how much has been committed so far, and what equity stake your contribution would represent.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="4" y="6" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="4" y1="13" x2="36" y2="13" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="9" y="18" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="23" y1="19" x2="31" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="23" y1="23" x2="29" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="9.5" r="1" fill="currentColor"/>
        <circle cx="12" cy="9.5" r="1" fill="currentColor"/>
        <circle cx="16" cy="9.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Commit an amount',
    body: 'Enter the amount you want to commit in Nigerian naira (NGN). No money moves at this stage — a commitment is a non-binding expression of intent. You can join a connection group with others to pool your ranking power.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M20 11v2M20 27v2M14 14.5l1.4 1.4M24.6 24.1l1.4 1.4M11 20h2M27 20h2M14 25.5l1.4-1.4M24.6 15.9l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="monospace">₦</text>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Verify your identity',
    body: 'Upload a government-issued ID (passport, driver\'s licence, or national ID card) plus a proof of address. Our team reviews every document manually — no automated checks. Reviews are completed within 3 business days.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="6" y="9" width="28" height="22" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="15" cy="19" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 31c0-4 2.7-6 6-6s6 2 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="24" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="24" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="24" y1="24" x2="29" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Allocation is confirmed',
    body: 'Once the raise closes, Own2gether runs the allocation algorithm. Commitments are ranked largest-first. You receive written confirmation of your exact equity stake and the precise amount due — which may differ from your original commitment if the pool is oversubscribed.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="5" y="5" width="30" height="30" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 20l5 5 11-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Transfer payment',
    body: 'You have 10 days from allocation confirmation to complete a bank transfer directly to the seller\'s account. Payment details arrive by email. No card payments, no escrow, no intermediaries. Late payment may result in forfeiture of your allocation.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="4" y="10" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="4" y1="17" x2="36" y2="17" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="8" y="21" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="20" y1="23" x2="26" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="28" y1="23" x2="31" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '06',
    title: 'Become a co-owner',
    body: 'Once all allocated co-owners have paid, Own2gether initiates the formation of a dedicated property company. You are registered as a shareholder with a stake proportional to your contribution. Company formation typically takes several weeks.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <path d="M20 4L4 14v22h10V24h12v12h10V14L20 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <rect x="16" y="24" width="8" height="12" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
]

// ─── Deals steps ──────────────────────────────────────────────────────────────

const DEAL_STEPS = [
  {
    number: '01',
    title: 'Browse available deals',
    body: 'Explore development deals — rehabilitation projects, ground-up builds, and off-plan purchases. Each deal shows the target raise, deal type, projected return, and estimated timeline.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="4" y="6" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="4" y1="13" x2="36" y2="13" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M10 22l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="25" y1="21" x2="31" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="25" y1="25" x2="29" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="9.5" r="1" fill="currentColor"/>
        <circle cx="12" cy="9.5" r="1" fill="currentColor"/>
        <circle cx="16" cy="9.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Express your commitment',
    body: 'Submit your name, email, and intended investment amount. Minimum commitment is 15% of the deal\'s target raise — deals have a small, concentrated group of investors. No money moves at this stage.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M20 11v2M20 27v2M14 14.5l1.4 1.4M24.6 24.1l1.4 1.4M11 20h2M27 20h2M14 25.5l1.4-1.4M24.6 15.9l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="monospace">₦</text>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Allocation confirmed',
    body: 'Own2gether reviews all commitments and confirms your allocation. You receive written confirmation of your slot, the exact amount due, and payment instructions by email.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="5" y="5" width="30" height="30" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 20l5 5 11-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Transfer payment — full or in instalments',
    body: 'Your allocation confirmation will specify whether payment must be made in full or can be spread across agreed instalments. Either way, all payments go directly to the project account by bank transfer — no card payments, no escrow. All amounts must be received before the project commences. Late or missed payments may forfeit your allocation.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="4" y="10" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="4" y1="17" x2="36" y2="17" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="8" y="21" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="20" y1="23" x2="26" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="28" y1="23" x2="31" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Project executes',
    body: 'Construction or development proceeds. Own2gether acts as the technical partner managing the project. You receive milestone updates and progress reports throughout.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <rect x="8" y="20" width="6" height="14" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="17" y="14" width="6" height="20" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="26" y="8" width="6" height="26" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4" y1="34" x2="36" y2="34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '06',
    title: 'Capital returned, profits distributed',
    body: 'On project exit, all investors receive their capital back in full first. Net profit (proceeds minus total project cost) is then distributed: 60% to investors proportional to each person\'s share of the raise, and 40% to Own2gether as the deal and technical partner.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M20 13v7l5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 27l2-2M27 27l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

// ─── FAQs ─────────────────────────────────────────────────────────────────────

const LISTING_FAQS = [
  {
    q: 'Is my commitment binding?',
    a: 'No. A commitment is a non-binding expression of intent. You are not obligated to pay until you receive a written allocation confirmation from Own2gether.',
  },
  {
    q: 'What if the raise is oversubscribed?',
    a: 'Commitments are ranked largest-first. If the total exceeds the co-owner pool (97.5% of the raise), smaller commitments may be partially or fully excluded. You will see your current rank in real time on the deal page.',
  },
  {
    q: 'Can I withdraw my commitment?',
    a: 'Yes, up to 3 times across your account. After the third withdrawal a 12-month lockout applies before you can withdraw again.',
  },
  {
    q: 'How is my equity percentage calculated?',
    a: 'Your equity stake = (your contribution ÷ total raise) × 97.5%. Co-owners collectively fund 100% of the raise and own 97.5% of the property company. Own2gether takes the remaining 2.5% as a management stake in lieu of fees. For example, a ₦10M commitment on a ₦100M raise gives you (10 ÷ 100) × 97.5 = 9.75% equity — not 10% — because Own2gether\'s 2.5% is funded proportionally by all contributors.',
  },
  {
    q: 'What currency is used?',
    a: 'All transactions are in Nigerian naira (NGN). USD and GBP figures shown on the platform are indicative approximations only.',
  },
  {
    q: 'How is the 2.5% Own2gether stake handled?',
    a: 'Own2gether receives 2.5% equity in the property company in place of management or acquisition fees. No cash fees are ever charged to co-owners.',
  },
  {
    q: 'Can I sell my stake after becoming a co-owner?',
    a: 'Yes — your shares in the property company are yours to sell. However, existing co-owners have the right of first refusal. Before selling to any external party, you must first offer your stake to the other co-owners in the same property company at your proposed price. Only if they decline can you proceed with an outside sale.',
  },
  {
    q: 'What happens if a payment window lapses?',
    a: 'If you do not transfer payment within 10 days of allocation confirmation, your allocation may be forfeited. Contact Own2gether immediately if you anticipate a delay.',
  },
]

const DEAL_FAQS = [
  {
    q: 'What is the minimum investment for a deal?',
    a: 'Each deal requires a minimum commitment of 15% of the target raise. This keeps the investor group small and concentrated — typically no more than 6 to 7 investors per deal. Larger commitments are welcome.',
  },
  {
    q: 'Is there an equity stake like listings?',
    a: 'No. Deals are a profit-sharing arrangement, not a company ownership structure. You do not receive shares in a property company. Instead, you contribute capital and receive your share of net profit on exit. Own2gether takes 40% of net profit as the deal originator and technical partner.',
  },
  {
    q: 'How is my profit calculated?',
    a: 'Your profit = (your contribution ÷ total raise) × 60% × net profit. Net profit is the difference between total sale or exit proceeds and the full project cost (acquisition, construction, fees). Capital is returned to all investors first, then net profit is split.',
  },
  {
    q: 'When do I get my capital back?',
    a: 'Your original capital is returned in full when the project exits (property is sold or refinanced). The profit split happens at the same time. There is no fixed date — returns depend on the project timeline.',
  },
  {
    q: 'Can I withdraw my deal commitment?',
    a: 'You can withdraw before allocation is confirmed. Once Own2gether confirms your slot and payment is made, capital is deployed into the project and cannot be withdrawn. Only invest funds you can commit for the full project duration.',
  },
  {
    q: 'What if the project is delayed or makes a loss?',
    a: 'Returns are not guaranteed. If the project takes longer than projected, your capital remains locked until exit. If the project makes a loss, your capital may be partially or fully lost. Own2gether\'s 40% share is also contingent on profit — if there is no profit, Own2gether receives nothing.',
  },
  {
    q: 'How many investors are in a deal?',
    a: 'With a 15% minimum per investor, a fully subscribed deal will have between 6 and 7 investors. In practice deals may close with fewer. Smaller groups allow for better communication and faster decision-making.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-teal text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Two ways to invest.<br />One platform.
          </h1>
          <p className="text-white/70 text-base max-w-xl leading-relaxed">
            Own2gether offers two distinct investment products: <strong className="text-white">Listings</strong> for
            co-owning existing properties via a dedicated company, and <strong className="text-white">Deals</strong> for
            co-investing in development projects with a profit-sharing structure.
          </p>
          {/* Jump links */}
          <div className="flex gap-4 mt-8">
            <a
              href="#listings"
              className="inline-block bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors"
            >
              Listings →
            </a>
            <a
              href="#deals"
              className="inline-block bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors"
            >
              Deals →
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          LISTINGS SECTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="listings" className="scroll-mt-4">

        <div className="max-w-4xl mx-auto px-6 py-14 space-y-20">

          <div>
            <h2 className="text-4xl font-bold text-navy mb-3">Listings</h2>
            <p className="text-base font-semibold text-navy mb-1">Co-own property. No fund. No fees in cash.</p>
            <p className="text-sm text-text-muted max-w-xl leading-relaxed">
              Pool capital with other buyers to acquire Nigerian property. Each co-owner holds
              registered shares in a dedicated company — proportional to what they put in.
            </p>
          </div>

          {/* Steps */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-10">The six steps</h3>
            <ol className="relative space-y-0">
              {LISTING_STEPS.map(({ number, title, body, icon }, idx) => (
                <li key={number} className="flex gap-6 relative">
                  {idx < LISTING_STEPS.length - 1 && (
                    <div className="absolute left-5 top-14 w-px h-full bg-border" aria-hidden="true" />
                  )}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center z-10">
                    {icon}
                  </div>
                  <div className="pb-10">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-[11px] text-teal font-semibold">{number}</span>
                      <h4 className="text-base font-semibold text-navy">{title}</h4>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Equity structure */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-2">Ownership structure</h3>
            <p className="text-sm text-text-muted mb-8">
              Every property is held by its own dedicated company formed after full payment clears.
            </p>

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-navy text-white px-6 py-5 text-center">
                <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Dedicated property company (SPV)</div>
                <div className="font-semibold text-lg">e.g. Lekki Phase 1 Ltd</div>
                <div className="text-white/60 text-xs mt-0.5">Holds title to the property</div>
              </div>
              <div className="flex justify-center bg-surface-raised py-0">
                <div className="w-px h-6 bg-border" />
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="bg-teal/5 px-6 py-6 text-center">
                  <div className="font-mono text-3xl font-bold text-teal mb-1">97.5%</div>
                  <div className="text-sm font-semibold text-navy mb-2">Co-owner pool</div>
                  <div className="text-xs text-text-muted leading-relaxed">
                    Shared proportionally among all co-owners. Each contributor&apos;s equity = (their amount ÷ total raise) × 97.5%.
                  </div>
                  <div className="mt-4 flex justify-center gap-1.5 flex-wrap">
                    {['Co-owner A', 'Co-owner B', 'Co-owner C', '…'].map((l) => (
                      <span key={l} className="text-[11px] bg-teal/10 text-teal px-2 py-0.5 rounded-full font-medium">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-navy/5 px-6 py-6 text-center">
                  <div className="font-mono text-3xl font-bold text-navy mb-1">2.5%</div>
                  <div className="text-sm font-semibold text-navy mb-2">Own2gether stake</div>
                  <div className="text-xs text-text-muted leading-relaxed">
                    Taken in lieu of management and acquisition fees — funded proportionally from all contributors. No cash fees are ever charged.
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] bg-navy/10 text-navy px-2 py-0.5 rounded-full font-medium">Own2gether</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-text-muted mt-3">
              If the co-owner pool is not fully subscribed at closing, Own2gether may acquire the residual stake, increasing its holding above 2.5%.
            </p>
          </section>

          {/* Ranking diagram */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-2">How allocation ranking works</h3>
            <p className="text-sm text-text-muted mb-6">
              When a raise closes, commitments compete for space in the 97.5% co-owner pool.
            </p>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised text-xs font-semibold text-text-muted uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">Rank</th>
                    <th className="px-5 py-3 text-left font-medium">Commitment</th>
                    <th className="px-5 py-3 text-right font-medium">Equity*</th>
                    <th className="px-5 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, amount: '₦40M', equity: '39.0%', status: 'In pool',  statusClass: 'text-teal font-semibold' },
                    { rank: 2, amount: '₦35M', equity: '34.1%', status: 'In pool',  statusClass: 'text-teal font-semibold' },
                    { rank: 3, amount: '₦15M', equity: '14.6%', status: 'In pool',  statusClass: 'text-teal font-semibold' },
                    { rank: 4, amount: '₦10M', equity: '9.8%',  status: 'Partial',  statusClass: 'text-amber-600 font-semibold' },
                    { rank: 5, amount: '₦5M',  equity: '4.9%',  status: 'Over cap', statusClass: 'text-text-muted' },
                  ].map((row) => (
                    <tr
                      key={row.rank}
                      className={`border-t border-border ${row.status === 'Over cap' ? 'opacity-40' : ''}`}
                    >
                      <td className="px-5 py-3 font-mono text-text-muted">{row.rank}</td>
                      <td className="px-5 py-3 font-mono font-semibold text-navy">{row.amount}</td>
                      <td className="px-5 py-3 font-mono text-text-secondary text-right">{row.equity}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs ${row.statusClass}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-amber-100 bg-amber-50">
                    <td colSpan={4} className="px-5 py-2.5 text-xs text-amber-800 font-medium text-center">
                      — allocation pool full — entries below this line are over cap —
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Example only. Amounts are illustrative against a ₦100M total raise. In pool + Partial equity sums to 97.5% — the full co-owner pool. A commitment marked &quot;Partial&quot; receives a reduced stake proportional to the remaining pool capacity.
              * Equity % = (commitment ÷ total raise) × 97.5% — Own2gether&apos;s 2.5% management stake is already deducted.
            </p>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-2">Typical timeline</h3>
            <p className="text-sm text-text-muted mb-6">From your first commitment to becoming a registered co-owner.</p>
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-px bg-border" aria-hidden="true" />
              <div className="grid grid-cols-5 gap-2 relative">
                {[
                  { label: 'Commit',     sub: 'Anytime while raise is open' },
                  { label: 'KYC review', sub: 'Up to 3 business days' },
                  { label: 'Allocation', sub: 'When raise closes' },
                  { label: 'Payment',    sub: 'Within 10 days' },
                  { label: 'Ownership',  sub: 'Several weeks for formation' },
                ].map(({ label, sub }, i) => (
                  <div key={label} className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm z-10 border-2 ${i === 0 ? 'bg-teal border-teal text-white' : 'bg-white border-border text-text-muted'}`}>
                      {i + 1}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-navy">{label}</div>
                    <div className="mt-0.5 text-[11px] text-text-muted leading-tight">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Listings FAQ */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-6">Frequently asked questions — Listings</h3>
            <dl className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {LISTING_FAQS.map(({ q, a }) => (
                <div key={q} className="px-5 py-5">
                  <dt className="text-sm font-semibold text-navy mb-1.5">{q}</dt>
                  <dd className="text-sm text-text-secondary leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Listings CTA */}
          <section className="bg-teal/5 border border-teal/20 rounded-xl px-8 py-10 text-center">
            <h3 className="text-xl font-bold text-navy mb-2">Ready to co-own?</h3>
            <p className="text-sm text-text-muted mb-6">
              Browse current open raises and commit your amount today — no payment required at this stage.
            </p>
            <Link
              href="/listings"
              className="inline-block bg-navy text-white text-sm font-semibold px-6 py-3 rounded hover:bg-navy/90 transition-colors"
            >
              View open listings →
            </Link>
          </section>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          DEALS SECTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="deals" className="scroll-mt-4 bg-surface-raised border-t-4 border-teal">

        <div className="max-w-4xl mx-auto px-6 py-14 space-y-20">

          <div>
            <h2 className="text-4xl font-bold text-navy mb-3">Deals</h2>
            <p className="text-base font-semibold text-navy mb-1">Co-invest in development. Share the profit.</p>
            <p className="text-sm text-text-muted max-w-xl leading-relaxed">
              Deals are joint development investments — rehabilitation, ground-up builds, and off-plan
              purchases. You contribute capital, Own2gether manages the project, and profits are split
              60% to investors and 40% to Own2gether on exit. There is no equity stake or company ownership.
            </p>

            {/* Key numbers bar */}
            <div className="mt-8 border border-border rounded-xl bg-white overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border text-center">
                {[
                  { value: '60%', label: 'of net profit to investors' },
                  { value: '40%', label: 'Own2gether deal fee' },
                  { value: '15%', label: 'minimum per investor' },
                ].map(({ value, label }) => (
                  <div key={label} className="px-4 py-6">
                    <div className="font-mono text-2xl font-bold text-navy">{value}</div>
                    <div className="text-xs text-text-muted mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-10">The six steps</h3>
            <ol className="relative space-y-0">
              {DEAL_STEPS.map(({ number, title, body, icon }, idx) => (
                <li key={number} className="flex gap-6 relative">
                  {idx < DEAL_STEPS.length - 1 && (
                    <div className="absolute left-5 top-14 w-px h-full bg-border" aria-hidden="true" />
                  )}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center z-10">
                    {icon}
                  </div>
                  <div className="pb-10">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-[11px] text-teal font-semibold">{number}</span>
                      <h4 className="text-base font-semibold text-navy">{title}</h4>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Profit structure */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-2">Profit structure</h3>
            <p className="text-sm text-text-muted mb-8">
              Capital is returned first. Net profit is then split between investors and Own2gether.
            </p>

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-navy text-white px-6 py-5 text-center">
                <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Project exit proceeds</div>
                <div className="font-semibold text-lg">Total sale or refinancing value</div>
                <div className="text-white/60 text-xs mt-0.5">minus total project costs = net profit</div>
              </div>
              <div className="flex justify-center bg-surface-raised py-0">
                <div className="w-px h-6 bg-border" />
              </div>
              {/* Capital return row */}
              <div className="border-b border-border bg-surface-raised px-6 py-4 text-center">
                <div className="text-sm font-semibold text-navy mb-0.5">Capital returned to all investors</div>
                <div className="text-xs text-text-muted">Every investor receives their original commitment back in full before any profit is distributed.</div>
              </div>
              <div className="flex justify-center bg-surface-raised py-0">
                <div className="w-px h-6 bg-border" />
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="bg-teal/5 px-6 py-6 text-center">
                  <div className="font-mono text-3xl font-bold text-teal mb-1">60%</div>
                  <div className="text-sm font-semibold text-navy mb-2">Investor profit share</div>
                  <div className="text-xs text-text-muted leading-relaxed">
                    Split proportionally among all investors. Each investor&apos;s share = (their contribution ÷ total raise) × 60% × net profit.
                  </div>
                  <div className="mt-4 flex justify-center gap-1.5 flex-wrap">
                    {['Investor A', 'Investor B', 'Investor C', '…'].map((l) => (
                      <span key={l} className="text-[11px] bg-teal/10 text-teal px-2 py-0.5 rounded-full font-medium">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-navy/5 px-6 py-6 text-center">
                  <div className="font-mono text-3xl font-bold text-navy mb-1">40%</div>
                  <div className="text-sm font-semibold text-navy mb-2">Own2gether deal fee</div>
                  <div className="text-xs text-text-muted leading-relaxed">
                    Own2gether&apos;s fee for originating, structuring, and managing the project end-to-end. Paid from profit only — if there is no profit, Own2gether receives nothing.
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] bg-navy/10 text-navy px-2 py-0.5 rounded-full font-medium">Own2gether</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-text-muted mt-3">
              Returns are not guaranteed. Project costs and timelines may vary. You may lose some or all of your committed capital.
            </p>
          </section>

          {/* Example */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-2">Example distribution</h3>
            <p className="text-sm text-text-muted mb-6">
              Illustrative only — based on a ₦100M raise with ₦40M net profit on exit.
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-raised text-xs font-semibold text-text-muted uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">Investor</th>
                    <th className="px-5 py-3 text-right font-medium">Contributed</th>
                    <th className="px-5 py-3 text-right font-medium">Capital returned</th>
                    <th className="px-5 py-3 text-right font-medium">Profit share*</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Investor A', contributed: '₦30M', capital: '₦30M', profit: '₦7.2M' },
                    { name: 'Investor B', contributed: '₦25M', capital: '₦25M', profit: '₦6.0M' },
                    { name: 'Investor C', contributed: '₦25M', capital: '₦25M', profit: '₦6.0M' },
                    { name: 'Investor D', contributed: '₦20M', capital: '₦20M', profit: '₦4.8M' },
                    { name: 'Own2gether', contributed: '—',    capital: '—',    profit: '₦16.0M' },
                  ].map((row, i) => (
                    <tr key={row.name} className={`border-t border-border ${i === 4 ? 'bg-navy/5 font-medium' : ''}`}>
                      <td className="px-5 py-3 text-navy">{row.name}</td>
                      <td className="px-5 py-3 font-mono text-text-secondary text-right">{row.contributed}</td>
                      <td className="px-5 py-3 font-mono text-text-secondary text-right">{row.capital}</td>
                      <td className={`px-5 py-3 font-mono text-right font-semibold ${i === 4 ? 'text-navy' : 'text-teal'}`}>{row.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted mt-3">
              * Based on ₦40M net profit. Investor profit = (contribution ÷ ₦100M) × 60% × ₦40M.
              Own2gether profit = 40% × ₦40M = ₦16M. All figures illustrative.
            </p>
          </section>

          {/* Deals FAQ */}
          <section>
            <h3 className="text-lg font-bold text-navy mb-6">Frequently asked questions — Deals</h3>
            <dl className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {DEAL_FAQS.map(({ q, a }) => (
                <div key={q} className="px-5 py-5">
                  <dt className="text-sm font-semibold text-navy mb-1.5">{q}</dt>
                  <dd className="text-sm text-text-secondary leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Deals CTA */}
          <section className="bg-teal/5 border border-teal/20 rounded-xl px-8 py-10 text-center">
            <h3 className="text-xl font-bold text-navy mb-2">Ready to invest in a deal?</h3>
            <p className="text-sm text-text-muted mb-6">
              Browse available development deals and express your commitment today — no payment required at this stage.
            </p>
            <Link
              href="/deals"
              className="inline-block bg-navy text-white text-sm font-semibold px-6 py-3 rounded hover:bg-navy/90 transition-colors"
            >
              View deals →
            </Link>
          </section>

        </div>
      </section>

      <Footer />
    </>
  )
}
