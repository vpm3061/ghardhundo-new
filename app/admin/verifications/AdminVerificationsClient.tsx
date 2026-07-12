'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type VerificationRequest = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  verification_requested_at: string | null
}

export default function AdminVerificationsClient({ requests: initial }: { requests: VerificationRequest[] }) {
  const [requests, setRequests] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const decide = async (req: VerificationRequest, status: 'verified' | 'rejected') => {
    setLoading(req.id)
    const supabase = createClient()
    await supabase.from('profiles').update({ verification_status: status }).eq('id', req.id)
    setRequests(prev => prev.filter(r => r.id !== req.id))
    setLoading(null)
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 glass">
        <div className="text-5xl mb-3">✅</div>
        <p className="font-heading font-700 text-[#111827]">No pending verification requests</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {requests.map(req => {
        const isLoading = loading === req.id
        return (
          <div key={req.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-700 text-[#111827]">{req.full_name || 'Expert'}</p>
                {req.email && <p className="text-sm text-[#6B7280]">{req.email}</p>}
                {req.phone && <p className="text-sm text-[#6B7280]">{req.phone}</p>}
              </div>
              {req.verification_requested_at && (
                <span className="text-xs text-[#9CA3AF] shrink-0">
                  {new Date(req.verification_requested_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className="flex gap-3 pt-3 border-t border-[#F5F5F4]">
              <button
                onClick={() => decide(req, 'verified')}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-700 text-white disabled:opacity-60 transition-all"
                style={{ background: '#22C55E' }}
              >
                {isLoading ? '…' : '✓ Approve'}
              </button>
              <button
                onClick={() => decide(req, 'rejected')}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-700 disabled:opacity-60 transition-all bg-[#FEF2F2] text-[#EF4444]"
              >
                {isLoading ? '…' : '✕ Reject'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
