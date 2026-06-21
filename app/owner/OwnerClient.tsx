'use client'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'

const FREE_LIMIT = 3
const CITIES = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya', 'Kanpur', 'Agra', 'Varanasi', 'Other']
const BHK_OPTS = ['1', '2', '3', '4', '5+']
const BLANK = {
  title: '', city: '', sector: '', price: '', bhk: '', description: '', phone: '', photos: [] as string[],
}

type Prop = { id: string; title: string; city: string | null; price_min: number | null; is_active: boolean; photos?: string[] | null; created_at: string }
type Enq  = { id: string; name: string; phone: string; city: string | null; budget: string | null; created_at: string; properties?: { title: string } | null }

export default function OwnerClient({
  userId, properties, enquiries,
}: {
  userId: string
  properties: Prop[]
  enquiries: Enq[]
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState<'listings' | 'add' | 'enquiries'>('listings')
  const [form, setForm] = useState(BLANK)
  const [saving, start] = useTransition()
  const [msg, setMsg] = useState('')
  const welcome = params.get('welcome') === '1'

  const setF = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const fmt = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(0)}L` : `₹${n}`

  const handleAdd = () => {
    start(async () => {
      setMsg('')
      if (!form.title || !form.phone) { setMsg('Title aur phone required hai'); return }
      if (properties.length >= FREE_LIMIT) { setMsg(`Free limit ${FREE_LIMIT} listings hai`); return }
      const { error } = await createClient().from('properties').insert({
        title: form.title, city: form.city || null, sector: form.sector || null,
        price_min: form.price ? parseFloat(form.price) : null,
        bhk: form.bhk ? [form.bhk] : null, description: form.description || null,
        owner_contact: form.phone, listing_type: 'owner', created_by: userId,
        listed_by: userId, is_active: true, is_featured: false,
        photos: form.photos.length > 0 ? form.photos : null,
      })
      if (error) { setMsg(error.message); return }
      setMsg('✅ Property listed!')
      setForm(BLANK)
      router.refresh()
      setTab('listings')
    })
  }

  const TABS = [
    { id: 'listings',  label: 'My Listings' },
    { id: 'add',       label: '+ Add Property' },
    { id: 'enquiries', label: 'Enquiries' },
  ] as const

  return (
    <>
      {welcome && (
        <div className="mb-6 p-4 rounded-2xl text-center"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="text-2xl mb-1">🎉</div>
          <p className="font-700 text-sm" style={{ color: '#22C55E' }}>Property list ho gayi! Buyers contact karenge.</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-800 mb-0.5" style={{ color: '#111827' }}>Owner Dashboard</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {properties.length}/{FREE_LIMIT} free listings used
        </p>
        <div className="mt-2 w-full h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${Math.min((properties.length / FREE_LIMIT) * 100, 100)}%`, background: '#22C55E' }} />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} suppressHydrationWarning
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-600 transition-all"
            style={{
              background: tab === t.id ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${tab === t.id ? 'rgba(16,185,129,0.4)' : 'rgba(0,0,0,0.05)'}`,
              color: tab === t.id ? '#22C55E' : '#6B7280',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* MY LISTINGS */}
      {tab === 'listings' && (
        properties.length === 0 ? (
          <div className="glass p-10 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <p className="font-heading font-700 mb-3" style={{ color: '#111827' }}>Abhi koi listing nahi</p>
            <button onClick={() => setTab('add')} suppressHydrationWarning
              className="text-sm px-5 py-2.5 rounded-xl font-700 transition-all"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#22C55E' }}>
              + Pehli property add karo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map(p => (
              <div key={p.id} className="glass p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {p.photos?.[0]
                    ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🏠</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-600 text-sm truncate" style={{ color: '#111827' }}>{p.title}</span>
                    <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.12)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.25)' }}>
                      🏠 Owner Listing
                    </span>
                  </div>
                  <div className="text-xs mt-0.5 flex gap-2 flex-wrap" style={{ color: '#6B7280' }}>
                    {p.city && <span>{p.city}</span>}
                    {p.price_min && <><span>·</span><span>{fmt(p.price_min)}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={p.is_active
                      ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.2)' }
                      : { background: 'rgba(0,0,0,0.03)', color: '#9CA3AF', border: '1px solid rgba(0,0,0,0.05)' }}>
                    {p.is_active ? 'Live' : 'Hidden'}
                  </span>
                  <Link href={`/property/${p.id}`}
                    className="text-xs px-3 py-1 rounded-lg"
                    style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ADD PROPERTY */}
      {tab === 'add' && (
        <div className="glass p-5">
          {properties.length >= FREE_LIMIT ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-heading font-700 mb-2" style={{ color: '#111827' }}>Free limit reach ho gayi</p>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Owner ke liye {FREE_LIMIT} listings free hain. Zyada ke liye contact karo.
              </p>
              <a href="https://wa.me/919643693090" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-700"
                style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}>
                WhatsApp Support
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-xs font-700 mb-1" style={{ color: '#9CA3AF' }}>
                {properties.length}/{FREE_LIMIT} free listings used
              </div>
              <PhotoUpload photos={form.photos} setPhotos={v => setF('photos', v)} maxFiles={10} />
              <input className="input-dark text-sm" placeholder="Property title *"
                value={form.title} onChange={e => setF('title', e.target.value)} suppressHydrationWarning />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-dark text-sm" value={form.city}
                  onChange={e => setF('city', e.target.value)} suppressHydrationWarning>
                  <option value="">Select City</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input className="input-dark text-sm" placeholder="Sector / Area"
                  value={form.sector} onChange={e => setF('sector', e.target.value)} suppressHydrationWarning />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input-dark text-sm" placeholder="Price (₹)" type="number"
                  value={form.price} onChange={e => setF('price', e.target.value)} suppressHydrationWarning />
                <select className="input-dark text-sm" value={form.bhk}
                  onChange={e => setF('bhk', e.target.value)} suppressHydrationWarning>
                  <option value="">BHK</option>
                  {BHK_OPTS.map(b => <option key={b}>{b} BHK</option>)}
                </select>
              </div>
              <textarea className="input-dark text-sm resize-none" rows={3} placeholder="Description"
                value={form.description} onChange={e => setF('description', e.target.value)} suppressHydrationWarning />
              <input className="input-dark text-sm" placeholder="Contact Number *" type="tel"
                value={form.phone} onChange={e => setF('phone', e.target.value)} suppressHydrationWarning />
              {msg && <p className="text-sm" style={{ color: msg.startsWith('✅') ? '#22C55E' : '#F87171' }}>{msg}</p>}
              <button onClick={handleAdd} disabled={saving} suppressHydrationWarning
                className="text-sm py-2.5 rounded-xl font-700 disabled:opacity-50 transition-all"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#22C55E' }}>
                {saving ? 'Saving…' : '🏠 List Property Free'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ENQUIRIES */}
      {tab === 'enquiries' && (
        enquiries.length === 0 ? (
          <div className="glass p-10 text-center">
            <div className="text-4xl mb-3">📩</div>
            <p className="font-heading font-700" style={{ color: '#111827' }}>Abhi koi enquiry nahi</p>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Jab buyers contact karenge, yahan dikhenge.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enquiries.map((e: Enq) => (
              <div key={e.id} className="glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-600 text-sm" style={{ color: '#111827' }}>{e.name}</div>
                    <a href={`tel:${e.phone}`} className="text-sm font-700 mt-0.5 block" style={{ color: '#22C55E' }}>
                      📞 {e.phone}
                    </a>
                    <div className="text-xs mt-1 flex gap-2 flex-wrap" style={{ color: '#6B7280' }}>
                      {e.city && <span>{e.city}</span>}
                      {e.budget && <><span>·</span><span>{e.budget}</span></>}
                      {(e.properties as { title?: string } | null)?.title && (
                        <><span>·</span><span>{(e.properties as { title: string }).title}</span></>
                      )}
                    </div>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>
                    {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  )
}
