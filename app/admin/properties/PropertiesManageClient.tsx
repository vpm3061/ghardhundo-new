'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Property } from '@/lib/supabase/types'
import PropertyPull, { type PullResult } from './PropertyPull'

type FormStatus = Property['status'] | ''

const CITY_OPTIONS = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']
const BHK_OPTIONS = ['1', '2', '3', '4']
const STATUS_OPTIONS: { value: FormStatus; label: string }[] = [
  { value: 'Ready to Move', label: 'Ready to Move' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'New Launch', label: 'New Launch' },
]
const AMENITY_OPTIONS = [
  'Swimming Pool', 'Club House', 'Gym', '24hr Security',
  'Power Backup', 'Parking', 'Garden', 'Kids Zone',
]

type FormState = {
  title: string
  builder: string
  sector: string
  city: string
  price_min: string
  price_max: string
  bhk: string[]
  status: FormStatus
  rera_number: string
  description: string
  amenities: string[]
  photos: string[]
  is_active: boolean
  is_featured: boolean
}

const EMPTY_FORM: FormState = {
  title: '', builder: '', sector: '', city: '',
  price_min: '', price_max: '', bhk: [], status: '',
  rera_number: '', description: '', amenities: [], photos: [''], is_active: true, is_featured: false,
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
    photos: p.photos?.length ? p.photos : [''],
    is_active: p.is_active,
    is_featured: p.is_featured,
  }
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-600 uppercase tracking-wider mb-3" style={{ color: '#A78BFA' }}>{children}</p>
)

export default function PropertiesManageClient({ properties }: { properties: Property[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (p: Property) => { setForm(toFormState(p)); setEditId(p.id); setShowForm(true) }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const toggleBhk = (v: string) =>
    set('bhk', form.bhk.includes(v) ? form.bhk.filter(b => b !== v) : [...form.bhk, v])

  const toggleAmenity = (v: string) =>
    set('amenities', form.amenities.includes(v) ? form.amenities.filter(a => a !== v) : [...form.amenities, v])

  const setPhoto = (i: number, v: string) => {
    const next = [...form.photos]
    next[i] = v
    set('photos', next)
  }
  const addPhoto = () => set('photos', [...form.photos, ''])
  const removePhoto = (i: number) => set('photos', form.photos.filter((_, idx) => idx !== i))

  const handlePullFill = (data: PullResult) => {
    const parsedBhk = data.bhk
      ? data.bhk.split(',').map(s => s.trim()).filter(s => BHK_OPTIONS.includes(s))
      : []
    const parsedAmenities = data.amenities
      ? data.amenities.split(',').map(s => s.trim()).filter(s => AMENITY_OPTIONS.includes(s))
      : []
    const validStatuses: FormStatus[] = ['Ready to Move', 'Under Construction', 'New Launch', '']
    const parsedStatus = validStatuses.includes(data.status as FormStatus)
      ? (data.status as FormStatus)
      : ''
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
        title: form.title,
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
        photos: form.photos.filter(s => s.trim()).length ? form.photos.filter(s => s.trim()) : null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      }
      if (editId) {
        await supabase.from('properties').update(payload).eq('id', editId)
      } else {
        await supabase.from('properties').insert(payload)
      }
      setShowForm(false)
      setEditId(null)
      router.refresh()
    })
  }

  return (
    <div>
      <PropertyPull onFill={handlePullFill} />

      <div className="flex items-center justify-between mb-5">
        <span className="text-sm" style={{ color: '#8B8BA8' }}>{properties.length} {properties.length === 1 ? 'property' : 'properties'}</span>
        <button onClick={openAdd} className="btn-accent text-sm px-4 py-2" suppressHydrationWarning>
          + Add Manually
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div className="w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: 'rgba(18,18,26,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-heading font-700 text-lg" style={{ color: '#F1F0FF' }}>
                {editId ? 'Edit Property' : 'Add Property'}
              </h3>
              <button onClick={() => setShowForm(false)} suppressHydrationWarning
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#8B8BA8' }}>✕</button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5" suppressHydrationWarning>

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
                        ? { background: 'rgba(124,58,237,0.2)', color: '#A78BFA', borderColor: 'rgba(124,58,237,0.5)' }
                        : { background: 'transparent', color: '#8B8BA8', borderColor: 'rgba(255,255,255,0.06)' }}>
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
                    <label className="text-xs mb-1 block" style={{ color: '#4A4A6A' }}>Min Price (₹)</label>
                    <input className="input-dark text-sm" placeholder="e.g. 4500000" type="number"
                      value={form.price_min} onChange={e => set('price_min', e.target.value)} suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#4A4A6A' }}>Max Price (₹)</label>
                    <input className="input-dark text-sm" placeholder="e.g. 8500000" type="number"
                      value={form.price_max} onChange={e => set('price_max', e.target.value)} suppressHydrationWarning />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <SectionLabel>Description</SectionLabel>
                <textarea className="input-dark text-sm min-h-[90px] resize-none"
                  placeholder="Describe the project — location highlights, possession date, key features..."
                  value={form.description} onChange={e => set('description', e.target.value)} suppressHydrationWarning />
              </div>

              {/* Amenities */}
              <div>
                <SectionLabel>Amenities</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITY_OPTIONS.map(a => (
                    <label key={a} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm"
                      style={form.amenities.includes(a)
                        ? { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#F1F0FF' }
                        : { border: '1px solid rgba(255,255,255,0.06)', color: '#8B8BA8' }}>
                      <input type="checkbox" className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ accentColor: '#7C3AED' }}
                        checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} suppressHydrationWarning />
                      <span className="leading-tight">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <SectionLabel>Photo URLs</SectionLabel>
                <div className="flex flex-col gap-2">
                  {form.photos.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input className="input-dark text-sm flex-1" placeholder={`Photo URL ${i + 1}`}
                        type="url" value={url} onChange={e => setPhoto(i, e.target.value)} suppressHydrationWarning />
                      {form.photos.length > 1 && (
                        <button type="button" onClick={() => removePhoto(i)} suppressHydrationWarning
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                          style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#4A4A6A' }}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addPhoto} suppressHydrationWarning
                    className="text-sm py-2 rounded-xl transition-colors"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', color: '#8B8BA8' }}>
                    + Add another photo
                  </button>
                </div>
              </div>

              {/* Visibility toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full flex items-center transition-colors"
                  style={{ background: form.is_active ? '#7C3AED' : 'rgba(255,255,255,0.06)' }}
                  onClick={() => set('is_active', !form.is_active)}>
                  <div className="w-4 h-4 rounded-full ml-1 transition-transform"
                    style={{ background: '#F1F0FF', transform: form.is_active ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
                <span className="text-sm" style={{ color: '#8B8BA8' }}>
                  {form.is_active ? 'Visible to buyers' : 'Hidden from buyers'}
                </span>
                <input type="checkbox" className="sr-only" checked={form.is_active}
                  onChange={e => set('is_active', e.target.checked)} />
              </label>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-6 rounded-full flex items-center transition-colors"
                  style={{ background: form.is_featured ? '#F59E0B' : 'rgba(255,255,255,0.06)' }}
                  onClick={() => set('is_featured', !form.is_featured)}>
                  <div className="w-4 h-4 rounded-full ml-1 transition-transform"
                    style={{ background: '#F1F0FF', transform: form.is_featured ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
                <span className="text-sm" style={{ color: '#8B8BA8' }}>
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
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#8B8BA8' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property list */}
      <div className="space-y-2">
        {properties.length === 0 ? (
          <div className="text-center py-14 glass">
            <div className="text-4xl mb-3">🏗️</div>
            <p className="text-sm" style={{ color: '#8B8BA8' }}>
              No properties yet. Click <strong style={{ color: '#F1F0FF' }}>+ Add Manually</strong> to get started.
            </p>
          </div>
        ) : (
          properties.map(p => (
            <div key={p.id} className="glass p-4 flex items-center justify-between gap-3 transition-all hover:border-white/[0.12]">
              <div className="min-w-0 flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg" style={{ color: '#4A4A6A' }}>🏢</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-600 text-sm" style={{ color: '#F1F0FF' }}>{p.title}</span>
                    {p.is_featured && (
                      <span className="text-xs font-700 px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                        ⭐ Featured
                      </span>
                    )}
                    {!p.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#4A4A6A', border: '1px solid rgba(255,255,255,0.06)' }}>
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5 flex flex-wrap gap-1.5" style={{ color: '#8B8BA8' }}>
                    {p.city && <span>{p.city}</span>}
                    {p.status && <><span>·</span><span>{p.status}</span></>}
                    {p.bhk?.length ? <><span>·</span><span>{p.bhk.join('/')} BHK</span></> : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(p)} suppressHydrationWarning
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#8B8BA8' }}>
                  Edit
                </button>
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
