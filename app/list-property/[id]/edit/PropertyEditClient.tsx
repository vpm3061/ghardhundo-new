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
    property_status: p.status ?? '',
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
    instagram_url: p.instagram_url ?? '',
    metro_station: Array.isArray(p.nearby?.metro) ? String((p.nearby.metro[0] as { name?: string })?.name ?? '') : '',
    metro_distance_km: Array.isArray(p.nearby?.metro) ? String((p.nearby.metro[0] as { distance?: string })?.distance ?? '').replace(/\s*km$/i, '') : '',
    railway_station: Array.isArray(p.nearby?.railway_station) ? String((p.nearby.railway_station[0] as { name?: string })?.name ?? '') : '',
    railway_distance_km: Array.isArray(p.nearby?.railway_station) ? String((p.nearby.railway_station[0] as { distance?: string })?.distance ?? '').replace(/\s*km$/i, '') : '',
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
  const dashboardPath = property.listing_type === 'builder' ? '/builder' : property.listing_type === 'owner' ? '/owner/list' : '/expert'
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
  const originalPhotos = property.photos ?? []
  const photosUnchanged = form.photos.length === originalPhotos.length && form.photos.every((photo, index) => photo === originalPhotos[index])

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Title required hai'
    if (!form.city) return 'City select karo'
    if (!form.locality.trim()) return 'Locality / area required hai'
    if (usesMonthlyRent ? !form.monthly_rent : !form.price_min) return 'Price required hai'
    if (!usesMonthlyRent && (!form.stamp_duty_estimate || !form.legal_fees_estimate)) return 'Stamp duty and legal fee estimates required hain (enter 0 if none)'
    if (form.photos.length < 2) return 'At least 2 original property photos are required'
    if (form.photos.length > 4 && !photosUnchanged) return 'A changed photo set must contain 2 to 4 photos'
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
      status: form.property_status || null,
      land_area_unit: form.land_area_unit,
      stamp_duty_estimate: form.stamp_duty_estimate ? parseFloat(form.stamp_duty_estimate) : null,
      legal_fees_estimate: form.legal_fees_estimate ? parseFloat(form.legal_fees_estimate) : null,
      security_deposit_amount: form.security_deposit_amount ? parseFloat(form.security_deposit_amount) : null,
      advance_terms: form.advance_terms || null,
      lease_duration_months: form.lease_duration_months ? parseInt(form.lease_duration_months) : null,
      property_category: pillar === 'land' ? 'plot' : pillar === 'commercial' || pillar === 'institutional' ? 'commercial' : 'flat',
      monthly_rent: usesMonthlyRent && form.monthly_rent ? parseFloat(form.monthly_rent) : null,
      title: form.title,
      city: form.city || null,
      locality: form.locality || null,
      sector: form.locality || null,
      price_min: !usesMonthlyRent && form.price_min ? parseFloat(form.price_min) : null,
      description: form.description || null,
      photos: form.photos.length > 0 ? form.photos : null,
      contact_preference: form.contact_preference,
        owner_contact: null,
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
      instagram_url: form.instagram_url || null,
      nearby: {
        ...(property.nearby ?? {}),
        ...(form.metro_station.trim() ? { metro: [{ name: form.metro_station.trim(), distance: form.metro_distance_km.trim() ? `${form.metro_distance_km.trim()} km` : '' }] } : {}),
        ...(form.railway_station.trim() ? { railway_station: [{ name: form.railway_station.trim(), distance: form.railway_distance_km.trim() ? `${form.railway_distance_km.trim()} km` : '' }] } : {}),
      },
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      floor_plan: form.floor_plan || null,
      plot_area_sqyard: form.plot_area_sqyard ? parseFloat(form.plot_area_sqyard) : null,
      plot_type: form.plot_type || null,
      corner_plot: form.corner_plot,
      facing: form.facing || null,
      registry_done: form.registry_done,
      boundary_wall: form.boundary_wall,
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
    toast.success('Listing updated successfully')
    router.push(dashboardPath)
    router.refresh()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-800 text-center mb-2" style={{ color: '#111827' }}>Edit Listing</h1>
      <p className="text-center text-sm mb-8" style={{ color: '#6B7280' }}>Update your property details</p>

      <div className="glass p-5 flex flex-col gap-4">
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Original site photos (2–4 for new or changed photos)</label>
          <p className="mb-2 text-xs text-slate-500">Existing photos stay as-is when unchanged. JPG/JPEG, PNG or WEBP; maximum 5 MB each.</p>
          <PhotoUpload photos={form.photos} setPhotos={v => setF('photos', v)} maxFiles={Math.max(4, originalPhotos.length)} />
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
        <label className="text-xs text-slate-600">Construction / possession status (optional)
          <select className="input-dark mt-1 w-full text-sm" value={form.property_status} onChange={e => setF('property_status', e.target.value)}>
            <option value="">Select status</option>
            {['Ready to Move', 'Under Construction', 'New Launch'].map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>

        <textarea className="input-dark text-sm resize-none" rows={4} maxLength={2500} placeholder="Description for buyers: layout, condition, facing, nearby facilities, possession and anything included (optional)"
          value={form.description} onChange={e => setF('description', e.target.value)} suppressHydrationWarning />

        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input-dark text-sm" type="url" placeholder="YouTube video URL (optional)"
            value={form.youtube_url} onChange={e => setF('youtube_url', e.target.value)} />
          <input className="input-dark text-sm" type="url" placeholder="Instagram post or Reel URL (optional)"
            value={form.instagram_url} onChange={e => setF('instagram_url', e.target.value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input-dark text-sm" placeholder="Nearest metro station (optional)"
            value={form.metro_station} onChange={e => setF('metro_station', e.target.value)} />
          <input className="input-dark text-sm" type="number" min="0" step="0.1" placeholder="Distance to metro (km)"
            value={form.metro_distance_km} onChange={e => setF('metro_distance_km', e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input-dark text-sm" placeholder="Nearest railway station (optional)"
            value={form.railway_station} onChange={e => setF('railway_station', e.target.value)} />
          <input className="input-dark text-sm" type="number" min="0" step="0.1" placeholder="Distance to railway station (km)"
            value={form.railway_distance_km} onChange={e => setF('railway_distance_km', e.target.value)} />
        </div>

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
          <button onClick={() => router.push(dashboardPath)} suppressHydrationWarning
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
