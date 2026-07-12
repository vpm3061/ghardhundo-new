'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    whatsapp_number: '',
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      setForm(f => ({
        ...f,
        full_name: user.user_metadata?.full_name || '',
      }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!form.full_name || !form.phone) {
      toast.error('Name aur phone number zaroori hai!')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      whatsapp_number: form.whatsapp_number || form.phone,
      profile_complete: true,
    }).eq('id', user.id)

    if (error) { toast.error('Error: ' + error.message); setLoading(false); return }
    toast.success('Profile complete!')
    router.push(searchParams.get('redirect') || '/')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-[#111827]">Welcome to Orenzaa!</h1>
          <p className="text-[#6B7280] mt-2">Pehle apni details bharo — sirf 30 seconds!</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#374151] block mb-1">Full Name *</label>
            <input type="text" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Aapka naam" suppressHydrationWarning
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#374151] block mb-1">Phone Number *</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="9876543210" suppressHydrationWarning
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#374151] block mb-1">WhatsApp Number</label>
            <input type="tel" value={form.whatsapp_number}
              onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
              placeholder="Same as phone? Tab empty rakho" suppressHydrationWarning
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FB923C]" />
            <p className="text-xs text-[#9CA3AF] mt-1">Khali rakho agar same hai phone se</p>
          </div>
          <button type="submit" disabled={loading} suppressHydrationWarning
            className="w-full py-3 bg-[#FB923C] hover:bg-[#F59E0B] text-white font-bold rounded-xl disabled:opacity-50">
            {loading ? 'Saving...' : 'Continue to Orenzaa →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingForm />
    </Suspense>
  )
}
