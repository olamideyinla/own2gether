export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const EFFECTIVE = '30 June 2026'

export default function PrivacyPolicyPage() {
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
            / Privacy Policy
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-sm">Effective date: {EFFECTIVE}</p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-12">

        {/* Intro box */}
        <div className="bg-amber border border-amber-text/20 rounded-xl px-5 py-4 text-sm text-amber-text leading-relaxed">
          This Privacy Policy explains how Own2gether collects, uses, stores, and shares your
          personal data. It is issued in compliance with the{' '}
          <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> and the{' '}
          <strong>Nigeria Data Protection Regulation 2019 (NDPR)</strong>.
        </div>

        {/* 1 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">1. Who we are</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Own2gether (&ldquo;Own2gether&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) is a property co-ownership platform operating in Nigeria. We are the
            data controller responsible for the personal data you provide when you use our website
            at <strong>www.own2gether.com</strong>.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed mt-3">
            To contact our data team, write to:{' '}
            <a href="mailto:sales@updates.own2gether.com" className="text-teal hover:underline">
              sales@updates.own2gether.com
            </a>
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">2. Data we collect</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            We collect the following categories of personal data:
          </p>
          <div className="space-y-4">
            {([
              {
                title: 'Account information',
                items: [
                  'Full name',
                  'Email address',
                  'Phone number',
                  'Password (stored as a secure bcrypt hash — we never store your plain password)',
                ],
              },
              {
                title: 'Identity and KYC information',
                items: [
                  'Date of birth',
                  'Nationality',
                  'Occupation',
                  'Residential address',
                  'Government-issued identity document (type, number, expiry date, and scan)',
                  'Proof of address document',
                ],
              },
              {
                title: 'Financial and transaction information',
                items: [
                  'Commitment amounts on specific properties',
                  'Payment receipt documents (uploaded by you)',
                  'Property stake percentages after allocation',
                ],
              },
              {
                title: 'Communication data',
                items: [
                  'Messages posted to co-owner message boards',
                  'Any correspondence you send to us by email',
                ],
              },
              {
                title: 'Technical and usage data',
                items: [
                  'Session tokens stored in secure HTTP-only cookies',
                  'IP address and browser information (collected by our infrastructure provider)',
                  'Pages visited and platform features used',
                ],
              },
            ] as { title: string; items: string[] }[]).map(({ title, items }) => (
              <div key={title} className="border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-navy mb-3">{title}</h3>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="flex gap-2 text-xs text-text-secondary">
                      <span className="text-teal shrink-0 mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">3. How we use your data</h2>
          <div className="space-y-4">
            {([
              {
                purpose: 'Account creation and authentication',
                detail:
                  'We use your name, email, and password hash to create and secure your account.',
              },
              {
                purpose: 'Identity verification (KYC)',
                detail:
                  'We review your identity documents and address proof to verify your identity before confirming any property allocation. This supports our internal compliance policy and the CAC registration of each property SPV.',
              },
              {
                purpose: 'Property co-ownership administration',
                detail:
                  'We use your commitment data, stake percentages, and payment receipts to manage the co-ownership process and maintain accurate ownership records.',
              },
              {
                purpose: 'SPV company registration',
                detail:
                  'Where a raise completes, we may share your verified identity information with the Corporate Affairs Commission (CAC) and our registered legal agents solely for the purpose of registering the property company in which you hold shares.',
              },
              {
                purpose: 'Notifications and updates',
                detail:
                  'We send in-platform notifications about your commitments, KYC status, messages from co-owners, and platform updates.',
              },
              {
                purpose: 'Co-owner communications',
                detail:
                  'Messages you post on a property message board are visible to all current co-owners of that property and to Own2gether staff.',
              },
              {
                purpose: 'Security and fraud prevention',
                detail:
                  'We analyse usage patterns to detect and prevent fraudulent activity and protect the security of our platform.',
              },
              {
                purpose: 'Legal and regulatory compliance',
                detail:
                  'We may process and retain data as required to comply with Nigerian law, including anti-money laundering (AML) and Know Your Customer (KYC) obligations.',
              },
            ] as { purpose: string; detail: string }[]).map(({ purpose, detail }) => (
              <div key={purpose} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-navy">{purpose}</p>
                  <p className="text-sm text-text-secondary leading-relaxed mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">4. Legal basis for processing</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-raised border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Processing activity</th>
                  <th className="px-4 py-3 text-left">Legal basis</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ['Account registration and login', 'Contract performance'],
                  ['Processing commitments and allocations', 'Contract performance'],
                  ['Identity verification (KYC)', 'Legal obligation; contract performance'],
                  ['SPV registration with CAC', 'Legal obligation; contract performance'],
                  ['In-platform notifications', 'Legitimate interests'],
                  ['Fraud detection and security', 'Legitimate interests'],
                  ['Regulatory record-keeping', 'Legal obligation'],
                  ['Platform improvement and analytics', 'Legitimate interests'],
                ] as [string, string][]).map(([activity, basis], i) => (
                  <tr
                    key={activity}
                    className={`border-t border-border ${i % 2 === 1 ? 'bg-surface-raised/50' : ''}`}
                  >
                    <td className="px-4 py-3 text-text-secondary">{activity}</td>
                    <td className="px-4 py-3 text-navy font-medium">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">5. Who we share your data with</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            We do not sell your personal data. We share it only where necessary and with the
            following parties:
          </p>
          <div className="space-y-3">
            {([
              {
                party: 'Supabase Inc.',
                role: 'Database and infrastructure hosting. Your data is stored on Supabase-managed PostgreSQL servers.',
              },
              {
                party: 'Vercel Inc.',
                role: 'Web hosting and file storage. Uploaded documents (ID scans, payment receipts) are stored on Vercel Blob in access-controlled private storage.',
              },
              {
                party: 'Corporate Affairs Commission (CAC)',
                role: 'Upon successful completion of a property raise, verified shareholder identity information is submitted for SPV company registration as required by CAMA 2020.',
              },
              {
                party: 'Legal and professional advisers',
                role: 'We may share information with legal counsel, auditors, or regulatory bodies where required by law, regulatory order, or court order.',
              },
              {
                party: 'Other co-owners (limited)',
                role: 'Your name is visible to co-owners of the same property on the co-owner hub. Your email address and identity documents are never shared with other users.',
              },
            ] as { party: string; role: string }[]).map(({ party, role }) => (
              <div key={party} className="border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-navy mb-1">{party}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">6. How long we keep your data</h2>
          <div className="space-y-4">
            {([
              {
                category: 'Account data',
                retention:
                  'For the duration of your account, and for 7 years after account closure.',
              },
              {
                category: 'KYC and identity documents',
                retention:
                  'For the duration of your account, and for at least 5 years after your last transaction, as required for AML compliance.',
              },
              {
                category: 'Payment receipts and commitment records',
                retention:
                  'For 7 years from the date of each transaction, in line with Nigerian financial record-keeping requirements.',
              },
              {
                category: 'Session tokens',
                retention: 'Expire after 30 days of inactivity, or immediately on sign-out.',
              },
              {
                category: 'Co-owner messages',
                retention:
                  'Retained for the lifetime of the associated property record on the platform.',
              },
            ] as { category: string; retention: string }[]).map(({ category, retention }) => (
              <div key={category} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-navy">{category}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{retention}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">7. Your rights</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            Under the Nigeria Data Protection Act 2023, you have the following rights:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {([
              {
                right: 'Right of access',
                detail: 'Request a copy of all personal data we hold about you.',
              },
              {
                right: 'Right to rectification',
                detail: 'Ask us to correct inaccurate or incomplete data.',
              },
              {
                right: 'Right to erasure',
                detail:
                  'Request deletion of your data, subject to legal retention obligations.',
              },
              {
                right: 'Right to restriction',
                detail: 'Ask us to pause how we process your data in certain circumstances.',
              },
              {
                right: 'Right to data portability',
                detail: 'Receive a copy of your data in a structured, machine-readable format.',
              },
              {
                right: 'Right to object',
                detail: 'Object to processing based on our legitimate interests.',
              },
            ] as { right: string; detail: string }[]).map(({ right, detail }) => (
              <div key={right} className="border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-navy mb-1">{right}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:sales@updates.own2gether.com" className="text-teal hover:underline">
              sales@updates.own2gether.com
            </a>
            . We will respond within 30 days. If you are not satisfied with our response, you may
            lodge a complaint with the{' '}
            <strong>Nigeria Data Protection Commission (NDPC)</strong>.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">8. Security</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            We implement the following technical and organisational measures to protect your data:
          </p>
          <ul className="space-y-2">
            {[
              'All data transmitted via HTTPS (TLS encryption in transit)',
              'Passwords stored as bcrypt hashes — we cannot read or recover your password',
              'Session tokens stored in HTTP-only, Secure, SameSite cookies — not accessible to JavaScript',
              'Database access restricted to server-side code only — no direct client access',
              'Uploaded documents stored in access-controlled private blob storage',
              'Admin access protected by a separate, independently authenticated session',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary leading-relaxed mt-4">
            No system is entirely immune to risk. If you believe your account has been
            compromised, please contact us immediately at{' '}
            <a href="mailto:sales@updates.own2gether.com" className="text-teal hover:underline">
              sales@updates.own2gether.com
            </a>
            .
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">9. Cookies</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            We use strictly necessary session cookies only — no advertising or tracking cookies.
            For full details, see our{' '}
            <Link href="/legal/cookies" className="text-teal hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">10. Changes to this policy</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            We may update this Privacy Policy periodically. When we make material changes, we will
            update the effective date at the top of this page and, where appropriate, notify you by
            email. Continued use of the platform after the updated effective date constitutes
            acceptance of the revised policy.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">11. Contact</h2>
          <div className="bg-surface-raised border border-border rounded-xl p-6">
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              For any privacy-related questions, requests, or to exercise your rights:
            </p>
            <a
              href="mailto:sales@updates.own2gether.com"
              className="text-sm font-semibold text-teal hover:underline"
            >
              sales@updates.own2gether.com
            </a>
            <p className="text-xs text-text-muted mt-3">
              You may also write to us using the contact details on our{' '}
              <Link href="/about" className="text-teal hover:underline">
                About page
              </Link>
              .
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
