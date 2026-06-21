import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import OwnerClient from './OwnerClient'

export default async function OwnerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['owner', 'admin'].includes(profile.role)) redirect('/owner/list')

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('created_by', user.id)
    .eq('listing_type', 'owner')
    .order('created_at', { ascending: false })

  const propIds = (properties || []).map(p => p.id)

  const { data: enquiries } = propIds.length > 0
    ? await supabase.from('leads').select('*, properties(title)').in('property_id', propIds).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <OwnerClient
          userId={user.id}
          properties={properties || []}
          enquiries={enquiries || []}
        />
      </main>
      <MobileNav />
    </>
  )
}
