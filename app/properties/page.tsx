import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PhoneModal from '@/components/PhoneModal'
import PropertiesClient from './PropertiesClient'
import type { Property } from '@/lib/supabase/types'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <>
      {profile && !profile.phone && <PhoneModal userId={user.id} />}
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <div className="mb-7">
          <h1 className="font-heading text-3xl font-800 text-[#F1F0FF]">Browse Properties</h1>
          <p className="text-[#8B8BA8] text-sm mt-1">{properties?.length || 0} active listings across 4 cities</p>
        </div>
        <PropertiesClient properties={(properties || []) as Property[]} userId={user.id} />
      </main>
      <MobileNav />
    </>
  )
}
