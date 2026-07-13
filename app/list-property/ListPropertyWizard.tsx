'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'
import RazorpayButton from '@/components/RazorpayButton'
import FlatFields from '@/components/wizard/FlatFields'
import PlotFields from '@/components/wizard/PlotFields'
import RentalFields from '@/components/wizard/RentalFields'
import CommercialFields from '@/components/wizard/CommercialFields'
import { BLANK_WIZARD_FORM, type WizardForm, type Persona, type Category } from '@/components/wizard/types'

const CITIES = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya', 'Ghaziabad']
const EXPERT_CITIES = [...CITIES, 'Other']
const EXPERIENCE_OPTIONS = ['0-1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years']
const SPECIALIZATIONS = ['Residential Flats', 'Plots', 'Rental', 'Commercial', 'All types']

type RegForm = {
  full_name: string
  phone: string
  whatsapp_number: string
  city: string
  experience_years: string
  property_specialization: string[]
  rera_number: string
}

const BLANK_REG_FORM: RegForm = {
  full_name: '',
  phone: '',
  whatsapp_number: '',
  city: '',
  experience_years: '',
  property_specialization: [],
  rera_number: '',
}

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

type Step = 0 | 'register' | 1 | 2

export default function ListPropertyWizard({ userId, initialRole, expertRegistered }: Props) {
  const router = useRouter()
  const alreadyAuthorized = !!initialRole || expertRegistered
  const [step, setStep] = useState<Step>(alreadyAuthorized ? 1 : 0)
  const [persona] = useState<Persona>(initialRole ?? 'expert')
  const [category, setCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<WizardForm>(BLANK_WIZARD_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [userEmail, setUserEmail] = useState('')
  const [regForm, setRegForm] = useState<RegForm>(BLANK_REG_FORM)
  const [regSaving, setRegSaving] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserEmail(user.email || '')
      setRegForm(f => ({ ...f, full_name: user.user_metadata?.full_name || f.full_name }))
    })
  }, [])

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

  const toggleSpecialization = (val: string) =>
    setRegForm(f => ({
      ...f,
      property_specialization: f.property_specialization.includes(val)
        ? f.property_specialization.filter(x => x !== val)
        : [...f.property_specialization, val],
    }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regForm.full_name.trim() || !regForm.phone.trim() || !regForm.city) {
      toast.error('Naam, phone aur city zaroori hain!')
      return
    }
    setRegSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setRegSaving(false); return }

    const { error } = await supabase.from('profiles').update({
      full_name: regForm.full_name,
      phone: regForm.phone,
      whatsapp_number: regForm.whatsapp_number || regForm.phone,
      city: regForm.city,
      experience_years: regForm.experience_years || null,
      property_specialization: regForm.property_specialization.length > 0 ? regForm.property_specialization : null,
      rera_number: regForm.rera_number || null,
      role: 'expert',
      expert_registered: true,
      profile_complete: true,
      registration_paid_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (error) { toast.error('Error: ' + error.message); setRegSaving(false); return }

    await fetch('/api/notify-expert-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: regForm.full_name,
        phone: regForm.phone,
        email: user.email,
        city: regForm.city,
      }),
    }).catch(() => {})

    toast.success('Welcome to Orenzaa! 🎉')
    setRegSaving(false)
    setRegSuccess(true)
    setTimeout(() => router.push('/expert'), 2000)
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

  const STEP_ORDER: Step[] = [0, 'register', 1, 2]
  const stepPos = STEP_ORDER.indexOf(step)

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_ORDER.map(n => (
          <div key={String(n)} className="flex-1 h-1 rounded-full"
            style={{ background: stepPos >= STEP_ORDER.indexOf(n) ? '#FB923C' : 'rgba(0,0,0,0.06)' }} />
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
              onVerified={() => setStep('register')}
              redirectTo={false}
              className="btn-accent w-full"
            />
          </div>
        </div>
      )}

      {/* STEP 'register' — post-payment expert registration form */}
      {step === 'register' && (
        <div className="max-w-md mx-auto">
          {regSuccess ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🎉</div>
              <h1 className="text-2xl font-bold text-[#111827]">Welcome to Orenzaa!</h1>
              <p className="text-[#6B7280] mt-1">Taking you to your dashboard…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✅</div>
                <h1 className="text-2xl font-bold text-[#111827]">Payment Successful!</h1>
                <p className="text-[#6B7280] mt-1">Ab apni details bharo — almost done!</p>
              </div>

              <form onSubmit={handleRegister} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1">Email</label>
                  <input type="email" value={userEmail} disabled
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400" />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1">Full Name *</label>
                  <input type="text" value={regForm.full_name}
                    onChange={e => setRegForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Aapka poora naam" suppressHydrationWarning
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]" />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1">Phone Number *</label>
                  <input type="tel" value={regForm.phone}
                    onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="9876543210" suppressHydrationWarning
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]" />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1">WhatsApp Number</label>
                  <input type="tel" value={regForm.whatsapp_number}
                    onChange={e => setRegForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                    placeholder="Same as phone? Khali rakho" suppressHydrationWarning
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]" />
                  <p className="text-xs text-[#9CA3AF] mt-1">Leads ke alerts yahan aayenge</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1">City *</label>
                  <select value={regForm.city}
                    onChange={e => setRegForm(f => ({ ...f, city: e.target.value }))} suppressHydrationWarning
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]">
                    <option value="">Select city</option>
                    {EXPERT_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1">Experience in Real Estate</label>
                  <select value={regForm.experience_years}
                    onChange={e => setRegForm(f => ({ ...f, experience_years: e.target.value }))} suppressHydrationWarning
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]">
                    <option value="">Select experience</option>
                    {EXPERIENCE_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-2">I deal in (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map(s => (
                      <button key={s} type="button" onClick={() => toggleSpecialization(s)} suppressHydrationWarning
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                          regForm.property_specialization.includes(s)
                            ? 'bg-orange-100 text-orange-600 border-orange-400'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1">
                    RERA Number <span className="text-[#9CA3AF] font-normal">(optional)</span>
                  </label>
                  <input type="text" value={regForm.rera_number}
                    onChange={e => setRegForm(f => ({ ...f, rera_number: e.target.value }))}
                    placeholder="Adds verified badge to your profile" suppressHydrationWarning
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]" />
                </div>

                <button type="submit" disabled={regSaving} suppressHydrationWarning
                  className="w-full py-4 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-bold rounded-xl disabled:opacity-50 text-base">
                  {regSaving ? 'Setting up your account...' : 'Complete Registration & Go to Dashboard →'}
                </button>
              </form>
            </>
          )}
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
