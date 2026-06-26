import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PropertyCard from '@/components/PropertyCard'
import AIQuestionnaire from '@/components/AIQuestionnaire'
import PhoneModal from '@/components/PhoneModal'
import type { Property } from '@/lib/supabase/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id ?? null

  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      {userId && profile && !profile.phone && <PhoneModal userId={userId} />}
      <Navbar />

      {/* Hero */}
      <section className="bg-white pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-sm text-orange-600 font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            AI-Powered Property Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-800 text-[#111827] leading-tight mb-6">
            Find Where<br />
            <span className="text-[#FB923C]">Life Belongs.</span>
          </h1>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover homes, plots, apartments, and investment opportunities with confidence. AI-matched. RERA verified. Zero pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/properties" className="px-8 py-4 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-200">
              Explore Properties →
            </Link>
            <Link href="/list" className="px-8 py-4 bg-white border border-[#E5E7EB] hover:border-[#FB923C] text-[#374151] font-semibold rounded-xl transition-all">
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="bg-[#FAFAF9] py-10 px-6 border-y border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-2 flex gap-2 flex-wrap md:flex-nowrap">
            <select className="flex-1 px-4 py-3 text-[#374151] bg-transparent border-r border-[#E5E7EB] outline-none text-sm min-w-0">
              <option>All Cities</option>
              <option>Lucknow</option>
              <option>Noida</option>
              <option>Greater Noida</option>
              <option>Ayodhya</option>
            </select>
            <select className="flex-1 px-4 py-3 text-[#374151] bg-transparent border-r border-[#E5E7EB] outline-none text-sm min-w-0">
              <option>Any BHK</option>
              <option>1 BHK</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4+ BHK</option>
            </select>
            <select className="flex-1 px-4 py-3 text-[#374151] bg-transparent border-r border-[#E5E7EB] outline-none text-sm min-w-0">
              <option>Any Budget</option>
              <option>Under ₹40L</option>
              <option>₹40L – ₹60L</option>
              <option>₹60L – ₹1Cr</option>
              <option>₹1Cr+</option>
            </select>
            <Link href="/properties" className="px-6 py-3 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-semibold rounded-xl transition-all whitespace-nowrap">
              Search Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '500+', label: 'RERA Verified Properties' },
            { num: '2,000+', label: 'Happy Buyers' },
            { num: '50+', label: 'Trusted Builders' },
            { num: '₹0', label: 'Buyer Fee' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-4xl font-heading font-800 text-[#111827]">{stat.num}</p>
              <p className="text-sm text-[#6B7280] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Questionnaire */}
      <section className="bg-[#FAFAF9] py-12 px-6 border-y border-[#E5E7EB]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-[#FB923C] mb-2">AI Property Match</p>
            <h2 className="text-3xl font-heading font-800 text-[#111827]">Find Your Perfect Home</h2>
            <p className="text-[#6B7280] mt-2 text-sm">Answer 5 questions. Get matched instantly.</p>
          </div>
          {userId ? <AIQuestionnaire userId={userId} /> : (
            <div className="text-center py-8">
              <p className="text-[#6B7280] text-sm mb-4">Sign in to get AI-matched properties instantly</p>
              <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-semibold rounded-xl transition-all">
                Sign in Free →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium text-[#FB923C] mb-2">Featured Listings</p>
              <h2 className="text-3xl font-heading font-800 text-[#111827]">Handpicked for You</h2>
            </div>
            <Link href="/properties" className="text-sm text-[#FB923C] font-medium hover:underline">View all →</Link>
          </div>
          {properties && properties.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(properties as Property[]).map(p => <PropertyCard key={p.id} property={p} userId={userId ?? undefined} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#FAFAF9] rounded-2xl border border-[#E5E7EB]">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="font-heading text-xl font-700 mb-2 text-[#111827]">Properties Coming Soon</h3>
              <p className="text-[#6B7280] text-sm">We're adding new properties daily. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#FAFAF9] py-16 px-6 border-y border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-heading font-800 text-[#111827]">How Orenzaa Works</h2>
          <p className="text-[#6B7280] mt-3">Simple. Transparent. Smart.</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '🤖', title: 'AI Match', desc: 'Answer 5 questions. Get your property match score instantly.' },
            { step: '02', icon: '🏠', title: 'Site Visit', desc: 'Book a free site visit. We arrange everything for you.' },
            { step: '03', icon: '✅', title: 'Move In', desc: 'RERA verified purchase. Plus 2 years after-sale support.' },
          ].map(item => (
            <div key={item.step} className="bg-white border border-[#E5E7EB] rounded-2xl p-8 hover:border-[#FB923C] hover:shadow-lg transition-all">
              <p className="text-xs font-bold text-[#FB923C] mb-4">{item.step}</p>
              <p className="text-3xl mb-4">{item.icon}</p>
              <h3 className="font-heading font-700 text-[#111827] text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-heading font-800 text-[#111827] text-center mb-12">What Our Buyers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Rahul S.', city: 'Lucknow', text: 'Found my dream 3BHK in 2 weeks. The AI matching was spot on.', rating: 5 },
              { name: 'Priya M.', city: 'Noida', text: 'Zero pressure. The team guided me through the entire process.', rating: 5 },
              { name: 'Amit K.', city: 'Ayodhya', text: 'RERA verified listing gave me confidence. Great experience!', rating: 5 },
            ].map(t => (
              <div key={t.name} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">{'⭐'.repeat(t.rating)}</div>
                <p className="text-[#374151] text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[#111827] text-sm">{t.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-[#FAFAF9] py-16 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <div className="text-xs font-700 uppercase tracking-wider mb-2 text-[#FB923C]">
                For Dealers & Brokers
              </div>
              <h3 className="font-heading text-2xl font-800 mb-1 text-[#111827]">
                Get AI-scored buyer leads from <span className="text-[#FB923C]">₹299</span>
              </h3>
              <p className="text-sm text-[#6B7280]">
                COLD · WARM · HOT — pay only for leads you want. Monthly plans from ₹2,999.
              </p>
            </div>
            <Link href="/pricing"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-700 text-sm transition-all bg-[#FB923C] hover:bg-[#F59E0B] text-white whitespace-nowrap">
              💎 See Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <p className="font-heading font-800 text-xl mb-3">ORENZ<span className="text-[#FB923C]">AA</span></p>
              <p className="text-gray-400 text-sm leading-relaxed">Premium PropTech platform for home buyers, builders, agents and investors.</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Platform</p>
              <div className="space-y-2">
                {[
                  { label: 'Properties', href: '/properties' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Share & Earn', href: '/share-earn' },
                  { label: 'List Property', href: '/list' },
                  { label: 'Find Buyers', href: '/find-buyers' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="block text-gray-400 text-sm hover:text-white transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">For Professionals</p>
              <div className="space-y-2">
                {[
                  { label: 'Builder Dashboard', href: '/builder' },
                  { label: 'Dealer Dashboard', href: '/dealer' },
                  { label: 'Owner Listing', href: '/owner' },
                  { label: 'Channel Partner', href: '/list' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="block text-gray-400 text-sm hover:text-white transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Contact</p>
              <p className="text-gray-400 text-sm">WhatsApp: +91 96436 93090</p>
              <p className="text-gray-400 text-sm mt-1">hello@orenzaa.com</p>
              <p className="text-gray-400 text-sm mt-4">RERA Verified Platform</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">© 2025 Orenzaa. All rights reserved.</p>
            <p className="text-gray-500 text-xs">AI-Powered · RERA Verified · Zero Pressure</p>
          </div>
        </div>
      </footer>

      <MobileNav />
    </>
  )
}
