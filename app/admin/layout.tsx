import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLayoutClient from './AdminLayoutClient'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tellitorg1@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  return <AdminLayoutClient userEmail={user.email || ''}>{children}</AdminLayoutClient>
}
