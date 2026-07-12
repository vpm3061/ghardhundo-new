import { createClient } from '@/lib/supabase/server'

export default async function AdminExpertsPage() {
  const supabase = await createClient()

  const [{ data: subs }, { count: registeredCount }] = await Promise.all([
    supabase
      .from('expert_subscriptions')
      .select('*, profiles!expert_id(full_name, email, phone)')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .eq('role', 'expert').eq('expert_registered', true),
  ])

  const activeMRR = (subs || []).filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + (s.amount || 0), 0)

  return (
    <div>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-800 text-[#111827]">Experts</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {registeredCount || 0} registered · {subs?.length || 0} Pro subscriptions · MRR ₹{activeMRR.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {!subs || subs.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-5xl mb-3">🤝</div>
            <p className="font-heading font-700 text-[#111827]">No Pro subscriptions yet</p>
            <p className="text-sm text-[#6B7280] mt-1">Registered experts without Pro will show here once they subscribe.</p>
          </div>
        ) : subs.map(sub => {
          const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles
          return (
            <div key={sub.id} className="glass p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-600 text-sm" style={{ color: '#111827' }}>
                    {(profile as { full_name?: string } | null)?.full_name || 'Expert'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    {(profile as { email?: string } | null)?.email}
                    {(profile as { phone?: string } | null)?.phone && ` · ${(profile as { phone?: string }).phone}`}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: '#6B7280' }}>
                    <span className="font-700" style={{ color: '#FB923C' }}>{sub.plan}</span>
                    <span>·</span>
                    <span>₹{(sub.amount || 0).toLocaleString('en-IN')}</span>
                    {sub.expires_at && <><span>·</span><span>Expires {new Date(sub.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></>}
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
