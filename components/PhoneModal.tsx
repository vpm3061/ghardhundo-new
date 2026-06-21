'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PhoneModal({ userId }: { userId: string }) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.match(/^[+]?[0-9]{10,13}$/)) {
      setError('Please enter a valid phone number')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('profiles')
        .update({ phone: phone.trim(), full_name: name.trim() || undefined })
        .eq('id', userId)
      if (err) { setError('Failed to save. Please try again.'); return }
      router.refresh()
    })
  }

  return (
    <div className="modal-overlay">
      <div className="w-full max-w-sm animate-scale-in" style={{ background: 'rgba(18,18,26,0.95)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '28px' }}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(109,40,217,0.1))', border: '1px solid rgba(251,146,60,0.25)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
            </svg>
          </div>
          <h2 className="font-heading text-xl font-800 text-[#111827]">One last step</h2>
          <p className="text-[#6B7280] text-sm mt-1">Add your phone number to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" suppressHydrationWarning>
          <div>
            <label className="text-xs text-[#6B7280] mb-1.5 block">Full Name <span className="text-[#9CA3AF]">(optional)</span></label>
            <input
              type="text" className="input-dark" placeholder="Your full name"
              value={name} onChange={e => setName(e.target.value)} suppressHydrationWarning
            />
          </div>
          <div>
            <label className="text-xs text-[#6B7280] mb-1.5 block">
              Phone Number <span className="text-[#FB923C]">*</span>
            </label>
            <input
              type="tel" className="input-dark" placeholder="+91 98765 43210" required
              value={phone} onChange={e => { setPhone(e.target.value); setError('') }} suppressHydrationWarning
            />
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>
          <button
            type="submit" disabled={isPending} suppressHydrationWarning
            className="btn-accent w-full mt-2 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Continue →'}
          </button>
        </form>

        <p className="text-center text-[#9CA3AF] text-xs mt-4">
          Used only to contact you about properties you're interested in.
        </p>
      </div>
    </div>
  )
}
