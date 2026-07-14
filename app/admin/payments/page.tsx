import { createClient } from '@/lib/supabase/server'
import PaymentsClient from './PaymentsClient'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('payment_orders')
    .select('*, profiles!user_id(full_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Revenue Dashboard</h1>
        <p className="text-[#6B7280] text-sm mt-1">All Razorpay-collected payments across every plan</p>
      </div>
      <PaymentsClient orders={orders || []} />
    </div>
  )
}
