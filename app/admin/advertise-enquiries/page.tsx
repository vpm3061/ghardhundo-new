import { createClient } from '@/lib/supabase/server'
import AdminAdvertiseClient from './AdminAdvertiseClient'
import type { AdvertiseEnquiry } from '@/lib/supabase/types'

export default async function AdminAdvertiseEnquiriesPage() {
  const supabase = await createClient()
  const { data: enquiries } = await supabase
    .from('advertise_enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Ad Enquiries</h1>
        <p className="text-[#6B7280] text-sm mt-1">{enquiries?.length || 0} total enquiries</p>
      </div>
      <AdminAdvertiseClient enquiries={(enquiries || []) as AdvertiseEnquiry[]} />
    </div>
  )
}
