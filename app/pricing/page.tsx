import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Leads from ₹299',
  description: 'Buyers always free. Dealers get AI-scored buyer leads from ₹299 per lead or from ₹2,999/month. Share & Earn 0.25% of deal value.',
}

const BUYER_FEATURES = [
  'Browse all properties',
  'AI Match Score',
  'EMI Calculator',
  'RERA Verification',
  'Free site visit arrangement',
  'Home loan guidance',
]

const WA_LINK = 'https://wa.me/919643693090?text=' + encodeURIComponent('Hi, I want to know more about GharDhundo dealer plans.')

function Check({ green }: { green?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="8" fill={green ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)'} />
      <path d="M5 8l2 2 4-4" stroke={green ? '#10B981' : '#A78BFA'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-28 md:pb-16">

        {/* ── HERO ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-700 tracking-wider uppercase mb-5"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}>
            Transparent Pricing
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-800 mb-3"
            style={{ background: 'linear-gradient(135deg, #F1F0FF 40%, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Simple. Honest. No hidden charges.
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: '#8B8BA8' }}>
            Buyers always free. Dealers pay only for leads they want.
          </p>
        </div>

        {/* ── FOR BUYERS ── */}
        <section className="mb-14">
          <div className="glass p-8 relative overflow-hidden"
            style={{ border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: '#10B981', filter: 'blur(80px)', opacity: 0.06 }} />

            <div className="flex flex-col sm:flex-row sm:items-start gap-8">
              <div className="shrink-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-800 text-sm mb-2"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
                  FREE
                </div>
                <div className="font-heading text-4xl font-800 mb-0.5" style={{ color: '#10B981' }}>₹0</div>
                <div className="text-xs font-700 uppercase tracking-wider" style={{ color: '#10B981' }}>Always free</div>
              </div>

              <div className="flex-1">
                <h2 className="font-heading text-xl font-800 mb-5" style={{ color: '#F1F0FF' }}>
                  For Buyers — Everything included
                </h2>
                <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
                  {BUYER_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#8B8BA8' }}>
                      <Check green /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOR DEALERS ── */}
        <section className="mb-14">
          <h2 className="font-heading text-2xl font-800 mb-1" style={{ color: '#F1F0FF' }}>For Dealers & Brokers</h2>
          <p className="text-sm mb-8" style={{ color: '#8B8BA8' }}>AI-scored buyer leads. Reveal contact when you're ready.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">

            {/* Starter */}
            <div className="glass p-6 flex flex-col">
              <div className="text-xs font-700 uppercase tracking-wider mb-4" style={{ color: '#8B8BA8' }}>Starter</div>
              <div className="font-heading text-3xl font-800 mb-0.5" style={{ color: '#F1F0FF' }}>₹2,999</div>
              <div className="text-xs mb-6" style={{ color: '#4A4A6A' }}>/month</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['5 WARM leads/month', 'AI score visible', 'City & budget visible', 'Phone revealed on purchase'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#8B8BA8' }}>
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="block text-center py-2.5 rounded-xl text-sm font-700 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#8B8BA8' }}>
                Get Started
              </a>
            </div>

            {/* Pro — Popular */}
            <div className="flex flex-col p-6 rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.4)', boxShadow: '0 0 48px rgba(124,58,237,0.1)' }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.7), transparent)' }} />
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="text-[10px] font-800 uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff' }}>
                  ⭐ Most Popular
                </span>
              </div>
              <div className="text-xs font-700 uppercase tracking-wider mb-4 mt-2" style={{ color: '#A78BFA' }}>Pro</div>
              <div className="font-heading text-3xl font-800 mb-0.5" style={{ color: '#F1F0FF' }}>₹5,999</div>
              <div className="text-xs mb-6" style={{ color: '#4A4A6A' }}>/month</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['15 WARM + 10 COLD leads/month', 'Full AI answers visible', 'WhatsApp alerts on new HOT leads', 'City + BHK filters', 'Analytics dashboard'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#8B8BA8' }}>
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="block text-center py-2.5 rounded-xl text-sm font-700 btn-accent transition-all">
                Start Pro
              </a>
            </div>

            {/* Power */}
            <div className="glass p-6 flex flex-col"
              style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="text-xs font-700 uppercase tracking-wider mb-4" style={{ color: '#F59E0B' }}>Power</div>
              <div className="font-heading text-3xl font-800 mb-0.5" style={{ color: '#F1F0FF' }}>₹9,999</div>
              <div className="text-xs mb-6" style={{ color: '#4A4A6A' }}>/month</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['Unlimited COLD leads', '25 WARM leads/month', 'CSV export', 'Priority support (direct line)', 'Dedicated account manager'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#8B8BA8' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="8" fill="rgba(245,158,11,0.15)" />
                      <path d="M5 8l2 2 4-4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="block text-center py-2.5 rounded-xl text-sm font-700 transition-all"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
                Go Power
              </a>
            </div>
          </div>

          {/* Per Lead */}
          <div className="glass p-5">
            <p className="text-xs font-700 uppercase tracking-wider mb-4" style={{ color: '#4A4A6A' }}>
              Or pay per lead — no subscription needed
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { tier: 'COLD',  price: '₹299',          color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  icon: '🧊', note: 'Early stage' },
                { tier: 'WARM',  price: '₹999',          color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  icon: '🔥', note: 'Ready to buy' },
                { tier: 'HOT',   price: 'Call us',       color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   icon: '⚡', note: 'We handle directly' },
              ].map(({ tier, price, color, bg, border, icon, note }) => (
                <div key={tier} className="p-4 rounded-2xl text-center" style={{ background: bg, border: `1px solid ${border}` }}>
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs font-700 mb-1" style={{ color }}>{tier}</div>
                  <div className="font-heading text-lg font-800 mb-0.5" style={{ color }}>{price}</div>
                  <div className="text-[10px]" style={{ color: '#8B8BA8' }}>{note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SHARE & EARN ── */}
        <section className="mb-14">
          <div className="p-8 rounded-2xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(109,40,217,0.06))', border: '1px solid rgba(124,58,237,0.3)' }}>
            <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: '#7C3AED', filter: 'blur(60px)', opacity: 0.08 }} />

            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔗</span>
                  <h2 className="font-heading text-2xl font-800" style={{ color: '#F1F0FF' }}>Share & Earn</h2>
                  <span className="text-xs font-700 px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}>
                    Referral Program
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {[
                    'Share any property link with your referral code',
                    'Someone buys via your link → deal closes → you earn',
                    <>You get <strong style={{ color: '#A78BFA' }}>0.25% of the deal value</strong> — automatically tracked</>,
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#8B8BA8' }}>
                      <Check /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 p-6 rounded-2xl text-center"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', minWidth: '180px' }}>
                <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#4A4A6A' }}>Example</div>
                <div className="font-heading text-3xl font-800 mb-0.5" style={{ color: '#A78BFA' }}>₹15,000</div>
                <div className="text-xs mb-1" style={{ color: '#8B8BA8' }}>on a ₹60L deal</div>
                <div className="text-[11px] px-2 py-0.5 rounded-full inline-block"
                  style={{ background: 'rgba(124,58,237,0.08)', color: '#6D5FA8' }}>
                  0.25% of ₹60,00,000
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <div className="text-center">
          <p className="text-sm mb-5" style={{ color: '#8B8BA8' }}>
            Want to subscribe or have questions? We respond in under 2 hours.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-700 transition-all"
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.53 5.857L0 24l6.335-1.502A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.66-.502-5.193-1.382l-.373-.22-3.76.892.944-3.66-.242-.386A9.98 9.98 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp us: +91 96436 93090
          </a>
          <p className="text-xs mt-3" style={{ color: '#4A4A6A' }}>
            Or call directly · Mon–Sat 9am–7pm IST
          </p>
        </div>

      </main>
      <MobileNav />
    </>
  )
}
