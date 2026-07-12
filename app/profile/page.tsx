import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ProfileClient from './ProfileClient'
import type { Metadata } from 'next'
import type { Property } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/profile')

  const [
    { data: profile },
    { data: enquiries },
    { data: savedRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, email, phone, whatsapp_number, avatar_url, role, verification_status').eq('id', user.id).single(),
    supabase.from('leads').select('id, name, tier, ai_score, status, created_at, properties(title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('saved_properties').select('property_id, properties(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const enquiriesTyped = (enquiries || []).map(e => ({
    id: e.id as string,
    name: e.name as string,
    tier: e.tier as string | null,
    ai_score: e.ai_score as number,
    status: e.status as string,
    created_at: e.created_at as string,
    propertyTitle: Array.isArray(e.properties)
      ? (e.properties[0] as { title: string } | null)?.title ?? null
      : (e.properties as { title: string } | null)?.title ?? null,
  }))

  const savedProperties = (savedRaw || []).map(r => {
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties
    return prop as Property | null
  }).filter(Boolean) as Property[]

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <ProfileClient
          userId={user.id}
          email={user.email || ''}
          fullName={profile?.full_name || null}
          phone={profile?.phone || null}
          whatsappNumber={profile?.whatsapp_number || null}
          avatarUrl={profile?.avatar_url || null}
          role={profile?.role || 'buyer'}
          verificationStatus={profile?.verification_status || 'none'}
          enquiries={enquiriesTyped}
          savedProperties={savedProperties}
        />
      </main>
      <MobileNav />
    </>
  )
}
