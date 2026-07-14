'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MENU = [
  { href: '/admin',             icon: '📊', label: 'Dashboard'   },
  { href: '/admin/leads',       icon: '👥', label: 'Leads'       },
  { href: '/admin/properties',  icon: '🏢', label: 'Properties'  },
  { href: '/admin/builders',    icon: '🏗️', label: 'Builders'    },
  { href: '/admin/experts',     icon: '🤝', label: 'Experts'     },
  { href: '/admin/cpl',         icon: '🎯', label: 'CPL Deals'   },
  { href: '/admin/banners',     icon: '🖼️', label: 'Banners'     },
  { href: '/admin/advertise-enquiries', icon: '📢', label: 'Ad Enquiries' },
  { href: '/admin/verifications', icon: '✅', label: 'Verifications' },
  { href: '/admin/payments',    icon: '💳', label: 'Revenue'     },
  { href: '/admin/traffic',     icon: '🌐', label: 'Traffic'     },
]

export default function AdminLayoutClient({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const currentLabel = MENU.find(m => isActive(m.href))?.label || 'Dashboard'

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF9]">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full w-56 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#FFFFFF', borderRight: '1px solid #E5E7EB', boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #FB923C, #F59E0B)' }}>
              O
            </div>
            <div className="min-w-0">
              <p className="font-heading font-800 text-sm text-[#111827]">ORENZ<span style={{ color: '#FB923C' }}>AA</span></p>
              <p className="text-[10px] text-[#9CA3AF]">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {MENU.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm"
                style={{
                  background: active ? '#FFF7ED' : 'transparent',
                  border: active ? '1px solid #FED7AA' : '1px solid transparent',
                  color: active ? '#FB923C' : '#6B7280',
                }}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <span className="font-500">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#FB923C' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E7EB]">
          <Link href="/" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAF9]">
            <span>←</span> Back to Site
          </Link>
          <div className="px-3 py-1.5 text-[10px] truncate text-[#9CA3AF]">{userEmail}</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="md:ml-56 flex-1 min-h-screen flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors border border-[#E5E7EB] bg-white text-[#374151]"
              onClick={() => setSidebarOpen(v => !v)}
              suppressHydrationWarning
            >
              {sidebarOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
            <h1 className="font-heading font-700 text-sm sm:text-base text-[#111827]">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-700 px-2.5 py-1 rounded-full hidden sm:inline-block bg-orange-50 text-[#FB923C] border border-orange-200">
              ADMIN
            </span>
            <button onClick={handleSignOut} suppressHydrationWarning
              className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors">
              Sign out
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 bg-[#FAFAF9]">
          {children}
        </div>

      </main>
    </div>
  )
}
