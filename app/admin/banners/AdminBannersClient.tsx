'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'
import type { Banner } from '@/lib/supabase/types'

const POSITIONS: { id: Banner['position']; label: string }[] = [
  { id: 'home_top', label: 'Home — top' },
  { id: 'home_mid', label: 'Home — middle' },
  { id: 'properties_top', label: 'Properties — top' },
  { id: 'property_detail_side', label: 'Property detail — sidebar' },
]

const BLANK_FORM = { title: '', image_url: [] as string[], link_url: '', position: 'home_top' as Banner['position'], starts_at: '', ends_at: '' }

export default function AdminBannersClient({ banners: initial }: { banners: Banner[] }) {
  const [banners, setBanners] = useState(initial)
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const create = async () => {
    setMsg('')
    if (!form.title.trim() || form.image_url.length === 0) { setMsg('Title aur image dono required hai'); return }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('banners').insert({
      title: form.title,
      image_url: form.image_url[0],
      link_url: form.link_url || null,
      position: form.position,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    }).select().single()
    setSaving(false)
    if (error) { setMsg(error.message); return }
    setBanners(prev => [data as Banner, ...prev])
    setForm(BLANK_FORM)
  }

  const toggleActive = async (banner: Banner) => {
    setLoadingId(banner.id)
    const supabase = createClient()
    await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
    setLoadingId(null)
  }

  const remove = async (banner: Banner) => {
    setLoadingId(banner.id)
    const supabase = createClient()
    await supabase.from('banners').delete().eq('id', banner.id)
    setBanners(prev => prev.filter(b => b.id !== banner.id))
    setLoadingId(null)
  }

  return (
    <div>
      {/* Create form */}
      <div className="glass p-5 mb-6 flex flex-col gap-3">
        <h2 className="font-heading font-700 mb-1" style={{ color: '#111827' }}>Add Banner</h2>
        <PhotoUpload photos={form.image_url} setPhotos={v => setForm(p => ({ ...p, image_url: v }))} maxFiles={1} />
        <input className="input-dark text-sm" placeholder="Title"
          value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} suppressHydrationWarning />
        <input className="input-dark text-sm" placeholder="Link URL (optional)"
          value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} suppressHydrationWarning />
        <select className="input-dark text-sm" value={form.position}
          onChange={e => setForm(p => ({ ...p, position: e.target.value as Banner['position'] }))} suppressHydrationWarning>
          {POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Starts</label>
            <input className="input-dark text-sm w-full" type="date"
              value={form.starts_at} onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))} suppressHydrationWarning />
          </div>
          <div>
            <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Ends</label>
            <input className="input-dark text-sm w-full" type="date"
              value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))} suppressHydrationWarning />
          </div>
        </div>
        {msg && <p className="text-sm" style={{ color: '#F87171' }}>{msg}</p>}
        <button onClick={create} disabled={saving} suppressHydrationWarning className="btn-accent disabled:opacity-50">
          {saving ? 'Saving…' : '+ Add Banner'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {banners.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-5xl mb-3">🖼️</div>
            <p className="font-heading font-700 text-[#111827]">No banners yet</p>
          </div>
        ) : banners.map(b => (
          <div key={b.id} className="glass p-4 flex items-center gap-3">
            <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <img src={b.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-600 text-sm truncate" style={{ color: '#111827' }}>{b.title}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                {POSITIONS.find(p => p.id === b.position)?.label}
                {b.ends_at && ` · ends ${new Date(b.ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleActive(b)} disabled={loadingId === b.id} suppressHydrationWarning
                className="text-xs font-700 px-2.5 py-1 rounded-full transition-all"
                style={b.is_active
                  ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'rgba(0,0,0,0.03)', color: '#9CA3AF', border: '1px solid rgba(0,0,0,0.05)' }}>
                {b.is_active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => remove(b)} disabled={loadingId === b.id} suppressHydrationWarning
                className="text-xs px-3 py-1 rounded-lg" style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
