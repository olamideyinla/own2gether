import { db } from '@/lib/db'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

type PageProps = { searchParams: Promise<Record<string, string | undefined>> }

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  let status: 'success' | 'invalid' | 'missing' = 'missing'

  if (token) {
    const subscriber = await db.subscriber.findUnique({
      where: { unsubscribeToken: token },
    }).catch(() => null)

    if (subscriber) {
      await db.subscriber.delete({ where: { id: subscriber.id } }).catch(() => null)
      status = 'success'
    } else {
      status = 'invalid'
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-6 py-24 text-center">
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-navy mb-2">Unsubscribed</h1>
            <p className="text-sm text-text-muted leading-relaxed">
              You have been removed from Own2gether notification emails. You will not receive
              any further emails about new listings or deals.
            </p>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-navy mb-2">Link not recognised</h1>
            <p className="text-sm text-text-muted leading-relaxed">
              This unsubscribe link has already been used or is no longer valid.
              If you continue to receive emails, contact us at{' '}
              <a href="mailto:sales@updates.own2gether.com" className="text-teal hover:underline">
                sales@updates.own2gether.com
              </a>.
            </p>
          </>
        )}

        {status === 'missing' && (
          <>
            <h1 className="text-xl font-bold text-navy mb-2">Invalid link</h1>
            <p className="text-sm text-text-muted">No unsubscribe token was provided.</p>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
