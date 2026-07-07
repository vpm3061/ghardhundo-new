import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListPropertyClient from './ListPropertyClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'List Property | Orenzaa' }

export default async function ListPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/list-property')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'builder') redirect('/builder')
  if (profile?.role === 'expert') redirect('/expert')

  return <ListPropertyClient userId={user.id} />
}
