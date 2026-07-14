import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const revalidate = 3600 // regenerate at most once per hour

const BASE = 'https://www.own2gether.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, deals] = await Promise.all([
    db.property.findMany({
      where:   { status: { not: 'cancelled' } },
      select:  { id: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    // Wrapped in try/catch — Deal table may not exist yet if migration is pending
    db.deal.findMany({
      where:   { status: { notIn: ['cancelled'] } },
      select:  { id: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }).catch(() => [] as { id: string; createdAt: Date }[]),
  ])

  const propertyEntries: MetadataRoute.Sitemap = properties.map(p => ({
    url:             `${BASE}/listings/${p.id}`,
    lastModified:    p.createdAt,
    changeFrequency: 'daily',
    priority:        0.8,
  }))

  const dealEntries: MetadataRoute.Sitemap = deals.map(d => ({
    url:             `${BASE}/deals/${d.id}`,
    lastModified:    d.createdAt,
    changeFrequency: 'weekly',
    priority:        0.8,
  }))

  return [
    {
      url:             BASE,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${BASE}/listings`,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        0.9,
    },
    ...propertyEntries,
    {
      url:             `${BASE}/deals`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    ...dealEntries,
    {
      url:             `${BASE}/how-it-works`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.7,
    },
    {
      url:             `${BASE}/about`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.6,
    },
    {
      url:             `${BASE}/contact`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.5,
    },
    {
      url:             `${BASE}/legal`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.4,
    },
    {
      url:             `${BASE}/legal/privacy`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.4,
    },
    {
      url:             `${BASE}/legal/terms`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.4,
    },
    {
      url:             `${BASE}/legal/cookies`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.3,
    },
    {
      url:             `${BASE}/legal/accessibility`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.3,
    },
  ]
}
