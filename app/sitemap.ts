import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://orenzaa.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: origin,                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${origin}/properties`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${origin}/advertise`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${origin}/ai`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return staticRoutes

    const supabase = createClient(url, key)
    const { data: properties } = await supabase
      .from('properties')
      .select('id, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    const propertyUrls: MetadataRoute.Sitemap = (properties || []).map(p => ({
      url: `${origin}/property/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticRoutes, ...propertyUrls]
  } catch {
    return staticRoutes
  }
}
