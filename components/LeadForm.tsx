'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']
const TIMELINE_OPTIONS = ['1-3 months', '3-6 months', '6-12 months', 'More than 1 year']
const LOAN_OPTIONS = ['Loan Approved', 'Applied / In Process', 'Not Applied Yet']
const PURPOSE_OPTIONS = ['Self Use', 'Investment']

function getReferrerId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)orenzaa_ref=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

interface LeadFormProps {
  userId: string | null
  propertyId: string
  propertyTitle: string
  onSuccess?: () => void
}

export default function LeadForm({ userId, propertyId, propertyTitle, onSuccess }: LeadFormProps) {
  const [form, setForm] = useState({ name: '', phone: '', budget: '', bhk: '', timeline: '', loan_status: '', purpose: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    if (!form.phone.match(/^[+]?[0-9]{10,13}$/)) { setError('Please enter a valid phone number'); return }
    setSubmitting(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('leads').insert({
      user_id: userId, property_id: propertyId,
      name: form.name, phone: form.phone,
      budget: form.budget || null, bhk: form.bhk || null,
      timeline: form.timeline || null, loan_status: form.loan_status || null,
      purpose: form.purpose || null, referrer_id: getReferrerId(),
      ai_score: 0, tier: 'COLD', status: 'New',
    })
    setSubmitting(false)
    if (err) { setError('Failed to submit. Please try again.'); return }
    setSubmitted(true); onSuccess?.()
  }

  if (submitted) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <h3 className="font-heading font-700 mb-1 text-[#111827]">Request Submitted!</h3>
        <p className="text-[#6B7280] text-sm">We'll contact you about <span className="text-[#111827]">{propertyTitle}</span> within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <h3 className="font-heading font-700 mb-0.5 text-[#111827]">Schedule a Site Visit</h3>
      <p className="text-[#6B7280] text-xs mb-4">Get expert guidance from our property advisors</p>

      {error && <p className="text-red-600 text-xs mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" suppressHydrationWarning>
        <input type="text" placeholder="Full name" required className="input-dark" value={form.name} onChange={e => set('name', e.target.value)} suppressHydrationWarning />
        <input type="tel" placeholder="Phone number" required className="input-dark" value={form.phone} onChange={e => set('phone', e.target.value)} suppressHydrationWarning />
        <input type="text" placeholder="Budget (e.g. ₹80L – ₹1.2Cr)" className="input-dark" value={form.budget} onChange={e => set('budget', e.target.value)} suppressHydrationWarning />
        <div className="grid grid-cols-2 gap-2">
          {([
            ['bhk', 'BHK Type', BHK_OPTIONS],
            ['timeline', 'Timeline', TIMELINE_OPTIONS],
            ['loan_status', 'Loan Status', LOAN_OPTIONS],
            ['purpose', 'Purpose', PURPOSE_OPTIONS],
          ] as [string, string, string[]][]).map(([key, label, opts]) => (
            <select key={key} className="input-dark text-sm" value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} suppressHydrationWarning>
              <option value="">{label}</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
        <button type="submit" disabled={submitting} className="btn-accent mt-1 disabled:opacity-50" suppressHydrationWarning>
          {submitting ? 'Submitting…' : 'Book Site Visit →'}
        </button>
      </form>
    </div>
  )
}
