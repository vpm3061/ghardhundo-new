import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ExpertClient from './ExpertClient'
import type { Metadata } from 'next'
import type { Property } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Expert Dashboard | Orenzaa' }

export default async function ExpertPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/expert')

  const [{ data: profile }, { data: properties }, { data: subData }, { data: partnerData }] = await Promise.all([
    supabase.from('profiles').select('full_name, email, phone, avatar_url, role, is_partner, verification_status').eq('id', user.id).single(),
    supabase.from('properties').select('*').eq('listed_by', user.id).order('created_at', { ascending: false }),
    supabase.from('expert_subscriptions').select('plan, status, expires_at').eq('expert_id', user.id).eq('status', 'Active').limit(1),
    supabase.from('partner_applications').select('status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
  ])

  const propIds = (properties || []).map(p => p.id)
  const { data: leads } = propIds.length > 0
    ? await supabase.from('leads').select('id, name, phone, message, created_at, property_id').in('property_id', propIds).order('created_at', { ascending: false })
    : { data: [] as { id: string; name: string; phone: string; message: string | null; created_at: string; property_id: string | null }[] }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <div className="mb-6">
          <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#FB923C' }}>
            Expert Dashboard
          </div>
          <h1 className="font-heading text-3xl font-800" style={{ color: '#111827' }}>
            {profile?.full_name || 'Property Expert'}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{profile?.email}</p>
        </div>

        <ExpertClient
          userId={user.id}
          fullName={profile?.full_name || null}
          email={profile?.email || user.email || ''}
          phone={profile?.phone || null}
          avatarUrl={profile?.avatar_url || null}
          verificationStatus={profile?.verification_status || 'none'}
          properties={(properties || []) as Property[]}
          leads={leads || []}
          isSubscribed={!!(subData && subData.length > 0)}
          activePlan={subData?.[0]?.plan ?? null}
          planExpiry={subData?.[0]?.expires_at ?? null}
          isPartner={profile?.is_partner ?? false}
          partnerAppStatus={(partnerData?.[0]?.status as string | null) ?? null}
        />
      </main>
      <MobileNav />
    </>
  )
}
