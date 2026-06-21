'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/',
    label: 'Home',
    exact: true,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    href: '/properties',
    label: 'Properties',
    exact: false,
    icon: (_active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/share-earn',
    label: '✨ Earn',
    exact: false,
    isPrimary: true,
    icon: (_active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
    ),
  },
  {
    href: '/list',
    label: 'List',
    exact: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    exact: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      suppressHydrationWarning
    >
      <div className="flex items-center">
        {TABS.map(tab => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)

          if (tab.isPrimary) {
            return (
              <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-2.5 gap-1">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FB923C, #F59E0B)',
                    boxShadow: '0 4px 16px rgba(251,146,60,0.35)',
                  }}
                >
                  <span className="text-white">{tab.icon(true)}</span>
                </div>
                <span className="text-[10px] font-600" style={{ color: '#FB923C' }}>{tab.label}</span>
              </Link>
            )
          }

          return (
            <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-3 gap-1 relative">
              {active && (
                <span
                  className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: '#FB923C' }}
                />
              )}
              <span style={{ color: active ? '#FB923C' : '#9CA3AF' }}>
                {tab.icon(active)}
              </span>
              <span
                className="text-[10px] font-600 transition-colors"
                style={{ color: active ? '#FB923C' : '#9CA3AF' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
