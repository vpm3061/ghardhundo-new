'use client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import RazorpayButton from '@/components/RazorpayButton'

const FAKE_LEADS = [
  {
    tier: 'HOT', tierColor: '#EF4444', tierBg: 'rgba(239,68,68,0.15)', tierBorder: 'rgba(239,68,68,0.3)',
    score: 87,
    budget: '₹65–80 lakh', city: 'Lucknow', timeline: '1–3 months', loan: 'Approved',
  },
  {
    tier: 'WARM', tierColor: '#F59E0B', tierBg: 'rgba(245,158,11,0.15)', tierBorder: 'rgba(245,158,11,0.3)',
    score: 72,
    budget: '₹45–60 lakh', city: 'Noida', timeline: '3–6 months', loan: 'In process',
  },
  {
    tier: 'COLD', tierColor: '#3B82F6', tierBg: 'rgba(59,130,246,0.15)', tierBorder: 'rgba(59,130,246,0.3)',
    score: 54,
    budget: '₹30–45 lakh', city: 'Greater Noida', timeline: '6–12 months', loan: 'Not applied',
  },
  {
    tier: 'COLD', tierColor: '#3B82F6', tierBg: 'rgba(59,130,246,0.15)', tierBorder: 'rgba(59,130,246,0.3)',
    score: 48,
    budget: '₹25–40 lakh', city: 'Lucknow', timeline: '6–12 months', loan: 'Not applied',
  },
]

export default function FindBuyersPage() {
  const router = useRouter()

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-28 md:pb-16">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-700 tracking-wider uppercase mb-5"
            style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)', color: '#FB923C' }}>
            For Dealers & Agents
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-800 mb-3"
            style={{ background: 'linear-gradient(135deg, #FFF7ED 40%, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Access AI-Scored Buyer Leads
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: '#6B7280' }}>
            Real buyers, verified intent, AI-scored by budget and timeline. Reveal contact only when you are ready.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-6 flex-wrap mb-10">
          {[
            { label: 'leads this month', value: '234', color: '#FB923C' },
            { label: 'HOT 🔥', value: '45', color: '#EF4444' },
            { label: 'WARM 🌡️', value: '89', color: '#F59E0B' },
            { label: 'COLD ❄️', value: '100', color: '#3B82F6' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#6B7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Blurred fake lead cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {FAKE_LEADS.map((lead, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden p-5"
              style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}>
              {/* Blur overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center"
                style={{ backdropFilter: 'blur(6px)', background: 'rgba(10,10,15,0.55)' }}>
                <button
                  onClick={() => router.push('/pricing#dealer')}
                  className="font-700 text-sm px-6 py-3 rounded-xl transition-all hover:scale-105"
                  style={{ background: 'rgba(124,58,237,0.9)', color: '#fff', border: '1px solid rgba(167,139,250,0.4)', boxShadow: '0 4px 20px rgba(251,146,60,0.35)' }}>
                  🔓 Subscribe to Unlock
                </button>
              </div>
              {/* Fake content (blurred by overlay) */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-700 px-3 py-1 rounded-full"
                  style={{ background: lead.tierBg, color: lead.tierColor, border: `1px solid ${lead.tierBorder}` }}>
                  {lead.tier === 'HOT' ? '🔥' : lead.tier === 'WARM' ? '🌡️' : '❄️'} {lead.tier}
                </span>
                <span className="text-sm" style={{ color: '#6B7280' }}>Score: {lead.score}/100</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Budget',   value: lead.budget   },
                  { label: 'City',     value: lead.city     },
                  { label: 'Timeline', value: lead.timeline },
                  { label: 'Loan',     value: lead.loan     },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
                    <p className="text-sm font-600 blur-sm select-none" style={{ color: '#111827' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Plan cards */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-800 text-center mb-2" style={{ color: '#111827' }}>Subscribe to Unlock All Leads</h2>
          <p className="text-sm text-center mb-8" style={{ color: '#6B7280' }}>Cancel anytime. New leads added daily.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { plan: 'Starter', price: 2999, leads: '5 leads/mo', color: '#6B7280', bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.06)', btnClass: 'block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all', btnStyle: { border: '1px solid rgba(255,255,255,0.1)', color: '#6B7280' } },
              { plan: 'Pro', price: 5999, leads: '25 leads/mo', color: '#FB923C', bg: 'rgba(124,58,237,0.08)', border: 'rgba(251,146,60,0.35)', btnClass: 'block w-full text-center py-2.5 rounded-xl text-sm font-700 btn-accent transition-all', btnStyle: {} },
              { plan: 'Power', price: 9999, leads: 'Unlimited', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', btnClass: 'block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all', btnStyle: { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' } },
            ].map(p => (
              <div key={p.plan} className="rounded-2xl p-6 flex flex-col"
                style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                <div className="text-xs font-700 uppercase tracking-wider mb-3" style={{ color: p.color }}>{p.plan}</div>
                <div className="font-heading text-3xl font-800 mb-0.5" style={{ color: '#111827' }}>₹{p.price.toLocaleString('en-IN')}</div>
                <div className="text-xs mb-6" style={{ color: '#9CA3AF' }}>/month · {p.leads}</div>
                <RazorpayButton plan={p.plan} role="dealer" amount={p.price} label={`Get ${p.plan}`}
                  className={p.btnClass} />
              </div>
            ))}
          </div>
        </div>

      </main>
      <MobileNav />
    </>
  )
}
