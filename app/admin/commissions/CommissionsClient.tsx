'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Commission } from '@/lib/supabase/types'

type CommissionWithLead = Commission & {
  leads: { name: string; phone: string; tier: string | null } | null
}
type DealLead = {
  id: string; name: string; phone: string; tier: string | null
  properties: { title: string } | null
}
type DealerSubRow = {
  id: string; plan: string; amount: number | null; leads_limit: number
  started_at: string; expires_at: string | null; status: string
  profiles: { full_name: string | null; email: string | null } | null
}
type ShareEarnRow = {
  id: string; earned_coins: number; created_at: string
  profiles: { full_name: string | null; email: string | null } | null
  leads: { deal_amount: number | null; properties: { title: string } | null } | null
}
type CoinConvRow = {
  id: string; coins: number; cash_amount: number; upi_id: string | null
  status: string; created_at: string
  profiles: { full_name: string | null; email: string | null } | null
}

const TABS = [
  { id: 'builder',  label: 'Builder Commissions', icon: '🏢' },
  { id: 'dealer',   label: 'Dealer Subscriptions', icon: '📊' },
  { id: 'share',    label: 'Share & Earn',          icon: '🔗' },
  { id: 'coins',    label: 'Coin Conversions',      icon: '🪙' },
] as const
type Tab = typeof TABS[number]['id']

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })

const STATUS_PILL: Record<string, { bg: string; color: string; border: string }> = {
  Pending:   { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.3)'  },
  Received:  { bg: 'rgba(16,185,129,0.1)',  color: '#22C55E', border: 'rgba(16,185,129,0.3)'  },
  Partial:   { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6', border: 'rgba(59,130,246,0.3)'  },
  Paid:      { bg: 'rgba(16,185,129,0.1)',  color: '#22C55E', border: 'rgba(16,185,129,0.3)'  },
  Rejected:  { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', border: 'rgba(239,68,68,0.3)'   },
  Active:    { bg: 'rgba(16,185,129,0.1)',  color: '#22C55E', border: 'rgba(16,185,129,0.3)'  },
  Expired:   { bg: 'rgba(0,0,0,0.03)',color: '#9CA3AF', border: 'rgba(0,0,0,0.06)' },
  Cancelled: { bg: 'rgba(239,68,68,0.08)', color: '#F87171', border: 'rgba(239,68,68,0.2)'   },
}

function Pill({ status }: { status: string }) {
  const s = STATUS_PILL[status] ?? STATUS_PILL.Pending
  return (
    <span className="text-[10px] font-700 px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}

export default function CommissionsClient({
  commissions, dealLeads, dealerSubs, shareEarn, coinConversions,
}: {
  commissions: CommissionWithLead[]
  dealLeads: DealLead[]
  dealerSubs: DealerSubRow[]
  shareEarn: ShareEarnRow[]
  coinConversions: CoinConvRow[]
}) {
  const [tab, setTab] = useState<Tab>('builder')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ lead_id: '', builder_name: '', amount: '', status: 'Pending' })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleAddCommission = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createClient().from('commissions').insert({
        lead_id: form.lead_id || null,
        builder_name: form.builder_name || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        status: form.status,
      })
      setShowForm(false)
      setForm({ lead_id: '', builder_name: '', amount: '', status: 'Pending' })
      router.refresh()
    })
  }

  const updateCommStatus = (id: string, status: string) => {
    startTransition(async () => {
      await createClient().from('commissions').update({ status }).eq('id', id)
      router.refresh()
    })
  }

  const updateConvStatus = (id: string, status: string) => {
    startTransition(async () => {
      await createClient().from('coin_conversions').update({ status }).eq('id', id)
      router.refresh()
    })
  }

  /* Totals */
  const commTotal    = commissions.reduce((s, c) => s + (c.amount || 0), 0)
  const commReceived = commissions.filter(c => c.status === 'Received').reduce((s, c) => s + (c.amount || 0), 0)
  const dealerMRR    = dealerSubs.filter(d => d.status === 'Active').reduce((s, d) => s + (d.amount || 0), 0)
  const pendingConvs = coinConversions.filter(c => c.status === 'Pending').reduce((s, c) => s + c.cash_amount, 0)

  return (
    <>
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Commission Received', value: fmt(commReceived),   color: '#22C55E' },
          { label: 'Commission Pending',  value: fmt(commTotal - commReceived), color: '#F59E0B' },
          { label: 'Dealer MRR',          value: fmt(dealerMRR),      color: '#FB923C' },
          { label: 'Coin Payouts Pending',value: fmt(pendingConvs),   color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass p-3">
            <div className="text-xs mb-1" style={{ color: '#6B7280' }}>{label}</div>
            <div className="font-heading text-lg font-800" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-0.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} suppressHydrationWarning
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-600 transition-all"
            style={{
              background: tab === t.id ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${tab === t.id ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.05)'}`,
              color: tab === t.id ? '#FB923C' : '#6B7280',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Builder Commissions ── */}
      {tab === 'builder' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowForm(true)} className="btn-accent text-sm px-4 py-2" suppressHydrationWarning>
              + Add Commission
            </button>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
              <div className="glass p-6 w-full max-w-sm rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-700" style={{ color: '#111827' }}>Add Commission</h3>
                  <button onClick={() => setShowForm(false)} suppressHydrationWarning style={{ color: '#6B7280' }}>✕</button>
                </div>
                <form onSubmit={handleAddCommission} className="flex flex-col gap-3">
                  <select className="input-dark text-sm" value={form.lead_id}
                    onChange={e => setForm(f => ({ ...f, lead_id: e.target.value }))}>
                    <option value="">Select Deal Lead (optional)</option>
                    {dealLeads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.properties?.title || 'No property'}
                      </option>
                    ))}
                  </select>
                  <input className="input-dark text-sm" placeholder="Builder Name"
                    value={form.builder_name} onChange={e => setForm(f => ({ ...f, builder_name: e.target.value }))} />
                  <input className="input-dark text-sm" placeholder="Amount (₹)" type="number"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                  <select className="input-dark text-sm" value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option>Pending</option><option>Received</option><option>Partial</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" disabled={isPending} className="btn-accent flex-1 text-sm disabled:opacity-50" suppressHydrationWarning>Save</button>
                    <button type="button" onClick={() => setShowForm(false)} suppressHydrationWarning
                      className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {commissions.length === 0 ? (
              <div className="text-center py-12 glass">
                <p className="text-sm" style={{ color: '#6B7280' }}>No commissions recorded yet.</p>
              </div>
            ) : commissions.map(c => (
              <div key={c.id} className="glass p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-600 text-sm" style={{ color: '#111827' }}>{c.builder_name || 'Unknown Builder'}</div>
                    {c.leads && <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{c.leads.name} · {c.leads.phone}</div>}
                    <div className="font-heading font-800 mt-1" style={{ color: '#FB923C' }}>{fmt(c.amount || 0)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select value={c.status} onChange={e => updateCommStatus(c.id, e.target.value)} suppressHydrationWarning
                      className="text-xs px-2.5 py-1 rounded-full border cursor-pointer"
                      style={{ background: 'transparent', ...(STATUS_PILL[c.status] || {}) }}>
                      <option>Pending</option><option>Received</option><option>Partial</option>
                    </select>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{fmtDate(c.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Tab 2: Dealer Subscriptions ── */}
      {tab === 'dealer' && (
        <div className="space-y-2">
          {dealerSubs.length === 0 ? (
            <div className="text-center py-12 glass">
              <p className="text-sm" style={{ color: '#6B7280' }}>No dealer subscriptions yet.</p>
            </div>
          ) : dealerSubs.map(d => (
            <div key={d.id} className="glass p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-600 text-sm" style={{ color: '#111827' }}>
                    {d.profiles?.full_name || d.profiles?.email || 'Unknown Dealer'}
                  </div>
                  {d.profiles?.email && d.profiles.full_name && (
                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{d.profiles.email}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-700"
                      style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.15)' }}>
                      {d.plan}
                    </span>
                    {d.amount && <span className="text-sm font-800" style={{ color: '#FB923C' }}>{fmt(d.amount)}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Pill status={d.status} />
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>
                    {fmtDate(d.started_at)} → {d.expires_at ? fmtDate(d.expires_at) : '∞'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 3: Share & Earn ── */}
      {tab === 'share' && (
        <div className="space-y-2">
          {shareEarn.length === 0 ? (
            <div className="text-center py-12 glass">
              <p className="text-sm" style={{ color: '#6B7280' }}>No referral payouts yet.</p>
            </div>
          ) : shareEarn.map(r => {
            const dealAmt = r.leads?.deal_amount
            const earnedCash = dealAmt ? (dealAmt * 0.0025) : null
            return (
              <div key={r.id} className="glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-600 text-sm" style={{ color: '#111827' }}>
                      {r.profiles?.full_name || r.profiles?.email || 'Unknown User'}
                    </div>
                    {r.leads?.properties?.title && (
                      <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                        Property: {r.leads.properties.title}
                      </div>
                    )}
                    {dealAmt && (
                      <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                        Deal: {fmt(dealAmt)} →
                        <span style={{ color: '#FB923C' }}> Earn {fmt(earnedCash!)}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-700 text-sm mb-0.5" style={{ color: '#FB923C' }}>
                      🪙 {r.earned_coins} coins
                    </div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{fmtDate(r.created_at)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab 4: Coin Conversions ── */}
      {tab === 'coins' && (
        <div className="space-y-2">
          {coinConversions.length === 0 ? (
            <div className="text-center py-12 glass">
              <p className="text-sm" style={{ color: '#6B7280' }}>No coin conversion requests yet.</p>
            </div>
          ) : coinConversions.map(c => (
            <div key={c.id} className="glass p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-600 text-sm" style={{ color: '#111827' }}>
                    {c.profiles?.full_name || c.profiles?.email || 'Unknown User'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    🪙 {c.coins.toLocaleString('en-IN')} coins → {fmt(c.cash_amount)}
                  </div>
                  {c.upi_id && <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>UPI: {c.upi_id}</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select value={c.status} onChange={e => updateConvStatus(c.id, e.target.value)} suppressHydrationWarning
                    className="text-xs px-2.5 py-1 rounded-full border cursor-pointer"
                    style={{ background: 'transparent', color: STATUS_PILL[c.status]?.color || '#6B7280', borderColor: STATUS_PILL[c.status]?.border || 'rgba(255,255,255,0.1)' }}>
                    <option>Pending</option><option>Paid</option><option>Rejected</option>
                  </select>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{fmtDate(c.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
