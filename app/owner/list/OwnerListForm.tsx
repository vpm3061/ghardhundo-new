'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'

const PROPERTY_TYPES = ['Flat / Apartment', 'House / Villa', 'Plot / Land', 'Rental']
const CITIES = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya', 'Kanpur', 'Agra', 'Varanasi', 'Other']
const BHK_OPTS = ['1', '2', '3', '4', '5+']

export default function OwnerListForm({ userId }: { userId: string }) {
  const [form, setForm] = useState({
    property_type: '', title: '', city: '', sector: '',
    price: '', bhk: '', description: '', phone: '', photos: [] as string[],
  })
  const [saving, start] = useTransition()
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const setF = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = () => {
    start(async () => {
      setMsg('')
      if (!form.title || !form.phone) {
        setMsg('Title aur contact number required hai')
        return
      }
      const supabase = createClient()

      /* Mark user as owner */
      await supabase.from('profiles').update({ role: 'owner' }).eq('id', userId)

      /* Insert property */
      const { error } = await supabase.from('properties').insert({
        title:         form.title,
        city:          form.city     || null,
        sector:        form.sector   || null,
        price_min:     form.price    ? parseFloat(form.price) : null,
        bhk:           form.bhk      ? [form.bhk] : null,
        description:   form.description || null,
        owner_contact: form.phone,
        listing_type:  'owner',
        created_by:    userId,
        listed_by:     userId,
        is_active:     true,
        is_featured:   false,
        photos:        form.photos.length > 0 ? form.photos : null,
      })

      if (error) { setMsg(error.message); return }

      router.push('/owner?welcome=1')
    })
  }

  return (
    <div className="glass p-5 flex flex-col gap-4">

      {/* Property type chips */}
      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Property Type</label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setF('property_type', t)}
              suppressHydrationWarning
              className="text-sm px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: form.property_type === t ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${form.property_type === t ? 'rgba(16,185,129,0.4)' : 'rgba(0,0,0,0.06)'}`,
                color: form.property_type === t ? '#22C55E' : '#6B7280',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Photos (optional)</label>
        <PhotoUpload photos={form.photos} setPhotos={v => setF('photos', v)} maxFiles={10} />
      </div>

      {/* Title */}
      <input className="input-dark text-sm" placeholder="Property title *  (e.g. 3BHK Flat in Gomti Nagar)"
        value={form.title} onChange={e => setF('title', e.target.value)} suppressHydrationWarning />

      {/* City + Sector */}
      <div className="grid grid-cols-2 gap-3">
        <select className="input-dark text-sm" value={form.city}
          onChange={e => setF('city', e.target.value)} suppressHydrationWarning>
          <option value="">Select City</option>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input className="input-dark text-sm" placeholder="Sector / Colony / Area"
          value={form.sector} onChange={e => setF('sector', e.target.value)} suppressHydrationWarning />
      </div>

      {/* Price + BHK */}
      <div className="grid grid-cols-2 gap-3">
        <input className="input-dark text-sm" placeholder="Expected Price (₹)" type="number"
          value={form.price} onChange={e => setF('price', e.target.value)} suppressHydrationWarning />
        <select className="input-dark text-sm" value={form.bhk}
          onChange={e => setF('bhk', e.target.value)} suppressHydrationWarning>
          <option value="">BHK / Size</option>
          {BHK_OPTS.map(b => <option key={b}>{b} BHK</option>)}
        </select>
      </div>

      {/* Description */}
      <textarea className="input-dark text-sm resize-none" rows={3}
        placeholder="Property description — highlights, floor, parking, etc."
        value={form.description} onChange={e => setF('description', e.target.value)} suppressHydrationWarning />

      {/* Contact */}
      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Your Contact Number *</label>
        <input className="input-dark text-sm" placeholder="+91 XXXXX XXXXX" type="tel"
          value={form.phone} onChange={e => setF('phone', e.target.value)} suppressHydrationWarning />
        <p className="text-[11px] mt-1" style={{ color: '#9CA3AF' }}>Only shown to interested buyers after they submit an enquiry.</p>
      </div>

      {msg && <p className="text-sm" style={{ color: msg.includes('required') ? '#F87171' : '#22C55E' }}>{msg}</p>}

      <button onClick={handleSubmit} disabled={saving} suppressHydrationWarning
        className="btn-accent disabled:opacity-50 text-sm">
        {saving ? 'Listing…' : '🏠 List My Property Free'}
      </button>

    </div>
  )
}
