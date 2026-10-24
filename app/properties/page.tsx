import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PhoneModal from '@/components/PhoneModal'
import BannerAd from '@/components/BannerAd'
import PropertiesClient from './PropertiesClient'
import type { Property } from '@/lib/supabase/types'
import { pageMetadata, SITE_DESCRIPTION } from '@/lib/seo'

export const metadata = pageMetadata('Flats, Plots & Rentals in Lucknow and Noida', SITE_DESCRIPTION, '/properties')

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('profiles').select('phone').eq('id', user.id).single()
    : { data: null }

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <>
      {user && profile && !profile.phone && <PhoneModal userId={user.id} />}
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <div className="mb-7">
          <h1 className="font-heading text-3xl font-800 text-[#111827]">Browse Properties</h1>
          <p className="text-[#6B7280] text-sm mt-1">{properties?.length || 0} active listings across cities and districts</p>
        </div>
        <div className="mb-6">
          <BannerAd position="properties_top" />
        </div>
        <PropertiesClient properties={(properties || []) as Property[]} userId={user?.id} initialTag={tag || ''} />
      </main>
      <MobileNav />
    </>
  )
}
