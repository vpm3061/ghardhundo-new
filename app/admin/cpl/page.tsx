import { createClient } from '@/lib/supabase/server'
import AdminCplClient from './AdminCplClient'
import type { CplDeal } from '@/lib/supabase/types'

export default async function AdminCplPage() {
  const supabase = await createClient()
  const { data: deals } = await supabase
    .from('cpl_deals')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-heading text-2xl font-800 text-[#111827] mb-6">CPL Deals</h1>
      <AdminCplClient deals={(deals || []) as CplDeal[]} />
    </div>
  )
}
