'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Commission } from '@/lib/supabase/types'

type CommissionWithLead = Commission & { leads: { name: string; phone: string; tier: string | null } | null }
type DealLead = { id: string; name: string; phone: string; tier: string | null; properties: { title: string } | null }

const STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Received: 'bg-green-500/10 text-green-400 border-green-500/30',
  Partial: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
}

export default function CommissionsClient({
  commissions,
  dealLeads,
}: {
  commissions: CommissionWithLead[]
  dealLeads: DealLead[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ lead_id: '', builder_name: '', amount: '', status: 'Pending' })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('commissions').insert({
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

  const updateStatus = (id: string, status: string) => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('commissions').update({ status }).eq('id', id)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="btn-accent text-sm px-4 py-2">+ Add Commission</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-600">Add Commission</h3>
              <button onClick={() => setShowForm(false)} className="text-[#888]">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select className="input-dark text-sm" value={form.lead_id} onChange={e => setForm(f => ({ ...f, lead_id: e.target.value }))}>
                <option value="">Select Deal Lead (optional)</option>
                {dealLeads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.properties?.title || 'No property'}
                  </option>
                ))}
              </select>
              <input className="input-dark text-sm" placeholder="Builder Name" value={form.builder_name} onChange={e => setForm(f => ({ ...f, builder_name: e.target.value }))} />
              <input className="input-dark text-sm" placeholder="Amount (₹)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              <select className="input-dark text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option>Pending</option>
                <option>Received</option>
                <option>Partial</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" disabled={isPending} className="btn-accent flex-1 text-sm disabled:opacity-50">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {commissions.length === 0 ? (
          <div className="text-center py-12 text-[#888]">No commissions recorded yet.</div>
        ) : (
          commissions.map(c => (
            <div key={c.id} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-600 text-sm">{c.builder_name || 'Unknown Builder'}</div>
                  {c.leads && (
                    <div className="text-xs text-[#888] mt-0.5">{c.leads.name} · {c.leads.phone}</div>
                  )}
                  <div className="text-[#E8FF47] font-heading font-700 mt-1">
                    ₹{(c.amount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={c.status}
                    onChange={e => updateStatus(c.id, e.target.value)}
                    className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer bg-transparent ${STATUS_STYLE[c.status] || ''}`}
                  >
                    <option>Pending</option>
                    <option>Received</option>
                    <option>Partial</option>
                  </select>
                  <span className="text-xs text-[#555]">
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
