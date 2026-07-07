'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Application = {
  id: string
  status: string
  created_at: string
  user_id: string
  full_name: string | null
  city: string | null
  phone: string | null
  rera_number: string | null
  partner_type: string | null
  profiles: Array<{
    full_name: string | null
    email: string | null
    phone: string | null
  }>
}

type Props = {
  applications: Application[]
}

export default function AdminPartnersClient({ applications: initial }: Props) {
  const [applications, setApplications] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const approve = async (app: Application) => {
    setLoading(app.id)
    const supabase = createClient()
    await Promise.all([
      supabase.from('partner_applications').update({ status: 'approved' }).eq('id', app.id),
      supabase.from('profiles').update({ role: 'expert', is_partner: true }).eq('id', app.user_id),
    ])
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'approved' } : a))
    setLoading(null)
  }

  const reject = async (app: Application) => {
    setLoading(app.id)
    const supabase = createClient()
    await supabase.from('partner_applications').update({ status: 'rejected' }).eq('id', app.id)
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'rejected' } : a))
    setLoading(null)
  }

  const statusColor: Record<string, { bg: string; color: string }> = {
    pending:  { bg: '#FFF7ED', color: '#FB923C' },
    approved: { bg: '#F0FDF4', color: '#22C55E' },
    rejected: { bg: '#FEF2F2', color: '#EF4444' },
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 text-[#9CA3AF]">
        <div className="text-4xl mb-3">📋</div>
        <p className="font-600">No applications yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {applications.map(app => {
        const sc = statusColor[app.status] || statusColor.pending
        const isLoading = loading === app.id
        const displayName = app.full_name || app.profiles?.[0]?.full_name || 'Unknown'
        const displayPhone = app.phone || app.profiles?.[0]?.phone
        const displayEmail = app.profiles?.[0]?.email

        return (
          <div key={app.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-700 text-[#111827]">{displayName}</p>
                {displayEmail && <p className="text-sm text-[#6B7280]">{displayEmail}</p>}
                {displayPhone && <p className="text-sm text-[#6B7280]">{displayPhone}</p>}
                {app.city && <p className="text-xs text-[#9CA3AF] mt-0.5">{app.city}</p>}
                {app.rera_number && (
                  <p className="text-xs text-green-600 mt-0.5">RERA: {app.rera_number}</p>
                )}
                {app.partner_type && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-[#FB923C] border border-orange-200">
                    {app.partner_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-700 px-3 py-1 rounded-full capitalize"
                  style={{ background: sc.bg, color: sc.color }}>
                  {app.status}
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {app.status === 'pending' && (
              <div className="flex gap-3 pt-3 border-t border-[#F5F5F4]">
                <button
                  onClick={() => approve(app)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-700 text-white disabled:opacity-60 transition-all"
                  style={{ background: '#22C55E' }}
                >
                  {isLoading ? '…' : '✓ Approve'}
                </button>
                <button
                  onClick={() => reject(app)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-700 disabled:opacity-60 transition-all bg-[#FEF2F2] text-[#EF4444]"
                >
                  {isLoading ? '…' : '✕ Reject'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
