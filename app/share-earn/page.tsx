import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ShareEarnClient from './ShareEarnClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Share & Earn — Orenzaa',
  description: 'Share karo, kamaao karo. Refer a property and earn 0.25% of the deal value.',
}

export default async function ShareEarnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let referralCode: string | null = null
  let topEarners: { masked: string; earned: number }[] = []

  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('referral_code').eq('id', user.id).single()
    referralCode = profile?.referral_code || user.id.slice(0, 8)

    /* Top referrers by coin earnings */
    const { data: refs } = await supabase
      .from('referrals').select('referrer_id, earned_coins').order('earned_coins', { ascending: false }).limit(50)
    if (refs) {
      const map: Record<string, number> = {}
      refs.forEach(r => {
        if (r.referrer_id) map[r.referrer_id] = (map[r.referrer_id] || 0) + (r.earned_coins || 0)
      })
      topEarners = Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, coins]) => ({ masked: id.slice(0, 1).toUpperCase() + '***' + id.slice(-1), earned: Math.round(coins * 15) }))
    }
  }

  return (
    <>
      <Navbar />
      <ShareEarnClient userId={user?.id || null} referralCode={referralCode} topEarners={topEarners} />
      <MobileNav />
    </>
  )
}
