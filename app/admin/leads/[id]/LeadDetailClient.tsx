'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = ['New', 'Called', 'Visit Fixed', 'Deal Done', 'Not Interested'] as const
type LeadStatus = typeof STATUS_OPTIONS[number]

const STATUS_STYLES: Record<LeadStatus, { bg: string; color: string; border: string }> = {
  'New':            { bg: 'rgba(0,0,0,0.03)', color: '#6B7280', border: 'rgba(0,0,0,0.06)' },
  'Called':         { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6', border: 'rgba(59,130,246,0.3)'   },
  'Visit Fixed':    { bg: 'rgba(251,146,60,0.08)',   color: '#FB923C', border: 'rgba(251,146,60,0.25)'   },
  'Deal Done':      { bg: 'rgba(16,185,129,0.1)',   color: '#22C55E', border: 'rgba(16,185,129,0.3)'   },
  'Not Interested': { bg: 'rgba(239,68,68,0.08)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)'   },
}

export default function LeadDetailClient({ leadId, currentStatus }: { leadId: string; currentStatus: LeadStatus }) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const updateStatus = (newStatus: LeadStatus) => {
    startTransition(async () => {
      await createClient().from('leads').update({ status: newStatus }).eq('id', leadId)
      setStatus(newStatus)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="text-xs text-[#6B7280] mb-3 font-600 uppercase tracking-wider">Update Status</div>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(s => {
          const ss = STATUS_STYLES[s]
          const active = status === s
          return (
            <button key={s} onClick={() => updateStatus(s)} disabled={isPending} suppressHydrationWarning
              className="text-xs px-3.5 py-1.5 rounded-full font-600 border transition-all disabled:opacity-40"
              style={{
                background: active ? ss.bg : 'transparent',
                color: active ? ss.color : '#9CA3AF',
                borderColor: active ? ss.border : 'rgba(0,0,0,0.05)',
              }}>
              {active && '✓ '}{s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
