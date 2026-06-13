import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tellitorg1@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  return (
    <div className="min-h-dvh flex flex-col">
      <AdminNav userEmail={user.email || ''} />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
        {children}
      </div>
    </div>
  )
}
