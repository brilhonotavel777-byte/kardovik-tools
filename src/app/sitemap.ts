import type { MetadataRoute } from 'next'
import { TOOLS_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: TOOLS_URL,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${TOOLS_URL}/precificacao`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${TOOLS_URL}/hora-clinica`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${TOOLS_URL}/ponto-de-equilibrio`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${TOOLS_URL}/rentabilidade`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${TOOLS_URL}/parcelamento`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
