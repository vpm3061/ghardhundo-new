import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import BuilderClient from './BuilderClient'
import type { Property } from '@/lib/supabase/types'
import type { Metadata } from 'next'
import type { DealerAudit } from '@/lib/dealer-audit'
import { EMPTY_DEALER_AUDIT } from '@/lib/dealer-audit'

export const metadata: Metadata = { title: 'Builder Dashboard' }

export default async function BuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/builder')

  const [{ data: profile }, { data: properties }, { data: pkgData }, { data: auditData }] = await Promise.all([
    supabase.from('profiles').select('full_name, email, role').eq('id', user.id).single(),
    supabase.from('properties').select('*').eq('listed_by', user.id).order('created_at', { ascending: false }),
    supabase.from('builder_packages').select('*').eq('builder_id', user.id).eq('status', 'Active').limit(1),
    supabase.rpc('get_dealer_audit'),
  ])

  const isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!isAdmin && profile?.role !== 'builder') redirect('/list-property')

  const pkg = pkgData?.[0]
  type Plan = 'Basic' | 'Standard' | 'Premium'
  const PLAN_LIMITS: Record<Plan, number> = { Basic: 2, Standard: 10, Premium: 999 }
  const plan: Plan = (pkg?.plan as Plan) || 'Basic'
  const listingLimit = pkg?.listing_limit ?? PLAN_LIMITS[plan]
  const listingCount = properties?.length || 0
  const propIds = (properties || []).map(p => p.id)
  const audit = (auditData || EMPTY_DEALER_AUDIT) as DealerAudit

  /* View & lead counts per property */
  const [{ data: viewCounts }] = await Promise.all([
    propIds.length > 0
      ? supabase.from('property_views').select('property_id').in('property_id', propIds)
      : Promise.resolve({ data: [] }),
  ])

  const viewMap: Record<string, number> = {}
  ;(viewCounts || []).forEach((v: { property_id: string }) => {
    viewMap[v.property_id] = (viewMap[v.property_id] || 0) + 1
  })
  const propStats = (properties || []).map(p => ({
    id:     p.id,
    title:  p.title.length > 20 ? p.title.slice(0, 18) + '…' : p.title,
    views:  viewMap[p.id] || 0,
    leads:  audit.properties.find(metric => metric.id === p.id)?.vip_passes || 0,
  }))

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <div className="mb-6">
          <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#FB923C' }}>Builder Dashboard</div>
          <h1 className="font-heading text-3xl font-800" style={{ color: '#111827' }}>
            {profile?.full_name || 'Builder'}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{profile?.email}</p>
        </div>

        <BuilderClient
          properties={(properties || []) as Property[]}
          plan={plan}
          listingCount={listingCount}
          listingLimit={listingLimit}
          propStats={propStats}
          pkgExpiry={pkg?.expires_at ?? null}
          audit={audit}
        />
      </main>
      <MobileNav />
    </>
  )
}
