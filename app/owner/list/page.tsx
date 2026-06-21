import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import OwnerListForm from './OwnerListForm'

export default async function OwnerListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/owner/list')

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-700 mb-4"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#22C55E' }}>
            🏠 Free Owner Listing
          </div>
          <h1 className="font-heading text-3xl font-800 mb-2" style={{ color: '#111827' }}>Apni Property List Karo</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Direct buyers se connect karo — koi commission nahi, koi hidden charge nahi.
          </p>
        </div>
        <OwnerListForm userId={user.id} />
      </main>
      <MobileNav />
    </>
  )
}
