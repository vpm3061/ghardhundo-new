'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AdvertiseEnquiry } from '@/lib/supabase/types'

const STATUSES: AdvertiseEnquiry['status'][] = ['new', 'contacted', 'deal_done']
const STATUS_COLOR: Record<AdvertiseEnquiry['status'], { bg: string; color: string }> = {
  new:        { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6' },
  contacted:  { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B' },
  deal_done:  { bg: 'rgba(16,185,129,0.1)',  color: '#22C55E' },
}

export default function AdminAdvertiseClient({ enquiries: initial }: { enquiries: AdvertiseEnquiry[] }) {
  const [enquiries, setEnquiries] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const setStatus = async (enquiry: AdvertiseEnquiry, status: AdvertiseEnquiry['status']) => {
    setLoadingId(enquiry.id)
    const supabase = createClient()
    await supabase.from('advertise_enquiries').update({ status }).eq('id', enquiry.id)
    setEnquiries(prev => prev.map(e => e.id === enquiry.id ? { ...e, status } : e))
    setLoadingId(null)
  }

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-16 glass">
        <div className="text-5xl mb-3">📢</div>
        <p className="font-heading font-700 text-[#111827]">No ad enquiries yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {enquiries.map(e => {
        const sc = STATUS_COLOR[e.status]
        return (
          <div key={e.id} className="glass p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-700 text-sm" style={{ color: '#111827' }}>{e.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap" style={{ color: '#6B7280' }}>
                  {e.company && <span>{e.company}</span>}
                  <span>{e.phone}</span>
                  {e.city && <><span>·</span><span>{e.city}</span></>}
                </div>
                {e.package && (
                  <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-[#FB923C] border border-orange-200">
                    {e.package}
                  </span>
                )}
                {e.message && <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>{e.message}</p>}
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <select value={e.status} disabled={loadingId === e.id} suppressHydrationWarning
                  onChange={ev => setStatus(e, ev.target.value as AdvertiseEnquiry['status'])}
                  className="text-xs font-700 px-2 py-1 rounded-full capitalize"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44` }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <a href={`https://wa.me/91${e.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-700 px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
