import { createClient } from '@/lib/supabase/server'
import AdminVerificationsClient from './AdminVerificationsClient'
import type { VerificationRequest } from './AdminVerificationsClient'

export default async function AdminVerificationsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, verification_requested_at')
    .eq('verification_status', 'pending')
    .order('verification_requested_at', { ascending: true })

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Verifications</h1>
        <p className="text-[#6B7280] text-sm mt-1">{requests?.length || 0} pending requests</p>
      </div>
      <AdminVerificationsClient requests={(requests || []) as VerificationRequest[]} />
    </div>
  )
}
