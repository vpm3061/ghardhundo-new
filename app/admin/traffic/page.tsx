import { createClient } from '@/lib/supabase/server'

export default async function TrafficPage() {
  const supabase = await createClient()

  const [
    { count: totalProperties },
    { count: totalLeads },
    { count: hotLeads },
    { count: totalUsers },
    { data: views },
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('tier', 'HOT'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('property_views').select('property_id, properties(title, city)'),
  ])

  const STATS = [
    { label: 'Total Properties', value: totalProperties || 0, icon: '🏢', color: '#3B82F6' },
    { label: 'Total Leads',      value: totalLeads || 0,      icon: '👥', color: '#F59E0B' },
    { label: 'HOT Leads',        value: hotLeads || 0,        icon: '⚡', color: '#EF4444' },
    { label: 'Total Users',      value: totalUsers || 0,      icon: '🙋', color: '#22C55E' },
  ]

  const counts: Record<string, { title: string; city: string; views: number }> = {}
  ;(views || []).forEach((v) => {
    const id = v.property_id
    const prop = Array.isArray(v.properties) ? v.properties[0] : v.properties
    if (!counts[id]) counts[id] = { title: prop?.title || 'Untitled', city: prop?.city || '', views: 0 }
    counts[id].views++
  })
  const mostViewed = Object.values(counts).sort((a, b) => b.views - a.views).slice(0, 10)

  const gaEmbedUrl = process.env.NEXT_PUBLIC_GA_EMBED_URL

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Site Traffic</h1>
        <p className="text-[#6B7280] text-sm mt-1">Live data from Supabase · Google Analytics for full traffic history</p>
      </div>

      {/* Google Analytics embed */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 mb-6">
        {gaEmbedUrl ? (
          <>
            <p className="text-xs text-[#9CA3AF] mb-3">Live data from Google Analytics — updates every 24 hours</p>
            <iframe
              src={gaEmbedUrl}
              width="100%"
              height={600}
              style={{ border: 0, borderRadius: 12 }}
              allowFullScreen
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📈</div>
            <p className="font-heading font-700 text-[#111827]">Google Analytics not connected yet</p>
            <p className="text-xs text-[#6B7280] mt-1">Add NEXT_PUBLIC_GA_EMBED_URL once the Looker Studio report is ready</p>
          </div>
        )}
      </div>

      {/* Quick stats from Supabase */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
            <div className="text-sm mb-1">{s.icon} <span className="text-xs font-600 text-[#6B7280]">{s.label}</span></div>
            <div className="font-heading text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Most viewed properties */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <h2 className="font-heading font-700 text-[#111827] mb-4">Most Viewed Properties</h2>
        <div className="space-y-2">
          {mostViewed.length === 0 && <p className="text-[#9CA3AF] text-sm">No views yet</p>}
          {mostViewed.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
              <div>
                <p className="text-sm font-600 text-[#111827]">{p.title}</p>
                <p className="text-xs text-[#6B7280]">{p.city}</p>
              </div>
              <span className="text-sm font-700" style={{ color: '#FB923C' }}>{p.views} views</span>
            </div>
          ))}
        </div>
      </div>

      {/* Direct GA link */}
      <div className="mt-6 text-center">
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-600 text-sm transition-all bg-orange-50 border border-orange-200 text-[#FB923C] hover:bg-orange-100"
        >
          📊 Open Full Google Analytics →
        </a>
      </div>
    </div>
  )
}
