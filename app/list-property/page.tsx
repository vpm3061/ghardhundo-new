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
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('[list-property] user:', user?.id, 'error:', userError?.message)
  if (!user) redirect('/login?redirect=/list-property')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, expert_registered, is_partner')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  console.log('[list-property] profile:', profile, 'error:', profileError?.message)

  if (profileError) {
    console.error('[list-property] profile fetch failed', { userId: user.id, profileError })
    return (
      <>
        <Navbar />
        <main className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="font-heading text-2xl font-800 mb-2" style={{ color: '#111827' }}>
            Couldn&apos;t verify your account
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            Please refresh and try again. If you&apos;ve already paid, you won&apos;t be charged again.
          </p>
        </main>
        <MobileNav />
      </>
    )
  }

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
