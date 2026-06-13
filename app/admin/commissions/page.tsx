import { createClient } from '@/lib/supabase/server'
import CommissionsClient from './CommissionsClient'

export default async function CommissionsPage() {
  const supabase = await createClient()
  const { data: commissions } = await supabase
    .from('commissions')
    .select('*, leads(name, phone, tier)')
    .order('created_at', { ascending: false })

  const { data: dealLeadsRaw } = await supabase
    .from('leads')
    .select('id, name, phone, tier, properties(title)')
    .eq('status', 'Deal Done')

  const total = commissions?.reduce((s, c) => s + (c.amount || 0), 0) || 0
  const received = commissions?.filter(c => c.status === 'Received').reduce((s, c) => s + (c.amount || 0), 0) || 0
  const pending = commissions?.filter(c => c.status === 'Pending').reduce((s, c) => s + (c.amount || 0), 0) || 0

  const dealLeads = (dealLeadsRaw || []).map(l => ({
    id: l.id as string,
    name: l.name as string,
    phone: l.phone as string,
    tier: l.tier as string | null,
    properties: Array.isArray(l.properties) ? l.properties[0] ?? null : l.properties as { title: string } | null,
  }))

  return (
    <div>
      <h1 className="font-heading text-2xl font-700 mb-6">Commission Tracker</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-3">
          <div className="text-[#888] text-xs mb-1">Total</div>
          <div className="font-heading text-lg font-700 text-[#E8FF47]">₹{total.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-3">
          <div className="text-green-400 text-xs mb-1">Received</div>
          <div className="font-heading text-lg font-700 text-green-400">₹{received.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-3">
          <div className="text-yellow-400 text-xs mb-1">Pending</div>
          <div className="font-heading text-lg font-700 text-yellow-400">₹{pending.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <CommissionsClient
        commissions={commissions || []}
        dealLeads={dealLeads}
      />
    </div>
  )
}
