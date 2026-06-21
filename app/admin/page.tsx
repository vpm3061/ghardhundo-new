import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { data: leads },
    { data: properties },
    { data: dealerSubs },
    { data: builderPkgs },
    { data: donations },
    { data: coinConvs },
    { data: payments },
  ] = await Promise.all([
    supabase.from('leads').select('tier, status, created_at'),
    supabase.from('properties').select('is_active, is_featured'),
    supabase.from('dealer_subscriptions').select('amount, status').eq('status', 'Active'),
    supabase.from('builder_packages').select('amount, status').eq('status', 'Active'),
    supabase.from('donated_listings').select('status').eq('status', 'Pending'),
    supabase.from('coin_conversions').select('cash_amount, status').eq('status', 'Pending'),
    supabase.from('payment_orders').select('amount, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const hotToday   = (leads || []).filter(l => l.tier === 'HOT' && new Date(l.created_at) >= today).length
  const totalLeads = (leads || []).length
  const dealerMRR  = (dealerSubs  || []).reduce((s, d) => s + (d.amount || 0), 0)
  const builderMRR = (builderPkgs || []).reduce((s, b) => s + (b.amount || 0), 0)
  const totalMRR   = dealerMRR + builderMRR
  const pendingDonations = (donations || []).length
  const pendingCoins     = (coinConvs || []).reduce((s, c) => s + (c.cash_amount || 0), 0)
  const activeProperties = (properties || []).filter(p => p.is_active).length
  const dealsDone        = (leads || []).filter(l => l.status === 'Deal Done').length

  const STATS = [
    { label: 'HOT Leads Today', value: hotToday,         icon: '⚡', color: '#EF4444', href: '/admin/leads'      },
    { label: 'Total Leads',     value: totalLeads,        icon: '👥', color: '#F59E0B', href: '/admin/leads'      },
    { label: 'Deals Done',      value: dealsDone,         icon: '✅', color: '#22C55E', href: '/admin/leads'      },
    { label: 'Total MRR',       value: `₹${totalMRR.toLocaleString('en-IN')}`, icon: '💰', color: '#FB923C', href: '/admin/commissions' },
    { label: 'Dealer MRR',      value: `₹${dealerMRR.toLocaleString('en-IN')}`, icon: '📈', color: '#FB923C', href: '/admin/dealers' },
    { label: 'Builder MRR',     value: `₹${builderMRR.toLocaleString('en-IN')}`, icon: '🏗️', color: '#FB923C', href: '/admin/builders' },
    { label: 'Active Listings', value: activeProperties, icon: '🏢', color: '#3B82F6', href: '/admin/properties'  },
    { label: 'Pending Donations', value: pendingDonations, icon: '🎁', color: '#F59E0B', href: '/admin/donations' },
    { label: 'Coins to Pay Out', value: `₹${pendingCoins.toLocaleString('en-IN')}`, icon: '🪙', color: '#F59E0B', href: '/admin/coins' },
  ]

  const QUICK_LINKS = [
    { href: '/admin/leads',       label: 'View all Leads',   icon: '👥' },
    { href: '/admin/properties',  label: 'Manage Properties', icon: '🏢' },
    { href: '/admin/builders',    label: 'Builder Accounts', icon: '🏗️' },
    { href: '/admin/dealers',     label: 'Dealer Accounts',  icon: '📈' },
    { href: '/admin/commissions', label: 'Revenue Dashboard', icon: '💰' },
    { href: '/admin/donations',   label: 'Approve Donations', icon: '🎁' },
    { href: '/admin/coins',       label: 'Coin Payouts',     icon: '🪙'  },
    { href: '/admin/payments',    label: 'Payment Orders',   icon: '💳' },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-800 text-[#111827]">Admin Overview</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {STATS.map(s => (
          <Link key={s.label} href={s.href}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-4 transition-all hover:shadow-md hover:border-[#FB923C]/30">
            <div className="text-sm mb-1">{s.icon} <span className="text-xs font-600 text-[#6B7280]">{s.label}</span></div>
            <div className="font-heading text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <h2 className="font-heading text-lg font-700 mb-4 text-[#111827]">Quick Access</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {QUICK_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-white border border-[#E5E7EB] hover:border-[#FB923C]/40 hover:shadow-sm">
              <span className="text-xl">{l.icon}</span>
              <span className="text-sm font-600 text-[#111827]">{l.label}</span>
              <span className="ml-auto text-[#9CA3AF]">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent payments */}
      {payments && payments.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-700 mb-4 text-[#111827]">Recent Payments</h2>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-600 text-[#111827]">{p.status === 'paid' ? '✅' : '🕐'} {p.status}</div>
                  <div className="text-xs text-[#6B7280]">
                    {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="font-heading font-800 text-[#FB923C]">₹{(p.amount || 0).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
