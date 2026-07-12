import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ListPropertyWizard from './ListPropertyWizard'

export default async function ListPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>
}) {
  const { new: isNew } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/list-property')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, expert_registered')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  const initialRole = role === 'builder' || role === 'expert' ? role : null

  if (initialRole && isNew !== '1') {
    redirect(initialRole === 'builder' ? '/builder' : '/expert')
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <ListPropertyWizard
          userId={user.id}
          initialRole={initialRole}
          expertRegistered={profile?.expert_registered ?? false}
        />
      </main>
      <MobileNav />
    </>
  )
}
