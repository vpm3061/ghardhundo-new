'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin',              label: 'Overview',     icon: '📊', exact: true  },
  { href: '/admin/leads',        label: 'Leads',        icon: '👥', exact: false },
  { href: '/admin/properties',   label: 'Properties',   icon: '🏢', exact: false },
  { href: '/admin/builders',     label: 'Builders',     icon: '🏗️', exact: false },
  { href: '/admin/dealers',      label: 'Dealers',      icon: '📈', exact: false },
  { href: '/admin/commissions',  label: 'Commissions',  icon: '💰', exact: false },
  { href: '/admin/donations',    label: 'Donations',    icon: '🎁', exact: false },
  { href: '/admin/coins',        label: 'Coins',        icon: '🪙', exact: false },
  { href: '/admin/payments',     label: 'Payments',     icon: '💳', exact: false },
  { href: '/admin/traffic',      label: 'Traffic',      icon: '🌐', exact: false },
]

const MOBILE_NAV = NAV_ITEMS.slice(0, 5)

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (item: typeof NAV_ITEMS[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <span className="font-heading font-800 text-[#111827] text-base">ORENZ<span className="text-[#FB923C]">AA</span></span>
            <span className="text-[10px] font-700 tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-50 text-[#FB923C] border border-orange-200">
              Admin
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap"
                style={{
                  background: isActive(item) ? '#FFF7ED' : 'transparent',
                  color: isActive(item) ? '#FB923C' : '#6B7280',
                }}>
                <span className="text-xs">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-[#9CA3AF]">{userEmail}</span>
          <Link href="/" className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors">← Site</Link>
          <button onClick={handleSignOut} suppressHydrationWarning
            className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors">
            Sign out
          </button>
        </div>
      </div>
      {/* Mobile bottom nav (first 5 items) */}
      <div className="lg:hidden flex border-t border-[#E5E7EB]">
        {MOBILE_NAV.map(item => (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center py-2 text-[10px] gap-0.5 transition-colors"
            style={{ color: isActive(item) ? '#FB923C' : '#9CA3AF' }}>
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
