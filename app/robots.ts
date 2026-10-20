import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const origin = SITE_URL
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/auth/'] },
    ],
    sitemap: `${origin}/sitemap.xml`,
  }
}
