import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PhoneModal from '@/components/PhoneModal'
import LeadForm from '@/components/LeadForm'
import EMICalculator from '@/components/EMICalculator'
import NearbyInfo from '@/components/NearbyInfo'
import WhatsAppButton from '@/components/WhatsAppButton'
import PropertyDetailClient from './PropertyDetailClient'
import type { Property } from '@/lib/supabase/types'
import { generatePropertyTags, getShareTags } from '@/lib/property-tags'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: p } = await supabase
    .from('properties')
    .select('title, builder, sector, city, price_min, bhk, rera_number, description, photos')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!p) return { title: 'Property | GharDhundo' }

  const fmt = (n: number) => n >= 1e7 ? `${(n / 1e7).toFixed(1)}Cr` : `${(n / 1e5).toFixed(0)}L`
  const bhkStr = p.bhk?.join('/') || ''
  const location = [p.sector, p.city].filter(Boolean).join(', ')
  const priceStr = p.price_min ? `₹${fmt(p.price_min)}` : ''
  const title = `${p.title} — ${bhkStr ? bhkStr + ' BHK in ' : ''}${p.city || ''}`
  const description = [
    bhkStr && `${bhkStr} BHK flat`,
    location && `in ${location}`,
    priceStr && `Price: ${priceStr}`,
    p.rera_number && `RERA: ${p.rera_number}`,
    'Book free site visit.',
  ].filter(Boolean).join('. ')

  return {
    title,
    description,
    keywords: [
      bhkStr && `${bhkStr} BHK ${p.city}`,
      p.builder || '',
      p.sector && `${p.sector} flat`,
      p.rera_number || '',
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      images: p.photos?.[0] ? [p.photos[0]] : ['/og-image.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: p.photos?.[0] ? [p.photos[0]] : ['/og-image.jpg'],
    },
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()

  const { data: property } = await supabase
    .from('properties').select('*').eq('id', id).eq('is_active', true).single()

  if (!property) notFound()
  const p = property as Property

  const statusConfig: Record<string, { bg: string; color: string; border: string }> = {
    'Ready to Move':      { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.3)'  },
    'Under Construction': { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.3)'  },
    'New Launch':         { bg: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: 'rgba(124,58,237,0.35)' },
  }

  const fmt = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(0)}L` : `₹${n}`
  const priceStr = p.price_min && p.price_max ? `${fmt(p.price_min)} – ${fmt(p.price_max)}`
    : p.price_min ? `From ${fmt(p.price_min)}` : 'Price on request'

  const sc = p.status ? statusConfig[p.status] : null
  const allTags = generatePropertyTags(p)
  const shareTags = getShareTags(p)

  return (
    <>
      {profile && !profile.phone && <PhoneModal userId={user.id} />}
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#8B8BA8] mb-6">
          <a href="/properties" className="hover:text-[#F1F0FF] transition-colors">Properties</a>
          <span className="text-[#4A4A6A]">/</span>
          <span className="text-[#F1F0FF] truncate">{p.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2">
            <PropertyDetailClient photos={p.photos || []} />

            {/* Title & Meta */}
            <div className="mt-6 mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {sc && (
                  <span className="text-xs font-700 px-3 py-1 rounded-full"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    {p.status}
                  </span>
                )}
                {p.is_featured && (
                  <span className="text-xs font-800 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                    ⭐ Featured
                  </span>
                )}
                {p.rera_number && (
                  <span className="text-xs px-3 py-1 rounded-full text-[#8B8BA8]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    RERA: {p.rera_number}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="font-heading text-3xl font-800 text-[#F1F0FF]">{p.title}</h1>
                <WhatsAppButton
                  propertyTitle={p.title}
                  price={priceStr}
                  location={[p.sector, p.city].filter(Boolean).join(', ') || ''}
                  propertyId={p.id}
                  tags={shareTags}
                  className="shrink-0 mt-1"
                />
              </div>
              <p className="text-[#8B8BA8] text-sm">
                {[p.builder, p.sector, p.city].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* Price & Config */}
            <div className="glass p-5 mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div>
                  <div className="text-[#8B8BA8] text-xs mb-1 uppercase tracking-wider">Price Range</div>
                  <div className="font-heading text-xl font-800" style={{ color: '#A78BFA' }}>{priceStr}</div>
                </div>
                {p.bhk && p.bhk.length > 0 && (
                  <div>
                    <div className="text-[#8B8BA8] text-xs mb-1 uppercase tracking-wider">Configuration</div>
                    <div className="font-heading text-xl font-800 text-[#F1F0FF]">{p.bhk.join(', ')} BHK</div>
                  </div>
                )}
                {p.city && (
                  <div>
                    <div className="text-[#8B8BA8] text-xs mb-1 uppercase tracking-wider">Location</div>
                    <div className="font-700 text-[#F1F0FF]">{p.city}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {p.description && (
              <div className="mb-5">
                <h2 className="font-heading text-lg font-700 mb-3 text-[#F1F0FF]">About this project</h2>
                <p className="text-[#8B8BA8] text-sm leading-relaxed whitespace-pre-line">{p.description}</p>
              </div>
            )}

            {/* Amenities */}
            {p.amenities && p.amenities.length > 0 && (
              <div className="mb-5">
                <h2 className="font-heading text-lg font-700 mb-3 text-[#F1F0FF]">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {p.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2.5 text-sm text-[#8B8BA8] glass-2 px-3 py-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}>
                        ✓
                      </span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {allTags.length > 0 && (
              <div className="mb-5">
                <h2 className="font-heading text-sm font-700 mb-3 uppercase tracking-wider" style={{ color: '#4A4A6A' }}>Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <span key={tag}
                      className="text-xs font-600 px-3 py-1 rounded-full transition-all"
                      style={{ background: 'rgba(124,58,237,0.07)', color: '#7C5CBF', border: '1px solid rgba(124,58,237,0.14)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <NearbyInfo city={p.city} />
            <EMICalculator defaultAmount={p.price_min || 5000000} />
          </div>

          {/* Right — sticky form */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <LeadForm userId={user.id} propertyId={p.id} propertyTitle={p.title} />
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
