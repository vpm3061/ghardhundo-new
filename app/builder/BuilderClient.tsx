'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import type { Property } from '@/lib/supabase/types'

const CHART_STYLE = {
  contentStyle: { background: '#F5F5F4', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', color: '#111827', fontSize: '12px' }
}

type PropStat = { id: string; title: string; views: number; leads: number }
type Offer = { id?: string; title: string; description: string; valid_till: string }

const fmt = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(0)}L` : `₹${n}`
const CITIES    = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']
const STATUSES  = ['Ready to Move', 'Under Construction', 'New Launch']
const AMENITIES = ['Swimming Pool', 'Gym', '24hr Security', 'Parking', 'Club House', 'Power Backup', 'Garden', 'Kids Zone']
const BHK_OPTS  = ['1', '2', '3', '4', '5']

type Plan = 'Basic' | 'Standard' | 'Premium'
const PLAN_INFO: Record<Plan, { color: string; border: string; limit: number; price: string }> = {
  Basic:    { color: '#6B7280', border: 'rgba(255,255,255,0.1)',  limit: 2,   price: 'Free' },
  Standard: { color: '#FB923C', border: 'rgba(251,146,60,0.25)',  limit: 10,  price: '₹4,999/mo' },
  Premium:  { color: '#F59E0B', border: 'rgba(245,158,11,0.3)',  limit: 999, price: '₹9,999/mo' },
}

const BLANK_FORM = {
  title: '', builder: '', sector: '', city: '', status: '',
  price_min: '', price_max: '', rera_number: '', description: '',
  possession_date: '', tags: '',
  bhk: [] as string[], amenities: [] as string[],
  photos: [] as string[], floor_plan: '', youtube_url: '',
}

export default function BuilderClient({
  userId, properties, plan, listingCount, listingLimit, propStats, pkgExpiry,
}: {
  userId: string
  properties: Property[]
  plan: Plan
  listingCount: number
  listingLimit: number
  propStats: PropStat[]
  pkgExpiry: string | null
}) {
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab]     = useState<'listings' | 'add' | 'analytics' | 'offers'>('listings')

  useEffect(() => {
    const supabase = createClient()
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/builder'); return }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      setAuthLoading(false)
      if (profile?.role && profile.role !== 'builder') router.push('/')
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full" />
    </div>
  )
  const [form, setForm]   = useState(BLANK_FORM)
  const [saving, start]   = useTransition()
  const [msg, setMsg]     = useState('')

  /* Offers state */
  const [selProp, setSelProp] = useState('')
  const [offers, setOffers]   = useState<Offer[]>([{ title: '', description: '', valid_till: '' }])
  const [offerMsg, setOfferMsg] = useState('')
  const [offerSaving, startOffer] = useTransition()

  const router = useRouter()
  const planInfo = PLAN_INFO[plan]

  const setF = (k: keyof typeof BLANK_FORM, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const toggleArr = (k: 'bhk' | 'amenities', val: string) =>
    setF(k, (form[k] as string[]).includes(val)
      ? (form[k] as string[]).filter(x => x !== val)
      : [...(form[k] as string[]), val])

  const handleAdd = () => {
    start(async () => {
      setMsg('')
      if (!form.title) { setMsg('Title is required'); return }
      if (listingCount >= listingLimit) { setMsg('Listing limit reached. Upgrade plan.'); return }

      const supabase = createClient()
      const { error } = await supabase.from('properties').insert({
        title:            form.title,
        builder:          form.builder || null,
        sector:           form.sector  || null,
        city:             form.city    || null,
        status:           form.status  || null,
        price_min:        form.price_min ? parseFloat(form.price_min) : null,
        price_max:        form.price_max ? parseFloat(form.price_max) : null,
        rera_number:      form.rera_number || null,
        description:      form.description || null,
        possession_date:  form.possession_date || null,
        tags:             form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        bhk:              form.bhk.length > 0 ? form.bhk : null,
        amenities:        form.amenities.length > 0 ? form.amenities : null,
        photos:           form.photos.length > 0 ? form.photos : null,
        floor_plan:       form.floor_plan || null,
        youtube_url:      form.youtube_url || null,
        listed_by:        userId,
        created_by:       userId,
        listing_type:     'builder',
        is_active:        true,
        is_featured:      false,
      })
      if (error) { setMsg(error.message); return }
      setMsg('✅ Property listed successfully!')
      setForm(BLANK_FORM)
      router.refresh()
    })
  }

  const handleSaveOffers = () => {
    if (!selProp) { setOfferMsg('Select a property'); return }
    startOffer(async () => {
      const supabase = createClient()
      await supabase.from('offers').delete().eq('property_id', selProp)
      const valid = offers.filter(o => o.title.trim())
      if (valid.length > 0) {
        await supabase.from('offers').insert(valid.map(o => ({
          property_id: selProp,
          title:       o.title,
          description: o.description || null,
          valid_till:  o.valid_till  || null,
        })))
      }
      setOfferMsg('✅ Offers saved!')
      setTimeout(() => setOfferMsg(''), 3000)
    })
  }

  const TABS = [
    { id: 'listings',  label: 'My Listings' },
    { id: 'add',       label: '+ Add Property' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'offers',    label: 'Offers' },
  ] as const

  return (
    <>
      {/* Package card */}
      <div className="glass p-5 mb-6 relative overflow-hidden"
        style={{ border: `1px solid ${planInfo.border}` }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: planInfo.color, filter: 'blur(60px)', opacity: 0.08 }} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Package</div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-2xl font-800" style={{ color: planInfo.color }}>{plan}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-700"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#6B7280', border: '1px solid rgba(0,0,0,0.06)' }}>
                {planInfo.price}
              </span>
            </div>
            {pkgExpiry && (
              <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Expires {new Date(pkgExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </div>
            )}
          </div>
          {plan !== 'Premium' && (
            <a href="/pricing" className="shrink-0 text-xs px-4 py-2 rounded-xl font-700"
              style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C' }}>
              Upgrade ↗
            </a>
          )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
            <span>Listings used</span>
            <span>{listingCount} / {listingLimit === 999 ? '∞' : listingLimit}</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: listingLimit === 999 ? '20%' : `${Math.min((listingCount / listingLimit) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${planInfo.color}88, ${planInfo.color})`,
              }} />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} suppressHydrationWarning
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-600 transition-all"
            style={{
              background: tab === t.id ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${tab === t.id ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.05)'}`,
              color: tab === t.id ? '#FB923C' : '#6B7280',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MY LISTINGS ── */}
      {tab === 'listings' && (
        properties.length === 0 ? (
          <div className="glass p-10 text-center">
            <div className="text-4xl mb-3">🏗️</div>
            <p className="font-heading font-700 mb-1" style={{ color: '#111827' }}>No listings yet</p>
            <button onClick={() => setTab('add')} suppressHydrationWarning
              className="btn-accent text-sm px-5 py-2.5 mt-3 inline-block">
              + Add First Property
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {properties.map(p => {
              const stat = propStats.find(s => s.id === p.id)
              return (
                <div key={p.id} className="glass p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center" style={{ color: '#9CA3AF' }}>🏢</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-600 text-sm truncate" style={{ color: '#111827' }}>{p.title}</div>
                    <div className="text-xs mt-0.5 flex gap-2 flex-wrap" style={{ color: '#6B7280' }}>
                      {p.city && <span>{p.city}</span>}
                      {p.price_min && <><span>·</span><span>{fmt(p.price_min)}</span></>}
                      {stat && <><span>· 👁 {stat.views}</span><span>· 📩 {stat.leads}</span></>}
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
                      className="text-xs px-3 py-1 rounded-lg transition-colors"
                      style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
                      View
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── ADD PROPERTY ── */}
      {tab === 'add' && (
        <div className="glass p-5">
          {listingCount >= listingLimit ? (
            <div className="text-center py-8">
              <p className="font-heading font-700 mb-2" style={{ color: '#111827' }}>Listing limit reached</p>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Upgrade your plan to add more properties.</p>
              <a href="/pricing" className="btn-accent text-sm px-5 py-2.5 inline-block">Upgrade Plan</a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-sm font-700 mb-1" style={{ color: '#9CA3AF' }}>
                {listingCount}/{listingLimit === 999 ? '∞' : listingLimit} listings used
              </div>

              <div>
                <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Property Photos</label>
                <PhotoUpload photos={form.photos} setPhotos={v => setF('photos', v)} maxFiles={15} />
              </div>

              <input className="input-dark text-sm" placeholder="Property title *"
                value={form.title} onChange={e => setF('title', e.target.value)} suppressHydrationWarning />

              <div className="grid grid-cols-2 gap-3">
                <input className="input-dark text-sm" placeholder="Builder name"
                  value={form.builder} onChange={e => setF('builder', e.target.value)} suppressHydrationWarning />
                <input className="input-dark text-sm" placeholder="Sector / Area"
                  value={form.sector} onChange={e => setF('sector', e.target.value)} suppressHydrationWarning />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select className="input-dark text-sm" value={form.city}
                  onChange={e => setF('city', e.target.value)} suppressHydrationWarning>
                  <option value="">Select City</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="input-dark text-sm" value={form.status}
                  onChange={e => setF('status', e.target.value)} suppressHydrationWarning>
                  <option value="">Status</option>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input className="input-dark text-sm" placeholder="Min Price (₹)" type="number"
                  value={form.price_min} onChange={e => setF('price_min', e.target.value)} suppressHydrationWarning />
                <input className="input-dark text-sm" placeholder="Max Price (₹)" type="number"
                  value={form.price_max} onChange={e => setF('price_max', e.target.value)} suppressHydrationWarning />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input className="input-dark text-sm" placeholder="RERA Number (optional)"
                  value={form.rera_number} onChange={e => setF('rera_number', e.target.value)} suppressHydrationWarning />
                <input className="input-dark text-sm" placeholder="Possession Date" type="date"
                  value={form.possession_date} onChange={e => setF('possession_date', e.target.value)} suppressHydrationWarning />
              </div>

              <div>
                <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>BHK Options</label>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTS.map(b => (
                    <button key={b} type="button" onClick={() => toggleArr('bhk', b)} suppressHydrationWarning
                      className="text-sm px-3 py-1.5 rounded-xl transition-all"
                      style={{
                        background: form.bhk.includes(b) ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${form.bhk.includes(b) ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.06)'}`,
                        color: form.bhk.includes(b) ? '#FB923C' : '#6B7280',
                      }}>
                      {b} BHK
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(a => (
                    <button key={a} type="button" onClick={() => toggleArr('amenities', a)} suppressHydrationWarning
                      className="text-xs px-3 py-1.5 rounded-xl transition-all"
                      style={{
                        background: form.amenities.includes(a) ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${form.amenities.includes(a) ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.06)'}`,
                        color: form.amenities.includes(a) ? '#FB923C' : '#6B7280',
                      }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <textarea className="input-dark text-sm resize-none" rows={3}
                placeholder="Description"
                value={form.description} onChange={e => setF('description', e.target.value)} suppressHydrationWarning />

              <div>
                <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Floor Plan (optional)</label>
                <PhotoUpload photos={form.floor_plan ? [form.floor_plan] : []}
                  setPhotos={v => setF('floor_plan', v[0] || '')} maxFiles={1} />
              </div>

              <input className="input-dark text-sm" placeholder="YouTube URL (optional)"
                value={form.youtube_url} onChange={e => setF('youtube_url', e.target.value)} suppressHydrationWarning />

              <input className="input-dark text-sm" placeholder="Tags (comma separated: 2BHK, Metro nearby, Garden)"
                value={form.tags} onChange={e => setF('tags', e.target.value)} suppressHydrationWarning />

              {msg && (
                <p className="text-sm" style={{ color: msg.startsWith('✅') ? '#22C55E' : '#F87171' }}>{msg}</p>
              )}

              <button onClick={handleAdd} disabled={saving} suppressHydrationWarning
                className="btn-accent disabled:opacity-50">
                {saving ? 'Saving…' : '+ List Property'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Listings', value: listingCount,                            icon: '🏢', color: '#FB923C' },
              { label: 'Total Views',    value: propStats.reduce((s,p) => s+p.views, 0), icon: '👁',  color: '#22C55E' },
              { label: 'Total Leads',    value: propStats.reduce((s,p) => s+p.leads, 0), icon: '📩', color: '#F59E0B' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="glass p-4 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <div className="font-heading text-2xl font-800" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{label}</div>
              </div>
            ))}
          </div>

          {propStats.length > 0 && (
            <>
              <div className="glass p-5">
                <h3 className="font-heading font-700 mb-4" style={{ color: '#111827' }}>Views per Property</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={propStats.slice(0, 6)} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="title" tick={{ fill: '#6B7280', fontSize: 9 }} axisLine={false} tickLine={false}
                      interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Bar dataKey="views" fill="#FB923C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass p-5">
                <h3 className="font-heading font-700 mb-4" style={{ color: '#111827' }}>Leads per Property</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={propStats.slice(0, 6)} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="title" tick={{ fill: '#6B7280', fontSize: 9 }} axisLine={false} tickLine={false}
                      interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...CHART_STYLE} />
                    <Bar dataKey="leads" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── OFFERS ── */}
      {tab === 'offers' && (
        <div className="glass p-5">
          <h3 className="font-heading font-700 mb-4" style={{ color: '#111827' }}>Property Offers</h3>

          <select className="input-dark text-sm mb-4 w-full" value={selProp}
            onChange={e => setSelProp(e.target.value)} suppressHydrationWarning>
            <option value="">Select a property</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>

          {selProp && (
            <>
              <div className="flex flex-col gap-3 mb-4">
                {offers.map((o, i) => (
                  <div key={i} className="flex flex-col gap-2 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <input className="input-dark text-sm" placeholder="Offer title *"
                      value={o.title} onChange={e => setOffers(arr => arr.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      suppressHydrationWarning />
                    <input className="input-dark text-sm" placeholder="Description (optional)"
                      value={o.description} onChange={e => setOffers(arr => arr.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                      suppressHydrationWarning />
                    <div className="flex gap-2 items-center">
                      <input className="input-dark text-sm flex-1" type="date"
                        value={o.valid_till} onChange={e => setOffers(arr => arr.map((x, j) => j === i ? { ...x, valid_till: e.target.value } : x))}
                        suppressHydrationWarning />
                      {offers.length > 1 && (
                        <button type="button" onClick={() => setOffers(arr => arr.filter((_, j) => j !== i))}
                          suppressHydrationWarning className="text-xs px-3 py-2 rounded-xl"
                          style={{ color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setOffers(a => [...a, { title: '', description: '', valid_till: '' }])}
                  suppressHydrationWarning className="text-sm text-center py-2.5 rounded-xl transition-all"
                  style={{ border: '1px dashed rgba(251,146,60,0.25)', color: '#FB923C' }}>
                  + Add Offer
                </button>
              </div>

              {offerMsg && (
                <p className="text-sm mb-3" style={{ color: offerMsg.startsWith('✅') ? '#22C55E' : '#F87171' }}>{offerMsg}</p>
              )}
              <button onClick={handleSaveOffers} disabled={offerSaving} suppressHydrationWarning
                className="btn-accent text-sm w-full disabled:opacity-50">
                {offerSaving ? 'Saving…' : 'Save Offers'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
