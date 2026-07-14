export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const DOCS = [
  {
    title: 'Privacy Policy',
    description:
      'How we collect, use, and protect your personal data in compliance with the Nigeria Data Protection Act 2023 and NDPR 2019.',
    href: '/legal/privacy',
    badge: 'NDPA 2023',
  },
  {
    title: 'Terms and Conditions',
    description:
      'The rules and obligations that govern your use of the Own2gether platform and co-ownership service.',
    href: '/legal/terms',
    badge: 'Nigerian law',
  },
  {
    title: 'Cookie Policy',
    description:
      'Which cookies we set on this website, why we set them, and how to control them.',
    href: '/legal/cookies',
    badge: 'Technical',
  },
  {
    title: 'Accessibility Statement',
    description:
      'Our commitment to making Own2gether usable by everyone, and the standards we target.',
    href: '/legal/accessibility',
    badge: 'WCAG 2.1',
  },
]

export default function LegalPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-teal text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Legal documents
          </h1>
          <p className="text-white/70 text-base max-w-2xl leading-relaxed">
            The policies and terms that govern your use of Own2gether. Please
            read these carefully — they explain your rights and our obligations.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {DOCS.map(({ title, description, href, badge }) => (
            <Link
              key={href}
              href={href}
              className="border border-border rounded-xl p-6 hover:border-teal/40 hover:bg-teal/5 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-sm font-semibold text-navy group-hover:text-teal transition-colors">
                  {title}
                </h2>
                <span className="text-[10px] font-semibold text-text-muted bg-surface-raised border border-border rounded px-2 py-0.5 whitespace-nowrap">
                  {badge}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {description}
              </p>
              <p className="text-xs text-teal font-medium mt-4">Read →</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
