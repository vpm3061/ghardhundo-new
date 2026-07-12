'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const HOME_ICON = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
)
const SEARCH_ICON = (_active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const PLUS_ICON = (_active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const PROFILE_ICON = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function MobileNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ role: string; expert_registered: boolean } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUser(user)
      supabase.from('profiles').select('role, expert_registered')
        .eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email === 'tellitorg1@gmail.com'
  const isExpert = profile?.role === 'expert' || !!profile?.expert_registered
  const profileTab = isAdmin
    ? { href: '/admin', label: 'Admin' }
    : isExpert
      ? { href: '/expert', label: 'Dashboard' }
      : { href: '/profile', label: 'Profile' }

  const TABS = [
    { href: '/', label: 'Home', exact: true, icon: HOME_ICON },
    { href: '/properties', label: 'Properties', exact: false, icon: SEARCH_ICON },
    { href: '/list-property', label: 'List', exact: false, isPrimary: true, icon: PLUS_ICON },
    { href: '/advertise', label: 'Ads', exact: false, icon: (_active: boolean) => <span className="text-[18px] leading-none">📢</span> },
    { href: profileTab.href, label: profileTab.label, exact: false, icon: PROFILE_ICON },
  ]

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
