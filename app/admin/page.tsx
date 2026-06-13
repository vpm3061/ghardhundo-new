import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Lead } from '@/lib/supabase/types'

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'New':            { bg: 'rgba(255,255,255,0.04)', color: '#8B8BA8', border: 'rgba(255,255,255,0.08)' },
  'Called':         { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6', border: 'rgba(59,130,246,0.25)'  },
  'Visit Fixed':    { bg: 'rgba(124,58,237,0.1)',   color: '#A78BFA', border: 'rgba(124,58,237,0.25)'  },
  'Deal Done':      { bg: 'rgba(16,185,129,0.1)',   color: '#10B981', border: 'rgba(16,185,129,0.25)'  },
  'Not Interested': { bg: 'rgba(239,68,68,0.08)',   color: '#EF4444', border: 'rgba(239,68,68,0.2)'    },
}

export default async function AdminLeadsPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads')
    .select('*, properties(title)')
    .order('ai_score', { ascending: false })
    .order('created_at', { ascending: false })

  const hot   = leads?.filter(l => l.tier === 'HOT').length  || 0
  const warm  = leads?.filter(l => l.tier === 'WARM').length || 0
  const cold  = leads?.filter(l => l.tier === 'COLD').length || 0
  const deals = leads?.filter(l => l.status === 'Deal Done').length || 0

  const statCards = [
    { label: 'HOT',         value: hot,   icon: '🔥', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
    { label: 'WARM',        value: warm,  icon: '☀️', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
    { label: 'COLD',        value: cold,  icon: '💎', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
    { label: 'Deals Done',  value: deals, icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#F1F0FF]">Leads Dashboard</h1>
        <p className="text-[#8B8BA8] text-sm mt-1">Sorted by AI score · {leads?.length || 0} total leads</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {statCards.map(s => (
          <div key={s.label} className="glass p-4" style={{ border: `1px solid ${s.border}` }}>
            <div className="text-sm mb-1">{s.icon} <span style={{ color: s.color }} className="font-600 text-xs">{s.label}</span></div>
            <div className="font-heading text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Leads list */}
      <div className="space-y-2">
        {!leads || leads.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="font-heading font-700 text-[#F1F0FF]">No leads yet</h3>
            <p className="text-[#8B8BA8] text-sm mt-1">Leads appear here as buyers submit inquiries</p>
          </div>
        ) : (
          leads.map((lead: Lead & { properties?: { title: string } | null }) => {
            const ss = STATUS_STYLE[lead.status] || STATUS_STYLE['New']
            return (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`}
                className="block rounded-xl p-4 transition-all hover:translate-x-0.5"
                style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Score */}
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: lead.tier === 'HOT' ? 'rgba(239,68,68,0.1)' : lead.tier === 'WARM' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                        border: `1px solid ${lead.tier === 'HOT' ? 'rgba(239,68,68,0.2)' : lead.tier === 'WARM' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`,
                      }}>
                      <span className="font-heading font-800 text-sm"
                        style={{ color: lead.tier === 'HOT' ? '#EF4444' : lead.tier === 'WARM' ? '#F59E0B' : '#3B82F6' }}>
                        {lead.ai_score}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-600 text-sm text-[#F1F0FF]">{lead.name}</span>
                        {lead.tier && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-700 tier-${lead.tier.toLowerCase()}`}>
                            {lead.tier}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-[#8B8BA8]">
                        <span>{lead.phone}</span>
                        {lead.city && <><span>·</span><span>{lead.city}</span></>}
                        {lead.budget && <><span>·</span><span>{lead.budget}</span></>}
                        {lead.timeline && <><span>·</span><span>{lead.timeline}</span></>}
                      </div>
                      {lead.properties?.title && (
                        <div className="text-xs text-[#4A4A6A] mt-0.5 truncate">→ {lead.properties.title}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-700"
                      style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                      {lead.status}
                    </span>
                    <span className="text-xs text-[#4A4A6A]">
                      {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
