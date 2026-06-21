'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

type Lead = {
  id: string; name: string; budget: string | null; city: string | null
  timeline: string | null; purpose: string | null; ai_score: number
  tier: string | null; created_at: string; loan_status: string | null
  bhk: string | null; phone: string; propertyTitle: string | null
}
type Sub = {
  id: string; plan: string; leads_limit: number; leads_used: number
  started_at: string; expires_at: string | null; status: string; amount: number | null
} | null

const TIER_STYLE: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  HOT:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: '⚡' },
  WARM: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: '🔥' },
  COLD: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', icon: '❄️' },
}
const PIE_COLORS = { HOT: '#EF4444', WARM: '#F59E0B', COLD: '#3B82F6' }

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#3B82F6'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-800 tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

function RevealBtn({ leadId, alreadyRevealed, phone, leadsLeft }: {
  leadId: string; alreadyRevealed: boolean; phone: string; leadsLeft: number
}) {
  const [revealed, setRevealed]     = useState(alreadyRevealed)
  const [shownPhone, setShownPhone] = useState(alreadyRevealed ? phone : '')
  const [isPending, start]          = useTransition()
  const [error, setError]           = useState('')
  const router = useRouter()

  if (revealed && shownPhone) {
    return (
      <a href={`tel:${shownPhone}`}
        className="flex items-center gap-2 text-xs font-700 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#22C55E' }}>
        📞 {shownPhone}
      </a>
    )
  }

  const reveal = () => {
    if (leadsLeft <= 0) { setError('Lead limit reached. Upgrade plan.'); return }
    start(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: insErr } = await supabase.from('lead_reveals')
        .insert({ dealer_id: user.id, lead_id: leadId })
      if (insErr) { setError('Already revealed'); setRevealed(true); setShownPhone(phone); return }

      /* Deduct from subscription */
      try { await supabase.rpc('increment_leads_used', { dealer_id: user.id }) } catch {}

      setRevealed(true); setShownPhone(phone)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={reveal} disabled={isPending || leadsLeft <= 0} suppressHydrationWarning
        className="text-xs px-3 py-2 rounded-xl font-700 disabled:opacity-50 transition-all"
        style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C' }}>
        {isPending ? '…' : leadsLeft > 0 ? `Reveal (${leadsLeft} left)` : 'Limit reached'}
      </button>
      {error && <p className="text-[10px]" style={{ color: '#F87171' }}>{error}</p>}
    </div>
  )
}

export default function DealerClient({
  userId, leads, revealedIds, subscription,
}: {
  userId: string; leads: Lead[]; revealedIds: string[]; subscription: Sub
}) {
  const [tab, setTab]     = useState<'leads' | 'analytics' | 'share' | 'settings'>('leads')
  const [filter, setFilter] = useState<'ALL' | 'HOT' | 'WARM' | 'COLD'>('ALL')
  const [copied, setCopied] = useState(false)

  const revSet = new Set(revealedIds)
  const leadsLeft = subscription
    ? Math.max(0, subscription.leads_limit - subscription.leads_used)
    : 0

  const filtered = leads.filter(l => filter === 'ALL' || l.tier === filter)

  /* Analytics data */
  const tierData = ['HOT', 'WARM', 'COLD'].map(t => ({
    name: t, value: leads.filter(l => l.tier === t).length,
    color: PIE_COLORS[t as keyof typeof PIE_COLORS],
  })).filter(d => d.value > 0)

  const cityMap: Record<string, number> = {}
  leads.forEach(l => { if (l.city) cityMap[l.city] = (cityMap[l.city] || 0) + 1 })
  const cityData = Object.entries(cityMap).map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count).slice(0, 6)

  const BUDGET_RANGES = [
    { label: '<40L', min: 0, max: 4000000 },
    { label: '40–60L', min: 4000000, max: 6000000 },
    { label: '60–80L', min: 6000000, max: 8000000 },
    { label: '80L–1Cr', min: 8000000, max: 10000000 },
    { label: '1Cr+', min: 10000000, max: Infinity },
  ]
  const budgetData = BUDGET_RANGES.map(r => ({
    label: r.label,
    count: leads.filter(l => {
      const b = parseFloat((l.budget || '').replace(/[^0-9.]/g, '')) * (
        (l.budget || '').includes('Cr') ? 1e7 : (l.budget || '').includes('L') ? 1e5 : 1
      )
      return !isNaN(b) && b >= r.min && b < r.max
    }).length,
  }))

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/properties?ref=${userId}`
    : `/properties?ref=${userId}`
  const copyRef = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const TABS = [
    { id: 'leads',     label: 'Find Buyers' },
    { id: 'analytics', label: 'Analytics'   },
    { id: 'share',     label: 'Share & Earn' },
    { id: 'settings',  label: 'Settings'    },
  ] as const

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#FB923C' }}>Dealer Dashboard</div>
          <h1 className="font-heading text-3xl font-800" style={{ color: '#111827' }}>Buyer Leads</h1>
        </div>
      </div>

      {/* Subscription card */}
      {subscription ? (
        <div className="glass p-4 mb-6" style={{ border: '1px solid rgba(251,146,60,0.15)' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-700 uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>Active Plan</div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-700 text-lg" style={{ color: '#FB923C' }}>{subscription.plan}</span>
                {subscription.amount && <span className="text-xs" style={{ color: '#6B7280' }}>₹{subscription.amount.toLocaleString('en-IN')}/mo</span>}
              </div>
              {subscription.expires_at && (
                <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  Expires {new Date(subscription.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-700 mb-1" style={{ color: '#9CA3AF' }}>Leads used</div>
              <div className="font-heading font-800 text-lg" style={{ color: '#111827' }}>
                {subscription.leads_used}/{subscription.leads_limit}
              </div>
              <div className="w-24 h-1.5 mt-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((subscription.leads_used / subscription.leads_limit) * 100, 100)}%`,
                    background: leadsLeft === 0 ? '#EF4444' : '#FB923C',
                  }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-600" style={{ color: '#111827' }}>No active subscription</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Get buyer leads from ₹2,999/mo</p>
          </div>
          <a href="/pricing" className="shrink-0 text-xs px-4 py-2 rounded-xl font-700"
            style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C' }}>
            💎 Buy Plan →
          </a>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} suppressHydrationWarning
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-600 transition-all"
            style={{
              background: tab === t.id ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${tab === t.id ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.05)'}`,
              color: tab === t.id ? '#FB923C' : '#6B7280',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── FIND BUYERS ── */}
      {tab === 'leads' && (
        <>
          {/* Tier filter chips */}
          <div className="flex gap-2 mb-5">
            {(['ALL', 'HOT', 'WARM', 'COLD'] as const).map(t => {
              const count = t === 'ALL' ? leads.length : leads.filter(l => l.tier === t).length
              const ts = t !== 'ALL' ? TIER_STYLE[t] : null
              return (
                <button key={t} onClick={() => setFilter(t)} suppressHydrationWarning
                  className="text-sm px-4 py-2 rounded-xl font-600 transition-all"
                  style={{
                    background: filter === t ? (ts ? ts.bg : 'rgba(251,146,60,0.08)') : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${filter === t ? (ts ? ts.border : 'rgba(251,146,60,0.35)') : 'rgba(0,0,0,0.05)'}`,
                    color: filter === t ? (ts ? ts.color : '#FB923C') : '#6B7280',
                  }}>
                  {t === 'HOT' ? '⚡' : t === 'WARM' ? '🔥' : t === 'COLD' ? '❄️' : ''} {t} ({count})
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 glass">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-heading text-xl font-700 mb-2" style={{ color: '#111827' }}>No leads in this tier</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>Try a different filter or check back later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(lead => {
                const ts = TIER_STYLE[lead.tier || 'COLD'] || TIER_STYLE.COLD
                return (
                  <div key={lead.id} className="glass p-5 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-800 px-2.5 py-1 rounded-full"
                            style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>
                            {ts.icon} {lead.tier}
                          </span>
                          <div className="flex-1 max-w-[120px]">
                            <ScoreBar score={lead.ai_score} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Budget',   value: lead.budget   },
                            { label: 'City',     value: lead.city     },
                            { label: 'Timeline', value: lead.timeline },
                            { label: 'BHK',      value: lead.bhk ? lead.bhk + ' BHK' : null },
                            { label: 'Loan',     value: lead.loan_status },
                            { label: 'Purpose',  value: lead.purpose  },
                          ].filter(i => i.value).map(({ label, value }) => (
                            <div key={label}>
                              <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>{label}</div>
                              <div className="text-sm font-600 truncate" style={{ color: '#111827' }}>{value}</div>
                            </div>
                          ))}
                        </div>
                        {lead.propertyTitle && (
                          <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>
                            Interested in: <span style={{ color: '#111827' }}>{lead.propertyTitle}</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        <RevealBtn leadId={lead.id} alreadyRevealed={revSet.has(lead.id)}
                          phone={lead.phone} leadsLeft={leadsLeft} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── ANALYTICS ── */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-3 mb-2">
            {[
              { label: 'Total Leads', value: leads.length, color: '#FB923C' },
              { label: 'Revealed',    value: revealedIds.length, color: '#22C55E' },
              { label: 'Leads Left',  value: leadsLeft, color: leadsLeft === 0 ? '#EF4444' : '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="glass p-4 text-center">
                <div className="font-heading text-3xl font-800 mb-0.5" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#6B7280' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tier pie chart */}
          {tierData.length > 0 && (
            <div className="glass p-5">
              <h3 className="font-heading font-700 mb-4" style={{ color: '#111827' }}>Lead Tier Distribution</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={tierData} dataKey="value" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                      {tierData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#F5F5F4', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', color: '#111827', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">
                  {tierData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                      <span style={{ color: '#6B7280' }}>{d.name}</span>
                      <span className="font-800 ml-auto" style={{ color: '#111827' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* City bar chart */}
          {cityData.length > 0 && (
            <div className="glass p-5">
              <h3 className="font-heading font-700 mb-4" style={{ color: '#111827' }}>Leads by City</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="city" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#F5F5F4', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', color: '#111827', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#FB923C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Budget bar chart */}
          <div className="glass p-5">
            <h3 className="font-heading font-700 mb-4" style={{ color: '#111827' }}>Leads by Budget</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={budgetData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#F5F5F4', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', color: '#111827', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── SHARE & EARN ── */}
      {tab === 'share' && (
        <div className="space-y-4">
          <div className="glass p-6" style={{ border: '1px solid rgba(251,146,60,0.15)' }}>
            <h3 className="font-heading font-700 mb-1" style={{ color: '#111827' }}>Your Referral Link</h3>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
              Share properties with your link. Earn <span style={{ color: '#FB923C' }}>0.25% of deal value</span> when a buyer closes.
            </p>
            <div className="flex gap-2 mb-3" suppressHydrationWarning>
              <div className="flex-1 text-xs px-3 py-2.5 rounded-xl truncate font-mono"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', color: '#6B7280' }}>
                {referralUrl}
              </div>
              <button onClick={copyRef} suppressHydrationWarning
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-700 transition-all"
                style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(251,146,60,0.08)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(251,146,60,0.25)'}`, color: copied ? '#22C55E' : '#FB923C' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <a href={`https://wa.me/?text=${encodeURIComponent('Check out this property: ' + referralUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-700 transition-all"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}>
              Share on WhatsApp
            </a>
          </div>
          <div className="glass p-5">
            <h3 className="font-heading font-700 mb-3" style={{ color: '#111827' }}>How it works</h3>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Copy your referral link above' },
                { step: '2', text: 'Share it with potential buyers via WhatsApp, Instagram, or email' },
                { step: '3', text: 'When they visit via your link, their lead is tagged to you' },
                { step: '4', text: 'When the deal closes, you earn 0.25% of the deal value automatically' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3 text-sm" style={{ color: '#6B7280' }}>
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-800"
                    style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C' }}>{step}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="glass p-6">
            <h3 className="font-heading font-700 mb-4" style={{ color: '#111827' }}>Current Plan</h3>
            {subscription ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span style={{ color: '#6B7280' }} className="text-sm">Plan</span>
                  <span className="font-700" style={{ color: '#FB923C' }}>{subscription.plan}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span style={{ color: '#6B7280' }} className="text-sm">Amount</span>
                  <span className="font-700" style={{ color: '#111827' }}>
                    {subscription.amount ? `₹${subscription.amount.toLocaleString('en-IN')}/mo` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span style={{ color: '#6B7280' }} className="text-sm">Leads used</span>
                  <span className="font-700" style={{ color: '#111827' }}>
                    {subscription.leads_used} / {subscription.leads_limit}
                  </span>
                </div>
                {subscription.expires_at && (
                  <div className="flex justify-between items-center mb-3">
                    <span style={{ color: '#6B7280' }} className="text-sm">Expires</span>
                    <span className="font-700" style={{ color: '#111827' }}>
                      {new Date(subscription.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm" style={{ color: '#6B7280' }}>No active subscription.</p>
            )}
            <a href="/pricing"
              className="mt-4 block text-center py-2.5 rounded-xl text-sm font-700 btn-accent transition-all">
              {subscription ? 'Upgrade Plan' : 'Buy a Plan'}
            </a>
          </div>
          <a href="https://wa.me/919643693090" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-700 glass"
            style={{ border: '1px solid rgba(37,211,102,0.2)', color: '#25D366' }}>
            WhatsApp Support
          </a>
        </div>
      )}
    </>
  )
}
