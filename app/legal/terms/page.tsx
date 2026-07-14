export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const EFFECTIVE = '30 June 2026'

export default function TermsPage() {
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
            / Terms &amp; Conditions
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Terms and Conditions
          </h1>
          <p className="text-white/70 text-sm">Effective date: {EFFECTIVE}</p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-12">

        {/* Intro box */}
        <div className="bg-amber border border-amber-text/20 rounded-xl px-5 py-4 text-sm text-amber-text leading-relaxed">
          Please read these Terms and Conditions carefully before using Own2gether. By creating
          an account or making a commitment, you agree to be bound by these terms. If you do not
          agree, please do not use the platform.
        </div>

        {/* 1 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">1. About Own2gether</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Own2gether is an online platform that facilitates property co-ownership in Nigeria.
            We help multiple individuals combine their financial commitments to collectively
            acquire real property, held through a dedicated Special Purpose Vehicle (SPV) — a
            limited liability company registered with the Corporate Affairs Commission (CAC)
            under the Companies and Allied Matters Act (CAMA) 2020.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed mt-3">
            Own2gether is <strong>not</strong> a financial adviser, investment manager, fund,
            collective investment scheme, or Real Estate Investment Trust (REIT). We are a
            co-ownership facilitation platform. Nothing on this platform constitutes financial,
            investment, or legal advice. You are responsible for conducting your own due
            diligence before making any commitment.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">2. Eligibility</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            To use Own2gether, you must:
          </p>
          <ul className="space-y-2">
            {[
              'Be at least 18 years of age',
              'Be capable of entering into a legally binding contract under Nigerian law',
              'Provide accurate and truthful information during registration and identity verification',
              'Not be prohibited from making property transactions under any applicable law',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary leading-relaxed mt-4">
            We reserve the right to decline or terminate any account that does not meet these
            requirements.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">3. Account registration</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            When you create an account, you agree to:
          </p>
          <ul className="space-y-2">
            {[
              'Provide a valid email address, full legal name, and other information requested',
              'Keep your account credentials confidential and not share access with others',
              'Notify us promptly if you suspect unauthorised access to your account',
              'Accept responsibility for all activity conducted through your account',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">4. Identity verification (KYC)</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Identity verification is mandatory before any property stake is confirmed. You
            must submit:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'A valid government-issued identity document (e.g. national ID, passport, or driver\'s licence)',
              'Proof of address (e.g. utility bill or bank statement dated within 3 months)',
              'Accurate personal information including date of birth, nationality, occupation, and residential address',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary leading-relaxed">
            KYC information is reviewed by our team. Providing false or misleading information
            is grounds for immediate account termination. Verified KYC data may be shared with
            the Corporate Affairs Commission (CAC) and our registered legal agents for the
            purpose of SPV company registration. See our{' '}
            <Link href="/legal/privacy" className="text-teal hover:underline">
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">5. Commitments and allocation</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            A &ldquo;commitment&rdquo; is an expression of your intent to contribute a specified
            amount toward the purchase of a property listed on the platform.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-navy">Non-binding until allocated</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Commitments are expressions of intent, not binding purchase contracts. No
                  financial obligation arises until your commitment is formally allocated by
                  Own2gether.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-navy">Ranking by size</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Commitments are ranked from largest to smallest. When a raise closes, the
                  top commitments by value are allocated stakes. Commitments below the
                  threshold are returned to the queue or withdrawn.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-navy">Minimum commitment</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  The minimum commitment per person is 7.5% of a property&apos;s total raise,
                  ensuring each co-owner holds a meaningful stake. Own2gether holds a minimum
                  2.5% equity stake in each SPV in lieu of cash fees.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-navy">Withdrawal before allocation</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  You may withdraw a commitment at any time before it is formally allocated.
                  Once allocated, withdrawal is subject to Own2gether&apos;s approval.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-navy">Discretion</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Own2gether reserves the right to reject, cancel, or modify any commitment
                  or allocation at its sole discretion, including where KYC verification fails
                  or where a commitment is deemed inconsistent with platform rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">6. Payment</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Own2gether does <strong>not</strong> hold or receive user funds. Once your
            commitment is allocated:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'Payment is made by you directly to the property seller via bank transfer in Nigerian naira (NGN)',
              'You are responsible for ensuring your transfer is accurate and for retaining proof of payment',
              'You must upload your payment receipt on the platform so it can be confirmed by our team',
              'Own2gether is not liable for errors, delays, or disputes arising from your direct bank transfer',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary leading-relaxed">
            All transactions on the platform are denominated in Nigerian naira. Foreign currency
            figures shown are indicative only.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">
            7. Special Purpose Vehicles (SPVs)
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Each property acquired through Own2gether is held by a dedicated SPV — a limited
            liability company registered with the CAC under CAMA 2020 for that property alone.
          </p>
          <div className="space-y-3">
            {([
              {
                title: 'Share certificates',
                detail:
                  'Co-owners receive share certificates in the SPV proportional to their allocated stake relative to the total raise.',
              },
              {
                title: 'Right of first refusal',
                detail:
                  'If a co-owner wishes to sell their stake, other co-owners in the same SPV have the right to purchase it at the proposed price before any external buyer is approached.',
              },
              {
                title: 'Own2gether\'s stake',
                detail:
                  'Own2gether holds a minimum 2.5% equity stake in each SPV in lieu of any cash management fees. Own2gether\'s interest is therefore aligned with co-owners — we benefit only if the property increases in value.',
              },
              {
                title: 'No cash fees',
                detail:
                  'Own2gether charges no acquisition fees, arrangement fees, or ongoing management fees in cash. Our only compensation is the equity stake described above.',
              },
            ] as { title: string; detail: string }[]).map(({ title, detail }) => (
              <div key={title} className="border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-navy mb-1">{title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">8. Connection groups</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            You may create a connection group and invite others to commit alongside you using a
            shared connection code. Members of the same connection group are ranked together and,
            if successful, allocated stakes in the same property. By sharing a connection code,
            you acknowledge that the individuals who use it may be allocated co-ownership of the
            same property as you.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">9. Co-owner message board</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Once co-owners are confirmed for a property, a shared message board is made
            available. You agree that:
          </p>
          <ul className="space-y-2">
            {[
              'Messages are visible to all current co-owners of the property and to Own2gether staff',
              'You will not post offensive, defamatory, fraudulent, or unlawful content',
              'Own2gether may remove messages that violate these terms at its sole discretion',
              'Own2gether is not responsible for the content posted by other co-owners',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">10. Risk disclosure</h2>
          <div className="bg-amber border border-amber-text/20 rounded-xl px-5 py-4 text-sm text-amber-text leading-relaxed space-y-2">
            <p>
              <strong>Property investment carries risk.</strong> The value of property can fall as
              well as rise. Past performance is not a guide to future results.
            </p>
            <p>
              Own2gether does not guarantee that any property raise will complete, that you will
              receive a stake, or that your stake will appreciate in value.
            </p>
            <p>
              You should not commit funds you cannot afford to have illiquid for an extended
              period. Consult an independent financial adviser before making any commitment.
            </p>
          </div>
        </section>

        {/* 11 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">11. Acceptable use</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            You agree not to:
          </p>
          <ul className="space-y-2">
            {[
              'Use the platform for any unlawful purpose or in violation of these Terms',
              'Provide false or misleading information at any stage of the process',
              'Attempt to circumvent security measures or access accounts that are not yours',
              'Use automated tools, bots, or scripts to interact with the platform',
              'Reverse-engineer, copy, or reproduce any part of the platform without our written consent',
              'Engage in money laundering, fraud, or any activity that contravenes Nigerian law',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 12 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">12. Intellectual property</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            All content on the Own2gether platform — including text, graphics, logos, page
            design, and software — is owned by or licensed to Own2gether and is protected by
            applicable intellectual property laws. You may not reproduce, distribute, or create
            derivative works from any platform content without our prior written consent.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">13. Disclaimers and liability</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            To the fullest extent permitted by Nigerian law:
          </p>
          <ul className="space-y-2">
            {[
              'The platform is provided "as is" without warranty of any kind, express or implied',
              'Own2gether does not warrant that the platform will be uninterrupted, error-free, or free from viruses or other harmful components',
              'Own2gether is not liable for any indirect, consequential, or incidental loss arising from your use of the platform',
              'Own2gether\'s total liability to you shall not exceed the amount, if any, that you have paid to Own2gether in cash in the 12 months preceding the claim',
              'Property valuations and raise amounts are estimates only and not guarantees of value',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 14 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">14. Termination</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            We reserve the right to suspend or terminate your account at any time if you breach
            these Terms, provide false information, or if we are required to do so by law. You
            may also close your account at any time by contacting us, subject to any outstanding
            obligations arising from active commitments or allocated stakes.
          </p>
        </section>

        {/* 15 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">
            15. Governing law and disputes
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of the Federal
            Republic of Nigeria. Any dispute arising from or in connection with these Terms or
            your use of Own2gether shall be subject to the exclusive jurisdiction of the
            competent courts of Nigeria. We encourage you to contact us first at{' '}
            <a href="mailto:sales@updates.own2gether.com" className="text-teal hover:underline">
              sales@updates.own2gether.com
            </a>{' '}
            to resolve any issue informally before initiating formal proceedings.
          </p>
        </section>

        {/* 16 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">16. Changes to these Terms</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            We may update these Terms from time to time. Material changes will be communicated
            by updating the effective date above and, where appropriate, by email notification.
            Continued use of the platform after the updated effective date constitutes your
            acceptance of the revised Terms.
          </p>
        </section>

        {/* 17 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">17. Contact</h2>
          <div className="bg-surface-raised border border-border rounded-xl p-6">
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              For questions about these Terms, contact us at:
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
