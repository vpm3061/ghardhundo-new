import { createClient } from '@/lib/supabase/server'
import CoinsClient from './CoinsClient'

export default async function AdminCoinsPage() {
  const supabase = await createClient()

  const { data: conversions } = await supabase
    .from('coin_conversions')
    .select('*, profiles!user_id(full_name, email, phone)')
    .order('created_at', { ascending: false })

  const pending = (conversions || []).filter(c => c.status === 'Pending')
  const pendingTotal = pending.reduce((s, c) => s + (c.cash_amount || 0), 0)

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Coin Payouts</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {pending.length} pending · ₹{pendingTotal.toLocaleString('en-IN')} to pay out
        </p>
      </div>
      <CoinsClient conversions={conversions || []} />
    </div>
  )
}
