'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', builder: '', sector: '', city: 'Lucknow',
    price_min: '', price_max: '', bhk: '',
    status: 'Under Construction', rera_number: '',
    possession_date: '', description: '', youtube_url: '',
    amenities: [] as string[], tags: '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { toast.error('Title required'); return }
    setSaving(true)
    const { error } = await supabase.from('properties').insert({
      title: form.title,
      builder: form.builder || null,
      sector: form.sector || null,
      city: form.city,
      price_min: form.price_min ? Math.round(parseFloat(form.price_min) * 100000) : null,
      price_max: form.price_max ? Math.round(parseFloat(form.price_max) * 100000) : null,
      bhk: form.bhk ? form.bhk.split(',').map(b => b.trim()).filter(Boolean) : null,
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
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Property saved!')
    router.push('/admin/properties')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Property</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        {[
          { key: 'title', label: 'Project Title *', placeholder: 'e.g. Shalimar Mannat' },
          { key: 'builder', label: 'Builder Name', placeholder: 'e.g. Shalimar Corp' },
          { key: 'sector', label: 'Sector/Area', placeholder: 'e.g. Gomti Nagar' },
          { key: 'rera_number', label: 'RERA Number', placeholder: 'e.g. UPRERAPRJ705722' },
          { key: 'possession_date', label: 'Possession Date', placeholder: 'e.g. Dec 2026' },
          { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-sm font-medium text-gray-700 block mb-1">{f.label}</label>
            <input type="text" placeholder={f.placeholder}
              value={(form as Record<string, unknown>)[f.key] as string}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Price Min (Lakhs)</label>
            <input type="number" placeholder="35" value={form.price_min}
              onChange={e => setForm(p => ({ ...p, price_min: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Price Max (Lakhs)</label>
            <input type="number" placeholder="65" value={form.price_max}
              onChange={e => setForm(p => ({ ...p, price_max: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
          <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
            {['Lucknow','Noida','Greater Noida','Ayodhya','Ghaziabad'].map(c => <option key={c}>{c}</option>)}
          </select>
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
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">BHK (comma separated)</label>
          <input type="text" placeholder="2,3" value={form.bhk}
            onChange={e => setForm(p => ({ ...p, bhk: e.target.value }))}
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
          <input type="text" placeholder="2BHK, Lucknow, RERA" value={form.tags}
            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full py-4 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-bold rounded-2xl disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Property'}
        </button>
      </form>
    </div>
  )
}
