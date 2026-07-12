'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CplDeal } from '@/lib/supabase/types'

const BLANK_FORM = { builder_name: '', cost_per_lead: '', leads_purchased: '', notes: '' }
const STATUSES: CplDeal['status'][] = ['Active', 'Paused', 'Completed']

export default function AdminCplClient({ deals: initial }: { deals: CplDeal[] }) {
  const [deals, setDeals] = useState(initial)
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const create = async () => {
    setMsg('')
    if (!form.builder_name.trim() || !form.cost_per_lead) { setMsg('Builder name aur cost/lead required hai'); return }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('cpl_deals').insert({
      builder_name: form.builder_name,
      cost_per_lead: parseFloat(form.cost_per_lead),
      leads_purchased: form.leads_purchased ? parseInt(form.leads_purchased) : 0,
      notes: form.notes || null,
    }).select().single()
    setSaving(false)
    if (error) { setMsg(error.message); return }
    setDeals(prev => [data as CplDeal, ...prev])
    setForm(BLANK_FORM)
  }

  const incrementDelivered = async (deal: CplDeal) => {
    setLoadingId(deal.id)
    const supabase = createClient()
    const next = deal.leads_delivered + 1
    await supabase.from('cpl_deals').update({ leads_delivered: next }).eq('id', deal.id)
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, leads_delivered: next } : d))
    setLoadingId(null)
  }

  const setStatus = async (deal: CplDeal, status: CplDeal['status']) => {
    setLoadingId(deal.id)
    const supabase = createClient()
    await supabase.from('cpl_deals').update({ status }).eq('id', deal.id)
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, status } : d))
    setLoadingId(null)
  }

  const remove = async (deal: CplDeal) => {
    setLoadingId(deal.id)
    const supabase = createClient()
    await supabase.from('cpl_deals').delete().eq('id', deal.id)
    setDeals(prev => prev.filter(d => d.id !== deal.id))
    setLoadingId(null)
  }

  return (
    <div>
      {/* Create form */}
      <div className="glass p-5 mb-6 flex flex-col gap-3">
        <h2 className="font-heading font-700 mb-1" style={{ color: '#111827' }}>Add CPL Deal</h2>
        <input className="input-dark text-sm" placeholder="Builder name"
          value={form.builder_name} onChange={e => setForm(p => ({ ...p, builder_name: e.target.value }))} suppressHydrationWarning />
        <div className="grid grid-cols-2 gap-3">
          <input className="input-dark text-sm" placeholder="Cost per lead (₹)" type="number"
            value={form.cost_per_lead} onChange={e => setForm(p => ({ ...p, cost_per_lead: e.target.value }))} suppressHydrationWarning />
          <input className="input-dark text-sm" placeholder="Leads purchased" type="number"
            value={form.leads_purchased} onChange={e => setForm(p => ({ ...p, leads_purchased: e.target.value }))} suppressHydrationWarning />
        </div>
        <textarea className="input-dark text-sm resize-none" rows={2} placeholder="Notes (optional)"
          value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} suppressHydrationWarning />
        {msg && <p className="text-sm" style={{ color: '#F87171' }}>{msg}</p>}
        <button onClick={create} disabled={saving} suppressHydrationWarning className="btn-accent disabled:opacity-50">
          {saving ? 'Saving…' : '+ Add Deal'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {deals.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-5xl mb-3">🎯</div>
            <p className="font-heading font-700 text-[#111827]">No CPL deals yet</p>
          </div>
        ) : deals.map(d => {
          const pct = d.leads_purchased > 0 ? Math.min((d.leads_delivered / d.leads_purchased) * 100, 100) : 0
          const isLoading = loadingId === d.id
          return (
            <div key={d.id} className="glass p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-600 text-sm" style={{ color: '#111827' }}>{d.builder_name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#6B7280' }}>
                    <span className="font-700" style={{ color: '#FB923C' }}>₹{d.cost_per_lead.toLocaleString('en-IN')}/lead</span>
                    <span>·</span>
                    <span>{d.leads_delivered}/{d.leads_purchased} delivered</span>
                    <span>·</span>
                    <span>₹{(d.cost_per_lead * d.leads_delivered).toLocaleString('en-IN')} earned</span>
                  </div>
                  {d.notes && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{d.notes}</p>}
                </div>
                <select value={d.status} disabled={isLoading} suppressHydrationWarning
                  onChange={e => setStatus(d, e.target.value as CplDeal['status'])}
                  className="text-xs font-700 px-2 py-1 rounded-full shrink-0"
                  style={d.status === 'Active'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: 'rgba(0,0,0,0.03)', color: '#9CA3AF', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #FB923C88, #FB923C)' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => incrementDelivered(d)} disabled={isLoading} suppressHydrationWarning
                  className="text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
                  +1 Delivered
                </button>
                <button onClick={() => remove(d)} disabled={isLoading} suppressHydrationWarning
                  className="text-xs px-3 py-1.5 rounded-lg" style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
