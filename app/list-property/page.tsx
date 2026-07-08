'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'

export default function ListPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [checking, setChecking] = useState(true)
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    async function checkExistingRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecking(false); return }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'expert') { router.replace('/expert'); return }
      if (profile?.role === 'builder') { router.replace('/builder'); return }
      setChecking(false)
    }
    checkExistingRole()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = async (role: 'expert' | 'builder') => {
    setSelecting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/list-property')
      return
    }
    await supabase.from('profiles').update({ role }).eq('id', user.id)
    router.replace(role === 'expert' ? '/expert' : '/builder')
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 pb-28 md:pb-8">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">List Your Property</h1>
          <p className="text-center text-gray-500 mb-10">Choose how you want to list</p>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Builder Card */}
            <div
              onClick={() => !selecting && handleSelect('builder')}
              className="border-2 border-gray-200 hover:border-orange-400 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg"
            >
              <div className="text-4xl mb-4">🏗️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Builder / Developer</h2>
              <p className="text-gray-500 text-sm mb-4">List your new projects directly</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>✅ 5 free project listings</li>
                <li>✅ RERA verified badge</li>
                <li>✅ Direct buyer leads</li>
                <li>⚠️ 1.75% commission on deals</li>
              </ul>
              <button
                disabled={selecting}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {selecting ? 'Please wait...' : 'Continue as Builder →'}
              </button>
            </div>

            {/* Expert Card */}
            <div
              onClick={() => !selecting && handleSelect('expert')}
              className="border-2 border-orange-400 bg-orange-50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg"
            >
              <div className="text-4xl mb-4">🤝</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Property Expert</h2>
              <p className="text-gray-500 text-sm mb-4">List properties, get leads, earn commission</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>✅ 5 free listings</li>
                <li>✅ AI scored buyer leads</li>
                <li>✅ Sell with Orenzaa option</li>
                <li>✅ 55% commission on deals</li>
              </ul>
              <button
                disabled={selecting}
                className="w-full py-3 bg-[#FB923C] text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {selecting ? 'Please wait...' : 'Continue as Expert →'}
              </button>
            </div>

          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
