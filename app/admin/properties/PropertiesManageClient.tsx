'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { Property } from '@/lib/supabase/types'
import PropertyPull, { type PullResult } from './PropertyPull'
import PhotoUpload from '@/components/PhotoUpload'

type FormStatus = Property['status'] | ''
type OfferForm = { title: string; description: string; valid_till: string }

const CITY_OPTIONS = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']
const BHK_OPTIONS = ['1', '2', '3', '4']
const STATUS_OPTIONS: { value: FormStatus; label: string }[] = [
  { value: 'Ready to Move',      label: 'Ready to Move' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'New Launch',         label: 'New Launch' },
]
const AMENITY_OPTIONS = [
  'Swimming Pool', 'Club House', 'Gym', '24hr Security',
  'Power Backup', 'Parking', 'Garden', 'Kids Zone',
]

type FormState = {
  title: string; builder: string; sector: string; city: string
  price_min: string; price_max: string; bhk: string[]; status: FormStatus
  rera_number: string; description: string; amenities: string[]
  photos: string[]; floor_plan_url: string; youtube_url: string
  is_active: boolean; is_featured: boolean
  offers: OfferForm[]
}

const EMPTY_FORM: FormState = {
  title: '', builder: '', sector: '', city: '',
  price_min: '', price_max: '', bhk: [], status: '',
  rera_number: '', description: '', amenities: [],
  photos: [], floor_plan_url: '', youtube_url: '',
  is_active: true, is_featured: false,
  offers: [],
}

function toFormState(p: Property): FormState {
  return {
    title: p.title,
    builder: p.builder || '',
    sector: p.sector || '',
    city: p.city || '',
    price_min: p.price_min?.toString() || '',
    price_max: p.price_max?.toString() || '',
    bhk: p.bhk || [],
    status: p.status || '',
    rera_number: p.rera_number || '',
    description: p.description || '',
    amenities: p.amenities || [],
    photos: p.photos || [],
    floor_plan_url: p.floor_plan || '',
    youtube_url: p.youtube_url || '',
    is_active: p.is_active,
    is_featured: p.is_featured,
    offers: [],
  }
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-600 uppercase tracking-wider mb-3" style={{ color: '#FB923C' }}>{children}</p>
)

export default function PropertiesManageClient({ properties }: { properties: Property[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }

  const openEdit = async (p: Property) => {
    const base = toFormState(p)
    setForm(base)
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

  const toggleBhk = (v: string) =>
    set('bhk', form.bhk.includes(v) ? form.bhk.filter(b => b !== v) : [...form.bhk, v])
  const toggleAmenity = (v: string) =>
    set('amenities', form.amenities.includes(v) ? form.amenities.filter(a => a !== v) : [...form.amenities, v])

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
      ? data.bhk.split(',').map(s => s.trim()).filter(s => BHK_OPTIONS.includes(s))
      : []
    const parsedAmenities = data.amenities
      ? data.amenities.split(',').map(s => s.trim()).filter(s => AMENITY_OPTIONS.includes(s))
      : []
    const validStatuses: FormStatus[] = ['Ready to Move', 'Under Construction', 'New Launch', '']
    const parsedStatus = validStatuses.includes(data.status as FormStatus) ? (data.status as FormStatus) : ''
    setForm({
      ...EMPTY_FORM,
      title: data.title || '',
      builder: data.builder || '',
      city: data.city || '',
      sector: data.sector || '',
      price_min: data.price_min != null ? String(data.price_min) : '',
      price_max: data.price_max != null ? String(data.price_max) : '',
      bhk: parsedBhk,
      status: parsedStatus,
      rera_number: data.rera_number || '',
      description: data.description || '',
      amenities: parsedAmenities,
      youtube_url: data.youtube_url || '',
    })
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

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        title: form.title || 'Untitled',
        builder: form.builder || null,
        sector: form.sector || null,
        city: form.city || null,
        price_min: form.price_min ? parseFloat(form.price_min) : null,
        price_max: form.price_max ? parseFloat(form.price_max) : null,
        bhk: form.bhk.length ? form.bhk : null,
        status: (form.status || null) as Property['status'] | null,
        rera_number: form.rera_number || null,
        description: form.description || null,
        amenities: form.amenities.length ? form.amenities : null,
        photos: form.photos.length ? form.photos : null,
        floor_plan_url: form.floor_plan_url || null,
        youtube_url: form.youtube_url || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      }

      console.log('Saving payload:', payload)

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

              {/* Basic Info */}
              <div>
                <SectionLabel>Basic Info</SectionLabel>
                <div className="flex flex-col gap-3">
                  <input className="input-dark text-sm" placeholder="Project / Property Title *"
                    value={form.title} onChange={e => set('title', e.target.value)} required suppressHydrationWarning />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-dark text-sm" placeholder="Builder / Developer"
                      value={form.builder} onChange={e => set('builder', e.target.value)} suppressHydrationWarning />
                    <input className="input-dark text-sm" placeholder="Sector / Locality"
                      value={form.sector} onChange={e => set('sector', e.target.value)} suppressHydrationWarning />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="input-dark text-sm" value={form.city}
                      onChange={e => set('city', e.target.value)} suppressHydrationWarning>
                      <option value="">Select City</option>
                      {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="input-dark text-sm" value={form.status ?? ''}
                      onChange={e => set('status', e.target.value as FormStatus)} suppressHydrationWarning>
                      <option value="">Select Status</option>
                      {STATUS_OPTIONS.map(s => <option key={s.value ?? ''} value={s.value ?? ''}>{s.label}</option>)}
                    </select>
                  </div>
                  <input className="input-dark text-sm" placeholder="RERA Number"
                    value={form.rera_number} onChange={e => set('rera_number', e.target.value)} suppressHydrationWarning />
                </div>
              </div>

              {/* BHK */}
              <div>
                <SectionLabel>BHK Configuration</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTIONS.map(b => (
                    <button key={b} type="button" onClick={() => toggleBhk(b)} suppressHydrationWarning
                      className="px-4 py-2 rounded-xl text-sm font-600 border transition-all"
                      style={form.bhk.includes(b)
                        ? { background: 'rgba(251,146,60,0.15)', color: '#FB923C', borderColor: 'rgba(124,58,237,0.5)' }
                        : { background: 'transparent', color: '#6B7280', borderColor: 'rgba(0,0,0,0.05)' }}>
                      {b} BHK
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <SectionLabel>Pricing</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9CA3AF' }}>Min Price (₹)</label>
                    <input className="input-dark text-sm" placeholder="e.g. 4500000" type="number"
                      value={form.price_min} onChange={e => set('price_min', e.target.value)} suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#9CA3AF' }}>Max Price (₹)</label>
                    <input className="input-dark text-sm" placeholder="e.g. 8500000" type="number"
                      value={form.price_max} onChange={e => set('price_max', e.target.value)} suppressHydrationWarning />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <SectionLabel>Description</SectionLabel>
                <textarea className="input-dark text-sm min-h-[90px] resize-none"
                  placeholder="Describe the project — location, possession date, key features…"
                  value={form.description} onChange={e => set('description', e.target.value)} suppressHydrationWarning />
              </div>

              {/* Amenities */}
              <div>
                <SectionLabel>Amenities</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITY_OPTIONS.map(a => (
                    <label key={a} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm"
                      style={form.amenities.includes(a)
                        ? { background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#111827' }
                        : { border: '1px solid rgba(0,0,0,0.05)', color: '#6B7280' }}>
                      <input type="checkbox" className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ accentColor: '#FB923C' }}
                        checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} suppressHydrationWarning />
                      <span className="leading-tight">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Media ── */}
              <div>
                <SectionLabel>Photos (up to 15)</SectionLabel>
                <PhotoUpload photos={form.photos} setPhotos={urls => set('photos', urls)} maxFiles={15} />
              </div>

              <div>
                <SectionLabel>Floor Plan</SectionLabel>
                <PhotoUpload
                  photos={form.floor_plan_url ? [form.floor_plan_url] : []}
                  setPhotos={urls => set('floor_plan_url', urls[0] || '')}
                  maxFiles={1}
                />
              </div>

              <div>
                <SectionLabel>YouTube Video URL</SectionLabel>
                <input className="input-dark text-sm" placeholder="https://youtube.com/watch?v=..."
                  type="url" value={form.youtube_url}
                  onChange={e => set('youtube_url', e.target.value)} suppressHydrationWarning />
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
