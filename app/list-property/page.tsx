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
    .select('role, expert_registered, is_partner')
    .eq('id', user.id)
    .single()

  const isBuilder = profile?.role === 'builder'
  const isAuthorizedExpert = profile?.expert_registered === true || profile?.is_partner === true
  const initialRole = isBuilder ? 'builder' : isAuthorizedExpert ? 'expert' : null

  if (isBuilder && isNew !== '1') {
    redirect('/builder')
  }
  if (isAuthorizedExpert && isNew !== '1') {
    redirect('/expert')
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <ListPropertyWizard
          userId={user.id}
          initialRole={initialRole}
          expertRegistered={isAuthorizedExpert}
          initialStep={isAuthorizedExpert ? 1 : 0}
        />
      </main>
      <MobileNav />
    </>
  )
}
