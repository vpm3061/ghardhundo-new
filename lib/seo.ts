import type { Metadata } from 'next'

const configuredUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.orenzaa.com')
if (configuredUrl.hostname === 'orenzaa.com') configuredUrl.hostname = 'www.orenzaa.com'
export const SITE_URL = configuredUrl.origin
export const SITE_DESCRIPTION = 'Explore flats, plots, rental homes and commercial properties in Lucknow, Noida, Greater Noida and Ayodhya with Orenzaa.'

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Orenzaa`,
      description,
      url,
      siteName: 'Orenzaa',
      locale: 'en_IN',
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Orenzaa — Real Estate and PropTech' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Orenzaa`,
      description,
      images: ['/og-image.jpg'],
    },
  }
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
