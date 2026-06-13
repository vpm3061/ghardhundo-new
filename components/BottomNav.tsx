'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    href: '/properties',
    label: 'Properties',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="7" height="9"/><rect x="15" y="3" width="7" height="5"/>
        <rect x="15" y="12" width="7" height="9"/><rect x="2" y="16" width="7" height="5"/>
      </svg>
    ),
  },
  {
    href: '/list',
    label: 'List',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    isPrimary: true,
  },
  {
    href: '/dealer',
    label: 'Buyers',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-pb">
      <div className="mx-3 mb-3 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(18,18,26,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center">
          {TABS.map(tab => {
            const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
            if (tab.isPrimary) {
              return (
                <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-3 gap-0.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
                    <span className="text-white">{tab.icon(true)}</span>
                  </div>
                  <span className="text-[10px] font-600 text-[#8B8BA8] mt-0.5">{tab.label}</span>
                </Link>
              )
            }
            return (
              <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-3.5 gap-1 relative">
                <span className={active ? 'text-[#A78BFA]' : 'text-[#4A4A6A]'}>
                  {tab.icon(active)}
                </span>
                <span className={`text-[10px] font-600 transition-colors ${active ? 'text-[#A78BFA]' : 'text-[#4A4A6A]'}`}>
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7C3AED]" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
