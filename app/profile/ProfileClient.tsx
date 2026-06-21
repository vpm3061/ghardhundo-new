'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HeartButton from '@/components/HeartButton'
import Link from 'next/link'
import type { Property } from '@/lib/supabase/types'

type CoinTx = { amount: number; type: 'earned' | 'spent'; description: string | null; created_at: string }
type Enquiry = { id: string; propertyTitle: string | null; tier: string | null; ai_score: number; status: string; created_at: string }
type Conversion = { id: string; coins: number; cash_amount: number; status: string; created_at: string }
type ReferralRow = { id: string; earnedCoins: number; dealAmount: number | null; propertyTitle: string | null; created_at: string }

interface Props {
  userId: string; email: string; fullName: string | null; phone: string | null
  avatarUrl: string | null; referralCode: string; coinBalance: number
  coinHistory: CoinTx[]; enquiries: Enquiry[]; conversions: Conversion[]
  savedProperties: Property[]; referrals: ReferralRow[]
}

const TABS = [
  { id: 'enquiries', label: '📋 Enquiries'  },
  { id: 'saved',     label: '❤️ Saved'       },
  { id: 'share',     label: '🔗 Share & Earn' },
  { id: 'coins',     label: '🪙 Coins'        },
  { id: 'donate',    label: '🎁 Donate'       },
] as const
type Tab = typeof TABS[number]['id']

const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const STATUS_COLOR: Record<string, string> = {
  New: '#6B7280', Called: '#3B82F6', 'Visit Fixed': '#F59E0B', 'Deal Done': '#22C55E', 'Not Interested': '#9CA3AF',
}
const CITY_OPTIONS = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']

function fmtPrice(n: number) {
  if (n >= 1e7) return `₹${(n/1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n/1e5).toFixed(0)}L`
  return `₹${n}`
}

export default function ProfileClient({
  userId, email, fullName, phone, avatarUrl, referralCode,
  coinBalance, coinHistory, enquiries, conversions, savedProperties, referrals,
}: Props) {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('enquiries')
  const [isPending, start]      = useTransition()
  const [copied, setCopied]     = useState(false)

  const [convCoins, setConvCoins] = useState('')
  const [upiId, setUpiId]         = useState('')
  const [convMsg, setConvMsg]     = useState('')

  const [donate, setDonate] = useState({ title: '', builder: '', sector: '', city: '', price_min: '', price_max: '', description: '', contact_phone: '' })
  const [donateMsg, setDonateMsg] = useState('')

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/properties?ref=${referralCode}`
    : `/properties?ref=${referralCode}`

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  const initials = (fullName || email).slice(0, 2).toUpperCase()

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault()
    const coins = parseInt(convCoins)
    if (isNaN(coins) || coins < 500) { setConvMsg('Minimum 500 coins required'); return }
    if (coins > coinBalance) { setConvMsg('Not enough coins'); return }
    if (!upiId.trim()) { setConvMsg('UPI ID is required'); return }
    start(async () => {
      const { error } = await createClient().from('coin_conversions').insert({
        user_id: userId, coins, cash_amount: coins, upi_id: upiId.trim(), status: 'Pending',
      })
      if (error) { setConvMsg('Failed to submit request'); return }
      setConvMsg('✅ Request submitted! Processed within 2 working days.')
      setConvCoins(''); setUpiId(''); router.refresh()
    })
  }

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!donate.title.trim()) { setDonateMsg('Property title is required'); return }
    start(async () => {
      const { error } = await createClient().from('donated_listings').insert({
        user_id: userId, title: donate.title.trim(),
        builder: donate.builder.trim() || null, sector: donate.sector.trim() || null,
        city: donate.city || null,
        price_min: donate.price_min ? parseFloat(donate.price_min) : null,
        price_max: donate.price_max ? parseFloat(donate.price_max) : null,
        description: donate.description.trim() || null,
        contact_phone: donate.contact_phone.trim() || null, status: 'Pending',
      })
      if (error) { setDonateMsg('Failed to submit. Try again.'); return }
      setDonateMsg("✅ Submitted! You'll earn 50 🪙 on admin approval.")
      setDonate({ title: '', builder: '', sector: '', city: '', price_min: '', price_max: '', description: '', contact_phone: '' })
      router.refresh()
    })
  }

  const totalEarned = referrals.reduce((s, r) => s + r.earnedCoins, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Profile header */}
      <div className="glass p-5 flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-14 h-14 rounded-2xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-800 text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #FB923C, #F59E0B)', color: '#111827' }}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-heading font-800 text-base truncate" style={{ color: '#111827' }}>{fullName || 'User'}</div>
          <div className="text-sm truncate" style={{ color: '#6B7280' }}>{email}</div>
          {phone && <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{phone}</div>}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}>
            <span className="text-base">🪙</span>
            <span className="font-heading font-800" style={{ color: '#FB923C' }}>{coinBalance}</span>
          </div>
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
              <HeartButton propertyId={p.id} userId={userId} initialSaved />
            </div>
          ))}
        </div>
      )}

      {/* ── SHARE & EARN ── */}
      {tab === 'share' && (
        <div className="space-y-4">
          {totalEarned > 0 && (
            <div className="glass p-4 text-center" style={{ border: '1px solid rgba(251,146,60,0.15)' }}>
              <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Total Earned</div>
              <div className="font-heading text-3xl font-800" style={{ color: '#FB923C' }}>🪙 {totalEarned}</div>
              <div className="text-xs mt-1" style={{ color: '#6B7280' }}>= ₹{totalEarned} cash value</div>
            </div>
          )}

          <div className="glass p-5">
            <h3 className="font-heading font-700 mb-1" style={{ color: '#111827' }}>Your Referral Link</h3>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
              Share it with buyers. Earn <span style={{ color: '#FB923C' }}>0.25% of the deal value</span> when they close.
            </p>
            <div className="flex gap-2 mb-3" suppressHydrationWarning>
              <div className="flex-1 text-xs px-3 py-2.5 rounded-xl truncate font-mono"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', color: '#6B7280' }}>
                {referralUrl}
              </div>
              <button onClick={copyReferral} suppressHydrationWarning
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-700 transition-all"
                style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(251,146,60,0.08)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(251,146,60,0.25)'}`, color: copied ? '#22C55E' : '#FB923C' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <a href={`https://wa.me/?text=${encodeURIComponent('Find your perfect home: ' + referralUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-700"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}>
              Share on WhatsApp
            </a>
          </div>

          {referrals.length > 0 && (
            <div className="glass p-5">
              <h3 className="font-heading font-700 mb-3" style={{ color: '#111827' }}>Referral History</h3>
              <div className="space-y-2">
                {referrals.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <div>
                      {r.propertyTitle && <div className="text-xs font-600" style={{ color: '#111827' }}>{r.propertyTitle}</div>}
                      {r.dealAmount && <div className="text-xs" style={{ color: '#6B7280' }}>Deal: {fmtPrice(r.dealAmount)}</div>}
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>{fmtDate(r.created_at)}</div>
                    </div>
                    <div className="font-heading font-800 text-sm" style={{ color: '#22C55E' }}>+{r.earnedCoins} 🪙</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COINS ── */}
      {tab === 'coins' && (
        <div className="flex flex-col gap-4">
          <div className="glass p-5 text-center" style={{ border: '1px solid rgba(251,146,60,0.15)' }}>
            <div className="text-4xl mb-1">🪙</div>
            <div className="font-heading text-4xl font-800 mb-0.5" style={{ color: '#FB923C' }}>{coinBalance}</div>
            <div className="text-sm" style={{ color: '#6B7280' }}>= ₹{coinBalance} cash value</div>
            <div className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Min 500 coins to cash out · Paid via UPI in 2 working days</div>
          </div>

          <div className="glass p-5">
            <div className="text-xs font-700 uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Convert to Cash</div>
            <form onSubmit={handleConvert} className="flex flex-col gap-3">
              <input className="input-dark text-sm" type="number" min={500} max={coinBalance}
                placeholder="Coins to convert (min 500)"
                value={convCoins} onChange={e => setConvCoins(e.target.value)} suppressHydrationWarning />
              {convCoins && parseInt(convCoins) >= 500 && (
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  You will receive <span style={{ color: '#FB923C' }}>₹{convCoins}</span> via UPI
                </p>
              )}
              <input className="input-dark text-sm" placeholder="Your UPI ID (e.g. name@upi)"
                value={upiId} onChange={e => setUpiId(e.target.value)} suppressHydrationWarning />
              {convMsg && <p className="text-xs" style={{ color: convMsg.startsWith('✅') ? '#22C55E' : '#F87171' }}>{convMsg}</p>}
              <button type="submit" disabled={isPending || coinBalance < 500} suppressHydrationWarning
                className="btn-accent text-sm disabled:opacity-50">
                {isPending ? 'Submitting…' : '💸 Request Cash Out'}
              </button>
            </form>
          </div>

          {conversions.length > 0 && (
            <div>
              <div className="text-xs font-700 uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Conversion Requests</div>
              {conversions.map(c => (
                <div key={c.id} className="glass p-3 flex items-center justify-between mb-2">
                  <div className="text-xs" style={{ color: '#6B7280' }}>🪙 {c.coins} → ₹{c.cash_amount} · {fmtDate(c.created_at)}</div>
                  <span className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                    style={c.status === 'Paid'
                      ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                      : c.status === 'Rejected'
                        ? { background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }
                        : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {coinHistory.length > 0 && (
            <div>
              <div className="text-xs font-700 uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Transaction History</div>
              <div className="space-y-1.5">
                {coinHistory.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between glass px-3 py-2.5 rounded-xl">
                    <div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>{tx.description || (tx.type === 'earned' ? 'Coins earned' : 'Coins spent')}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>{fmtDate(tx.created_at)}</div>
                    </div>
                    <span className="font-heading font-800 text-sm" style={{ color: tx.type === 'earned' ? '#22C55E' : '#F87171' }}>
                      {tx.type === 'earned' ? '+' : '−'}{tx.amount} 🪙
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DONATE ── */}
      {tab === 'donate' && (
        <div className="glass p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎁</span>
            <h2 className="font-heading font-700" style={{ color: '#111827' }}>Donate a Listing</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: '#6B7280' }}>
            Know of a good property? Submit it. Earn{' '}
            <span style={{ color: '#F59E0B' }}>50 coins (₹50)</span> on admin approval.
          </p>
          <form onSubmit={handleDonate} className="flex flex-col gap-3">
            <input className="input-dark text-sm" placeholder="Property title *" required
              value={donate.title} onChange={e => setDonate(d => ({ ...d, title: e.target.value }))} suppressHydrationWarning />
            <div className="grid grid-cols-2 gap-2">
              <input className="input-dark text-sm" placeholder="Builder name"
                value={donate.builder} onChange={e => setDonate(d => ({ ...d, builder: e.target.value }))} suppressHydrationWarning />
              <input className="input-dark text-sm" placeholder="Sector / Area"
                value={donate.sector} onChange={e => setDonate(d => ({ ...d, sector: e.target.value }))} suppressHydrationWarning />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className="input-dark text-sm" value={donate.city}
                onChange={e => setDonate(d => ({ ...d, city: e.target.value }))} suppressHydrationWarning>
                <option value="">Select City</option>
                {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="input-dark text-sm" placeholder="Contact phone"
                value={donate.contact_phone} onChange={e => setDonate(d => ({ ...d, contact_phone: e.target.value }))} suppressHydrationWarning />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="input-dark text-sm" placeholder="Min Price (₹)" type="number"
                value={donate.price_min} onChange={e => setDonate(d => ({ ...d, price_min: e.target.value }))} suppressHydrationWarning />
              <input className="input-dark text-sm" placeholder="Max Price (₹)" type="number"
                value={donate.price_max} onChange={e => setDonate(d => ({ ...d, price_max: e.target.value }))} suppressHydrationWarning />
            </div>
            <textarea className="input-dark text-sm resize-none" rows={3}
              placeholder="Brief description"
              value={donate.description} onChange={e => setDonate(d => ({ ...d, description: e.target.value }))} suppressHydrationWarning />
            {donateMsg && <p className="text-xs" style={{ color: donateMsg.startsWith('✅') ? '#22C55E' : '#F87171' }}>{donateMsg}</p>}
            <button type="submit" disabled={isPending} suppressHydrationWarning className="btn-accent text-sm disabled:opacity-50">
              {isPending ? 'Submitting…' : '🎁 Submit Property'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
