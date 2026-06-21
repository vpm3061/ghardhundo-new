import { createClient } from '@/lib/supabase/server'

export default async function AdminBuildersPage() {
  const supabase = await createClient()

  const { data: pkgs } = await supabase
    .from('builder_packages')
    .select('*, profiles!builder_id(full_name, email, phone)')
    .order('created_at', { ascending: false })

  const activeMRR = (pkgs || []).filter(p => p.status === 'Active')
    .reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-800 text-[#111827]">Builders</h1>
          <p className="text-[#6B7280] text-sm mt-1">{pkgs?.length || 0} builder packages · MRR ₹{activeMRR.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {!pkgs || pkgs.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-5xl mb-3">🏗️</div>
            <p className="font-heading font-700 text-[#111827]">No builder packages yet</p>
          </div>
        ) : pkgs.map(pkg => {
          const profile = Array.isArray(pkg.profiles) ? pkg.profiles[0] : pkg.profiles
          return (
            <div key={pkg.id} className="glass p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-600 text-sm" style={{ color: '#111827' }}>
                    {(profile as { full_name?: string } | null)?.full_name || 'Builder'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    {(profile as { email?: string } | null)?.email}
                    {(profile as { phone?: string } | null)?.phone && ` · ${(profile as { phone?: string }).phone}`}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: '#6B7280' }}>
                    <span className="font-700" style={{ color: '#FB923C' }}>{pkg.plan}</span>
                    <span>·</span>
                    <span>₹{(pkg.amount || 0).toLocaleString('en-IN')}/mo</span>
                    <span>·</span>
                    <span>{pkg.listing_limit === 999 ? '∞' : pkg.listing_limit} listings</span>
                    {pkg.expires_at && <><span>·</span><span>Expires {new Date(pkg.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></>}
                  </div>
                </div>
                <span className="text-xs font-700 px-2.5 py-1 rounded-full shrink-0"
                  style={pkg.status === 'Active'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: 'rgba(0,0,0,0.03)', color: '#9CA3AF', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {pkg.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
