'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ZeroSpamBadge from './ZeroSpamBadge'
import DigitalVipPass from './DigitalVipPass'
import { indiaToday, type VipPass } from '@/lib/trust'

const PURPOSE_OPTIONS = [
  ['Self Use', 'Buying for yourself or family'],
  ['Long-Term Investment ROI', 'Long-term investment'],
  ['Rental Income', 'Looking for rental income'],
] as const
const URGENCY_OPTIONS = [
  ['today_tomorrow', '🔥 Today / Tomorrow', 'Priority lock slot'],
  ['next_3_7_days', '⚡ Within 3 to 7 Days', 'Weekend visit window'],
  ['next_15_days', '📅 Next 15 Days', 'Plan a visit soon'],
] as const

function getReferrerId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)orenzaa_ref=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

interface LeadFormProps { userId: string | null; propertyId: string; propertyTitle: string; onSuccess?: () => void }

export default function LeadForm({ userId, propertyId, propertyTitle, onSuccess }: LeadFormProps) {
  const [form, setForm] = useState({ name: '', phone: '', budget: '', bhk: '', timeline: '', loan_status: '', purpose: '', urgency_timeline: '', visit_date: '', whatsapp_consent: false, disclaimer_accepted: false })
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [pass, setPass] = useState<VipPass | null>(null)
  const requestId = useRef('')
  const set = (field: string, value: string | boolean) => { requestId.current = ''; setForm(prev => ({ ...prev, [field]: value })) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      if (step === 1 && !form.purpose) { setError('Please select what you are looking for'); return }
      if (step === 2 && !form.urgency_timeline) { setError('Please select your visit timeline'); return }
      setError(''); setStep(step === 1 ? 2 : 3); return
    }
    if (!userId) { router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`); return }
    setSubmitting(true); setError('')
    try {
      requestId.current ||= crypto.randomUUID()
      const response = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, property_id: propertyId, request_id: requestId.current, referrer_id: getReferrerId() }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save your request')
      setPass(result.pass); setSubmitted(true); onSuccess?.()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your request. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (submitted && pass) return <DigitalVipPass pass={pass} />
  if (submitted) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
    <h3 className="font-bold text-slate-800">Request submitted</h3>
    <p className="mt-2 text-sm text-slate-600">Your request for {propertyTitle} is saved. Orenzaa will confirm your visit time.</p>
  </div>

  return <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="mb-1 font-bold text-slate-800">Get your VIP Site Visit Pass</h3>
    <p className="mb-4 text-xs text-slate-500">Step {step} of 3 · visit request and pass are free</p>
    <div className="mb-4"><ZeroSpamBadge /></div>
    {error && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {step === 1 && <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold text-slate-800">1. What is your purpose?</legend>
        {PURPOSE_OPTIONS.map(([value, label]) => <label key={value} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
          <input type="radio" name="purpose" required checked={form.purpose === value} onChange={() => set('purpose', value)} />{label}
        </label>)}
      </fieldset>}

      {step === 2 && <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold text-slate-800">2. When would you like to visit?</legend>
        {URGENCY_OPTIONS.map(([value, label, helper]) => <label key={value} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
          <input type="radio" name="urgency" required checked={form.urgency_timeline === value} onChange={() => set('urgency_timeline', value)} />
          <span><strong>{label}</strong><span className="block text-xs text-slate-500">{helper}</span></span>
        </label>)}
      </fieldset>}

      {step === 3 && <>
        <h4 className="text-sm font-bold text-slate-800">3. Your details and legal consent</h4>
        <input type="text" aria-label="Full name" autoComplete="name" maxLength={100} placeholder="Full name" required className="input-dark" value={form.name} onChange={e => set('name', e.target.value)} />
        <input type="tel" aria-label="Phone number" autoComplete="tel" maxLength={25} placeholder="Phone number" required className="input-dark" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <input type="text" placeholder="Budget (optional)" className="input-dark" value={form.budget} onChange={e => set('budget', e.target.value)} />
        <label className="text-sm text-slate-700">Preferred visit date
          <input type="date" required min={indiaToday()} className="input-dark mt-1 w-full" value={form.visit_date} onChange={e => set('visit_date', e.target.value)} />
        </label>
        <label className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-slate-800">
          <input type="checkbox" required className="mt-0.5" checked={form.disclaimer_accepted} onChange={e => set('disclaimer_accepted', e.target.checked)} />
          I understand Orenzaa is a technology-enabled aggregator, not a developer, owner or title guarantor. I will independently verify title, registry, and all transaction details before paying any advance.
        </label>
        <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" className="mt-0.5" checked={form.whatsapp_consent} onChange={e => set('whatsapp_consent', e.target.checked)} />
          I agree to receive WhatsApp updates about this visit. This is optional.
        </label>
      </>}

      <div className="flex gap-2">
        {step > 1 && <button type="button" onClick={() => { setError(''); setStep(step === 3 ? 2 : 1) }} className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">Back</button>}
        <button type="submit" disabled={submitting} className="btn-accent mt-1 flex-1 disabled:opacity-50">
          {submitting ? 'Saving request…' : step < 3 ? 'Continue →' : 'Create VIP Pass →'}
        </button>
      </div>
      <p className="text-xs text-slate-500">No property booking payment is collected by Orenzaa. Our team will confirm the site visit.</p>
    </form>
  </div>
}
