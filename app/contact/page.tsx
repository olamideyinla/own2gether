import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | Own2gether',
  description: 'Get in touch with the Own2gether team. Ask about listings, deals, the co-ownership process, or anything else.',
}

export default function ContactPage() {
  return (
    <>
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="mb-8">
          <p className="text-teal text-xs font-semibold uppercase tracking-widest mb-2">Contact</p>
          <h1 className="text-2xl font-bold text-navy mb-3">Get in touch</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Have a question about a listing, a deal, the co-ownership process, or a property you
            would like to see on the platform? Drop us a message and we will get back to you.
          </p>
        </div>

        <ContactForm />

        <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-6 text-xs text-text-muted">
          <div>
            <p className="font-semibold text-navy mb-0.5">Email</p>
            <a href="mailto:sales@updates.own2gether.com" className="hover:text-navy transition-colors">
              sales@updates.own2gether.com
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
