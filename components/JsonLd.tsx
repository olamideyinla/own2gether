/**
 * Renders a JSON-LD structured-data script tag.
 * Google reads this to understand the entity/content of the page and to
 * enable rich results (breadcrumbs, FAQ, organization knowledge panel, etc.).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Content is server-generated from our own data, not user input rendered as HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
