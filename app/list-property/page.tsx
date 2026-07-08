'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ListPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role === 'expert') router.replace('/expert')
          else if (data?.role === 'builder') router.replace('/builder')
          else setLoading(false)
        })
    })
  }, [])

  const pick = async (role: 'expert' | 'builder') => {
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await supabase.from('profiles').update({ role }).eq('id', user.id)
    router.replace(role === 'expert' ? '/expert' : '/builder')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-2">List Your Property</h1>
        <p className="text-center text-gray-500 mb-10">Choose how you want to list</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-200 hover:border-orange-400 rounded-2xl p-6 cursor-pointer"
            onClick={() => !busy && pick('builder')}>
            <div className="text-4xl mb-3">🏗️</div>
            <h2 className="text-xl font-bold mb-2">Builder</h2>
            <ul className="text-sm text-gray-600 space-y-1 mb-6">
              <li>✅ 5 free listings</li>
              <li>✅ RERA badge</li>
              <li>⚠️ 1.75% commission</li>
            </ul>
            <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold">
              {busy ? '...' : 'Continue as Builder →'}
            </button>
          </div>
          <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-6 cursor-pointer"
            onClick={() => !busy && pick('expert')}>
            <div className="text-4xl mb-3">🤝</div>
            <h2 className="text-xl font-bold mb-2">Property Expert</h2>
            <ul className="text-sm text-gray-600 space-y-1 mb-6">
              <li>✅ 5 free listings</li>
              <li>✅ AI scored leads</li>
              <li>✅ 55% commission</li>
            </ul>
            <button className="w-full py-3 bg-orange-400 text-white rounded-xl font-semibold">
              {busy ? '...' : 'Continue as Expert →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}