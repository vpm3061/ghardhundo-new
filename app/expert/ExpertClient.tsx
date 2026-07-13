'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import RazorpayButton from '@/components/RazorpayButton'
import StatusCard from '@/components/StatusCard'
import type { Property } from '@/lib/supabase/types'

type Lead = {
  id: string
  name: string
  phone: string
  message: string | null
  created_at: string
  property_id: string | null
  ai_score: number
  tier: 'HOT' | 'WARM' | 'COLD' | null
  propertyTitle: string | null
}

type Analytics = {
  viewsThisMonth: number
  enquiriesThisMonth: number
  mostViewedTitle: string | null
  mostViewedCount: number
  conversionRate: number
}

type Props = {
  userId: string
  fullName: string | null
  email: string
  phone: string | null
  whatsappNumber: string | null
  avatarUrl: string | null
  verificationStatus: string
  city: string | null
  experienceYears: string | null
  reraNumber: string | null
  properties: Property[]
  leads: Lead[]
  isSubscribed: boolean
  activePlan: string | null
  planExpiry: string | null
  isPartner: boolean
  partnerAppStatus: string | null
  analytics: Analytics
}

const TABS = ['My Listings', 'My Leads', 'Analytics', 'Upgrade', 'Sell with Orenzaa'] as const
type Tab = typeof TABS[number]

const TIER_BADGE: Record<string, { label: string; className: string }> = {
  HOT:  { label: 'HOT 🔥',  className: 'bg-red-50 text-red-600' },
  WARM: { label: 'WARM 🌡️', className: 'bg-orange-50 text-orange-600' },
  COLD: { label: 'COLD ❄️',  className: 'bg-blue-50 text-blue-600' },
}

const fmt = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(0)}L` : `₹${n.toLocaleString()}`

export default function ExpertClient({
  userId, fullName, email, phone, whatsappNumber, avatarUrl, verificationStatus,
  city, experienceYears, reraNumber,
  properties, leads, isSubscribed, activePlan, planExpiry, isPartner, partnerAppStatus, analytics,
}: Props) {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('My Listings')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [verifStatus, setVerifStatus] = useState(verificationStatus)
  const [verifApplying, setVerifApplying] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/expert'); return }
      setAuthLoading(false)
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full" />
    </div>
  )

  const applyPartner = async () => {
    setApplying(true)
    const supabase = createClient()
    await supabase.from('partner_applications').insert({ user_id: userId, status: 'pending' })
    setApplied(true)
    setApplying(false)
  }

  const applyVerification = async () => {
    setVerifApplying(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      verification_requested_at: new Date().toISOString(),
      verification_status: 'pending',
    }).eq('id', userId)
    setVerifStatus('pending')
    setVerifApplying(false)
  }

  const deleteProperty = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('properties').delete().eq('id', id)
    setDeletingId(null)
    if (error) { toast.error('Delete failed: ' + error.message); return }
    toast.success('Listing deleted')
    router.refresh()
  }

  const FREE_LIMIT = 5
  const PRO_LIMIT = 20
  const listingLimit = isSubscribed ? PRO_LIMIT : FREE_LIMIT
  const overLimit = properties.length >= listingLimit
  const initials = (fullName || email).slice(0, 1).toUpperCase()

  return (
    <div>
      {/* Profile card */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-200 flex items-center justify-center text-xl font-bold text-orange-700">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#111827]">{fullName || 'Property Expert'}</h2>
              {verifStatus === 'verified' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✅ Verified</span>
              )}
            </div>
            <p className="text-sm text-[#6B7280]">{email}</p>
            {(phone || whatsappNumber) && (
              <p className="text-sm text-[#6B7280]">
                {phone && `📱 ${phone}`}{phone && whatsappNumber && ' | '}{whatsappNumber && `💬 ${whatsappNumber}`}
              </p>
            )}
            {(city || experienceYears) && (
              <p className="text-sm text-[#6B7280]">
                {city && `📍 ${city}`}{city && experienceYears && ' | '}{experienceYears}
              </p>
            )}
            {reraNumber && <p className="text-sm text-[#6B7280]">🪪 RERA: {reraNumber}</p>}
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">
              🤝 Expert
            </span>
            {verifStatus !== 'verified' && (
              <div className="mt-2">
                {verifStatus === 'pending' ? (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">⏳ Pending</span>
                ) : (
                  <button onClick={applyVerification} disabled={verifApplying} suppressHydrationWarning
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-200 disabled:opacity-50">
                    {verifApplying ? '…' : 'Apply for Badge →'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#F5F5F4] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-600 transition-all whitespace-nowrap"
            style={tab === t
              ? { background: 'white', color: '#111827', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: '#6B7280' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* My Listings */}
      {tab === 'My Listings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#6B7280]">
              {properties.length} / {listingLimit} listings used
            </p>
            {!overLimit && (
              <Link
                href="/list-property?new=1"
                className="px-4 py-2 rounded-xl text-sm font-700 text-white transition-all"
                style={{ background: '#FB923C' }}
              >
                + Add Listing
              </Link>
            )}
          </div>

          {overLimit && (
            <div className="mb-4 p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm">
              <p className="font-700 text-[#FB923C] mb-1">
                {isSubscribed ? 'Pro plan limit reached (20 listings)' : 'Free plan limit reached (5 listings)'}
              </p>
              <p className="text-[#6B7280]">
                {isSubscribed ? 'Contact support to raise your limit.' : 'Upgrade to Pro to add up to 20 listings.'}
              </p>
              {!isSubscribed && (
                <button onClick={() => setTab('Upgrade')}
                  className="mt-2 text-[#FB923C] font-700 underline text-xs">
                  View Upgrade →
                </button>
              )}
            </div>
          )}

          {properties.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]">
              <div className="text-4xl mb-3">🏠</div>
              <p className="font-600">No listings yet</p>
              <Link href="/list-property?new=1"
                className="inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-700 text-white"
                style={{ background: '#FB923C' }}>
                Add your first listing →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {properties.map(p => (
                <div key={p.id} className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="font-700 text-[#111827] text-sm">{p.title}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {p.city} · {p.price_min ? fmt(p.price_min) : '—'}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-600 shrink-0 ${
                      p.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusCard property={p} />
                    <Link href={`/list-property/${p.id}/edit`}
                      className="px-3 py-1.5 rounded-lg text-xs font-700 border border-[#E5E7EB] text-[#374151] hover:border-[#FB923C]">
                      Edit
                    </Link>
                    <button onClick={() => deleteProperty(p.id, p.title)} disabled={deletingId === p.id} suppressHydrationWarning
                      className="px-3 py-1.5 rounded-lg text-xs font-700 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                      {deletingId === p.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Leads */}
      {tab === 'My Leads' && (
        <div>
          {!isSubscribed && (
            <div className="mb-4 p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-700 text-[#FB923C]">Phone numbers are blurred</p>
                <p className="text-[#6B7280]">Upgrade to Pro to unlock full lead details.</p>
                <button onClick={() => setTab('Upgrade')} className="mt-1.5 text-[#FB923C] font-700 underline text-xs">
                  Upgrade now →
                </button>
              </div>
            </div>
          )}

          {leads.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-600">No leads yet</p>
              <p className="text-sm mt-1">Leads will appear here when buyers enquire about your listings.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {leads.map(lead => {
                const badge = lead.tier ? TIER_BADGE[lead.tier] : null
                return (
                  <div key={lead.id} className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-700 text-[#111827] text-sm">{lead.name}</p>
                        {badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-700 ${badge.className}`}>{badge.label}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#9CA3AF]">
                        {new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    {lead.propertyTitle && (
                      <p className="text-xs text-[#6B7280] mb-1">Enquired: {lead.propertyTitle}</p>
                    )}
                    {isSubscribed ? (
                      <p className="text-sm" style={{ color: '#374151' }}>{lead.phone}</p>
                    ) : (
                      <p className="text-sm" style={{ color: '#374151' }}>
                        **** ****{lead.phone.slice(-2)}{' '}
                        <button onClick={() => setTab('Upgrade')} className="text-[#FB923C] font-700 underline text-xs">
                          Upgrade to reveal
                        </button>
                      </p>
                    )}
                    {lead.message && (
                      <p className="text-xs text-[#9CA3AF] mt-1 truncate">{lead.message}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Analytics */}
      {tab === 'Analytics' && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
              <p className="text-xs font-600 text-[#6B7280] mb-1">👁️ Views this month</p>
              <p className="font-heading text-2xl font-800 text-[#111827]">{analytics.viewsThisMonth}</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
              <p className="text-xs font-600 text-[#6B7280] mb-1">📋 Enquiries this month</p>
              <p className="font-heading text-2xl font-800 text-[#111827]">{analytics.enquiriesThisMonth}</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
              <p className="text-xs font-600 text-[#6B7280] mb-1">📈 Conversion rate</p>
              <p className="font-heading text-2xl font-800 text-[#111827]">{analytics.conversionRate}%</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
              <p className="text-xs font-600 text-[#6B7280] mb-1">🏆 Most viewed</p>
              <p className="font-700 text-sm text-[#111827] truncate">{analytics.mostViewedTitle || '—'}</p>
              {analytics.mostViewedTitle && <p className="text-xs text-[#9CA3AF]">{analytics.mostViewedCount} views</p>}
            </div>
          </div>
          {properties.length === 0 && (
            <p className="text-sm text-[#9CA3AF] text-center py-8">Add a listing to start seeing analytics.</p>
          )}
        </div>
      )}

      {/* Upgrade */}
      {tab === 'Upgrade' && (
        <div>
          {isSubscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-700 text-[#111827]">Active: {activePlan} Plan</p>
                  {planExpiry && (
                    <p className="text-sm text-[#6B7280]">
                      Expires: {new Date(planExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#6B7280]">Full lead access enabled. Up to 20 listings.</p>
            </div>
          ) : (
            <div className="mb-6 p-5 rounded-2xl bg-orange-50 border border-orange-200">
              <p className="font-700 text-[#111827] mb-1">Current plan: Basic (₹49 paid)</p>
              <p className="text-sm text-[#6B7280]">Upgrade to Pro to unlock phone numbers and add up to 20 listings.</p>
            </div>
          )}

          {!isSubscribed && (
            <div className="bg-[#FB923C] rounded-2xl p-6 flex flex-col relative overflow-hidden mb-6">
              <div className="text-xs font-700 uppercase tracking-wider mb-3 text-orange-100">Pro Plan</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-white">₹499</div>
              <div className="text-xs mb-5 text-orange-200">/month</div>
              <ul className="flex flex-col gap-2 text-sm text-orange-100 mb-6">
                {['20 listings', 'Lead phone reveal', 'Priority in search'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-white">✓</span> {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="expert-pro" role="expert" amount={499} label="Upgrade to Pro ₹499/mo"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all cursor-pointer bg-white text-[#FB923C] hover:bg-orange-50" />
            </div>
          )}

          <div className="border border-[#E5E7EB] rounded-2xl p-5">
            <h3 className="font-bold mb-2" style={{ color: '#111827' }}>📢 Advertise on Orenzaa</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Featured listing ya banner ad ke liye apply karo — 10,000+ buyers tak pahuncho
            </p>
            <a href="/advertise" className="block w-full py-3 bg-[#111827] text-white text-center rounded-xl font-semibold">
              Apply for Banner Ad →
            </a>
          </div>
        </div>
      )}

      {/* Sell with Orenzaa */}
      {tab === 'Sell with Orenzaa' && (
        <div>
          {isPartner ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h2 className="font-heading text-xl font-800 text-[#111827] mb-2">You&apos;re an Orenzaa Partner!</h2>
              <p className="text-sm text-[#6B7280] max-w-sm mx-auto">
                You have full partner access. List properties, earn 55% on closures, and get priority leads.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-100 text-green-700 text-sm font-700">
                ✅ Partner Status Active
              </div>
            </div>
          ) : partnerAppStatus === 'pending' || applied ? (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">⏳</div>
              <h2 className="font-heading text-xl font-800 text-[#111827] mb-2">Application Under Review</h2>
              <p className="text-sm text-[#6B7280] max-w-sm mx-auto">
                Our team will review your application within 2 business days. We&apos;ll notify you via WhatsApp.
              </p>
              <a
                href="https://wa.me/919643693090?text=Hi, I applied to become an Orenzaa partner. Can you update me on the status?"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-700 transition-all"
                style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}
              >
                WhatsApp for Update
              </a>
            </div>
          ) : partnerAppStatus === 'rejected' ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">❌</div>
              <h2 className="font-heading text-xl font-800 text-[#111827] mb-2">Application Not Approved</h2>
              <p className="text-sm text-[#6B7280] max-w-sm mx-auto">
                Your application was not approved at this time. Contact us on WhatsApp for more details.
              </p>
              <a
                href="https://wa.me/919643693090?text=Hi, my Orenzaa partner application was rejected. Can you help?"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-700 transition-all"
                style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}
              >
                Contact Support
              </a>
            </div>
          ) : (
            <div>
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 mb-6">
                <h2 className="font-heading text-2xl font-800 text-[#111827] mb-2">Become an Orenzaa Partner</h2>
                <p className="text-[#6B7280] mb-6">
                  Join our network of verified property experts. Earn 55% on every deal you close through Orenzaa.
                </p>
                <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                  {[
                    'Earn 55% on every closed deal',
                    'Access to premium buyer leads',
                    'Orenzaa verified partner badge',
                    'Priority listing placement',
                    'Dedicated relationship manager',
                    'Training & support',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#374151]">
                      <span className="text-[#FB923C]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={applyPartner}
                  disabled={applying}
                  className="px-8 py-3.5 rounded-xl text-white font-700 text-sm disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FB923C, #F59E0B)' }}
                >
                  {applying ? 'Submitting…' : 'Apply to Become a Partner →'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
