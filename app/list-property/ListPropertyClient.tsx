'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'

export default function ListPropertyClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'builder' | 'expert' | null>(null)

  const choose = async (role: 'builder' | 'expert') => {
    setLoading(role)
    const supabase = createClient()
    await supabase.from('profiles').update({ role }).eq('id', userId)
    router.push(`/${role}`)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4 py-16 pb-28 md:pb-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="text-xs font-700 uppercase tracking-wider text-[#FB923C] mb-3">
              List Property
            </div>
            <h1 className="font-heading text-3xl font-800 text-[#111827] mb-2">
              How do you want to list?
            </h1>
            <p className="text-[#6B7280]">Choose your role to get started. You can change later.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Builder */}
            <button
              onClick={() => choose('builder')}
              disabled={!!loading}
              className="bg-white border-2 border-[#E5E7EB] hover:border-[#FB923C] rounded-2xl p-8 text-left transition-all group disabled:opacity-60"
            >
              <div className="text-3xl mb-4">🏗️</div>
              <h2 className="font-heading text-xl font-800 text-[#111827] mb-2 group-hover:text-[#FB923C] transition-colors">
                Builder / Developer
              </h2>
              <p className="text-sm text-[#6B7280] mb-4">
                List your projects with RERA certification. Get verified buyer leads directly.
              </p>
              <ul className="space-y-2 text-sm text-[#374151] mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-[#FB923C]">✓</span> RERA registration required
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FB923C]">✓</span> 1.75% deal commission only
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FB923C]">✓</span> Full lead details visible
                </li>
              </ul>
              <div className="w-full py-2.5 rounded-xl bg-[#FB923C] text-white text-sm font-700 text-center">
                {loading === 'builder' ? 'Setting up…' : 'Continue as Builder →'}
              </div>
            </button>

            {/* Property Expert */}
            <button
              onClick={() => choose('expert')}
              disabled={!!loading}
              className="bg-white border-2 border-[#E5E7EB] hover:border-[#FB923C] rounded-2xl p-8 text-left transition-all group disabled:opacity-60"
            >
              <div className="text-3xl mb-4">🤝</div>
              <h2 className="font-heading text-xl font-800 text-[#111827] mb-2 group-hover:text-[#FB923C] transition-colors">
                Property Expert
              </h2>
              <p className="text-sm text-[#6B7280] mb-4">
                List properties and earn on closures. Subscription unlocks full buyer details.
              </p>
              <ul className="space-y-2 text-sm text-[#374151] mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-[#FB923C]">✓</span> ₹599/month or ₹999/6-months
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FB923C]">✓</span> 55/45 deal split with Orenzaa
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FB923C]">✓</span> Up to 5 listings free
                </li>
              </ul>
              <div className="w-full py-2.5 rounded-xl bg-[#F59E0B] text-white text-sm font-700 text-center">
                {loading === 'expert' ? 'Setting up…' : 'Continue as Expert →'}
              </div>
            </button>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
