'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)
  const [photos, setPhotos] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', builder: '', sector: '', city: 'Lucknow',
    price_min: '', price_max: '', bhk: '',
    status: 'Under Construction', rera_number: '',
    possession_date: '', description: '', youtube_url: '',
    tags: '', amenities: [] as string[],
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== 'tellitorg1@gmail.com') {
        router.replace('/login')
      } else {
        setChecking(false)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const { error } = await supabase.from('properties').insert({
      title: form.title,
      builder: form.builder || null,
      sector: form.sector || null,
      city: form.city,
      price_min: form.price_min ? Math.round(parseFloat(form.price_min) * 100000) : null,
      price_max: form.price_max ? Math.round(parseFloat(form.price_max) * 100000) : null,
      bhk: form.bhk || null,
      status: form.status,
      rera_number: form.rera_number || null,
      possession_date: form.possession_date || null,
      description: form.description || null,
      youtube_url: form.youtube_url || null,
      amenities: form.amenities,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      photos: photos,
      is_active: true,
      is_featured: false,
    })
    setSaving(false)
    if (error) { toast.error('Save failed: ' + error.message); return }
    toast.success('Property added successfully!')
    router.push('/admin/properties')
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
      </div>
      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6">

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Project Title *</label>
          <input type="text" placeholder="e.g. Shalimar Mannat"
            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Builder Name</label>
          <input type="text" placeholder="e.g. Shalimar Corp"
            value={form.builder} onChange={e => setForm(p => ({ ...p, builder: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
            <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
              {['Lucknow','Noida','Greater Noida','Ayodhya','Ghaziabad'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Sector/Area</label>
            <input type="text" placeholder="e.g. Gomti Nagar"
              value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Price Min (Lakhs)</label>
            <input type="number" placeholder="35"
              value={form.price_min} onChange={e => setForm(p => ({ ...p, price_min: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Price Max (Lakhs)</label>
            <input type="number" placeholder="65"
              value={form.price_max} onChange={e => setForm(p => ({ ...p, price_max: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">BHK</label>
            <input type="text" placeholder="2,3"
              value={form.bhk} onChange={e => setForm(p => ({ ...p, bhk: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
              <option>Under Construction</option>
              <option>Ready to Move</option>
              <option>New Launch</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">RERA Number</label>
          <input type="text" placeholder="e.g. UPRERAPRJ705722"
            value={form.rera_number} onChange={e => setForm(p => ({ ...p, rera_number: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Possession Date</label>
          <input type="text" placeholder="e.g. Dec 2026"
            value={form.possession_date} onChange={e => setForm(p => ({ ...p, possession_date: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">YouTube URL</label>
          <input type="text" placeholder="https://youtube.com/..."
            value={form.youtube_url} onChange={e => setForm(p => ({ ...p, youtube_url: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea rows={3} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Tags (comma separated)</label>
          <input type="text" placeholder="2BHK, Lucknow, RERA"
            value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {['Swimming Pool','Club House','Gym','24hr Security','Power Backup','Parking','Garden','Kids Zone'].map(a => (
              <button key={a} type="button"
                onClick={() => setForm(p => ({
                  ...p,
                  amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a]
                }))}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  form.amenities.includes(a)
                    ? 'bg-orange-100 text-orange-600 border-orange-400'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300'
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-4 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-bold rounded-2xl transition-all disabled:opacity-50 text-base">
          {saving ? 'Saving...' : 'Save Property'}
        </button>

      </form>
    </div>
  )
}
