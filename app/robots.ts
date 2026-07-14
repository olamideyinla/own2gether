import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/commitments/',
          '/sign-in',
          '/sign-up',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.own2gether.com/sitemap.xml',
  }
}
