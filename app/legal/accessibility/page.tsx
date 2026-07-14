export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const STATEMENT_DATE = 'June 2026'

export default function AccessibilityPage() {
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
            / Accessibility
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Accessibility Statement
          </h1>
          <p className="text-white/70 text-sm">Statement date: {STATEMENT_DATE}</p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-12">

        {/* 1 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">1. Our commitment</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Own2gether is committed to making this website accessible to all users, regardless
            of ability or the technology they use to browse the web. We believe that access to
            financial services and property co-ownership should not be limited by disability.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed mt-3">
            We aim to meet the{' '}
            <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>, published
            by the World Wide Web Consortium (W3C). These guidelines are the internationally
            recognised benchmark for web accessibility.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">2. Technical features</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            The following technical choices support accessibility across the platform:
          </p>
          <div className="space-y-3">
            {([
              {
                title: 'Semantic HTML',
                detail:
                  'Page structure uses appropriate HTML elements — headings, lists, tables, buttons, links, and form labels — so screen readers can interpret content correctly.',
              },
              {
                title: 'Keyboard navigation',
                detail:
                  'All interactive elements (links, buttons, form fields, dropdowns) are reachable and operable using the keyboard alone. Focus states are visible.',
              },
              {
                title: 'Colour contrast',
                detail:
                  'Text and interactive elements meet or exceed the WCAG 2.1 AA contrast ratio requirements (4.5:1 for normal text, 3:1 for large text and UI components).',
              },
              {
                title: 'Text resizing',
                detail:
                  'The layout is responsive and remains readable when text is scaled up to 200% using browser zoom, without loss of content or functionality.',
              },
              {
                title: 'ARIA attributes',
                detail:
                  'Where HTML semantics alone are insufficient, we use ARIA (Accessible Rich Internet Applications) roles and attributes to communicate state and purpose to assistive technologies.',
              },
              {
                title: 'Decorative images',
                detail:
                  'Images that are purely decorative carry an empty alt attribute (alt="") so screen readers skip them. Meaningful images carry descriptive alt text.',
              },
              {
                title: 'Form labels',
                detail:
                  'Every form input has an associated visible label or accessible name. Error messages are associated with the relevant field and announced to screen readers.',
              },
              {
                title: 'No reliance on colour alone',
                detail:
                  'We do not convey information using colour as the only visual means of distinction. Status badges, icons, and text labels supplement colour coding.',
              },
              {
                title: 'Readable fonts',
                detail:
                  'We use IBM Plex Sans — a humanist sans-serif typeface designed for screen legibility — across all body copy.',
              },
            ] as { title: string; detail: string }[]).map(({ title, detail }) => (
              <div key={title} className="border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-navy mb-1">{title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">3. Known limitations</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            While we aim for full WCAG 2.1 AA compliance, we recognise that some areas of the
            platform may not yet meet all criteria. Known or potential limitations include:
          </p>
          <ul className="space-y-2 mb-4">
            {[
              'Uploaded identity and payment documents (PDFs, images) are submitted by users and may not themselves be accessible',
              'Complex data tables (e.g. commitment ranking tables) may be difficult to navigate on certain older screen readers',
              'Some third-party infrastructure components (hosting, blob storage) are outside our direct control',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary leading-relaxed">
            We are actively working to identify and address accessibility issues as they are
            discovered. If you encounter a barrier, please tell us (see section 4 below) and
            we will prioritise a fix.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">4. Feedback and contact</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            If you experience any accessibility issues on this website, or if you need content
            in an alternative format, please contact us:
          </p>
          <div className="bg-surface-raised border border-border rounded-xl p-6 space-y-2">
            <p className="text-sm text-text-secondary">
              <strong className="text-navy">Email:</strong>{' '}
              <a href="mailto:sales@updates.own2gether.com" className="text-teal hover:underline">
                sales@updates.own2gether.com
              </a>
            </p>
            <p className="text-sm text-text-secondary">
              <strong className="text-navy">Alternative:</strong>{' '}
              <a href="mailto:sales@updates.own2gether.com" className="text-teal hover:underline">
                sales@updates.own2gether.com
              </a>
            </p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mt-4">
            We aim to acknowledge accessibility feedback within 5 business days and resolve
            issues within 30 days where technically feasible.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">5. Assessment approach</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Own2gether assesses the accessibility of this website using the following methods:
          </p>
          <ul className="space-y-2">
            {[
              'Self-evaluation against WCAG 2.1 Level AA success criteria during development',
              'Manual keyboard-only navigation testing',
              'Testing with screen reader software (VoiceOver on macOS/iOS)',
              'Browser developer tools for colour contrast and DOM inspection',
              'Periodic reviews when significant new features are released',
            ].map(item => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-teal shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-base font-bold text-navy mb-4">6. Updates to this statement</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This Accessibility Statement was prepared in {STATEMENT_DATE}. We review and update
            it when significant changes are made to the platform. If you have suggestions for
            how we can improve, we welcome your feedback.
          </p>
        </section>

      </main>

      <Footer />
    </>
  )
}
