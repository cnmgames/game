import type { MetadataRoute } from 'next'

const GAMES = ['truth', 'dice', 'flight', 'flight-pro', 'beast', 'gay', 'infinite-celsius', 'monopoly', 'posture', 'roleplay', 'senses', 'slot', 'strip-cards', 'telepathy']
const BASE_URL = 'https://love.ttla.top'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL + '/', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: BASE_URL + '/activate/', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]
  const gamePages = GAMES.map((slug) => ({
    url: `${BASE_URL}/${slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  return [...staticPages, ...gamePages]
}
