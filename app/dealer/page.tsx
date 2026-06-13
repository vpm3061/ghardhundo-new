import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import RevealButton from './RevealButton'

export default async function DealerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, budget, city, timeline, purpose, ai_score, tier, created_at, properties(title)')
    .in('tier', ['WARM', 'COLD'])
    .order('ai_score', { ascending: false })

  const { data: reveals } = await supabase.from('lead_reveals').select('lead_id').eq('dealer_id', user.id)
  const { data: coins } = await supabase.from('coins').select('amount, type').eq('user_id', user.id)

  const balance = (coins || []).reduce((s, c) => s + (c.type === 'earned' ? c.amount : -c.amount), 0)
  const revealedIds = new Set((reveals || []).map(r => r.lead_id))

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-800 text-[#F1F0FF] mb-1">Buyer Leads</h1>
            <p className="text-[#8B8BA8] text-sm">Reveal contacts using coins. Each reveal costs 10 🪙</p>
          </div>
          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <span>🪙</span>
            <span className="font-heading font-800 text-lg" style={{ color: '#A78BFA' }}>{balance}</span>
            <span className="text-xs text-[#8B8BA8]">coins</span>
          </div>
        </div>

        {(!leads || leads.length === 0) ? (
          <div className="text-center py-20 glass">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-heading text-xl font-700 text-[#F1F0FF] mb-2">No leads yet</h3>
            <p className="text-[#8B8BA8]">Check back soon as buyers submit inquiries.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map(lead => {
              const tierColor = lead.tier === 'WARM' ? '#F59E0B' : '#3B82F6'
              const tierBg = lead.tier === 'WARM' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)'
              const tierBorder = lead.tier === 'WARM' ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)'
              return (
                <div key={lead.id} className="glass p-5 hover:border-white/[0.12] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-700 px-2.5 py-1 rounded-full"
                          style={{ background: tierBg, color: tierColor, border: `1px solid ${tierBorder}` }}>
                          {lead.tier}
                        </span>
                        <span className="font-heading font-800 text-sm" style={{ color: '#A78BFA' }}>
                          Score: {lead.ai_score}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Budget',   value: lead.budget   },
                          { label: 'City',     value: lead.city     },
                          { label: 'Timeline', value: lead.timeline },
                          { label: 'Purpose',  value: lead.purpose  },
                        ].filter(i => i.value).map(({ label, value }) => (
                          <div key={label}>
                            <div className="text-[#4A4A6A] text-[10px] uppercase tracking-wider mb-0.5">{label}</div>
                            <div className="text-sm font-600 text-[#F1F0FF] truncate">{value}</div>
                          </div>
                        ))}
                      </div>
                      {lead.properties && !Array.isArray(lead.properties) && (
                        <div className="mt-2 text-xs text-[#8B8BA8]">
                          Interested in: <span className="text-[#F1F0FF]">{(lead.properties as { title: string }).title}</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <RevealButton leadId={lead.id} alreadyRevealed={revealedIds.has(lead.id)} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <MobileNav />
    </>
  )
}
