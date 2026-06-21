'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Donation = {
  id: string; title: string; builder: string | null; sector: string | null; city: string | null
  price_min: number | null; status: string; created_at: string; user_id: string | null
  profiles?: { full_name?: string; email?: string } | null
}

export default function DonationsClient({ donations }: { donations: Donation[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg]    = useState('')

  const approve = (d: Donation) => {
    start(async () => {
      const supabase = createClient()

      /* 1. Copy to properties */
      await supabase.from('properties').insert({
        title:       d.title,
        builder:     d.builder,
        sector:      d.sector,
        city:        d.city,
        price_min:   d.price_min,
        is_active:   true,
        is_featured: false,
      })

      /* 2. Award 50 coins to donor */
      if (d.user_id) {
        await supabase.from('coins').insert({
          user_id: d.user_id, amount: 50, type: 'earned', description: 'Donated listing approved',
        })
      }

      /* 3. Update status */
      await supabase.from('donated_listings').update({ status: 'Approved', coins_awarded: true }).eq('id', d.id)

      setMsg(`✅ "${d.title}" approved and listed!`)
      router.refresh()
    })
  }

  const reject = (id: string) => {
    start(async () => {
      await createClient().from('donated_listings').update({ status: 'Rejected' }).eq('id', id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {msg && <p className="text-sm" style={{ color: '#22C55E' }}>{msg}</p>}
      {donations.length === 0 ? (
        <div className="text-center py-16 glass">
          <div className="text-5xl mb-3">🎁</div>
          <p className="font-heading font-700 text-[#111827]">No donations yet</p>
        </div>
      ) : donations.map(d => {
        const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles
        return (
          <div key={d.id} className="glass p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-600 text-sm" style={{ color: '#111827' }}>{d.title}</div>
                <div className="text-xs mt-0.5 flex gap-2 flex-wrap" style={{ color: '#6B7280' }}>
                  {d.city && <span>{d.city}</span>}
                  {d.builder && <><span>·</span><span>{d.builder}</span></>}
                  {d.price_min && <><span>·</span><span>₹{(d.price_min/1e5).toFixed(0)}L</span></>}
                </div>
                <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  By: {(profile as { full_name?: string } | null)?.full_name || (profile as { email?: string } | null)?.email || 'Anonymous'} ·{' '}
                  {new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                  style={d.status === 'Approved'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                    : d.status === 'Rejected'
                      ? { background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }
                      : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                  {d.status}
                </span>
                {d.status === 'Pending' && (
                  <>
                    <button onClick={() => approve(d)} disabled={pending} suppressHydrationWarning
                      className="text-xs px-3 py-1.5 rounded-lg font-700 disabled:opacity-50"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#22C55E' }}>
                      Approve
                    </button>
                    <button onClick={() => reject(d.id)} disabled={pending} suppressHydrationWarning
                      className="text-xs px-3 py-1.5 rounded-lg font-700 disabled:opacity-50"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
