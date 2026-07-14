'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import PhotoUpload from '@/components/PhotoUpload'

const CITIES    = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya', 'Ghaziabad']
const AMENITIES = ['Swimming Pool', 'Club House', 'Gym', '24hr Security', 'Power Backup', 'Parking', 'Garden', 'Kids Zone', 'Lift', 'CCTV']
const STATUSES  = ['Under Construction', 'Ready to Move', 'New Launch']

function youtubeEmbedUrl(url: string) {
  const id = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}` : null
}

export default function EditPropertyPage() {
  const router    = useRouter()
  const params    = useParams()
  const id        = params.id as string
  const supabase  = createClient()

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [photos,  setPhotos]  = useState<string[]>([])

  const [form, setForm] = useState({
    title:            '',
    builder:          '',
    sector:           '',
    city:             '',
    price_min:        '',
    price_max:        '',
    bhk:              '',
    status:           'Under Construction',
    rera_number:      '',
    possession_date:  '',
    description:      '',
    youtube_url:      '',
    floor_plan:   '',
    amenities:        [] as string[],
    tags:             '',
    is_active:        true,
    is_featured:      false,
  })

  const setF = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        toast.error('Property not found (id=' + id + ')')
        router.push('/admin/properties')
        return
      }

      setForm({
        title:           data.title           ?? '',
        builder:         data.builder         ?? '',
        sector:          data.sector          ?? '',
        city:            data.city            ?? '',
        price_min:       data.price_min  != null ? String(data.price_min  / 100000) : '',
        price_max:       data.price_max  != null ? String(data.price_max  / 100000) : '',
        bhk:             Array.isArray(data.bhk) ? data.bhk.join(', ') : (data.bhk ?? ''),
        status:          data.status          ?? 'Under Construction',
        rera_number:     data.rera_number     ?? '',
        possession_date: data.possession_date ?? '',
        description:     data.description     ?? '',
        youtube_url:     data.youtube_url     ?? '',
        floor_plan:  data.floor_plan  ?? '',
        amenities:       Array.isArray(data.amenities) ? data.amenities : [],
        tags:            Array.isArray(data.tags) ? data.tags.join(', ') : '',
        is_active:       data.is_active  ?? true,
        is_featured:     data.is_featured ?? false,
      })

      setPhotos(Array.isArray(data.photos) ? data.photos : [])
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)

    const updateData = {
      title:           form.title,
      builder:         form.builder,
      sector:          form.sector,
      city:            form.city,
      price_min:       form.price_min ? parseFloat(form.price_min) * 100000 : null,
      price_max:       form.price_max ? parseFloat(form.price_max) * 100000 : null,
      bhk:             form.bhk ? form.bhk.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      status:          form.status,
      rera_number:     form.rera_number,
      possession_date: form.possession_date,
      description:     form.description,
      youtube_url:     form.youtube_url,
      amenities:       form.amenities,
      tags:            form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      is_active:       form.is_active,
      is_featured:     form.is_featured,
      photos:          photos,
      floor_plan:  form.floor_plan || null,
      updated_at:      new Date().toISOString(),
    }

    try {
      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)

      if (error) {
        toast.error('Save failed: ' + error.message)
        return
      }

      toast.success('Property saved!')
      router.push('/admin/properties')
      router.refresh()
    } catch {
      toast.error('Unexpected error — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm" style={{ color: '#6B7280' }}>Loading property {id}…</div>
      </div>
    )
  }

  const embedUrl = youtubeEmbedUrl(form.youtube_url)

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-800" style={{ color: '#111827' }}>Edit Property</h1>
        <button onClick={() => router.back()} className="text-sm transition-colors"
          style={{ color: '#6B7280' }}>
          ← Back
        </button>
      </div>

      {/* Photos */}
      <section className="rounded-2xl p-5 space-y-3"
        style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="font-600 text-sm" style={{ color: '#111827' }}>
          Photos ({photos.length}/15)
        </h2>
        <PhotoUpload photos={photos} setPhotos={setPhotos} maxFiles={15} />
      </section>

      {/* Floor Plan */}
      <section className="rounded-2xl p-5 space-y-3"
        style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="font-600 text-sm" style={{ color: '#111827' }}>Floor Plan</h2>
        <PhotoUpload
          photos={form.floor_plan ? [form.floor_plan] : []}
          setPhotos={urls => setF('floor_plan', urls[0] || '')}
          maxFiles={1}
        />
      </section>

      {/* YouTube */}
      <section className="rounded-2xl p-5 space-y-3"
        style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="font-600 text-sm" style={{ color: '#111827' }}>Video Tour</h2>
        <input
          type="url"
          placeholder="YouTube URL (https://youtube.com/watch?v=...)"
          value={form.youtube_url}
          onChange={e => setF('youtube_url', e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm"
          style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
          suppressHydrationWarning
        />
        {embedUrl && (
          <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Preview" />
          </div>
        )}
      </section>

      {/* Basic info */}
      <section className="rounded-2xl p-5 space-y-4"
        style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="font-600 text-sm" style={{ color: '#111827' }}>Basic Info</h2>

        {([
          { key: 'title',           label: 'Project Title',    placeholder: 'e.g. Shalimar Mannat' },
          { key: 'builder',         label: 'Builder Name',     placeholder: 'e.g. Shalimar Corp' },
          { key: 'sector',          label: 'Sector / Area',    placeholder: 'e.g. Gomti Nagar' },
          { key: 'rera_number',     label: 'RERA Number',      placeholder: 'e.g. UPRERAPRJ705722' },
          { key: 'possession_date', label: 'Possession Date',  placeholder: 'e.g. Dec 2026' },
        ] as const).map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>{label}</label>
            <input
              type="text"
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setF(key, e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
              suppressHydrationWarning
            />
          </div>
        ))}

        <div>
          <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>City</label>
          <select value={form.city} onChange={e => setF('city', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
            suppressHydrationWarning>
            <option value="">Select City</option>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Status</label>
          <select value={form.status} onChange={e => setF('status', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
            suppressHydrationWarning>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'price_min', label: 'Min Price (lakhs)', placeholder: '35' },
            { key: 'price_max', label: 'Max Price (lakhs)', placeholder: '65' },
          ] as const).map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>{label}</label>
              <input type="number" placeholder={placeholder} value={form[key]}
                onChange={e => setF(key, e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
                suppressHydrationWarning />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>BHK (comma separated, e.g. 2, 3)</label>
          <input type="text" placeholder="2, 3" value={form.bhk}
            onChange={e => setF('bhk', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
            suppressHydrationWarning />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Description</label>
          <textarea rows={4} placeholder="Project description…"
            value={form.description}
            onChange={e => setF('description', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none"
            style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
            suppressHydrationWarning />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>Tags (comma separated)</label>
          <input type="text" placeholder="2BHK, Lucknow, RERA, ReadyToMove"
            value={form.tags}
            onChange={e => setF('tags', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
            suppressHydrationWarning />
        </div>

        <div>
          <label className="block text-xs mb-2" style={{ color: '#6B7280' }}>Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => {
              const on = form.amenities.includes(a)
              return (
                <button key={a} type="button" suppressHydrationWarning
                  onClick={() => setF('amenities', on
                    ? form.amenities.filter(x => x !== a)
                    : [...form.amenities, a]
                  )}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={on
                    ? { background: 'rgba(251,146,60,0.15)', color: '#FB923C', border: '1px solid rgba(124,58,237,0.5)' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {a}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-5 pt-1">
          {([
            { key: 'is_active',   label: 'Active' },
            { key: 'is_featured', label: 'Featured ⭐' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form[key]}
                onChange={e => setF(key, e.target.checked)}
                className="accent-orange-500 w-4 h-4" suppressHydrationWarning />
              <span className="text-sm" style={{ color: '#6B7280' }}>{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Debug panel — shows exactly what will be saved */}
      <div className="rounded-xl p-3 text-xs space-y-1"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D' }}>
        <p className="font-700 mb-1" style={{ color: '#F59E0B' }}>Debug — what will be saved:</p>
        <p>Property ID: {id}</p>
        <p>Title: {form.title || '(empty)'}</p>
        <p>Photos: {photos.length} {photos.length > 0 ? `✓ [${photos[0]?.slice(-30)}…]` : '✗ none'}</p>
        <p>Floor Plan URL: {form.floor_plan ? `✓ ${form.floor_plan.slice(-30)}…` : '✗ none'}</p>
        <p>YouTube: {form.youtube_url || '(none)'}</p>
        <p>Price: ₹{form.price_min || '?'}L – ₹{form.price_max || '?'}L</p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-heading font-800 text-base text-white transition-all disabled:opacity-50"
        style={{ background: saving ? '#E86A00' : 'linear-gradient(135deg, #FB923C, #F59E0B)', boxShadow: '0 4px 20px rgba(251,146,60,0.25)' }}
        suppressHydrationWarning
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>

    </div>
  )
}
