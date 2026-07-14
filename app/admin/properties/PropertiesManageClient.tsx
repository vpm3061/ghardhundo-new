'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { Property } from '@/lib/supabase/types'
import PropertyPull, { type PullResult } from './PropertyPull'
import PhotoUpload from '@/components/PhotoUpload'
import FlatFields from '@/components/wizard/FlatFields'
import PlotFields from '@/components/wizard/PlotFields'
import RentalFields from '@/components/wizard/RentalFields'
import CommercialFields from '@/components/wizard/CommercialFields'
import { BLANK_WIZARD_FORM, type WizardForm, type Category } from '@/components/wizard/types'

type FormStatus = Property['status'] | ''
type OfferForm = { title: string; description: string; valid_till: string }

type FormState = WizardForm & {
  builder: string
  price_max: string
  status: FormStatus
  is_active: boolean
  is_featured: boolean
  offers: OfferForm[]
}

const EMPTY_FORM: FormState = {
  ...BLANK_WIZARD_FORM,
  builder: '', price_max: '', status: '',
  is_active: true, is_featured: false,
  offers: [],
}

const CITY_OPTIONS = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']
const STATUS_OPTIONS: { value: FormStatus; label: string }[] = [
  { value: 'Ready to Move',      label: 'Ready to Move' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'New Launch',         label: 'New Launch' },
]
const PROPERTY_TYPES: { id: Category; icon: string; label: string }[] = [
  { id: 'flat',       icon: '🏢', label: 'Flat / Apartment' },
  { id: 'plot',       icon: '🌍', label: 'Plot / Zameen' },
  { id: 'rental',     icon: '🏠', label: 'Rental / Room / PG' },
  { id: 'commercial', icon: '🏪', label: 'Commercial' },
]

function toFormState(p: Property): FormState {
  return {
    ...BLANK_WIZARD_FORM,
    title: p.title,
    city: p.city || '',
    locality: p.locality || p.sector || '',
    price_min: p.price_min?.toString() || '',
    price_max: p.price_max?.toString() || '',
    description: p.description || '',
    photos: p.photos || [],
    contact_preference: p.contact_preference || 'both',
    owner_contact: p.owner_contact || '',
    bhk: p.bhk || [],
    floor_number: p.floor_number?.toString() || '',
    total_floors: p.total_floors?.toString() || '',
    super_area: p.super_area?.toString() || '',
    carpet_area: p.carpet_area?.toString() || '',
    furnished: p.furnished || '',
    rera_number: p.rera_number || '',
    possession_date: p.possession_date || '',
    age_years: p.age_years?.toString() || '',
    parking: p.parking,
    amenities: p.amenities || [],
    youtube_url: p.youtube_url || '',
    tags: p.tags?.join(', ') || '',
    floor_plan: p.floor_plan || '',
    plot_area_sqyard: p.plot_area_sqyard?.toString() || '',
    plot_type: p.plot_type || '',
    corner_plot: p.corner_plot,
    facing: p.facing || '',
    registry_done: p.registry_done,
    boundary_wall: p.boundary_wall,
    monthly_rent: p.monthly_rent?.toString() || '',
    deposit_months: p.deposit_months?.toString() || '',
    available_from: p.available_from || '',
    tenant_preference: p.tenant_preference || '',
    gender_preference: p.gender_preference || '',
    pets_allowed: p.pets_allowed,
    commercial_type: p.commercial_type || '',
    commercial_deal: p.monthly_rent ? 'Rent' : 'Sale',
    power_load: p.power_load || '',
    frontage_width: p.frontage_width?.toString() || '',
    builder: p.builder || '',
    status: p.status || '',
    is_active: p.is_active,
    is_featured: p.is_featured,
    offers: [],
  }
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-600 uppercase tracking-wider mb-3" style={{ color: '#FB923C' }}>{children}</p>
)

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} suppressHydrationWarning
      className="text-sm px-3 py-1.5 rounded-xl transition-all"
      style={{
        background: active ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${active ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.06)'}`,
        color: active ? '#FB923C' : '#6B7280',
      }}>
      {children}
    </button>
  )
}

export default function PropertiesManageClient({ properties }: { properties: Property[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const openAdd = () => { setForm(EMPTY_FORM); setCategory(null); setEditId(null); setShowForm(true) }

  const openEdit = async (p: Property) => {
    const base = toFormState(p)
    setForm(base)
    setCategory(p.property_category)
    setEditId(p.id)
    setShowForm(true)

    try {
      const { data: offers } = await createClient()
        .from('offers')
        .select('title, description, valid_till')
        .eq('property_id', p.id)
        .order('created_at')
      if (offers) {
        setForm(prev => ({
          ...prev,
          offers: offers.map(o => ({
            title: o.title,
            description: o.description || '',
            valid_till: o.valid_till || '',
          })),
        }))
      }
    } catch { /* offers table may not exist yet */ }
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))
  const setF = (k: keyof WizardForm, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }))
  const toggleArr = (k: 'bhk' | 'amenities', val: string) =>
    setForm(prev => ({
      ...prev,
      [k]: (prev[k] as string[]).includes(val)
        ? (prev[k] as string[]).filter(x => x !== val)
        : [...(prev[k] as string[]), val],
    }))

  /* Offers helpers */
  const addOffer = () =>
    set('offers', [...form.offers, { title: '', description: '', valid_till: '' }])
  const removeOffer = (i: number) =>
    set('offers', form.offers.filter((_, idx) => idx !== i))
  const setOffer = (i: number, k: keyof OfferForm, v: string) => {
    const next = [...form.offers]
    next[i] = { ...next[i], [k]: v }
    set('offers', next)
  }

  const handlePullFill = (data: PullResult) => {
    const parsedBhk = data.bhk
      ? data.bhk.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const parsedAmenities = data.amenities
      ? data.amenities.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const validStatuses: FormStatus[] = ['Ready to Move', 'Under Construction', 'New Launch', '']
    const parsedStatus = validStatuses.includes(data.status as FormStatus) ? (data.status as FormStatus) : ''
    const validCategories: Category[] = ['flat', 'plot', 'rental', 'commercial']
    const parsedCategory = validCategories.includes(data.property_category as Category)
      ? (data.property_category as Category) : 'flat'

    setForm({
      ...EMPTY_FORM,
      title: data.title || '',
      builder: data.builder || '',
      city: data.city || '',
      locality: data.locality || data.sector || '',
      price_min: data.price_min != null ? String(data.price_min) : '',
      price_max: data.price_max != null ? String(data.price_max) : '',
      bhk: parsedBhk,
      status: parsedStatus,
      rera_number: data.rera_number || '',
      description: data.description || '',
      amenities: parsedAmenities,
      youtube_url: data.youtube_url || '',
      plot_area_sqyard: data.plot_area_sqyard != null ? String(data.plot_area_sqyard) : '',
      monthly_rent: data.monthly_rent != null ? String(data.monthly_rent) : '',
      commercial_type: data.commercial_type || '',
      commercial_deal: data.monthly_rent != null ? 'Rent' : 'Sale',
    })
    setCategory(parsedCategory)
    setEditId(null)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this property?')) return
    startTransition(async () => {
      await createClient().from('properties').delete().eq('id', id)
      router.refresh()
    })
  }

  const usesMonthlyRent = category === 'rental' || (category === 'commercial' && form.commercial_deal === 'Rent')

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!category) { toast.error('Select a property type'); return }
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        title: form.title || 'Untitled',
        builder: form.builder || null,
        city: form.city || null,
        locality: form.locality || null,
        sector: form.locality || null,
        description: form.description || null,
        photos: form.photos.length ? form.photos : null,
        contact_preference: form.contact_preference,
        owner_contact: form.owner_contact || null,
        property_category: category,
        listing_type: 'builder' as const,
        status: category === 'flat' ? ((form.status || null) as Property['status'] | null) : null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        price_min: usesMonthlyRent ? null : (form.price_min ? parseFloat(form.price_min) : null),
        price_max: usesMonthlyRent ? null : (form.price_max ? parseFloat(form.price_max) : null),
        rera_number: form.rera_number || null,
        // flat
        bhk: form.bhk.length ? form.bhk : null,
        floor_number: form.floor_number ? parseInt(form.floor_number) : null,
        total_floors: form.total_floors ? parseInt(form.total_floors) : null,
        super_area: form.super_area ? parseFloat(form.super_area) : null,
        carpet_area: form.carpet_area ? parseFloat(form.carpet_area) : null,
        furnished: form.furnished || null,
        possession_date: form.possession_date || null,
        age_years: form.age_years ? parseInt(form.age_years) : null,
        parking: form.parking,
        amenities: form.amenities.length ? form.amenities : null,
        youtube_url: form.youtube_url || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        floor_plan: form.floor_plan || null,
        // plot
        plot_area_sqyard: form.plot_area_sqyard ? parseFloat(form.plot_area_sqyard) : null,
        plot_type: form.plot_type || null,
        corner_plot: form.corner_plot,
        facing: form.facing || null,
        registry_done: form.registry_done,
        boundary_wall: form.boundary_wall,
        // rental
        monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : null,
        deposit_months: form.deposit_months ? parseInt(form.deposit_months) : null,
        available_from: form.available_from || null,
        tenant_preference: form.tenant_preference || null,
        gender_preference: form.gender_preference || null,
        pets_allowed: form.pets_allowed,
        // commercial
        commercial_type: form.commercial_type || null,
        power_load: form.power_load || null,
        frontage_width: form.frontage_width ? parseFloat(form.frontage_width) : null,
      }

      let propertyId = editId
      if (editId) {
        const { error } = await supabase.from('properties').update(payload).eq('id', editId)
        if (error) { console.error('Update error:', error); toast.error('Save failed: ' + error.message); return }
      } else {
        const { data: inserted, error } = await supabase
          .from('properties').insert(payload).select('id').single()
        if (error) { console.error('Insert error:', error); toast.error('Save failed: ' + error.message); return }
        propertyId = inserted?.id ?? null
      }

      /* Save offers */
      if (propertyId) {
        try {
          await supabase.from('offers').delete().eq('property_id', propertyId)
          const validOffers = form.offers.filter(o => o.title.trim())
          if (validOffers.length) {
            await supabase.from('offers').insert(
              validOffers.map(o => ({
                property_id: propertyId,
                title: o.title.trim(),
                description: o.description.trim() || null,
                valid_till: o.valid_till || null,
              }))
            )
          }
        } catch { /* offers table may not exist yet */ }
      }

      toast.success(editId ? 'Property updated!' : 'Property added!')
      setShowForm(false)
      setEditId(null)
      router.refresh()
    })
  }

  return (
    <div>
      <PropertyPull onFill={handlePullFill} />

      <div className="flex items-center justify-between mb-5">
        <span className="text-sm" style={{ color: '#6B7280' }}>
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </span>
        <button onClick={openAdd} className="btn-accent text-sm px-4 py-2" suppressHydrationWarning>
          + Add Manually
        </button>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: 'rgba(18,18,26,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 className="font-heading font-700 text-lg" style={{ color: '#111827' }}>
                {editId ? 'Edit Property' : 'Add Property'}
              </h3>
              <button onClick={() => setShowForm(false)} suppressHydrationWarning
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ border: '1px solid rgba(0,0,0,0.05)', color: '#6B7280' }}>✕</button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5" suppressHydrationWarning>

              {/* Property Type */}
              <div>
                <SectionLabel>Property Type</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.id} type="button" onClick={() => setCategory(t.id)} suppressHydrationWarning
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-600 border transition-all"
                      style={category === t.id
                        ? { background: 'rgba(251,146,60,0.15)', color: '#FB923C', borderColor: 'rgba(251,146,60,0.5)' }
                        : { background: 'transparent', color: '#6B7280', borderColor: 'rgba(0,0,0,0.05)' }}>
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <SectionLabel>Basic Info</SectionLabel>
                <div className="flex flex-col gap-3">
                  <input className="input-dark text-sm" placeholder="Project / Property Title *"
                    value={form.title} onChange={e => set('title', e.target.value)} required suppressHydrationWarning />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-dark text-sm" placeholder="Builder / Developer (optional)"
                      value={form.builder} onChange={e => set('builder', e.target.value)} suppressHydrationWarning />
                    <input className="input-dark text-sm" placeholder="Locality / Sector / Area"
                      value={form.locality} onChange={e => setF('locality', e.target.value)} suppressHydrationWarning />
                  </div>
                  <select className="input-dark text-sm" value={form.city}
                    onChange={e => setF('city', e.target.value)} suppressHydrationWarning>
                    <option value="">Select City</option>
                    {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input className="input-dark text-sm" placeholder="Contact number for buyer enquiries"
                    value={form.owner_contact} onChange={e => setF('owner_contact', e.target.value)} suppressHydrationWarning />
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: '#9CA3AF' }}>Contact preference</label>
                    <div className="flex gap-2">
                      {(['call', 'whatsapp', 'both'] as const).map(c => (
                        <Chip key={c} active={form.contact_preference === c} onClick={() => setF('contact_preference', c)}>
                          {c[0].toUpperCase() + c.slice(1)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status — flat only */}
              {category === 'flat' && (
                <div>
                  <SectionLabel>Status</SectionLabel>
                  <select className="input-dark text-sm" value={form.status ?? ''}
                    onChange={e => set('status', e.target.value as FormStatus)} suppressHydrationWarning>
                    <option value="">Select Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s.value ?? ''} value={s.value ?? ''}>{s.label}</option>)}
                  </select>
                </div>
              )}

              {/* Pricing — hidden when rental/commercial-for-rent, those collect monthly rent in their own section */}
              {!usesMonthlyRent && (
                <div>
                  <SectionLabel>Pricing</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#9CA3AF' }}>Min Price (₹)</label>
                      <input className="input-dark text-sm" placeholder="e.g. 4500000" type="number"
                        value={form.price_min} onChange={e => setF('price_min', e.target.value)} suppressHydrationWarning />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#9CA3AF' }}>Max Price (₹)</label>
                      <input className="input-dark text-sm" placeholder="e.g. 8500000" type="number"
                        value={form.price_max} onChange={e => set('price_max', e.target.value)} suppressHydrationWarning />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <SectionLabel>Description</SectionLabel>
                <textarea className="input-dark text-sm min-h-[90px] resize-none"
                  placeholder="Describe the project — location, possession date, key features…"
                  value={form.description} onChange={e => setF('description', e.target.value)} suppressHydrationWarning />
              </div>

              {/* Type-specific fields */}
              {category === 'flat' && (
                <div>
                  <SectionLabel>Flat Details</SectionLabel>
                  <FlatFields form={form} persona="builder" setF={setF} toggleArr={toggleArr} />
                </div>
              )}
              {category === 'plot' && (
                <div>
                  <SectionLabel>Plot Details</SectionLabel>
                  <PlotFields form={form} persona="builder" setF={setF} toggleArr={toggleArr} />
                </div>
              )}
              {category === 'rental' && (
                <div>
                  <SectionLabel>Rental Details</SectionLabel>
                  <RentalFields form={form} persona="builder" setF={setF} toggleArr={toggleArr} />
                </div>
              )}
              {category === 'commercial' && (
                <div>
                  <SectionLabel>Commercial Details</SectionLabel>
                  <CommercialFields form={form} persona="builder" setF={setF} toggleArr={toggleArr} />
                </div>
              )}

              {/* ── Photos ── */}
              <div>
                <SectionLabel>Photos (up to 15)</SectionLabel>
                <PhotoUpload photos={form.photos} setPhotos={urls => set('photos', urls)} maxFiles={15} />
              </div>

              {/* ── Special Offers ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Special Offers</SectionLabel>
                  <button type="button" onClick={addOffer} suppressHydrationWarning
                    className="text-xs px-3 py-1 rounded-lg transition-colors"
                    style={{ border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C' }}>
                    + Add Offer
                  </button>
                </div>
                {form.offers.length === 0 ? (
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    No offers yet. Add limited-time deals to attract buyers.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {form.offers.map((offer, i) => (
                      <div key={i} className="p-3 rounded-xl flex flex-col gap-2"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex gap-2">
                          <input className="input-dark text-sm flex-1"
                            placeholder="Offer title (e.g. Free AC for first 10 buyers)"
                            value={offer.title} onChange={e => setOffer(i, 'title', e.target.value)} suppressHydrationWarning />
                          <button type="button" onClick={() => removeOffer(i)} suppressHydrationWarning
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
                            style={{ border: '1px solid rgba(0,0,0,0.05)', color: '#9CA3AF' }}>✕</button>
                        </div>
                        <textarea className="input-dark text-sm resize-none" rows={2}
                          placeholder="Offer description (optional)"
                          value={offer.description} onChange={e => setOffer(i, 'description', e.target.value)} suppressHydrationWarning />
                        <div className="flex items-center gap-2">
                          <label className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>Valid till:</label>
                          <input className="input-dark text-sm flex-1" type="date"
                            value={offer.valid_till} onChange={e => setOffer(i, 'valid_till', e.target.value)} suppressHydrationWarning />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility toggles */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full flex items-center transition-colors"
                  style={{ background: form.is_active ? '#FB923C' : 'rgba(0,0,0,0.05)' }}
                  onClick={() => set('is_active', !form.is_active)}>
                  <div className="w-4 h-4 rounded-full ml-1 transition-transform"
                    style={{ background: '#111827', transform: form.is_active ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>
                  {form.is_active ? 'Visible to buyers' : 'Hidden from buyers'}
                </span>
                <input type="checkbox" className="sr-only" checked={form.is_active}
                  onChange={e => set('is_active', e.target.checked)} />
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full flex items-center transition-colors"
                  style={{ background: form.is_featured ? '#F59E0B' : 'rgba(0,0,0,0.05)' }}
                  onClick={() => set('is_featured', !form.is_featured)}>
                  <div className="w-4 h-4 rounded-full ml-1 transition-transform"
                    style={{ background: '#111827', transform: form.is_featured ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
                <span className="text-sm" style={{ color: '#6B7280' }}>
                  {form.is_featured ? '⭐ Featured listing' : 'Not featured'}
                </span>
                <input type="checkbox" className="sr-only" checked={form.is_featured}
                  onChange={e => set('is_featured', e.target.checked)} />
              </label>

              {/* Actions */}
              <div className="flex gap-2 pt-1 pb-2">
                <button type="submit" disabled={isPending} className="btn-accent flex-1 disabled:opacity-50" suppressHydrationWarning>
                  {isPending ? 'Saving…' : editId ? 'Update Property' : 'Add Property'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} suppressHydrationWarning
                  className="flex-1 py-2.5 rounded-xl text-sm font-600 transition-all"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Property list ── */}
      <div className="space-y-2">
        {properties.length === 0 ? (
          <div className="text-center py-14 glass">
            <div className="text-4xl mb-3">🏗️</div>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              No properties yet. Click <strong style={{ color: '#111827' }}>+ Add Manually</strong> to get started.
            </p>
          </div>
        ) : (
          properties.map(p => (
            <div key={p.id} className="glass p-4 flex items-center justify-between gap-3 transition-all hover:border-white/[0.12]">
              <div className="min-w-0 flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg" style={{ color: '#9CA3AF' }}>🏢</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-600 text-sm" style={{ color: '#111827' }}>{p.title}</span>
                    <span className="text-xs font-700 px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(251,146,60,0.08)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.2)' }}>
                      {PROPERTY_TYPES.find(t => t.id === p.property_category)?.icon} {p.property_category}
                    </span>
                    {p.is_featured && (
                      <span className="text-xs font-700 px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                        ⭐ Featured
                      </span>
                    )}
                    {!p.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(0,0,0,0.03)', color: '#9CA3AF', border: '1px solid rgba(0,0,0,0.05)' }}>
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5 flex flex-wrap gap-1.5" style={{ color: '#6B7280' }}>
                    {p.city && <span>{p.city}</span>}
                    {p.status && <><span>·</span><span>{p.status}</span></>}
                    {p.bhk?.length ? <><span>·</span><span>{p.bhk.join('/')} BHK</span></> : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(p)} suppressHydrationWarning
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
                  Quick Edit
                </button>
                <Link href={`/admin/properties/${p.id}/edit`}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C' }}>
                  Full Edit
                </Link>
                <button onClick={() => handleDelete(p.id)} suppressHydrationWarning
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
