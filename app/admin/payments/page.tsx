import { createClient } from '@/lib/supabase/server'

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('payment_orders')
    .select('*, profiles!user_id(full_name, email)')
    .order('created_at', { ascending: false })

  const totalPaid = (orders || []).filter(o => o.status === 'paid').reduce((s, o) => s + (o.amount || 0), 0)

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Payment Orders</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {(orders || []).filter(o => o.status === 'paid').length} paid ·
          Total collected ₹{totalPaid.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="space-y-2">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16 glass">
            <div className="text-5xl mb-3">💳</div>
            <p className="font-heading font-700 text-[#111827]">No payment orders yet</p>
          </div>
        ) : orders.map(order => {
          const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
          return (
            <div key={order.id} className="glass p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-600 text-sm" style={{ color: '#111827' }}>
                    {(profile as { full_name?: string } | null)?.full_name || (profile as { email?: string } | null)?.email || 'User'}
                  </div>
                  <div className="text-xs mt-0.5 flex gap-2 flex-wrap" style={{ color: '#6B7280' }}>
                    <span>{order.role} · {order.plan}</span>
                    {order.razorpay_payment_id && <><span>·</span><span className="font-mono text-[10px]">{order.razorpay_payment_id}</span></>}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="font-heading font-800" style={{ color: '#FB923C' }}>
                    ₹{(order.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-700 px-2.5 py-0.5 rounded-full"
                    style={order.status === 'paid'
                      ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                      : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
