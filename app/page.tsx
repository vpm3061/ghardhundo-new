import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PropertyCard from '@/components/PropertyCard'
import AIQuestionnaire from '@/components/AIQuestionnaire'
import PhoneModal from '@/components/PhoneModal'
import type { Property } from '@/lib/supabase/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      {profile && !profile.phone && <PhoneModal userId={user.id} />}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        {/* Hero */}
        <section className="relative mb-14 pt-6">
          {/* Background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-25"
              style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float-orb 12s ease-in-out infinite' }} />
            <div className="absolute top-20 right-0 w-72 h-72 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.5) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'float-orb 15s ease-in-out infinite 3s' }} />
          </div>

          <div className="mb-4">
            <span className="inline-flex items-center gap-2 text-xs font-700 tracking-wider uppercase px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
              AI-Powered Property Search
            </span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl font-800 leading-[1.1] mb-4 text-[#F1F0FF]">
            Find your dream<br />
            <span style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              home faster
            </span>
          </h1>
          <p className="text-[#8B8BA8] text-base max-w-lg leading-relaxed">
            Our AI matches you with verified properties based on your preferences, budget, and timeline. 500+ listings. 4 cities.
          </p>
        </section>

        {/* Two-col */}
        <div className="grid lg:grid-cols-5 gap-8 mb-16">
          <div className="lg:col-span-2">
            <AIQuestionnaire userId={user.id} />
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
            {[
              { label: 'Properties', value: '500+', icon: '🏢', color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.25)' },
              { label: 'Happy Buyers', value: '1,200+', icon: '🎉', color: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
              { label: 'Cities', value: '4', icon: '🗺️', color: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
              { label: 'AI Match Rate', value: '92%', icon: '🤖', color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.25)' },
              { label: 'RERA Verified', value: '100%', icon: '✅', color: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
              { label: 'Response Time', value: '< 2hrs', icon: '⚡', color: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            ].map(s => (
              <div key={s.label} className="glass p-4 hover:scale-[1.02] transition-transform">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-lg"
                  style={{ background: s.color, border: `1px solid ${s.border}` }}>
                  {s.icon}
                </div>
                <div className="font-heading text-xl font-800 text-[#F1F0FF]">{s.value}</div>
                <div className="text-[#8B8BA8] text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Properties */}
        {properties && properties.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-2xl font-800 text-[#F1F0FF]">Featured Properties</h2>
                <p className="text-[#8B8BA8] text-xs mt-0.5">Curated picks from top builders</p>
              </div>
              <a href="/properties"
                className="text-sm font-600 px-4 py-2 rounded-full transition-all"
                style={{ color: '#A78BFA', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                View all →
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(properties as Property[]).map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}

        {(!properties || properties.length === 0) && (
          <div className="text-center py-20 glass">
            <div className="text-5xl mb-4">🏗️</div>
            <h3 className="font-heading text-xl font-700 mb-2 text-[#F1F0FF]">Properties Coming Soon</h3>
            <p className="text-[#8B8BA8] text-sm">We're adding new properties daily. Check back soon!</p>
          </div>
        )}

        {/* Pricing teaser */}
        <section className="mt-14">
          <div className="relative overflow-hidden rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.06))', border: '1px solid rgba(124,58,237,0.25)' }}>
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: '#7C3AED', filter: 'blur(70px)', opacity: 0.08 }} />
            <div>
              <div className="text-xs font-700 uppercase tracking-wider mb-2" style={{ color: '#A78BFA' }}>
                For Dealers & Brokers
              </div>
              <h3 className="font-heading text-2xl font-800 mb-1" style={{ color: '#F1F0FF' }}>
                Get AI-scored buyer leads from <span style={{ color: '#A78BFA' }}>₹299</span>
              </h3>
              <p className="text-sm" style={{ color: '#8B8BA8' }}>
                COLD · WARM · HOT — pay only for leads you want. Monthly plans from ₹2,999.
              </p>
            </div>
            <a href="/pricing"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-700 text-sm transition-all btn-accent whitespace-nowrap">
              💎 See Pricing →
            </a>
          </div>
        </section>
      </main>

      <MobileNav />
    </>
  )
}
