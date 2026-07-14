export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About | Own2gether',
  description:
    'Own2gether is a Nigerian property co-ownership and co-investment platform. Pool resources to own registered shares in property, or co-invest in development deals and share the profits.',
}

const VALUES = [
  {
    title: 'Aligned incentives',
    body: 'Own2gether earns by partnering — not by charging fees. For Listings we take a 2.5% equity stake. For Deals we earn 40% of net profit as the deal partner. In both cases we only do well when you do well.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <path d="M16 4l3 8h8l-6.5 5 2.5 8L16 20l-7 5 2.5-8L5 12h8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Real ownership or real profit share',
    body: 'You are not buying into a fund or a REIT. Listing co-owners hold registered shares in a dedicated SPV. Deal investors hold a documented contractual right to 60% of net profits on exit — structured before funds are committed.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <path d="M16 3L3 12v17h8V19h10v10h8V12L16 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Transparent process',
    body: 'Every commitment, ranking, and allocation decision is visible on the listing or deal page in real time. You can see exactly where you stand before the raise closes.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M16 10v6l4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Manual review, not algorithms',
    body: 'Identity verification, document review, and allocation are handled by our team — no black-box automation. Every co-owner and investor is verified personally before their stake is confirmed.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4 27c0-5.5 3.6-8 8-8s8 2.5 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M22 14l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Clear minimums per product',
    body: 'Listing co-owners commit a minimum 7.5% of the property\'s total raise. Deal investors commit a minimum 15% of the target raise. Both floors ensure every participant holds a meaningful stake.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M10 16h12M10 21h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M10 11h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Currency pragmatism',
    body: 'We list properties anywhere, and the property determines the currency. A Nigerian naira listing is settled in naira; a dollar-priced asset is settled in dollars. You pay directly to the seller or project account in the deal\'s native currency — no forced conversion, no escrow middleman.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M10 12h4.5a2.5 2.5 0 010 5H10m0-5v10m0-5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const COMPARISONS = [
  { feature: 'You hold registered shares',        o2g: true,  fund: false, reit: false },
  { feature: 'Management fees in cash',           o2g: false, fund: true,  reit: true  },
  { feature: 'Own2gether profits only with you',  o2g: true,  fund: false, reit: false },
  { feature: 'Direct bank transfer to seller',    o2g: true,  fund: false, reit: false },
  { feature: 'Dedicated SPV per property',        o2g: true,  fund: false, reit: false },
  { feature: 'Real-time commitment ranking',      o2g: true,  fund: false, reit: false },
  { feature: 'Right of first refusal on resale',  o2g: true,  fund: false, reit: false },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-teal text-xs font-semibold uppercase tracking-widest mb-3">About</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Two ways to invest in<br />Nigerian property.
          </h1>
          <p className="text-white/70 text-base max-w-2xl leading-relaxed">
            Own2gether makes Nigerian property investment accessible in two distinct ways: co-own
            ready property through our Listings platform, or co-invest in development and
            rehabilitation projects through our Deals platform. In both cases, you pool resources
            with others, pay nothing in cash fees, and share the outcome directly.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-14 space-y-20">

        {/* Mission */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-xl font-bold text-navy mb-4">Our mission</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Property wealth in Nigeria has historically been accessible only to those with
              large individual capital. Own2gether breaks that barrier. By pooling committed
              amounts from multiple participants, we enable each person to acquire a meaningful
              stake in property they could not access alone.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Through <strong className="text-navy">Listings</strong>, buyers find each other,
              commit capital together, and become registered shareholders in a dedicated property
              company. Through <strong className="text-navy">Deals</strong>, investors co-fund
              development projects — rehabilitation, ground-up builds, off-plan — and share 60%
              of net profits on exit.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              We are not a fund manager, a REIT, or a property syndicate. We are a co-ownership
              and co-investment platform — built to make real Nigerian property work for
              individuals, not just institutions.
            </p>
          </div>

          {/* Two-model schematic */}
          <div className="space-y-4">
            <div className="bg-surface-raised border border-border rounded-xl p-5">
              <div className="text-[10px] text-teal uppercase tracking-wider mb-3 font-semibold">Listings — co-ownership</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Multiple buyers commit amounts (min 7.5%)', icon: '👥' },
                  { label: 'Largest commitments ranked first', icon: '📊' },
                  { label: 'Raise closes → allocation confirmed', icon: '✅' },
                  { label: 'Buyers pay directly to seller', icon: '🏦' },
                  { label: 'Dedicated SPV holds the title', icon: '🏢' },
                  { label: 'Co-owners hold registered shares', icon: '📜' },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="text-sm w-5 text-center">{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-raised border border-border rounded-xl p-5">
              <div className="text-[10px] text-teal uppercase tracking-wider mb-3 font-semibold">Deals — co-investment</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Investors commit capital (min 15%)', icon: '👥' },
                  { label: 'Raise closes → allocation confirmed', icon: '✅' },
                  { label: 'Funds released against milestones', icon: '🏗️' },
                  { label: 'Own2gether manages the project', icon: '🔧' },
                  { label: 'Property sold or refinanced on exit', icon: '🏦' },
                  { label: 'Investors share 60% of net profit', icon: '📈' },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="text-sm w-5 text-center">{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-bold text-navy mb-2">What we stand for</h2>
          <p className="text-sm text-text-muted mb-8">Six principles that shape every decision we make.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ title, body, icon }) => (
              <div key={title} className="border border-border rounded-xl p-5 space-y-3">
                <div className="text-teal">{icon}</div>
                <h3 className="text-sm font-semibold text-navy">{title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table — Listings */}
        <section>
          <h2 className="text-xl font-bold text-navy mb-2">How we compare</h2>
          <p className="text-sm text-text-muted mb-6">Own2gether Listings vs traditional property investment vehicles.</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-raised text-xs font-semibold uppercase tracking-wide">
                  <th className="px-5 py-3 text-left text-text-muted font-medium w-1/2">Feature</th>
                  <th className="px-5 py-3 text-center text-navy whitespace-nowrap">Own2gether</th>
                  <th className="px-5 py-3 text-center text-text-muted whitespace-nowrap">Property fund</th>
                  <th className="px-5 py-3 text-center text-text-muted whitespace-nowrap">REIT</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map(({ feature, o2g, fund, reit }) => (
                  <tr key={feature} className="border-t border-border">
                    <td className="px-5 py-3.5 text-text-secondary">{feature}</td>
                    <td className="px-5 py-3.5 text-center bg-teal/5">
                      {o2g
                        ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal text-white text-xs font-bold">✓</span>
                        : <span className="text-text-muted text-lg leading-none">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {fund
                        ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal text-white text-xs font-bold">✓</span>
                        : <span className="text-text-muted text-lg leading-none">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {reit
                        ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal text-white text-xs font-bold">✓</span>
                        : <span className="text-text-muted text-lg leading-none">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Legal structure — Listings */}
        <section>
          <h2 className="text-xl font-bold text-navy mb-1">Legal structure</h2>
          <p className="text-sm text-text-muted mb-6">How ownership and profit-sharing are documented for each product.</p>

          <div className="space-y-6">
            {/* Listings SPV */}
            <div>
              <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-3">Listings</p>
              <p className="text-sm text-text-muted mb-4">
                Each property acquired through a Listing is held by its own Special Purpose Vehicle (SPV) —
                a dedicated limited company formed specifically for that property.
              </p>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-navy text-white text-center px-6 py-5">
                  <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Special Purpose Vehicle</div>
                  <div className="font-semibold text-base">Property Co. Ltd</div>
                  <div className="text-white/50 text-xs mt-0.5">Registered company — holds legal title</div>
                </div>
                <div className="flex justify-center bg-surface-raised">
                  <div className="w-px h-6 bg-border" />
                </div>
                <div className="px-6 pb-6 pt-0 bg-surface-raised">
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-3 text-center font-semibold">Shareholders</div>
                  <div className="grid grid-cols-4 gap-2">
                    {['Co-owner A', 'Co-owner B', 'Co-owner C', 'Own2gether'].map((name, i) => (
                      <div
                        key={name}
                        className={`rounded-lg px-3 py-3 text-center text-xs border ${i < 3 ? 'border-teal/20 bg-teal/5 text-teal' : 'border-navy/20 bg-navy/5 text-navy'}`}
                      >
                        <div className="font-semibold">{name}</div>
                        <div className="text-[11px] mt-0.5 opacity-70">
                          {i < 3 ? 'Proportional stake' : 'Min 2.5%'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-4 text-center">
                    Co-owners receive share certificates in the SPV. Ownership is proportional to each
                    co-owner&apos;s allocated amount relative to the total raise.
                  </p>
                  <div className="mt-4 border border-teal/20 bg-teal/5 rounded-lg px-4 py-3 text-xs text-teal leading-relaxed">
                    <span className="font-semibold">Right of first refusal — </span>
                    if a co-owner wishes to sell their stake, the other co-owners in the same property
                    company have the right to purchase it first at the proposed price, before any external
                    buyer is approached.
                  </div>
                </div>
              </div>
            </div>

            {/* Deals structure */}
            <div>
              <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-3">Deals</p>
              <p className="text-sm text-text-muted mb-4">
                Each Deal is structured as a joint venture between investors and Own2gether. Investors
                do not receive share certificates — instead, they hold a documented contractual right
                to 60% of net proceeds on exit, split proportionally to their contribution.
              </p>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-navy text-white text-center px-6 py-5">
                  <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Joint Venture</div>
                  <div className="font-semibold text-base">Development Project</div>
                  <div className="text-white/50 text-xs mt-0.5">Own2gether manages end-to-end</div>
                </div>
                <div className="flex justify-center bg-surface-raised">
                  <div className="w-px h-6 bg-border" />
                </div>
                <div className="px-6 pb-6 pt-0 bg-surface-raised">
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-3 text-center font-semibold">Profit split on exit</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg px-4 py-4 text-center border border-teal/20 bg-teal/5 text-teal">
                      <div className="text-2xl font-bold">60%</div>
                      <div className="text-xs mt-1 font-semibold">Investors</div>
                      <div className="text-[11px] mt-0.5 opacity-70">Split proportionally to contribution</div>
                    </div>
                    <div className="rounded-lg px-4 py-4 text-center border border-navy/20 bg-navy/5 text-navy">
                      <div className="text-2xl font-bold">40%</div>
                      <div className="text-xs mt-1 font-semibold">Own2gether</div>
                      <div className="text-[11px] mt-0.5 opacity-70">Deal partner &amp; project manager</div>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-4 text-center">
                    Funds are released in milestone tranches. Investors track project progress through
                    milestone updates published on the deal page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-teal/5 border border-teal/20 rounded-xl px-6 py-8">
            <h2 className="text-base font-bold text-navy mb-2">Get in touch</h2>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Have a question about a listing, a deal, or a property you would like to see on
              the platform?
            </p>
            <a
              href="mailto:sales@updates.own2gether.com"
              className="inline-block text-sm font-semibold text-navy border border-navy rounded px-4 py-2 hover:bg-navy hover:text-white transition-colors"
            >
              sales@updates.own2gether.com
            </a>
          </div>
          <div className="bg-surface-raised border border-border rounded-xl px-6 py-8">
            <h2 className="text-base font-bold text-navy mb-2">Browse listings</h2>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Browse co-ownership opportunities, see live commitment rankings, and reserve your
              stake in a property today.
            </p>
            <Link
              href="/listings"
              className="inline-block text-sm font-semibold text-white bg-navy rounded px-4 py-2 hover:bg-navy/90 transition-colors"
            >
              View listings →
            </Link>
          </div>
          <div className="bg-surface-raised border border-border rounded-xl px-6 py-8">
            <h2 className="text-base font-bold text-navy mb-2">Browse deals</h2>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Explore open development deals, review milestones and projected returns, and
              commit capital to co-invest.
            </p>
            <Link
              href="/deals"
              className="inline-block text-sm font-semibold text-white bg-navy rounded px-4 py-2 hover:bg-navy/90 transition-colors"
            >
              View deals →
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
