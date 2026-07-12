import { createClient } from '@/lib/supabase/server'
import type { Banner } from '@/lib/supabase/types'

export default async function BannerAd({ position }: { position: Banner['position'] }) {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()

  const { data: banner } = await supabase
    .from('banners')
    .select('*')
    .eq('position', position)
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .limit(1)
    .maybeSingle()

  if (!banner) return null

  const b = banner as Banner

  return (
    <a href={b.link_url || '#'} target={b.link_url ? '_blank' : undefined} rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden border border-[#E5E7EB] transition-all hover:shadow-md">
      <img src={b.image_url} alt={b.title} className="w-full h-auto object-cover" />
    </a>
  )
}
