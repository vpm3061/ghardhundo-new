import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PhoneModal from '@/components/PhoneModal'
import PropertiesClient from './PropertiesClient'
import type { Property } from '@/lib/supabase/types'

export const metadata = {
  title: 'Properties in Lucknow & Noida | Orenzaa',
  description: 'Browse RERA verified flats, plots and apartments in Lucknow, Noida, Greater Noida and Ayodhya. AI matched properties. Free site visit.',
  keywords: '2BHK Lucknow, flats Noida, RERA verified property, buy flat Lucknow, property in Noida',
}

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
          <p className="text-[#6B7280] text-sm mt-1">{properties?.length || 0} active listings across 4 cities</p>
        </div>
        <PropertiesClient properties={(properties || []) as Property[]} userId={user?.id} initialTag={tag || ''} />
      </main>
      <MobileNav />
    </>
  )
}
