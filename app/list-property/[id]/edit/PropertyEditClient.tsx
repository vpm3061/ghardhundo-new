'use client'
import PropertyLocationFields from '@/components/PropertyLocationFields'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'
import PillarFields from '@/components/wizard/PillarFields'
import type { WizardForm, PropertyPillar } from '@/components/wizard/types'
import type { Property } from '@/lib/supabase/types'


function toWizardForm(p: Property): WizardForm {
  return {
    pillar: p.property_pillar ?? (p.property_category === 'plot' ? 'land' : p.property_category === 'commercial' ? 'commercial' : 'residential'),
    intent: p.listing_intent ?? (p.property_category === 'rental' || p.monthly_rent != null ? 'rent' : 'sale'),
    property_subtype: p.property_subtype ?? '', land_area_unit: p.land_area_unit ?? 'sq. yard',
    stamp_duty_estimate: p.stamp_duty_estimate != null ? String(p.stamp_duty_estimate) : '',
    legal_fees_estimate: p.legal_fees_estimate != null ? String(p.legal_fees_estimate) : '',
    security_deposit_amount: p.security_deposit_amount != null ? String(p.security_deposit_amount) : '',
    advance_terms: p.advance_terms ?? '', lease_duration_months: p.lease_duration_months != null ? String(p.lease_duration_months) : '',
    title: p.title ?? '',
    city: p.city ?? '',
    locality: p.locality ?? p.sector ?? '',
    price_min: p.price_min != null ? String(p.price_min) : '',
    description: p.description ?? '',
    photos: p.photos ?? [],
    contact_preference: p.contact_preference ?? 'both',
    owner_contact: p.owner_contact ?? '',
    bhk: p.bhk ?? [],
    floor_number: p.floor_number != null ? String(p.floor_number) : '',
    total_floors: p.total_floors != null ? String(p.total_floors) : '',
    super_area: p.super_area != null ? String(p.super_area) : '',
    carpet_area: p.carpet_area != null ? String(p.carpet_area) : '',
    furnished: p.furnished ?? '',
    rera_number: p.rera_number ?? '',
    possession_date: p.possession_date ?? '',
    age_years: p.age_years != null ? String(p.age_years) : '',
    parking: p.parking ?? false,
    amenities: p.amenities ?? [],
    youtube_url: p.youtube_url ?? '',
    tags: (p.tags ?? []).join(', '),
    floor_plan: p.floor_plan ?? '',
    plot_area_sqyard: p.plot_area_sqyard != null ? String(p.plot_area_sqyard) : '',
    plot_type: p.plot_type ?? '',
    corner_plot: p.corner_plot ?? false,
    facing: p.facing ?? '',
    registry_done: p.registry_done ?? false,
    boundary_wall: p.boundary_wall ?? false,
    monthly_rent: p.monthly_rent != null ? String(p.monthly_rent) : '',
    deposit_months: p.deposit_months != null ? String(p.deposit_months) : '',
    available_from: p.available_from ?? '',
    tenant_preference: p.tenant_preference ?? '',
    gender_preference: p.gender_preference ?? '',
    pets_allowed: p.pets_allowed ?? false,
    commercial_type: p.commercial_type ?? '',
    commercial_deal: p.monthly_rent != null ? 'Rent' : 'Sale',
    power_load: p.power_load ?? '',
    frontage_width: p.frontage_width != null ? String(p.frontage_width) : '',
  }
}

export default function PropertyEditClient({ property }: { property: Property }) {
  const router = useRouter()
  const [form, setForm] = useState<WizardForm>(toWizardForm(property))
  const pillar = (form.pillar || property.property_pillar || 'residential') as PropertyPillar
  const [isActive, setIsActive] = useState(property.is_active)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    createClient().rpc('get_my_property_contact', { p_property_id: property.id }).then(({ data }) => {
      if (typeof data === 'string') setForm(current => ({ ...current, owner_contact: data }))
    })
  }, [property.id])

  const setF = (k: keyof WizardForm, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const toggleArr = (k: 'bhk' | 'amenities', val: string) =>
    setF(k, (form[k] as string[]).includes(val)
      ? (form[k] as string[]).filter(x => x !== val)
      : [...(form[k] as string[]), val])

  const usesMonthlyRent = form.intent === 'rent'

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Title required hai'
    if (!form.city) return 'City select karo'
    if (!form.locality.trim()) return 'Locality / area required hai'
    if (usesMonthlyRent ? !form.monthly_rent : !form.price_min) return 'Price required hai'
    if (!usesMonthlyRent && (!form.stamp_duty_estimate || !form.legal_fees_estimate)) return 'Stamp duty and legal fee estimates required hain (enter 0 if none)'
    if (form.photos.length < 2 || form.photos.length > 4) return '2 se 4 original photos upload karo'
    if (!form.property_subtype) return 'Property subtype select karo'
    if (!form.owner_contact.trim()) return 'Contact number required hai'
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { setMsg(err); return }
    setMsg('')
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from('properties').update({
      property_pillar: pillar, listing_intent: form.intent, property_subtype: form.property_subtype,
      land_area_unit: form.land_area_unit,
      stamp_duty_estimate: form.stamp_duty_estimate ? parseFloat(form.stamp_duty_estimate) : null,
      legal_fees_estimate: form.legal_fees_estimate ? parseFloat(form.legal_fees_estimate) : null,
      security_deposit_amount: form.security_deposit_amount ? parseFloat(form.security_deposit_amount) : null,
      advance_terms: form.advance_terms || null,
      lease_duration_months: form.lease_duration_months ? parseInt(form.lease_duration_months) : null,
      property_category: pillar === 'land' ? 'plot' : pillar === 'commercial' || pillar === 'industrial' ? 'commercial' : usesMonthlyRent ? 'rental' : 'flat',
      monthly_rent: usesMonthlyRent && form.monthly_rent ? parseFloat(form.monthly_rent) : null,
      title: form.title,
      city: form.city || null,
      locality: form.locality || null,
      sector: form.locality || null,
      price_min: !usesMonthlyRent && form.price_min ? parseFloat(form.price_min) : null,
      description: form.description || null,
      photos: form.photos.length > 0 ? form.photos : null,
      contact_preference: form.contact_preference,
      owner_contact: form.owner_contact || null,
      is_active: isActive,
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
    }).eq('id', property.id)

    setSaving(false)
    if (error) { setMsg(error.message); return }
    if (form.owner_contact.trim()) {
      const { error: contactError } = await supabase.rpc('set_my_property_contact', { p_property_id: property.id, p_owner_contact: form.owner_contact })
      if (contactError) { setMsg(contactError.message); return }
    }
    const photosChanged = JSON.stringify(form.photos) !== JSON.stringify(property.photos ?? [])
    toast.success(photosChanged ? 'Listing updated. Photos are hidden while Orenzaa reviews them.' : 'Listing updated')
    router.push('/expert')
    router.refresh()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-800 text-center mb-2" style={{ color: '#111827' }}>Edit Listing</h1>
      <p className="text-center text-sm mb-8" style={{ color: '#6B7280' }}>Update your property details</p>

      <div className="glass p-5 flex flex-col gap-4">
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Original site photos (2-4)</label>
          <PhotoUpload photos={form.photos} setPhotos={v => setF('photos', v)} maxFiles={4} />
        </div>

        <input className="input-dark text-sm" placeholder="Property title *"
          value={form.title} onChange={e => setF('title', e.target.value)} suppressHydrationWarning />

        <div className="grid grid-cols-2 gap-3">
          <PropertyLocationFields value={form.city} onChange={city => setF('city', city)} />
          <input className="input-dark text-sm" placeholder="Locality / Area *"
            value={form.locality} onChange={e => setF('locality', e.target.value)} suppressHydrationWarning />
        </div>

        {!usesMonthlyRent && (
          <input className="input-dark text-sm" placeholder="Price (₹) *" type="number"
            value={form.price_min} onChange={e => setF('price_min', e.target.value)} suppressHydrationWarning />
        )}

        <PillarFields form={form} pillar={pillar} persona="expert" setF={setF} toggleArr={toggleArr} />

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

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
            className="accent-orange-500 w-4 h-4" suppressHydrationWarning />
          <span className="text-sm" style={{ color: '#6B7280' }}>Active (visible to buyers)</span>
        </label>

        {msg && <p className="text-sm" style={{ color: '#F87171' }}>{msg}</p>}

        <div className="flex gap-3">
          <button onClick={() => router.push('/expert')} suppressHydrationWarning
            className="px-5 py-2.5 rounded-xl text-sm font-700" style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
            ← Cancel
          </button>
          <button onClick={handleSave} disabled={saving} suppressHydrationWarning className="btn-accent flex-1 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
