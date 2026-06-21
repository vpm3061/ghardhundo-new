'use client'
import { useState } from 'react'

export default function RevealButton({ leadId, alreadyRevealed, initialPhone }: {
  leadId: string
  alreadyRevealed: boolean
  initialPhone?: string
}) {
  const [phone, setPhone] = useState(alreadyRevealed ? initialPhone || '' : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reveal = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/reveal-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setPhone(data.phone)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (phone) {
    return (
      <a href={`tel:${phone}`}
        className="flex items-center gap-2 text-sm font-700 px-4 py-2 rounded-full transition-all"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#22C55E' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
        </svg>
        {phone}
      </a>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={reveal} disabled={loading} suppressHydrationWarning
        className="flex items-center gap-1.5 text-xs font-700 px-3.5 py-2 rounded-full transition-all disabled:opacity-50"
        style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C' }}>
        🔒 {loading ? 'Revealing…' : 'Reveal Contact (10 🪙)'}
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
