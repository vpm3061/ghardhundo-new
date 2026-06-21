import { createClient } from '@/lib/supabase/server'
import CommissionsClient from './CommissionsClient'

export default async function CommissionsPage() {
  const supabase = await createClient()

  const [
    { data: commissionsRaw },
    { data: dealLeadsRaw },
    { data: dealerSubsRaw },
    { data: shareEarnRaw },
    { data: coinConvRaw },
  ] = await Promise.all([
    supabase.from('commissions').select('*, leads(name, phone, tier)').order('created_at', { ascending: false }),
    supabase.from('leads').select('id, name, phone, tier, properties(title)').eq('status', 'Deal Done'),
    supabase.from('dealer_subscriptions').select('*, profiles!dealer_id(full_name, email)').order('created_at', { ascending: false }),
    supabase.from('referrals').select('*, profiles!referrer_id(full_name, email), leads(deal_amount, properties(title))').order('created_at', { ascending: false }),
    supabase.from('coin_conversions').select('*, profiles!user_id(full_name, email)').order('created_at', { ascending: false }),
  ])

  const dealLeads = (dealLeadsRaw || []).map(l => ({
    id: l.id as string,
    name: l.name as string,
    phone: l.phone as string,
    tier: l.tier as string | null,
    properties: Array.isArray(l.properties) ? (l.properties[0] as { title: string } | null) : (l.properties as { title: string } | null),
  }))

  return (
    <div>
      <h1 className="font-heading text-2xl font-700 mb-6" style={{ color: '#111827' }}>Revenue Dashboard</h1>
      <CommissionsClient
        commissions={(commissionsRaw || []) as Parameters<typeof CommissionsClient>[0]['commissions']}
        dealLeads={dealLeads}
        dealerSubs={(dealerSubsRaw || []) as Parameters<typeof CommissionsClient>[0]['dealerSubs']}
        shareEarn={(shareEarnRaw || []) as Parameters<typeof CommissionsClient>[0]['shareEarn']}
        coinConversions={(coinConvRaw || []) as Parameters<typeof CommissionsClient>[0]['coinConversions']}
      />
    </div>
  )
}
