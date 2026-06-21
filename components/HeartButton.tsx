'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  propertyId: string
  userId?: string
  initialSaved?: boolean
  size?: number
}

export default function HeartButton({ propertyId, userId, initialSaved = false, size = 18 }: Props) {
  const [saved, setSaved]   = useState(initialSaved)
  const [isPending, start]  = useTransition()

  if (!userId) return null

  const toggle = () => {
    start(async () => {
      const supabase = createClient()
      if (saved) {
        await supabase.from('saved_properties')
          .delete()
          .eq('user_id', userId)
          .eq('property_id', propertyId)
      } else {
        try {
          await supabase.from('saved_properties').insert({ user_id: userId, property_id: propertyId })
        } catch { /* ignore duplicate — UNIQUE constraint */ }
      }
      setSaved(v => !v)
    })
  }

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle() }}
      disabled={isPending}
      suppressHydrationWarning
      aria-label={saved ? 'Unsave property' : 'Save property'}
      className="flex items-center justify-center rounded-full transition-all disabled:opacity-50"
      style={{
        width:      size + 16,
        height:     size + 16,
        background: saved ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${saved ? 'rgba(239,68,68,0.35)' : '#E5E7EB'}`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={saved ? '#EF4444' : 'none'}
        stroke={saved ? '#EF4444' : '#9CA3AF'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    </button>
  )
}
