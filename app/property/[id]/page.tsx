import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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
import OffersDisplay from '@/components/OffersDisplay'
import HeartButton from '@/components/HeartButton'
import BannerAd from '@/components/BannerAd'
import ViewTracker from './ViewTracker'
import VisitBookingModal from './VisitBookingModal'
import { isUUID } from '@/lib/is-uuid'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  if (!isUUID(id)) return { title: 'Property | Orenzaa' }

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

  if (!p) return { title: 'Property | Orenzaa' }

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
  if (!isUUID(id)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: property, error: propertyError }, { data: offersData }, profileResult, savedResult] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).eq('is_active', true).single(),
    supabase.from('offers').select('id, title, description, valid_till').eq('property_id', id).order('created_at'),
    user ? supabase.from('profiles').select('phone').eq('id', user.id).single() : Promise.resolve({ data: null }),
    user ? supabase.from('saved_properties').select('id').eq('user_id', user.id).eq('property_id', id).maybeSingle() : Promise.resolve({ data: null }),
  ])
  const profile = profileResult.data
  const savedRow = savedResult.data

  if (propertyError || !property) notFound()
  const p = property as Property
  const offers = offersData || []
  const isSaved = !!savedRow

  const statusConfig: Record<string, { bg: string; color: string; border: string }> = {
    'Ready to Move':      { bg: 'rgba(34,197,94,0.08)',  color: '#22C55E', border: 'rgba(34,197,94,0.25)'  },
    'Under Construction': { bg: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
    'New Launch':         { bg: 'rgba(251,146,60,0.08)', color: '#FB923C', border: 'rgba(251,146,60,0.25)' },
  }

  const fmt = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(0)}L` : `₹${n}`
  const priceStr = p.price_min && p.price_max ? `${fmt(p.price_min)} – ${fmt(p.price_max)}`
    : p.price_min ? `From ${fmt(p.price_min)}` : 'Price on request'

  const sc = p.status ? statusConfig[p.status] : null
  const allTags = generatePropertyTags(p)
  const shareTags = getShareTags(p)

  return (
    <>
      {user && profile && !profile.phone && <PhoneModal userId={user.id} />}
      <ViewTracker propertyId={p.id} userId={user?.id ?? null} />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
          <a href="/properties" className="hover:text-[#111827] transition-colors">Properties</a>
          <span className="text-[#9CA3AF]">/</span>
          <span className="text-[#111827] truncate">{p.title}</span>
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
                  <span className="text-xs font-800 px-3 py-1 rounded-full bg-orange-50 text-[#FB923C] border border-orange-200">
                    ⭐ Featured
                  </span>
                )}
                {p.rera_number && (
                  <span className="text-xs px-3 py-1 rounded-full text-[#22C55E] bg-green-50 border border-green-100">
                    RERA: {p.rera_number}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="font-heading text-3xl font-800 text-[#111827]">{p.title}</h1>
                <div className="flex items-center gap-2 shrink-0 mt-1">
                  <HeartButton propertyId={p.id} userId={user?.id} initialSaved={isSaved} />
                  <WhatsAppButton
                  propertyTitle={p.title}
                  price={priceStr}
                  location={[p.sector, p.city].filter(Boolean).join(', ') || ''}
                  propertyId={p.id}
                  tags={shareTags}
                />
                </div>
              </div>
              <p className="text-[#6B7280] text-sm">
                {[p.builder, p.sector, p.city].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* Price & Config */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div>
                  <div className="text-[#9CA3AF] text-xs mb-1 uppercase tracking-wider">Price Range</div>
                  <div className="font-heading text-xl font-800 text-[#FB923C]">{priceStr}</div>
                </div>
                {p.bhk && p.bhk.length > 0 && (
                  <div>
                    <div className="text-[#9CA3AF] text-xs mb-1 uppercase tracking-wider">Configuration</div>
                    <div className="font-heading text-xl font-800 text-[#111827]">{p.bhk.join(', ')} BHK</div>
                  </div>
                )}
                {p.city && (
                  <div>
                    <div className="text-[#9CA3AF] text-xs mb-1 uppercase tracking-wider">Location</div>
                    <div className="font-700 text-[#111827]">{p.city}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {p.description && (
              <div className="mb-5">
                <h2 className="font-heading text-lg font-700 mb-3 text-[#111827]">About this project</h2>
                <p className="text-[#6B7280] text-sm leading-relaxed whitespace-pre-line">{p.description}</p>
              </div>
            )}

            {/* Amenities */}
            {p.amenities && p.amenities.length > 0 && (
              <div className="mb-5">
                <h2 className="font-heading text-lg font-700 mb-3 text-[#111827]">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {p.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2.5 text-sm text-[#374151] bg-[#FAFAF9] border border-[#E5E7EB] rounded-xl px-3 py-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-orange-50 text-[#FB923C]">
                        ✓
                      </span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube embed */}
            {p.youtube_url && (() => {
              const ytId = p.youtube_url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)?.[1]
              return ytId ? (
                <div className="mb-5">
                  <h2 className="font-heading text-lg font-700 mb-3 text-[#111827]">Project Video</h2>
                  <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%', background: '#F5F5F4' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="Project Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              ) : null
            })()}

            {/* Offers */}
            <OffersDisplay offers={offers} />

            {/* Hashtags — clickable */}
            {allTags.length > 0 && (
              <div className="mb-5">
                <h2 className="font-heading text-sm font-700 mb-3 uppercase tracking-wider text-[#9CA3AF]">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <a key={tag} href={`/properties?tag=${encodeURIComponent(tag.replace('#', ''))}`}
                      className="text-xs font-600 px-3 py-1 rounded-full transition-all bg-orange-50 text-orange-600 border border-orange-100 hover:border-orange-300">
                      {tag}
                    </a>
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
              <VisitBookingModal userId={user?.id ?? null} propertyId={p.id} propertyTitle={p.title} />
              <LeadForm userId={user?.id ?? null} propertyId={p.id} propertyTitle={p.title} />
              <div className="mt-4">
                <BannerAd position="property_detail_side" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
