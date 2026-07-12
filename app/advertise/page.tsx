import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import AdvertiseForm from './AdvertiseForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Advertise on Orenzaa' }

const PACKAGES = [
  { name: 'Property Page Banner', price: '₹10,000/month', desc: 'Shown on every property detail page' },
  { name: 'Search Page Banner', price: '₹15,000/month', desc: 'Shown above search results', popular: true },
  { name: 'Homepage Banner', price: '₹25,000/month', desc: 'Prime placement on the homepage' },
]

const WHY = [
  { icon: '🎯', title: 'Targeted UP buyers', desc: 'Reach active buyers in Lucknow, Noida & Ayodhya specifically.' },
  { icon: '🤖', title: 'AI qualified leads', desc: 'Every CPL lead is AI-scored HOT/WARM/COLD before it reaches you.' },
  { icon: '💰', title: 'Affordable rates', desc: 'No agency mark-ups — pay directly for placement or per lead.' },
  { icon: '📊', title: 'Real-time analytics', desc: 'Track views, clicks and leads on your campaign as it runs.' },
]

export default function AdvertisePage() {
  return (
    <>
      <Navbar />
      <main className="pb-28 md:pb-12">
        {/* Hero */}
        <section className="bg-white pt-16 pb-12 px-6 border-b border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl sm:text-5xl font-800 text-[#111827] mb-4">
              Advertise on <span className="text-[#FB923C]">Orenzaa</span>
            </h1>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Reach active property buyers in Lucknow, Noida &amp; Ayodhya
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-sm">
              {['10,000+ Monthly Visitors', 'Lucknow & Noida Focus', 'AI Qualified Buyers'].map(s => (
                <span key={s} className="px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-[#FB923C] font-600">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Banner packages */}
        <section className="py-14 px-6 bg-[#FAFAF9]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-800 text-[#111827] text-center mb-8">Banner Packages</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {PACKAGES.map(p => (
                <div key={p.name}
                  className="bg-white rounded-2xl p-6 flex flex-col"
                  style={p.popular ? { border: '2px solid #FB923C' } : { border: '1px solid #E5E7EB' }}>
                  {p.popular && (
                    <span className="self-start text-[10px] font-800 uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-50 text-[#FB923C] mb-3">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-heading font-700 text-lg text-[#111827] mb-1">{p.name}</h3>
                  <p className="font-heading text-2xl font-800 mb-3" style={{ color: '#FB923C' }}>{p.price}</p>
                  <p className="text-sm text-[#6B7280]">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* CPL box */}
            <div className="mt-6 rounded-2xl p-6 sm:p-8 text-center sm:text-left sm:flex items-center justify-between gap-6"
              style={{ background: 'linear-gradient(135deg, #FB923C, #F59E0B)' }}>
              <div>
                <h3 className="font-heading text-2xl font-800 text-white mb-1">CPL Package — ₹1,500/lead</h3>
                <p className="text-orange-50 text-sm">AI-scored buyers only · Minimum 10 leads = ₹15,000</p>
              </div>
              <a href="https://wa.me/919643693090?text=Hi%2C%20I%27m%20interested%20in%20the%20Orenzaa%20CPL%20package"
                target="_blank" rel="noopener noreferrer"
                className="inline-block mt-5 sm:mt-0 px-6 py-3 bg-white text-[#FB923C] font-700 rounded-xl whitespace-nowrap">
                Ask on WhatsApp →
              </a>
            </div>
          </div>
        </section>

        {/* Why Orenzaa */}
        <section className="py-14 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-2xl font-800 text-[#111827] text-center mb-8">Why Orenzaa</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {WHY.map(w => (
                <div key={w.title} className="flex gap-4 p-5 rounded-2xl border border-[#E5E7EB]">
                  <div className="text-3xl shrink-0">{w.icon}</div>
                  <div>
                    <h3 className="font-heading font-700 text-[#111827] mb-1">{w.title}</h3>
                    <p className="text-sm text-[#6B7280]">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section className="py-14 px-6 bg-[#FAFAF9]">
          <div className="max-w-lg mx-auto">
            <h2 className="font-heading text-2xl font-800 text-[#111827] text-center mb-2">Get in Touch</h2>
            <p className="text-sm text-[#6B7280] text-center mb-8">Tell us what you&apos;re looking for — we&apos;ll follow up within 24 hours.</p>
            <AdvertiseForm />
            <div className="text-center mt-6">
              <a href="https://wa.me/919643693090" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-600" style={{ color: '#25D366' }}>
                Or WhatsApp us directly: +91 96436 93090
              </a>
            </div>
          </div>
        </section>
      </main>
      <MobileNav />
    </>
  )
}
