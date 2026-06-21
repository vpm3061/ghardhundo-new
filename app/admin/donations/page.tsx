import { createClient } from '@/lib/supabase/server'
import DonationsClient from './DonationsClient'

export default async function AdminDonationsPage() {
  const supabase = await createClient()

  const { data: donations } = await supabase
    .from('donated_listings')
    .select('*, profiles!user_id(full_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Donated Listings</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {(donations || []).filter(d => d.status === 'Pending').length} pending approval
        </p>
      </div>
      <DonationsClient donations={donations || []} />
    </div>
  )
}
