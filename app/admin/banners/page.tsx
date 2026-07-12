import { createClient } from '@/lib/supabase/server'
import AdminBannersClient from './AdminBannersClient'
import type { Banner } from '@/lib/supabase/types'

export default async function AdminBannersPage() {
  const supabase = await createClient()
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-heading text-2xl font-800 text-[#111827] mb-6">Banners</h1>
      <AdminBannersClient banners={(banners || []) as Banner[]} />
    </div>
  )
}
