'use client'
import PropertyLocationFields from '@/components/PropertyLocationFields'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import PhotoUpload from '@/components/PhotoUpload'
import AdminPropertyTrust from '@/components/AdminPropertyTrust'

const AMENITIES = ['Swimming Pool', 'Club House', 'Gym', '24hr Security', 'Power Backup', 'Parking', 'Garden', 'Kids Zone', 'Lift', 'CCTV']
const STATUSES  = ['Under Construction', 'Ready to Move', 'New Launch']

function youtubeEmbedUrl(url: string) {
  const id = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)?.[1]
  return id ? `https://www.youtube.com/embed/${id}` : null
}

function instagramEmbedUrl(value: string) {
  try {
    const url = new URL(value)
    if (!['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(url.hostname)) return null
    const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/)
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed` : null
  } catch {
    return null
  }
}

export default function EditPropertyPage() {
  const router    = useRouter()
  const params    = useParams()
  const id        = params.id as string
  const supabase  = createClient()

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [photos,  setPhotos]  = useState<string[]>([])
  const [originalPhotos, setOriginalPhotos] = useState<string[]>([])
  const [existingNearby, setExistingNearby] = useState<Record<string, unknown>>({})

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
    instagram_url:    '',
    metro_station:    '',
    metro_distance_km: '',
    railway_station:  '',
    railway_distance_km: '',
    airport_name:     '',
    airport_distance_km: '',
    school_name:      '',
    school_distance_km: '',
    hospital_name:    '',
    hospital_distance_km: '',
    floor_plan:   '',
    amenities:        [] as string[],
    tags:             '',
    is_active:        true,
    is_featured:      false,
  })

  const setF = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const updatePhotos = (nextPhotos: string[]) => setPhotos(nextPhotos)

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
        instagram_url:   data.instagram_url   ?? '',
        metro_station: Array.isArray(data.nearby?.metro) ? data.nearby.metro[0]?.name ?? '' : '',
        metro_distance_km: Array.isArray(data.nearby?.metro) ? String(data.nearby.metro[0]?.distance ?? '').replace(/\s*km$/i, '') : '',
        railway_station: Array.isArray(data.nearby?.railway_station) ? data.nearby.railway_station[0]?.name ?? '' : '',
        railway_distance_km: Array.isArray(data.nearby?.railway_station) ? String(data.nearby.railway_station[0]?.distance ?? '').replace(/\s*km$/i, '') : '',
        airport_name: Array.isArray(data.nearby?.airport) ? data.nearby.airport[0]?.name ?? '' : '',
        airport_distance_km: Array.isArray(data.nearby?.airport) ? String(data.nearby.airport[0]?.distance ?? '').replace(/\s*km$/i, '') : '',
        school_name: Array.isArray(data.nearby?.schools) ? data.nearby.schools[0]?.name ?? '' : '',
        school_distance_km: Array.isArray(data.nearby?.schools) ? String(data.nearby.schools[0]?.distance ?? '').replace(/\s*km$/i, '') : '',
        hospital_name: Array.isArray(data.nearby?.hospitals) ? data.nearby.hospitals[0]?.name ?? '' : '',
        hospital_distance_km: Array.isArray(data.nearby?.hospitals) ? String(data.nearby.hospitals[0]?.distance ?? '').replace(/\s*km$/i, '') : '',
        floor_plan:  data.floor_plan  ?? '',
        amenities:       Array.isArray(data.amenities) ? data.amenities : [],
        tags:            Array.isArray(data.tags) ? data.tags.join(', ') : '',
        is_active:       data.is_active  ?? true,
        is_featured:     data.is_featured ?? false,
      })

      setPhotos(Array.isArray(data.photos) ? data.photos : [])
      setOriginalPhotos(Array.isArray(data.photos) ? data.photos : [])
      setExistingNearby(data.nearby && typeof data.nearby === 'object' ? data.nearby : {})
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    const photosUnchanged = photos.length === originalPhotos.length && photos.every((photo, index) => photo === originalPhotos[index])
    if (photos.length < 2) { toast.error('Listings require at least 2 original site photos'); return }
    if (photos.length > 4 && !photosUnchanged) { toast.error('A changed photo set must contain 2 to 4 photos'); return }
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
      instagram_url:   form.instagram_url,
      nearby: {
        ...existingNearby,
        ...(form.metro_station.trim() ? { metro: [{ name: form.metro_station.trim(), distance: form.metro_distance_km.trim() ? `${form.metro_distance_km.trim()} km` : '' }] } : {}),
        ...(form.railway_station.trim() ? { railway_station: [{ name: form.railway_station.trim(), distance: form.railway_distance_km.trim() ? `${form.railway_distance_km.trim()} km` : '' }] } : {}),
        ...(form.airport_name.trim() ? { airport: [{ name: form.airport_name.trim(), distance: form.airport_distance_km.trim() ? `${form.airport_distance_km.trim()} km` : '' }] } : {}),
        ...(form.school_name.trim() ? { schools: [{ name: form.school_name.trim(), distance: form.school_distance_km.trim() ? `${form.school_distance_km.trim()} km` : '' }] } : {}),
        ...(form.hospital_name.trim() ? { hospitals: [{ name: form.hospital_name.trim(), distance: form.hospital_distance_km.trim() ? `${form.hospital_distance_km.trim()} km` : '' }] } : {}),
      },
      amenities:       form.amenities,
      tags:            form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      is_active:       form.is_active,
      is_featured:     form.is_featured,
      media_review_status: 'approved',
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
          Original site photos ({photos.length}/{Math.max(4, originalPhotos.length)})
        </h2>
        <p className="text-xs text-slate-500">Use JPG/JPEG, PNG or WEBP, maximum 5 MB each. New or changed photo sets allow 2–4 photos; existing photo sets stay untouched unless edited.</p>
        <PhotoUpload photos={photos} setPhotos={updatePhotos} maxFiles={Math.max(4, originalPhotos.length)} />
      </section>

      <section className="rounded-2xl p-5 space-y-3" style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="font-600 text-sm" style={{ color: '#111827' }}>Metro proximity (optional)</h2>
        <input type="text" placeholder="Nearest metro station" value={form.metro_station} onChange={e => setF('metro_station', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="number" min="0" step="0.1" placeholder="Distance in km" value={form.metro_distance_km} onChange={e => setF('metro_distance_km', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="text" placeholder="Nearest railway station" value={form.railway_station} onChange={e => setF('railway_station', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="number" min="0" step="0.1" placeholder="Railway station distance in km" value={form.railway_distance_km} onChange={e => setF('railway_distance_km', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="text" placeholder="Nearest airport" value={form.airport_name} onChange={e => setF('airport_name', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="number" min="0" step="0.1" placeholder="Airport distance in km" value={form.airport_distance_km} onChange={e => setF('airport_distance_km', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="text" placeholder="Nearby school" value={form.school_name} onChange={e => setF('school_name', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="number" min="0" step="0.1" placeholder="School distance in km" value={form.school_distance_km} onChange={e => setF('school_distance_km', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="text" placeholder="Nearby hospital" value={form.hospital_name} onChange={e => setF('hospital_name', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
        <input type="number" min="0" step="0.1" placeholder="Hospital distance in km" value={form.hospital_distance_km} onChange={e => setF('hospital_distance_km', e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm" />
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
        <input
          type="url"
          placeholder="Instagram post or Reel URL (optional)"
          value={form.instagram_url}
          onChange={e => setF('instagram_url', e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm"
          style={{ background: '#F5F5F4', border: '1px solid rgba(255,255,255,0.1)', color: '#111827', outline: 'none' }}
        />
        {instagramEmbedUrl(form.instagram_url) && (
          <iframe src={instagramEmbedUrl(form.instagram_url)!} className="w-full rounded-xl border-0" style={{ height: 600 }} title="Instagram post or Reel preview" />
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
          <PropertyLocationFields value={form.city} onChange={city => setF('city', city)} />
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
          <input type="text" placeholder="3/4 BHK, city, RERA, Ready to Move"
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

      <AdminPropertyTrust propertyId={id} />
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
