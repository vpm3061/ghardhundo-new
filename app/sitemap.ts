import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: properties } = await supabase
    .from('properties')
    .select('id, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: 'https://ghardhundo.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://ghardhundo.com/properties', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ]

  const propertyRoutes: MetadataRoute.Sitemap = (properties || []).map(p => ({
    url: `https://ghardhundo.com/property/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...propertyRoutes]
}
