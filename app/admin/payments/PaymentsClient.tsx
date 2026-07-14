'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CHART_STYLE = {
  contentStyle: { background: '#F5F5F4', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', color: '#111827', fontSize: '12px' },
}

type Order = {
  id: string
  amount: number | null
  status: string
  plan: string
  role: string
  created_at: string
  razorpay_payment_id: string | null
  profiles: { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[] | null
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

function getProfile(o: Order) {
  return Array.isArray(o.profiles) ? o.profiles[0] : o.profiles
}

export default function PaymentsClient({ orders }: { orders: Order[] }) {
  const paid = orders.filter(o => o.status === 'paid')
  const totalRevenue = paid.reduce((s, o) => s + (o.amount || 0), 0)

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonthRevenue = paid
    .filter(o => new Date(o.created_at) >= startOfThisMonth)
    .reduce((s, o) => s + (o.amount || 0), 0)
  const lastMonthRevenue = paid
    .filter(o => { const d = new Date(o.created_at); return d >= startOfLastMonth && d < startOfThisMonth })
    .reduce((s, o) => s + (o.amount || 0), 0)
  const monthDelta = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null

  const expertRegistrations = paid.filter(o => o.plan === 'expert-registration').length
  const proUpgrades = paid.filter(o => o.plan === 'expert-pro').length

  const planTotals = new Map<string, number>()
  paid.forEach(o => planTotals.set(o.plan, (planTotals.get(o.plan) || 0) + (o.amount || 0)))
  const planBreakdown = [...planTotals.entries()]
    .map(([plan, revenue]) => ({ plan, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  const STATS = [
    { label: 'Total Revenue',          value: fmt(totalRevenue),                  color: '#FB923C' },
    { label: 'This Month',             value: fmt(thisMonthRevenue),              color: '#22C55E',
      sub: monthDelta !== null ? `${monthDelta >= 0 ? '▲' : '▼'} ${Math.abs(monthDelta)}% vs last month` : null },
    { label: 'Expert Registrations',   value: `${expertRegistrations}`,           color: '#3B82F6', sub: '₹49 one-time' },
    { label: 'Pro Upgrades',           value: `${proUpgrades}`,                   color: '#7C3AED', sub: '₹499/mo' },
  ]

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
            <div className="text-xs font-600 text-[#6B7280] mb-1">{s.label}</div>
            <div className="font-heading text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
            {s.sub && <div className="text-[11px] mt-0.5 text-[#9CA3AF]">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Plan breakdown chart */}
      {planBreakdown.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-6">
          <h2 className="font-heading text-sm font-700 mb-4 text-[#111827]">Revenue by Plan</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={planBreakdown} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => fmt(v)} />
                <YAxis type="category" dataKey="plan" width={140} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip {...CHART_STYLE} formatter={(v) => fmt(Number(v))} />
                <Bar dataKey="revenue" fill="#FB923C" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-heading text-sm font-700 text-[#111827]">All Payment Orders</h2>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💳</div>
            <p className="font-heading font-700 text-[#111827]">No payment orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#9CA3AF] border-b border-[#E5E7EB]">
                  <th className="px-5 py-2.5 font-600">Date</th>
                  <th className="px-5 py-2.5 font-600">Email</th>
                  <th className="px-5 py-2.5 font-600">Plan</th>
                  <th className="px-5 py-2.5 font-600">Amount</th>
                  <th className="px-5 py-2.5 font-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const profile = getProfile(order)
                  return (
                    <tr key={order.id} className="border-b border-[#F5F5F4] last:border-0">
                      <td className="px-5 py-3 text-[#6B7280] whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-[#111827] truncate max-w-[180px]">
                        {profile?.email || profile?.full_name || '—'}
                      </td>
                      <td className="px-5 py-3 text-[#6B7280]">{order.role} · {order.plan}</td>
                      <td className="px-5 py-3 font-700 text-[#111827]">{fmt(order.amount || 0)}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-700 px-2.5 py-0.5 rounded-full"
                          style={order.status === 'paid'
                            ? { background: 'rgba(16,185,129,0.1)', color: '#22C55E', border: '1px solid rgba(16,185,129,0.3)' }
                            : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
