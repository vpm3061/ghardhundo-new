import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dealer/', '/list/'],
      },
    ],
    sitemap: 'https://ghardhundo.com/sitemap.xml',
  }
}
