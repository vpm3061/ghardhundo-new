'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CITIES = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya', 'Ghaziabad', 'Other']
const PACKAGES = ['Property Page Banner', 'Search Page Banner', 'Homepage Banner', 'CPL Package', 'Not sure yet']

const BLANK = { name: '', company: '', phone: '', city: '', package: '', message: '' }

export default function AdvertiseForm() {
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)

  const setF = (k: keyof typeof BLANK, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (!form.name.trim() || !form.phone.trim()) { setMsg('Name aur phone number zaroori hai'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('advertise_enquiries').insert({
      name: form.name.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim(),
      city: form.city || null,
      package: form.package || null,
      message: form.message.trim() || null,
    })
    setSaving(false)
    if (error) { setMsg(error.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-heading text-xl font-800 text-[#111827] mb-2">Thanks — request received!</h3>
        <p className="text-sm text-[#6B7280]">Our team will reach out within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]"
          placeholder="Your name *" value={form.name} onChange={e => setF('name', e.target.value)} suppressHydrationWarning />
        <input className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]"
          placeholder="Company (optional)" value={form.company} onChange={e => setF('company', e.target.value)} suppressHydrationWarning />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]"
          placeholder="Phone number *" type="tel" value={form.phone} onChange={e => setF('phone', e.target.value)} suppressHydrationWarning />
        <select className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]"
          value={form.city} onChange={e => setF('city', e.target.value)} suppressHydrationWarning>
          <option value="">Select City</option>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <select className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]"
        value={form.package} onChange={e => setF('package', e.target.value)} suppressHydrationWarning>
        <option value="">Interested in…</option>
        {PACKAGES.map(p => <option key={p}>{p}</option>)}
      </select>
      <textarea className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#FB923C]"
        rows={3} placeholder="Anything else we should know? (optional)"
        value={form.message} onChange={e => setF('message', e.target.value)} suppressHydrationWarning />
      {msg && <p className="text-sm text-red-500">{msg}</p>}
      <button type="submit" disabled={saving} suppressHydrationWarning
        className="w-full py-3 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-bold rounded-xl disabled:opacity-50 transition-all">
        {saving ? 'Sending…' : 'Get in Touch →'}
      </button>
    </form>
  )
}
