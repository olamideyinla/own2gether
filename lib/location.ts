/**
 * Location helpers for SEO city-level targeting.
 *
 * Listing/deal locations are stored as "Area, City" (e.g. "Lekki Phase 1, Lagos").
 * For search, the city is the strongest geo-qualifier, so we extract and surface
 * it explicitly in titles, descriptions, and visible copy.
 */

/** Returns the city portion of a location string ("Lekki Phase 1, Lagos" -> "Lagos"). */
export function extractCity(location: string): string {
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : location.trim()
}

/** Distinct cities from a list of locations, preserving first-seen order. */
export function uniqueCities(locations: string[]): string[] {
  const seen = new Set<string>()
  const cities: string[] = []
  for (const loc of locations) {
    const city = extractCity(loc)
    if (city && !seen.has(city.toLowerCase())) {
      seen.add(city.toLowerCase())
      cities.push(city)
    }
  }
  return cities
}

/** Human list: ["Lagos"] -> "Lagos"; ["Lagos","Abuja"] -> "Lagos and Abuja";
 *  ["Lagos","Abuja","Ibadan"] -> "Lagos, Abuja and Ibadan". */
export function formatCityList(cities: string[]): string {
  if (cities.length === 0) return ''
  if (cities.length === 1) return cities[0]
  return `${cities.slice(0, -1).join(', ')} and ${cities[cities.length - 1]}`
}
