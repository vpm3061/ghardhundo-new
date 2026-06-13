import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import AIQuestionnaire from '@/components/AIQuestionnaire'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Property Match',
  description: 'Answer 5 questions and get matched with the perfect RERA verified property in Lucknow or Noida.',
}

export default async function AIMatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/ai')

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-700 tracking-wider uppercase mb-4"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}>
            AI Property Matching
          </div>
          <h1 className="font-heading text-3xl font-800 text-[#F1F0FF] mb-2">
            Find your perfect home
          </h1>
          <p className="text-[#8B8BA8] text-sm">
            60 seconds · 5 questions · Personalised property matches
          </p>
        </div>

        <AIQuestionnaire userId={user.id} />
      </main>
      <MobileNav />
    </>
  )
}
