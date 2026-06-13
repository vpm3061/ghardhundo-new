import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ListPropertyForm from './ListPropertyForm'

export default async function ListPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: coins } = await supabase.from('coins').select('amount, type').eq('user_id', user.id)
  const balance = (coins || []).reduce((s, c) => s + (c.type === 'earned' ? c.amount : -c.amount), 0)

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-heading text-3xl font-800 text-[#F1F0FF]">List Your Property</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <span>🪙</span>
              <span className="font-heading font-800" style={{ color: '#A78BFA' }}>{balance}</span>
              <span className="text-[#8B8BA8] text-xs">coins</span>
            </div>
          </div>
          <p className="text-[#8B8BA8] text-sm">
            List your property and earn <span className="font-700" style={{ color: '#A78BFA' }}>50 coins</span> when published.
          </p>
        </div>

        <ListPropertyForm userId={user.id} />
      </main>
      <MobileNav />
    </>
  )
}
