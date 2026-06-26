import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import RazorpayButton from '@/components/RazorpayButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Leads from ₹299',
  description: 'Buyers always free. Dealers get AI-scored buyer leads from ₹299 per lead or from ₹2,999/month. Builders list properties. Share & Earn 0.25% of deal value.',
}

const WA_LINK = 'https://wa.me/919643693090?text=' + encodeURIComponent('Hi, I want to know more about Orenzaa plans.')

function Check({ color = '#FB923C' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="8" fill={`${color}22`} />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const BUYER_FEATURES = [
  'Browse all RERA verified properties',
  'AI Match Score for every property',
  'EMI Calculator',
  'Free site visit arrangement',
  'Home loan guidance',
  'Save & compare properties',
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-28 md:pb-16">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-700 tracking-wider uppercase mb-5 bg-orange-50 border border-orange-200 text-[#FB923C]">
            Transparent Pricing
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-800 mb-3 text-[#111827]">
            Simple. Honest. No hidden charges.
          </h1>
          <p className="text-base max-w-lg mx-auto text-[#6B7280]">
            Buyers always free. Dealers pay for qualified leads. Builders list properties.
          </p>
        </div>

        {/* ── BUYERS ── */}
        <section className="mb-14">
          <div className="bg-white border border-green-200 rounded-2xl p-8 relative overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start gap-8">
              <div className="shrink-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-800 text-sm mb-2 bg-green-50 border border-green-200 text-[#22C55E]">
                  FREE
                </div>
                <div className="font-heading text-4xl font-800 mb-0.5 text-[#22C55E]">₹0</div>
                <div className="text-xs font-700 uppercase tracking-wider text-[#22C55E]">Always free</div>
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-800 mb-5 text-[#111827]">For Buyers — Everything included</h2>
                <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
                  {BUYER_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <Check color="#22C55E" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── DEALERS ── */}
        <section id="dealer" className="mb-14">
          <h2 className="font-heading text-2xl font-800 mb-1 text-[#111827]">For Dealers & Brokers</h2>
          <p className="text-sm mb-8 text-[#6B7280]">AI-scored buyer leads. Reveal contact only when you're ready.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Starter */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col">
              <div className="text-xs font-700 uppercase tracking-wider mb-4 text-[#9CA3AF]">Starter</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-[#111827]">₹2,999</div>
              <div className="text-xs mb-6 text-[#9CA3AF]">/month · 5 WARM leads</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['5 WARM leads/month', 'AI score visible', 'City & budget visible', 'Reveal phone on purchase'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="Starter" role="dealer" amount={2999} label="Get Started"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all disabled:opacity-60 cursor-pointer border border-[#E5E7EB] text-[#374151] hover:border-[#FB923C] hover:text-[#FB923C]" />
            </div>

            {/* Pro — Popular */}
            <div className="flex flex-col p-6 rounded-2xl relative overflow-hidden bg-[#FB923C]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="text-[10px] font-800 uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap bg-[#111827] text-white">
                  ⭐ Most Popular
                </span>
              </div>
              <div className="text-xs font-700 uppercase tracking-wider mb-4 mt-2 text-orange-100">Pro</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-white">₹5,999</div>
              <div className="text-xs mb-6 text-orange-200">/month · 15 WARM + 10 COLD</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['15 WARM + 10 COLD leads/month', 'Full AI answers visible', 'WhatsApp alerts on HOT leads', 'City + BHK filters', 'Analytics dashboard'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-orange-100">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)" />
                      <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="Pro" role="dealer" amount={5999} label="Start Pro"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 bg-white text-[#FB923C] transition-all disabled:opacity-60 cursor-pointer hover:bg-orange-50" />
            </div>

            {/* Power */}
            <div className="bg-white border border-[#FED7AA] rounded-2xl p-6 flex flex-col">
              <div className="text-xs font-700 uppercase tracking-wider mb-4 text-[#F59E0B]">Power</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-[#111827]">₹9,999</div>
              <div className="text-xs mb-6 text-[#9CA3AF]">/month · 25 WARM + Unlimited COLD</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['25 WARM + unlimited COLD leads', 'CSV export', 'Priority support', 'Dedicated account manager', 'Custom city targeting'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <Check color="#F59E0B" /> {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="Power" role="dealer" amount={9999} label="Go Power"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all disabled:opacity-60 cursor-pointer bg-orange-50 border border-[#FED7AA] text-[#F59E0B] hover:bg-orange-100" />
            </div>
          </div>

          {/* Per Lead */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <p className="text-xs font-700 uppercase tracking-wider mb-4 text-[#9CA3AF]">Or pay per lead — no subscription needed</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { tier: 'COLD', price: '₹299',   color: '#3B82F6', bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.15)',  icon: '🧊', note: 'Early stage' },
                { tier: 'WARM', price: '₹999',   color: '#F59E0B', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.15)',  icon: '🔥', note: 'Ready to buy' },
                { tier: 'HOT',  price: 'Call us', color: '#EF4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.15)',   icon: '⚡', note: 'We handle directly' },
              ].map(({ tier, price, color, bg, border, icon, note }) => (
                <div key={tier} className="p-4 rounded-2xl text-center" style={{ background: bg, border: `1px solid ${border}` }}>
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs font-700 mb-1" style={{ color }}>{tier}</div>
                  <div className="font-heading text-lg font-800 mb-0.5" style={{ color }}>{price}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BUILDERS ── */}
        <section id="builder" className="mb-14">
          <h2 className="font-heading text-2xl font-800 mb-1 text-[#111827]">For Builders & Developers</h2>
          <p className="text-sm mb-8 text-[#6B7280]">List your projects, get buyer enquiries directly, track views & leads.</p>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Basic — Free */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col">
              <div className="text-xs font-700 uppercase tracking-wider mb-4 text-[#9CA3AF]">Basic</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-[#22C55E]">Free</div>
              <div className="text-xs mb-6 text-[#9CA3AF]">Forever · 2 listings</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['2 property listings', 'Photo upload', 'Buyer enquiry form', 'Basic analytics'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <Check color="#22C55E" /> {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="Basic" role="builder" amount={0} label="Get Started Free" free
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all disabled:opacity-60 cursor-pointer bg-green-50 border border-green-200 text-[#22C55E] hover:bg-green-100" />
            </div>

            {/* Standard — Popular */}
            <div className="flex flex-col p-6 rounded-2xl relative overflow-hidden bg-[#FB923C]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="text-[10px] font-800 uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap bg-[#111827] text-white">
                  ⭐ Most Popular
                </span>
              </div>
              <div className="text-xs font-700 uppercase tracking-wider mb-4 mt-2 text-orange-100">Standard</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-white">₹4,999</div>
              <div className="text-xs mb-6 text-orange-200">/month · 10 listings</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['10 property listings', 'YouTube video embed', 'Floor plan upload', 'Special offers section', 'View & lead analytics'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-orange-100">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                      <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)" />
                      <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="Standard" role="builder" amount={4999} label="Start Standard"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 bg-white text-[#FB923C] transition-all disabled:opacity-60 cursor-pointer hover:bg-orange-50" />
            </div>

            {/* Premium */}
            <div className="bg-white border border-[#FED7AA] rounded-2xl p-6 flex flex-col">
              <div className="text-xs font-700 uppercase tracking-wider mb-4 text-[#F59E0B]">Premium</div>
              <div className="font-heading text-3xl font-800 mb-0.5 text-[#111827]">₹9,999</div>
              <div className="text-xs mb-6 text-[#9CA3AF]">/month · Unlimited listings</div>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {['Unlimited listings', 'Featured badge on all projects', 'Priority placement in search', 'Dedicated account manager', 'Custom branding'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <Check color="#F59E0B" /> {f}
                  </li>
                ))}
              </ul>
              <RazorpayButton plan="Premium" role="builder" amount={9999} label="Go Premium"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-700 transition-all disabled:opacity-60 cursor-pointer bg-orange-50 border border-[#FED7AA] text-[#F59E0B] hover:bg-orange-100" />
            </div>
          </div>
        </section>

        {/* ── SHARE & EARN ── */}
        <section className="mb-14">
          <div className="bg-white border border-orange-200 rounded-2xl p-8 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔗</span>
                  <h2 className="font-heading text-2xl font-800 text-[#111827]">Share & Earn</h2>
                  <span className="text-xs font-700 px-2.5 py-1 rounded-full bg-orange-50 text-[#FB923C] border border-orange-200">
                    Referral Program
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {[
                    'Share any property link with your referral code',
                    'Someone buys via your link → deal closes → you earn',
                    <span key="earn">You get <strong className="text-[#FB923C]">0.25% of the deal value</strong> — automatically tracked</span>,
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <Check /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 p-6 rounded-2xl text-center bg-orange-50 border border-orange-200" style={{ minWidth: '180px' }}>
                <div className="text-xs font-700 uppercase tracking-wider mb-1 text-[#9CA3AF]">Example</div>
                <div className="font-heading text-3xl font-800 mb-0.5 text-[#FB923C]">₹15,000</div>
                <div className="text-xs mb-1 text-[#6B7280]">on a ₹60L deal</div>
                <div className="text-[11px] px-2 py-0.5 rounded-full inline-block bg-white text-[#9CA3AF] border border-[#E5E7EB]">0.25% of ₹60,00,000</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <div className="text-center">
          <p className="text-sm mb-5 text-[#6B7280]">
            Questions? We respond in under 2 hours.
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-700 transition-all"
            style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.53 5.857L0 24l6.335-1.502A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.66-.502-5.193-1.382l-.373-.22-3.76.892.944-3.66-.242-.386A9.98 9.98 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp: +91 96436 93090
          </a>
          <p className="text-xs mt-3 text-[#9CA3AF]">Mon–Sat 9am–7pm IST</p>
        </div>

      </main>
      <MobileNav />
    </>
  )
}
