'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'
import RazorpayButton from '@/components/RazorpayButton'
import FlatFields from '@/components/wizard/FlatFields'
import PlotFields from '@/components/wizard/PlotFields'
import RentalFields from '@/components/wizard/RentalFields'
import CommercialFields from '@/components/wizard/CommercialFields'
import { BLANK_WIZARD_FORM, type WizardForm, type Persona, type Category } from '@/components/wizard/types'

const CITIES = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya', 'Ghaziabad']

const PROPERTY_TYPES: { id: Category; icon: string; label: string }[] = [
  { id: 'flat', icon: '🏢', label: 'Flat / Apartment' },
  { id: 'plot', icon: '🌍', label: 'Plot / Zameen' },
  { id: 'rental', icon: '🏠', label: 'Rental / Room / PG' },
  { id: 'commercial', icon: '🏪', label: 'Commercial' },
]

type Props = {
  userId: string
  initialRole: Persona | null
  expertRegistered: boolean
}

export default function ListPropertyWizard({ userId, initialRole, expertRegistered }: Props) {
  const router = useRouter()
  const alreadyAuthorized = !!initialRole || expertRegistered
  const [step, setStep] = useState<0 | 1 | 2>(alreadyAuthorized ? 1 : 0)
  const [persona] = useState<Persona>(initialRole ?? 'expert')
  const [category, setCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<WizardForm>(BLANK_WIZARD_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const setF = (k: keyof WizardForm, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const toggleArr = (k: 'bhk' | 'amenities', val: string) =>
    setF(k, (form[k] as string[]).includes(val)
      ? (form[k] as string[]).filter(x => x !== val)
      : [...(form[k] as string[]), val])

  const usesMonthlyRent = category === 'rental' || (category === 'commercial' && form.commercial_deal === 'Rent')

  const validateForm = (): string | null => {
    if (!form.title.trim()) return 'Title required hai'
    if (!form.city) return 'City select karo'
    if (!form.locality.trim()) return 'Locality / area required hai'
    if (usesMonthlyRent ? !form.monthly_rent : !form.price_min) return 'Price required hai'
    if (form.photos.length < 3) return 'Kam se kam 3 photos upload karo'
    if (!form.owner_contact.trim()) return 'Contact number required hai'
    if (persona === 'builder' && (category === 'flat' || category === 'plot') && !form.rera_number.trim()) {
      return 'RERA number mandatory hai (Builder)'
    }
    return null
  }

  const buildPayload = () => ({
    title: form.title,
    city: form.city || null,
    locality: form.locality || null,
    sector: form.locality || null,
    price_min: form.price_min ? parseFloat(form.price_min) : null,
    description: form.description || null,
    photos: form.photos.length > 0 ? form.photos : null,
    contact_preference: form.contact_preference,
    owner_contact: form.owner_contact || null,
    property_category: category,
    listing_type: persona,
    created_by: userId,
    listed_by: userId,
    is_active: true,
    is_featured: false,
    bhk: form.bhk.length > 0 ? form.bhk : null,
    floor_number: form.floor_number ? parseInt(form.floor_number) : null,
    total_floors: form.total_floors ? parseInt(form.total_floors) : null,
    super_area: form.super_area ? parseFloat(form.super_area) : null,
    carpet_area: form.carpet_area ? parseFloat(form.carpet_area) : null,
    furnished: form.furnished || null,
    rera_number: form.rera_number || null,
    possession_date: form.possession_date || null,
    age_years: form.age_years ? parseInt(form.age_years) : null,
    parking: form.parking,
    amenities: form.amenities.length > 0 ? form.amenities : null,
    youtube_url: form.youtube_url || null,
    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
    floor_plan: form.floor_plan || null,
    plot_area_sqyard: form.plot_area_sqyard ? parseFloat(form.plot_area_sqyard) : null,
    plot_type: form.plot_type || null,
    corner_plot: form.corner_plot,
    facing: form.facing || null,
    registry_done: form.registry_done,
    boundary_wall: form.boundary_wall,
    monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : null,
    deposit_months: form.deposit_months ? parseInt(form.deposit_months) : null,
    available_from: form.available_from || null,
    tenant_preference: form.tenant_preference || null,
    gender_preference: form.gender_preference || null,
    pets_allowed: form.pets_allowed,
    commercial_type: form.commercial_type || null,
    power_load: form.power_load || null,
    frontage_width: form.frontage_width ? parseFloat(form.frontage_width) : null,
  })

  const insertProperty = async () => {
    const supabase = createClient()
    return supabase.from('properties').insert(buildPayload())
  }

  const handleSubmit = async () => {
    const err = validateForm()
    if (err) { setMsg(err); return }
    setMsg('')
    setSaving(true)
    if (persona === 'builder') {
      await fetch('/api/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'builder' }),
      })
    }
    const { error } = await insertProperty()
    setSaving(false)
    if (error) { setMsg(error.message); return }
    router.push(persona === 'builder' ? '/builder?welcome=1' : '/expert?welcome=1')
  }

  const TypeFields = category === 'flat' ? FlatFields
    : category === 'plot' ? PlotFields
    : category === 'rental' ? RentalFields
    : category === 'commercial' ? CommercialFields
    : null

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2].map(n => (
          <div key={n} className="flex-1 h-1 rounded-full"
            style={{ background: step >= n ? '#FB923C' : 'rgba(0,0,0,0.06)' }} />
        ))}
      </div>

      {/* STEP 0 — payment gate (only reached when not already an authorized expert/builder) */}
      {step === 0 && (
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-800 text-center mb-2" style={{ color: '#111827' }}>
            List Your Property
          </h1>
          <p className="text-center text-sm mb-8" style={{ color: '#6B7280' }}>Become a Property Expert on Orenzaa</p>
          <div className="max-w-sm mx-auto glass p-6" style={{ border: '2px solid rgba(251,146,60,0.4)', background: 'rgba(251,146,60,0.04)' }}>
            <div className="text-4xl mb-3">🤝</div>
            <h2 className="font-heading text-xl font-800 mb-2" style={{ color: '#111827' }}>Property Expert</h2>
            <ul className="text-sm space-y-1.5 mb-5" style={{ color: '#6B7280' }}>
              <li>✅ ₹49 one-time — lifetime access</li>
              <li>✅ 5 free property listings</li>
              <li>✅ AI-scored buyer leads HOT🔥 WARM🌡️ COLD❄️</li>
              <li>✅ WhatsApp Status Card for each property</li>
              <li>✅ Orenzaa Verified Expert badge</li>
              <li>✅ WhatsApp alerts on new leads</li>
              <li>✅ Expert dashboard with analytics</li>
            </ul>
            <RazorpayButton
              amount={49}
              plan="expert-registration"
              role="expert"
              label="Pay ₹49 & Start Listing →"
              onVerified={() => setStep(1)}
              redirectTo={false}
              className="btn-accent w-full"
            />
          </div>
        </div>
      )}

      {/* STEP 1 — property type */}
      {step === 1 && (
        <div>
          <h1 className="font-heading text-2xl font-800 text-center mb-2" style={{ color: '#111827' }}>What are you listing?</h1>
          <p className="text-center text-sm mb-8" style={{ color: '#6B7280' }}>Pick a property type</p>
          <div className="grid grid-cols-2 gap-3">
            {PROPERTY_TYPES.map(t => (
              <div key={t.id} className="glass p-5 text-center cursor-pointer"
                style={{ border: '2px solid rgba(0,0,0,0.06)' }}
                onClick={() => { setCategory(t.id); setStep(2) }}>
                <div className="text-3xl mb-2">{t.icon}</div>
                <div className="text-sm font-700" style={{ color: '#111827' }}>{t.label}</div>
              </div>
            ))}
          </div>
          {!alreadyAuthorized && (
            <button onClick={() => setStep(0)} suppressHydrationWarning
              className="mt-6 text-sm" style={{ color: '#6B7280' }}>← Back</button>
          )}
        </div>
      )}

      {/* STEP 2 — form + submit (payment already done, if it was needed) */}
      {step === 2 && TypeFields && (
        <div className="glass p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Photos (3–10)</label>
            <PhotoUpload photos={form.photos} setPhotos={v => setF('photos', v)} maxFiles={10} />
          </div>

          <input className="input-dark text-sm" placeholder="Property title *"
            value={form.title} onChange={e => setF('title', e.target.value)} suppressHydrationWarning />

          <div className="grid grid-cols-2 gap-3">
            <select className="input-dark text-sm" value={form.city}
              onChange={e => setF('city', e.target.value)} suppressHydrationWarning>
              <option value="">Select City</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="input-dark text-sm" placeholder="Locality / Area *"
              value={form.locality} onChange={e => setF('locality', e.target.value)} suppressHydrationWarning />
          </div>

          {!usesMonthlyRent && (
            <input className="input-dark text-sm" placeholder="Price (₹) *" type="number"
              value={form.price_min} onChange={e => setF('price_min', e.target.value)} suppressHydrationWarning />
          )}

          <TypeFields form={form} persona={persona} setF={setF} toggleArr={toggleArr} />

          <textarea className="input-dark text-sm resize-none" rows={3} placeholder="Description"
            value={form.description} onChange={e => setF('description', e.target.value)} suppressHydrationWarning />

          <div>
            <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Contact preference</label>
            <div className="flex gap-2 mb-3">
              {(['call', 'whatsapp', 'both'] as const).map(c => (
                <button key={c} type="button" onClick={() => setF('contact_preference', c)} suppressHydrationWarning
                  className="text-sm px-3 py-1.5 rounded-xl capitalize transition-all"
                  style={{
                    background: form.contact_preference === c ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${form.contact_preference === c ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.06)'}`,
                    color: form.contact_preference === c ? '#FB923C' : '#6B7280',
                  }}>
                  {c}
                </button>
              ))}
            </div>
            <input className="input-dark text-sm" placeholder="Your contact number *" type="tel"
              value={form.owner_contact} onChange={e => setF('owner_contact', e.target.value)} suppressHydrationWarning />
          </div>

          {msg && <p className="text-sm" style={{ color: '#F87171' }}>{msg}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} suppressHydrationWarning
              className="px-5 py-2.5 rounded-xl text-sm font-700" style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
              ← Back
            </button>
            <button onClick={handleSubmit} disabled={saving} suppressHydrationWarning className="btn-accent flex-1 disabled:opacity-50">
              {saving ? 'Listing…' : '+ List My Property'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
