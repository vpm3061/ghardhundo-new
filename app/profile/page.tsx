import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ProfileClient from './ProfileClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/profile')

  const [{ data: profile }, { data: coins }] = await Promise.all([
    supabase.from('profiles').select('full_name, email, phone, avatar_url').eq('id', user.id).single(),
    supabase.from('coins').select('amount, type').eq('user_id', user.id),
  ])

  const balance = (coins || []).reduce((s, c) => s + (c.type === 'earned' ? c.amount : -c.amount), 0)

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
          coinBalance={balance}
        />
      </main>
      <MobileNav />
    </>
  )
}
