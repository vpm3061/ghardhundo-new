'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CITY_OPTIONS = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']
const BHK_OPTIONS = ['1', '2', '3', '4']
const AMENITY_OPTIONS = ['Swimming Pool', 'Club House', 'Gym', '24hr Security', 'Power Backup', 'Parking', 'Garden', 'Kids Zone']
const STATUS_OPTIONS = ['Ready to Move', 'Under Construction', 'New Launch'] as const
type FormStatus = (typeof STATUS_OPTIONS)[number] | ''

type FormState = {
  title: string; builder: string; sector: string; city: string
  price_min: string; price_max: string; bhk: string[]; status: FormStatus
  rera_number: string; description: string; amenities: string[]; photos: string[]
}
const EMPTY: FormState = {
  title: '', builder: '', sector: '', city: '',
  price_min: '', price_max: '', bhk: [], status: '',
  rera_number: '', description: '', amenities: [], photos: [''],
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass p-5">
    <p className="text-xs font-700 uppercase tracking-wider mb-4" style={{ color: '#A78BFA' }}>{title}</p>
    {children}
  </div>
)

export default function ListPropertyForm({ userId }: { userId: string }) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (key: 'bhk' | 'amenities', v: string) =>
    set(key, (form[key] as string[]).includes(v) ? (form[key] as string[]).filter(x => x !== v) : [...(form[key] as string[]), v])
  const setPhoto = (i: number, v: string) => { const n = [...form.photos]; n[i] = v; set('photos', n) }

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault(); setError('')
    startTransition(async () => {
      const { error: err } = await createClient().from('properties').insert({
        title: form.title, builder: form.builder || null, sector: form.sector || null,
        city: form.city || null,
        price_min: form.price_min ? parseFloat(form.price_min) : null,
        price_max: form.price_max ? parseFloat(form.price_max) : null,
        bhk: form.bhk.length ? form.bhk : null,
        status: (form.status || null) as 'Ready to Move' | 'Under Construction' | 'New Launch' | null,
        rera_number: form.rera_number || null, description: form.description || null,
        amenities: form.amenities.length ? form.amenities : null,
        photos: form.photos.filter(s => s.trim()).length ? form.photos.filter(s => s.trim()) : null,
        is_active: false, listed_by: userId,
      })
      if (err) { setError('Failed to submit. Please try again.'); return }
      setDone(true); router.refresh()
    })
  }

  if (done) {
    return (
      <div className="glass p-10 text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h2 className="font-heading text-2xl font-800 text-[#F1F0FF] mb-2">Property Submitted!</h2>
        <p className="text-[#8B8BA8] text-sm mb-5">Our team will review and publish it within 24 hours.</p>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
          <span>🪙</span>
          <span className="font-heading font-800 text-lg" style={{ color: '#A78BFA' }}>+50 coins</span>
          <span className="text-[#8B8BA8] text-sm">credited to your account</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" suppressHydrationWarning>
      {error && (
        <p className="text-red-400 text-sm px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </p>
      )}

      <Section title="Basic Info">
        <div className="flex flex-col gap-3">
          <input className="input-dark" placeholder="Project / Property Title *" required value={form.title} onChange={e => set('title', e.target.value)} suppressHydrationWarning />
          <div className="grid grid-cols-2 gap-2">
            <input className="input-dark text-sm" placeholder="Builder / Developer" value={form.builder} onChange={e => set('builder', e.target.value)} suppressHydrationWarning />
            <input className="input-dark text-sm" placeholder="Sector / Locality" value={form.sector} onChange={e => set('sector', e.target.value)} suppressHydrationWarning />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="input-dark text-sm" value={form.city} onChange={e => set('city', e.target.value)} suppressHydrationWarning>
              <option value="">Select City</option>
              {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-dark text-sm" value={form.status} onChange={e => set('status', e.target.value as FormStatus)} suppressHydrationWarning>
              <option value="">Select Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input className="input-dark text-sm" placeholder="RERA Number" value={form.rera_number} onChange={e => set('rera_number', e.target.value)} suppressHydrationWarning />
        </div>
      </Section>

      <Section title="BHK Configuration">
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map(b => (
            <button key={b} type="button" suppressHydrationWarning onClick={() => toggle('bhk', b)}
              className="px-4 py-2 rounded-full text-sm font-700 border transition-all"
              style={form.bhk.includes(b) ? { background: 'rgba(124,58,237,0.2)', color: '#A78BFA', borderColor: 'rgba(124,58,237,0.5)' } : { background: 'transparent', color: '#8B8BA8', borderColor: 'rgba(255,255,255,0.06)' }}>
              {b} BHK
            </button>
          ))}
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#4A4A6A] mb-1.5 block">Min Price (₹)</label>
            <input className="input-dark text-sm" type="number" placeholder="e.g. 4500000" value={form.price_min} onChange={e => set('price_min', e.target.value)} suppressHydrationWarning />
          </div>
          <div>
            <label className="text-xs text-[#4A4A6A] mb-1.5 block">Max Price (₹)</label>
            <input className="input-dark text-sm" type="number" placeholder="e.g. 8500000" value={form.price_max} onChange={e => set('price_max', e.target.value)} suppressHydrationWarning />
          </div>
        </div>
      </Section>

      <Section title="Description">
        <textarea className="input-dark text-sm min-h-[90px] resize-none" placeholder="Describe the project…" value={form.description} onChange={e => set('description', e.target.value)} suppressHydrationWarning />
      </Section>

      <Section title="Amenities">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AMENITY_OPTIONS.map(a => (
            <label key={a} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm"
              style={form.amenities.includes(a) ? { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#F1F0FF' } : { border: '1px solid rgba(255,255,255,0.06)', color: '#8B8BA8' }}>
              <input type="checkbox" className="w-3.5 h-3.5 shrink-0" checked={form.amenities.includes(a)} onChange={() => toggle('amenities', a)} style={{ accentColor: '#7C3AED' }} suppressHydrationWarning />
              <span className="leading-tight">{a}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Photo URLs">
        <div className="flex flex-col gap-2">
          {form.photos.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input className="input-dark text-sm flex-1" type="url" placeholder={`Photo URL ${i + 1}`} value={url} onChange={e => setPhoto(i, e.target.value)} suppressHydrationWarning />
              {form.photos.length > 1 && (
                <button type="button" onClick={() => set('photos', form.photos.filter((_, idx) => idx !== i))} suppressHydrationWarning
                  className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#4A4A6A' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set('photos', [...form.photos, ''])} suppressHydrationWarning
            className="text-sm py-2.5 rounded-xl transition-all"
            style={{ border: '1px dashed rgba(255,255,255,0.1)', color: '#8B8BA8' }}>
            + Add photo
          </button>
        </div>
      </Section>

      <button type="submit" disabled={isPending} className="btn-accent text-base py-4 disabled:opacity-50" suppressHydrationWarning>
        {isPending ? 'Submitting…' : 'Submit Property & Earn 50 Coins 🪙'}
      </button>
    </form>
  )
}
