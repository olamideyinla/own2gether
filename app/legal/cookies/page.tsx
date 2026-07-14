export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const EFFECTIVE = '30 June 2026'

export default function CookiePolicyPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-teal text-xs font-semibold uppercase tracking-widest mb-3">
            <Link href="/legal" className="hover:text-teal/70 transition-colors">
              Legal
            </Link>{' '}
            / Cookie Policy
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">Cookie Policy</h1>
          <p className="text-white/70 text-sm">Effective date: {EFFECTIVE}</p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-12">

        {/* 1 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">1. What are cookies?</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Cookies are small text files that a website places on your device when you visit.
            They are widely used to make websites work, to keep you signed in, and to gather
            information about how a site is used. This policy explains which cookies Own2gether
            sets and why.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">2. The cookies we use</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            Own2gether uses <strong>strictly necessary cookies only</strong>. We do not use
            advertising cookies, tracking cookies, or any third-party analytics cookies.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Cookie name</th>
                  <th className="px-4 py-3 text-left">Purpose</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {([
                  {
                    name: 'profile_session',
                    purpose: 'Keeps you signed in to your Own2gether account',
                    duration: '30 days (or until sign-out)',
                    type: 'Strictly necessary',
                  },
                  {
                    name: 'admin_session',
                    purpose: 'Keeps an admin user signed in to the admin dashboard',
                    duration: 'Session (browser close or sign-out)',
                    type: 'Strictly necessary',
                  },
                ] as { name: string; purpose: string; duration: string; type: string }[]).map(
                  (row, i) => (
                    <tr
                      key={row.name}
                      className={`border-t border-border ${i % 2 === 1 ? 'bg-surface-raised/50' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-navy">{row.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.purpose}</td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{row.duration}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold text-teal bg-teal/10 rounded px-2 py-0.5 whitespace-nowrap">
                          {row.type}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">3. How our session cookies work</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Both cookies listed above are set with the following security attributes:
          </p>
          <ul className="space-y-2">
            {[
              'HttpOnly — the cookie cannot be read or modified by JavaScript running on the page, protecting you against cross-site scripting (XSS) attacks',
              'Secure — the cookie is only transmitted over HTTPS connections',
              'SameSite=Lax — the cookie is not sent on cross-site requests initiated from other websites, protecting against cross-site request forgery (CSRF)',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary leading-relaxed mt-4">
            These cookies are essential to the operation of the platform. Without them, you
            cannot sign in or use authenticated features.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">4. What we do not use</h2>
          <div className="space-y-3">
            {([
              {
                category: 'Analytics cookies',
                detail:
                  'We do not use Google Analytics, Mixpanel, or any other third-party analytics service that sets cookies.',
              },
              {
                category: 'Advertising cookies',
                detail:
                  'We do not run advertising campaigns using cookie-based tracking (e.g. Meta Pixel, Google Ads remarketing).',
              },
              {
                category: 'Social media cookies',
                detail:
                  'We do not embed social media widgets or share buttons that would set third-party cookies.',
              },
              {
                category: 'Fingerprinting or supercookies',
                detail:
                  'We do not use browser fingerprinting, localStorage tracking, or any technique designed to track you across sites.',
              },
            ] as { category: string; detail: string }[]).map(({ category, detail }) => (
              <div key={category} className="border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-navy mb-1">{category} — not used</p>
                <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">5. Managing cookies</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            You can control cookies through your browser settings. Most browsers allow you to:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'View all cookies currently stored on your device',
              'Delete individual cookies or all cookies at any time',
              'Block cookies from specific websites',
              'Block all third-party cookies',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary leading-relaxed">
            Because the cookies we set are strictly necessary, blocking or deleting them will
            prevent you from signing in or using authenticated areas of Own2gether. You can sign
            out at any time to delete your session cookie from our end.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">6. Changes to this policy</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            If we introduce new cookies in the future, we will update this policy before doing
            so and update the effective date above. We will notify registered users by email if
            we introduce any cookies that are not strictly necessary.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">7. Contact</h2>
          <div className="bg-surface-raised border border-border rounded-xl p-6">
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Questions about this Cookie Policy can be directed to:
            </p>
            <a
              href="mailto:sales@updates.own2gether.com"
              className="text-sm font-semibold text-teal hover:underline"
            >
              sales@updates.own2gether.com
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
