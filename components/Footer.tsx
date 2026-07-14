import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-xs text-text-muted space-y-1 mb-5">
          <p>Own2gether is not a financial adviser. Nothing on this platform constitutes financial advice.</p>
          <p>All transactions are denominated in Nigerian naira (NGN). USD/GBP figures shown are indicative only.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-xs">
          <Link href="/contact"             className="text-text-muted hover:text-navy transition-colors">Contact Us</Link>
          <Link href="/legal/privacy"       className="text-text-muted hover:text-navy transition-colors">Privacy Policy</Link>
          <Link href="/legal/terms"         className="text-text-muted hover:text-navy transition-colors">Terms &amp; Conditions</Link>
          <Link href="/legal/cookies"       className="text-text-muted hover:text-navy transition-colors">Cookie Policy</Link>
          <Link href="/legal/accessibility" className="text-text-muted hover:text-navy transition-colors">Accessibility</Link>
        </div>
      </div>
    </footer>
  )
}
