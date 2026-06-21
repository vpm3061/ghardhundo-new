'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Conversion = {
  id: string; coins: number; cash_amount: number; upi_id: string | null
  status: string; created_at: string
  profiles?: { full_name?: string; email?: string; phone?: string } | null
}

export default function CoinsClient({ conversions }: { conversions: Conversion[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const update = (id: string, status: 'Paid' | 'Rejected') => {
    start(async () => {
      await createClient().from('coin_conversions').update({ status }).eq('id', id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      {conversions.length === 0 ? (
        <div className="text-center py-16 glass">
          <div className="text-5xl mb-3">🪙</div>
          <p className="font-heading font-700 text-[#111827]">No conversion requests</p>
        </div>
      ) : conversions.map(c => {
        const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
        return (
          <div key={c.id} className="glass p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-600 text-sm" style={{ color: '#111827' }}>
                  {(profile as { full_name?: string } | null)?.full_name || (profile as { email?: string } | null)?.email || 'User'}
                </div>
                <div className="text-xs mt-0.5 flex gap-2 flex-wrap" style={{ color: '#6B7280' }}>
                  <span>🪙 {c.coins} coins</span>
                  <span>·</span>
                  <span>₹{c.cash_amount}</span>
                  {c.upi_id && <><span>·</span><span className="font-mono">{c.upi_id}</span></>}
                  {(profile as { phone?: string } | null)?.phone && <><span>·</span><span>{(profile as { phone?: string }).phone}</span></>}
                </div>
                <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                  {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                  style={c.status === 'Paid'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                    : c.status === 'Rejected'
                      ? { background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }
                      : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                  {c.status}
                </span>
                {c.status === 'Pending' && (
                  <>
                    <button onClick={() => update(c.id, 'Paid')} disabled={pending} suppressHydrationWarning
                      className="text-xs px-3 py-1.5 rounded-lg font-700 disabled:opacity-50"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#22C55E' }}>
                      Paid ✓
                    </button>
                    <button onClick={() => update(c.id, 'Rejected')} disabled={pending} suppressHydrationWarning
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
