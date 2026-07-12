'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HeartButton from '@/components/HeartButton'
import WhatsAppButton from '@/components/WhatsAppButton'
import Link from 'next/link'
import type { Property } from '@/lib/supabase/types'

type Enquiry = { id: string; propertyTitle: string | null; tier: string | null; ai_score: number; status: string; created_at: string }

interface Props {
  userId: string; email: string; fullName: string | null; phone: string | null
  whatsappNumber: string | null; avatarUrl: string | null
  role: string; verificationStatus: string
  enquiries: Enquiry[]; savedProperties: Property[]
}

const TABS = [
  { id: 'enquiries', label: '📋 Enquiries' },
  { id: 'saved',     label: '❤️ Saved'     },
] as const
type Tab = typeof TABS[number]['id']

const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const STATUS_COLOR: Record<string, string> = {
  New: '#6B7280', Called: '#3B82F6', 'Visit Fixed': '#F59E0B', 'Deal Done': '#22C55E', 'Not Interested': '#9CA3AF',
}

function fmtPrice(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(0)}L`
  return `₹${n}`
}

export default function ProfileClient({
  userId, email, fullName, phone, whatsappNumber, avatarUrl, role, verificationStatus, enquiries, savedProperties,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('enquiries')
  const [isPending, start] = useTransition()
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: fullName || '', phone: phone || '', whatsapp_number: whatsappNumber || '',
  })
  const [editMsg, setEditMsg] = useState('')

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  const initials = (fullName || email).slice(0, 2).toUpperCase()

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.full_name.trim() || !editForm.phone.trim()) { setEditMsg('Name aur phone required hai'); return }
    start(async () => {
      const { error } = await createClient().from('profiles').update({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        whatsapp_number: editForm.whatsapp_number.trim() || editForm.phone.trim(),
      }).eq('id', userId)
      if (error) { setEditMsg(error.message); return }
      setEditMode(false)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Profile header */}
      <div className="glass p-5 flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-800 text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #FB923C, #F59E0B)', color: '#111827' }}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-heading font-800 text-base truncate" style={{ color: '#111827' }}>{fullName || 'User'}</div>
            {role === 'expert' && (
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 shrink-0">
                {verificationStatus === 'verified' ? '✅ Verified Expert' : 'Orenzaa Expert'}
              </span>
            )}
          </div>
          <div className="text-sm truncate" style={{ color: '#6B7280' }}>{email}</div>
          {phone && <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>📱 {phone}</div>}
          {whatsappNumber && <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>💬 WhatsApp: {whatsappNumber}</div>}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <button onClick={() => setEditMode(true)} suppressHydrationWarning
            className="text-xs font-700 px-3 py-1.5 rounded-xl transition-all"
            style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', color: '#FB923C' }}>
            Edit Profile
          </button>
          <button onClick={signOut} suppressHydrationWarning
            className="text-xs transition-colors" style={{ color: '#9CA3AF' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} suppressHydrationWarning
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-600 transition-all"
            style={{
              background: tab === t.id ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${tab === t.id ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.05)'}`,
              color: tab === t.id ? '#FB923C' : '#6B7280',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ENQUIRIES ── */}
      {tab === 'enquiries' && (
        <div className="flex flex-col gap-2">
          {enquiries.length === 0 ? (
            <div className="glass p-10 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-heading font-700 mb-1" style={{ color: '#111827' }}>No enquiries yet</p>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Browse properties and submit your interest.</p>
              <a href="/properties" className="btn-accent text-sm px-5 py-2.5 inline-block">Browse Properties</a>
            </div>
          ) : enquiries.map(e => {
            const tierColor = e.tier === 'HOT' ? '#EF4444' : e.tier === 'WARM' ? '#F59E0B' : '#3B82F6'
            return (
              <div key={e.id} className="glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {e.propertyTitle && <div className="font-600 text-sm mb-0.5" style={{ color: '#111827' }}>{e.propertyTitle}</div>}
                    <div className="flex items-center gap-2 mt-1">
                      {e.tier && (
                        <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                          style={{ background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}44` }}>
                          {e.tier}
                        </span>
                      )}
                      <span className="text-xs font-700" style={{ color: '#FB923C' }}>Score: {e.ai_score}</span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{fmtDate(e.created_at)}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full shrink-0"
                    style={{ background: 'rgba(0,0,0,0.03)', color: STATUS_COLOR[e.status] || '#6B7280', border: '1px solid rgba(0,0,0,0.05)' }}>
                    {e.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── SAVED ── */}
      {tab === 'saved' && (
        <div className="flex flex-col gap-3">
          {savedProperties.length === 0 ? (
            <div className="glass p-10 text-center">
              <div className="text-4xl mb-3">❤️</div>
              <p className="font-heading font-700 mb-1" style={{ color: '#111827' }}>No saved properties</p>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Tap the heart on any property to save it.</p>
              <a href="/properties" className="btn-accent text-sm px-5 py-2.5 inline-block">Browse Properties</a>
            </div>
          ) : savedProperties.map(p => (
            <div key={p.id} className="glass p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                {p.photos?.[0]
                  ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ color: '#9CA3AF' }}>🏢</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/property/${p.id}`} className="font-600 text-sm truncate block" style={{ color: '#111827' }}>
                  {p.title}
                </Link>
                <div className="text-xs mt-0.5 flex gap-2 flex-wrap" style={{ color: '#6B7280' }}>
                  {p.city && <span>{p.city}</span>}
                  {p.price_min && <><span>·</span><span>{fmtPrice(p.price_min)}</span></>}
                  {p.bhk?.length && <><span>·</span><span>{p.bhk.join('/')} BHK</span></>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <WhatsAppButton
                  propertyTitle={p.title}
                  price={p.price_min ? fmtPrice(p.price_min) : 'Price on request'}
                  location={[p.locality || p.sector, p.city].filter(Boolean).join(', ')}
                  propertyId={p.id}
                />
                <HeartButton propertyId={p.id} userId={userId} initialSaved />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit profile modal */}
      {editMode && (
        <div className="modal-overlay">
          <div className="w-full max-w-sm" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: '24px' }}>
            <h2 className="font-heading text-xl font-800 mb-4" style={{ color: '#111827' }}>Edit Profile</h2>
            <form onSubmit={saveEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Full Name</label>
                <input className="input-dark text-sm" value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} suppressHydrationWarning />
              </div>
              <div>
                <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Phone</label>
                <input className="input-dark text-sm" type="tel" value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} suppressHydrationWarning />
              </div>
              <div>
                <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>WhatsApp Number</label>
                <input className="input-dark text-sm" type="tel" value={editForm.whatsapp_number}
                  onChange={e => setEditForm(f => ({ ...f, whatsapp_number: e.target.value }))} suppressHydrationWarning
                  placeholder="Same as phone? leave blank" />
              </div>
              {editMsg && <p className="text-xs" style={{ color: '#F87171' }}>{editMsg}</p>}
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setEditMode(false)} suppressHydrationWarning
                  className="flex-1 py-2.5 rounded-xl text-sm font-700" style={{ border: '1px solid rgba(0,0,0,0.06)', color: '#6B7280' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isPending} suppressHydrationWarning className="flex-1 btn-accent text-sm disabled:opacity-50">
                  {isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
