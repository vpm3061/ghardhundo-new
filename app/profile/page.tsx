import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ProfileClient from './ProfileClient'
import type { Metadata } from 'next'
import type { Property } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/profile')

  const [
    { data: profile },
    { data: coins },
    { data: coinHistory },
    { data: enquiries },
    { data: conversions },
    { data: savedRaw },
    { data: referrals },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, email, phone, avatar_url, referral_code').eq('id', user.id).single(),
    supabase.from('coins').select('amount, type').eq('user_id', user.id),
    supabase.from('coins').select('amount, type, description, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('leads').select('id, name, tier, ai_score, status, created_at, properties(title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('coin_conversions').select('id, coins, cash_amount, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('saved_properties').select('property_id, properties(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('referrals').select('id, leads(deal_amount, properties(title)), created_at, earned_coins').eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const balance = (coins || []).reduce((s, c) => s + (c.type === 'earned' ? c.amount : -c.amount), 0)

  const enquiriesTyped = (enquiries || []).map(e => ({
    id: e.id as string,
    name: e.name as string,
    tier: e.tier as string | null,
    ai_score: e.ai_score as number,
    status: e.status as string,
    created_at: e.created_at as string,
    propertyTitle: Array.isArray(e.properties)
      ? (e.properties[0] as { title: string } | null)?.title ?? null
      : (e.properties as { title: string } | null)?.title ?? null,
  }))

  const savedProperties = (savedRaw || []).map(r => {
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties
    return prop as Property | null
  }).filter(Boolean) as Property[]

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <ProfileClient
          userId={user.id}
          email={user.email || ''}
          fullName={profile?.full_name || null}
          phone={profile?.phone || null}
          avatarUrl={profile?.avatar_url || null}
          referralCode={profile?.referral_code || user.id.slice(0, 8)}
          coinBalance={balance}
          coinHistory={(coinHistory || []).map(c => ({ ...c, amount: c.amount as number, type: c.type as 'earned' | 'spent', description: c.description as string | null, created_at: c.created_at as string }))}
          enquiries={enquiriesTyped}
          conversions={(conversions || []).map(c => ({ ...c, coins: c.coins as number, cash_amount: c.cash_amount as number, status: c.status as string, created_at: c.created_at as string }))}
          savedProperties={savedProperties}
          referrals={(referrals || []).map(r => {
            const lead = Array.isArray(r.leads) ? r.leads[0] : r.leads
            const propT = Array.isArray((lead as { properties?: { title?: string } | null })?.properties)
              ? ((lead as { properties?: { title?: string }[] | null })?.properties?.[0] as { title?: string } | null)?.title ?? null
              : ((lead as { properties?: { title?: string } | null })?.properties as { title?: string } | null)?.title ?? null
            return {
              id:          r.id as string,
              earnedCoins: r.earned_coins as number,
              dealAmount:  (lead as { deal_amount?: number | null } | null)?.deal_amount ?? null,
              propertyTitle: propT,
              created_at:  r.created_at as string,
            }
          })}
        />
      </main>
      <MobileNav />
    </>
  )
}
