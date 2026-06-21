'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

type Lead = {
  id: string; name: string; phone: string; city: string | null; budget: string | null
  ai_score: number; tier: string | null; status: string; created_at: string
  properties?: { title: string } | null
}

const TIER_BORDER: Record<string, { border: string; glow: string }> = {
  HOT:  { border: '#EF4444', glow: 'rgba(239,68,68,0.08)' },
  WARM: { border: '#F59E0B', glow: 'rgba(245,158,11,0.08)' },
  COLD: { border: '#3B82F6', glow: 'rgba(59,130,246,0.08)' },
}

const STATUS_BADGE: Record<string, string> = {
  'New':            'bg-orange-100 text-[#FB923C] border-orange-200',
  'Called':         'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Visit Fixed':    'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Deal Done':      'bg-green-500/20 text-green-400 border-green-500/30',
  'Not Interested': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'Lost':           'bg-red-500/20 text-red-400 border-red-500/30',
}
const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'New':            { bg: 'rgba(251,146,60,0.08)',  color: '#FB923C', border: 'rgba(251,146,60,0.25)'  },
  'Called':         { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6', border: 'rgba(59,130,246,0.3)'  },
  'Visit Fixed':    { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.3)'  },
  'Deal Done':      { bg: 'rgba(16,185,129,0.1)',  color: '#22C55E', border: 'rgba(16,185,129,0.3)'  },
  'Not Interested': { bg: 'rgba(107,114,128,0.1)', color: '#9CA3AF', border: 'rgba(107,114,128,0.3)' },
  'Lost':           { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.3)'   },
}

const TIERS   = ['ALL', 'HOT', 'WARM', 'COLD'] as const
const STATUSES = ['New', 'Called', 'Visit Fixed', 'Deal Done', 'Not Interested', 'Lost']
const SORTS   = ['score', 'newest', 'oldest'] as const

export default function LeadsClient({ leads, cities }: { leads: Lead[]; cities: string[] }) {
  const [tier, setTier]     = useState<string>('ALL')
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')
  const [city, setCity]     = useState('')
  const [sort, setSort]     = useState<'score' | 'newest' | 'oldest'>('score')

  const hot   = leads.filter(l => l.tier === 'HOT').length
  const warm  = leads.filter(l => l.tier === 'WARM').length
  const cold  = leads.filter(l => l.tier === 'COLD').length

  const filtered = useMemo(() => {
    let r = [...leads]
    if (tier !== 'ALL') r = r.filter(l => l.tier === tier)
    if (status) r = r.filter(l => l.status === status)
    if (city)   r = r.filter(l => l.city === city)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q))
    }
    if (sort === 'score')  r.sort((a, b) => b.ai_score - a.ai_score)
    if (sort === 'newest') r.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === 'oldest') r.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return r
  }, [leads, tier, status, city, search, sort])

  const hasFilters = tier !== 'ALL' || status || city || search || sort !== 'score'

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">All Leads</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{filtered.length} of {leads.length} leads</p>
      </div>

      {/* Tier pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {([
          { key: 'ALL',  label: '📋 All',       count: leads.length, c: '#FB923C', bg: 'rgba(251,146,60,0.08)', b: 'rgba(251,146,60,0.35)' },
          { key: 'HOT',  label: '🔥 HOT',        count: hot,          c: '#EF4444', bg: 'rgba(239,68,68,0.15)',  b: 'rgba(239,68,68,0.4)'  },
          { key: 'WARM', label: '🌡️ WARM',       count: warm,         c: '#F59E0B', bg: 'rgba(245,158,11,0.15)', b: 'rgba(245,158,11,0.4)' },
          { key: 'COLD', label: '❄️ COLD',       count: cold,         c: '#3B82F6', bg: 'rgba(59,130,246,0.15)', b: 'rgba(59,130,246,0.4)' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTier(t.key)} suppressHydrationWarning
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-700 transition-all"
            style={tier === t.key
              ? { background: t.bg, border: `1px solid ${t.b}`, color: t.c }
              : { background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
            {t.label}
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: tier === t.key ? t.b : 'rgba(0,0,0,0.06)', color: tier === t.key ? t.c : '#9CA3AF' }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Status filter + search row */}
      <div className="flex gap-2 flex-wrap mb-4">
        {STATUSES.map(s => {
          const ss = STATUS_STYLE[s] || STATUS_STYLE['New']
          return (
            <button key={s} onClick={() => setStatus(status === s ? '' : s)} suppressHydrationWarning
              className="shrink-0 text-xs px-3 py-1.5 rounded-xl font-600 transition-all"
              style={status === s
                ? { background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color }
                : { background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', color: '#6B7280' }}>
              {s}
            </button>
          )
        })}
      </div>

      {/* Search + city + sort */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          className="input-dark text-sm flex-1 min-w-[160px]"
          placeholder="Search name or phone…"
          value={search} onChange={e => setSearch(e.target.value)} suppressHydrationWarning />
        <select className="input-dark text-sm" value={city}
          onChange={e => setCity(e.target.value)} suppressHydrationWarning>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input-dark text-sm" value={sort}
          onChange={e => setSort(e.target.value as typeof sort)} suppressHydrationWarning>
          <option value="score">Score ↓</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        {hasFilters && (
          <button onClick={() => { setTier('ALL'); setStatus(''); setCity(''); setSearch(''); setSort('score') }}
            suppressHydrationWarning className="text-xs px-3 py-2 rounded-xl font-600 shrink-0"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
            Clear all
          </button>
        )}
      </div>

      {/* Lead cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-heading font-700" style={{ color: '#111827' }}>No leads found</p>
          </div>
        ) : filtered.map(lead => {
          const tb = TIER_BORDER[lead.tier || 'COLD'] || TIER_BORDER.COLD
          const ss = STATUS_STYLE[lead.status] || STATUS_STYLE['New']
          return (
            <Link key={lead.id} href={`/admin/leads/${lead.id}`}
              className="block rounded-xl p-4 transition-all hover:translate-x-0.5"
              style={{
                background: 'rgba(18,18,26,0.8)',
                border: `1px solid rgba(0,0,0,0.05)`,
                borderLeft: `3px solid ${tb.border}`,
                boxShadow: `0 0 20px ${tb.glow}`,
              }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Score circle */}
                  <div className="shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: `${tb.border}15`, border: `1px solid ${tb.border}33` }}>
                    <span className="font-heading font-800 text-sm leading-none" style={{ color: tb.border }}>
                      {lead.ai_score}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-600 text-sm" style={{ color: '#111827' }}>{lead.name}</span>
                      {lead.tier && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-700"
                          style={{ background: `${tb.border}15`, color: tb.border, border: `1px solid ${tb.border}33` }}>
                          {lead.tier}
                        </span>
                      )}
                    </div>
                    {/* Score bar */}
                    <div className="mt-1 mb-1 w-32 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${lead.ai_score}%`,
                        background: 'linear-gradient(90deg, #3B82F6, #F59E0B, #EF4444)',
                      }} />
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: '#6B7280' }}>
                      <span>{lead.phone}</span>
                      {lead.city && <><span>·</span><span>{lead.city}</span></>}
                      {lead.budget && <><span>·</span><span>{lead.budget}</span></>}
                    </div>
                    {(lead.properties as { title?: string } | null)?.title && (
                      <div className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
                        → {(lead.properties as { title: string }).title}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-700"
                    style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                    {lead.status}
                  </span>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
