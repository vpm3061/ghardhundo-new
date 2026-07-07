'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import RazorpayButton from '@/components/RazorpayButton'

type Property = {
  id: string
  title: string
  city: string | null
  price_min: number | null
  price_max: number | null
  is_active: boolean | null
  created_at: string
}

type Lead = {
  id: string
  name: string
  phone: string
  message: string | null
  created_at: string
  property_id: string | null
}

type Props = {
  userId: string
  properties: Property[]
  leads: Lead[]
  isSubscribed: boolean
  activePlan: string | null
  planExpiry: string | null
  isPartner: boolean
  partnerAppStatus: string | null
}

const TABS = ['My Listings', 'My Leads', 'Subscription', 'Sell with Orenzaa'] as const
type Tab = typeof TABS[number]

const fmt = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(0)}L` : `₹${n.toLocaleString()}`

export default function ExpertClient({
  userId, properties, leads, isSubscribed, activePlan, planExpiry, isPartner, partnerAppStatus,
}: Props) {
  const [tab, setTab] = useState<Tab>('My Listings')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const applyPartner = async () => {
    setApplying(true)
    const supabase = createClient()
    await supabase.from('partner_applications').insert({ user_id: userId, status: 'pending' })
    setApplied(true)
    setApplying(false)
  }

  const FREE_LIMIT = 5
  const overLimit = properties.length >= FREE_LIMIT && !isSubscribed

  return (
    <div>
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
              {properties.length} / {isSubscribed ? '∞' : FREE_LIMIT} listings used
            </p>
            {!overLimit && (
              <Link
                href="/admin/properties/new"
                className="px-4 py-2 rounded-xl text-sm font-700 text-white transition-all"
                style={{ background: '#FB923C' }}
              >
                + Add Listing
              </Link>
            )}
          </div>

          {overLimit && (
            <div className="mb-4 p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm">
              <p className="font-700 text-[#FB923C] mb-1">Free plan limit reached (5 listings)</p>
              <p className="text-[#6B7280]">Subscribe to add unlimited listings.</p>
              <button onClick={() => setTab('Subscription')}
                className="mt-2 text-[#FB923C] font-700 underline text-xs">
                View Subscription →
              </button>
            </div>
          )}

          {properties.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]">
              <div className="text-4xl mb-3">🏠</div>
              <p className="font-600">No listings yet</p>
              <Link href="/admin/properties/new"
                className="inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-700 text-white"
                style={{ background: '#FB923C' }}>
                Add your first listing →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {properties.map(p => (
                <div key={p.id} className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-700 text-[#111827] text-sm">{p.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {p.city} · {p.price_min ? fmt(p.price_min) : '—'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-600 ${
                    p.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
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
                <p className="text-[#6B7280]">Subscribe to unlock full lead details.</p>
                <button onClick={() => setTab('Subscription')} className="mt-1.5 text-[#FB923C] font-700 underline text-xs">
                  Subscribe now →
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
              {leads.map(lead => (
                <div key={lead.id} className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <p className="font-700 text-[#111827] text-sm">{lead.name}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <p className="text-sm" style={isSubscribed ? { color: '#374151' } : { filter: 'blur(5px)', userSelect: 'none', color: '#374151' }}>
                    {lead.phone}
                  </p>
                  {lead.message && (
                    <p className="text-xs text-[#9CA3AF] mt-1 truncate">{lead.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscription */}
      {tab === 'Subscription' && (
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
              <p className="text-sm text-[#6B7280]">Full lead access enabled. Unlimited listings.</p>
            </div>
          ) : (
            <div className="mb-6 p-5 rounded-2xl bg-orange-50 border border-orange-200">
              <p className="font-700 text-[#111827] mb-1">No active subscription</p>
              <p className="text-sm text-[#6B7280]">Subscribe to unlock phone numbers and add unlimited listings.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Monthly */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col">
              <div className="text-xs font-700 uppercase tracking-wider mb-3 text-[#9CA3AF]">Monthly</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-[#111827]">₹599</div>
              <div className="text-xs mb-5 text-[#9CA3AF]">/month</div>
              <ul className="flex flex-col gap-2 text-sm text-[#6B7280] mb-6 flex-1">
                {['Unlimited listings', 'Full lead details', '55/45 deal split', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-[#FB923C]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="Monthly" role="expert" amount={599} label="Subscribe ₹599/mo"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all cursor-pointer bg-[#FB923C] text-white hover:bg-[#F59E0B]" />
            </div>

            {/* 6-Month */}
            <div className="bg-[#FB923C] rounded-2xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute -top-3 right-4">
                <span className="text-[10px] font-800 uppercase tracking-wider px-3 py-1 rounded-full bg-[#111827] text-white">
                  Best Value
                </span>
              </div>
              <div className="text-xs font-700 uppercase tracking-wider mb-3 text-orange-100">6 Months</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-white">₹999</div>
              <div className="text-xs mb-5 text-orange-200">/6 months · Save ₹1,595</div>
              <ul className="flex flex-col gap-2 text-sm text-orange-100 mb-6 flex-1">
                {['Everything in Monthly', '6 months access', 'Priority placement', 'Dedicated support'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-white">✓</span> {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="SixMonth" role="expert" amount={999} label="Subscribe ₹999/6mo"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all cursor-pointer bg-white text-[#FB923C] hover:bg-orange-50" />
            </div>
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
