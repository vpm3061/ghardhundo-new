import { createClient } from '@/lib/supabase/server'

export default async function AdminDealersPage() {
  const supabase = await createClient()

  const { data: subs } = await supabase
    .from('dealer_subscriptions')
    .select('*, profiles!dealer_id(full_name, email, phone)')
    .order('created_at', { ascending: false })

  const activeMRR = (subs || []).filter(s => s.status === 'Active')
    .reduce((t, s) => t + (s.amount || 0), 0)

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Dealers</h1>
        <p className="text-[#6B7280] text-sm mt-1">{subs?.length || 0} subscriptions · MRR ₹{activeMRR.toLocaleString('en-IN')}</p>
      </div>

      <div className="space-y-2">
        {!subs || subs.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-5xl mb-3">📊</div>
            <p className="font-heading font-700 text-[#111827]">No dealer subscriptions yet</p>
          </div>
        ) : subs.map(sub => {
          const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles
          const leadsUsed  = sub.leads_used  || 0
          const leadsLimit = sub.leads_limit || 5
          return (
            <div key={sub.id} className="glass p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-600 text-sm" style={{ color: '#111827' }}>
                    {(profile as { full_name?: string } | null)?.full_name || 'Dealer'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    {(profile as { email?: string } | null)?.email}
                    {(profile as { phone?: string } | null)?.phone && ` · ${(profile as { phone?: string }).phone}`}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: '#6B7280' }}>
                    <span className="font-700" style={{ color: '#FB923C' }}>{sub.plan}</span>
                    <span>·</span>
                    <span>₹{(sub.amount || 0).toLocaleString('en-IN')}/mo</span>
                    <span>·</span>
                    <span>{leadsUsed}/{leadsLimit} leads used</span>
                    {sub.expires_at && <><span>·</span><span>Exp {new Date(sub.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></>}
                  </div>
                  <div className="mt-2 w-32 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min((leadsUsed / leadsLimit) * 100, 100)}%`,
                      background: leadsUsed >= leadsLimit ? '#EF4444' : '#FB923C',
                    }} />
                  </div>
                </div>
                <span className="text-xs font-700 px-2.5 py-1 rounded-full shrink-0"
                  style={sub.status === 'Active'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: 'rgba(0,0,0,0.03)', color: '#9CA3AF', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {sub.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
