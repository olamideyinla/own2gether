import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { JsonLd } from '@/components/JsonLd'
import './globals.css'

const SITE_URL = 'https://www.own2gether.com'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Own2gether — Fractional Property Co-Ownership in Nigeria',
    template: '%s — Own2gether',
  },
  description:
    'Pool funds with others to co-own real property in Nigeria. Fractional, co-ownership for local and diaspora investors — registered shares in a property company, no fund, no cash fees. Browse open raises in naira (NGN).',
  keywords: [
    'fractional property ownership Nigeria',
    'co-own property in Nigeria',
    'buy property together',
    'property co-ownership',
    'fractional real estate investment',
    'invest in Nigerian property from abroad',
    'co-investment property deals Lagos',
    'own property with others',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Own2gether',
    url: SITE_URL,
    title: 'Own2gether — Fractional Property Co-Ownership in Nigeria',
    description:
      'Pool funds with others to co-own real property in Nigeria. Fractional co-ownership for local and diaspora investors — no fund, no cash fees.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Own2gether — Fractional Property Co-Ownership in Nigeria',
    description:
      'Pool funds with others to co-own real property in Nigeria. No fund, no cash fees.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Own2gether',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    'Nigerian property co-ownership and co-investment platform. Pool funds to co-own real property, or co-invest in development deals.',
  areaServed: 'NG',
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Own2gether',
  url: SITE_URL,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="bg-surface-raised font-sans text-text-primary antialiased min-h-screen">
        <JsonLd data={[organizationLd, websiteLd]} />
        {children}
      </body>
    </html>
  )
}
