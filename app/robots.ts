import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://orenzaa.com'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/admin'] },
    ],
    sitemap: `${origin}/sitemap.xml`,
  }
}
