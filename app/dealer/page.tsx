import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import DealerClient from './DealerClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dealer Dashboard' }

export default async function DealerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: leadsRaw },
    { data: reveals },
    { data: subscription },
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('id, name, budget, city, timeline, purpose, ai_score, tier, created_at, loan_status, bhk, phone, properties(title)')
      .in('tier', ['WARM', 'COLD'])
      .order('ai_score', { ascending: false }),
    supabase.from('lead_reveals').select('lead_id').eq('dealer_id', user.id),
    supabase.from('dealer_subscriptions')
      .select('id, plan, leads_limit, leads_used, started_at, expires_at, status, amount')
      .eq('dealer_id', user.id).eq('status', 'Active').limit(1),
  ])

  const revealedIds = new Set((reveals || []).map(r => r.lead_id))
  const sub = subscription?.[0] ?? null

  /* Resolve property title */
  const leads = (leadsRaw || []).map(lead => ({
    ...lead,
    propertyTitle: Array.isArray(lead.properties)
      ? (lead.properties[0] as { title: string } | null)?.title ?? null
      : (lead.properties as { title: string } | null)?.title ?? null,
  }))

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <DealerClient
          userId={user.id}
          leads={leads}
          revealedIds={Array.from(revealedIds) as string[]}
          subscription={sub}
        />
      </main>
      <MobileNav />
    </>
  )
}
