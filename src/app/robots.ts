import type { MetadataRoute } from 'next'
import { TOOLS_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${TOOLS_URL}/sitemap.xml`,
  }
}
