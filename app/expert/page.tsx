import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ExpertClient from './ExpertClient'
import type { Metadata } from 'next'
import type { Property } from '@/lib/supabase/types'
import type { DealerAudit, DealerAuditLead } from '@/lib/dealer-audit'
import { EMPTY_DEALER_AUDIT } from '@/lib/dealer-audit'

export const metadata: Metadata = { title: 'Expert Dashboard | Orenzaa' }

export default async function ExpertPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/expert')

  const { data: gateProfile, error: gateError } = await supabase.from('profiles')
    .select('expert_registered, is_partner').eq('id', user.id).single()

  if (gateError) {
    console.error('[expert] gate profile fetch failed', gateError)
  }

  const isRegisteredExpert = gateProfile?.expert_registered === true || gateProfile?.is_partner === true

  if (!gateError && !isRegisteredExpert) {
    redirect('/list-property')
  }

  const [{ data: profile }, { data: properties }, { data: subData }] = await Promise.all([
    supabase.from('profiles')
      .select('full_name, email, phone, whatsapp_number, avatar_url, role, verification_status, city, experience_years, rera_number')
      .eq('id', user.id).single(),
    supabase.from('properties').select('*').eq('listed_by', user.id).order('created_at', { ascending: false }),
    supabase.from('expert_subscriptions').select('plan, status, expires_at').eq('expert_id', user.id).eq('status', 'Active').limit(1),
  ])

  const propIds = (properties || []).map(p => p.id)

  const [{ data: auditData }, { data: views }] = await Promise.all([
    supabase.rpc('get_dealer_audit'),
    propIds.length > 0
      ? supabase.from('property_views').select('property_id, viewed_at').in('property_id', propIds)
      : Promise.resolve({ data: [] as { property_id: string; viewed_at: string }[] }),
  ])
  const audit = (auditData || EMPTY_DEALER_AUDIT) as DealerAudit
  const leads = ((audit.leads || []) as DealerAuditLead[]).map(l => ({
    id: l.id,
    buyer_label: `User #${l.id.slice(-4).toUpperCase()}`,
    phoneMasked: l.phone_masked,
    message: null as string | null,
    created_at: l.created_at,
    property_id: l.property_id ?? null,
    ai_score: l.ai_score,
    tier: l.tier,
    propertyTitle: l.property_title,
  }))

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const viewsThisMonth = (views || []).filter(v => new Date(v.viewed_at) >= startOfMonth)
  const leadsThisMonth = leads.filter(l => new Date(l.created_at) >= startOfMonth)

  const viewCounts: Record<string, number> = {}
  ;(views || []).forEach(v => { viewCounts[v.property_id] = (viewCounts[v.property_id] || 0) + 1 })
  const topViewedId = Object.entries(viewCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const mostViewedProperty = (properties || []).find(p => p.id === topViewedId) ?? null

  const analytics = {
    viewsThisMonth: viewsThisMonth.length,
    enquiriesThisMonth: leadsThisMonth.length,
    mostViewedTitle: mostViewedProperty?.title ?? null,
    mostViewedCount: topViewedId ? viewCounts[topViewedId] : 0,
    conversionRate: viewsThisMonth.length > 0
      ? Math.round((leadsThisMonth.length / viewsThisMonth.length) * 1000) / 10
      : 0,
  }

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
          whatsappNumber={profile?.whatsapp_number || null}
          avatarUrl={profile?.avatar_url || null}
          verificationStatus={profile?.verification_status || 'none'}
          city={profile?.city || null}
          experienceYears={profile?.experience_years || null}
          reraNumber={profile?.rera_number || null}
          properties={(properties || []) as Property[]}
          leads={leads}
          isSubscribed={!!(subData && subData.length > 0)}
          activePlan={subData?.[0]?.plan ?? null}
          planExpiry={subData?.[0]?.expires_at ?? null}
          analytics={analytics}
          audit={audit}
        />
      </main>
      <MobileNav />
    </>
  )
}
