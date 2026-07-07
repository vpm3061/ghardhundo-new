'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const NAV_LINKS: { href: string; label: string; highlight?: boolean }[] = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/list-property', label: 'List Property', highlight: true },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUser(user)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading font-800 text-xl tracking-tight text-[#111827]">
          ORENZ<span className="text-[#FB923C]">AA</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = pathname === l.href
            if (l.highlight) {
              return (
                <Link key={l.href} href={l.href}
                  className="relative px-3.5 py-1.5 rounded-full text-sm font-700 transition-all"
                  style={active
                    ? { background: '#FFF7ED', color: '#FB923C', border: '1px solid #FED7AA' }
                    : { background: '#FFF7ED', color: '#FB923C', border: '1px solid #FED7AA' }}>
                  💎 {l.label}
                </Link>
              )
            }
            if ((l as { shareEarn?: boolean }).shareEarn) {
              return (
                <Link key={l.href} href={l.href}
                  className="relative px-3.5 py-1.5 rounded-full text-sm font-700 transition-all"
                  style={active
                    ? { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' }
                    : { color: '#F59E0B' }}>
                  {l.label}
                </Link>
              )
            }
            return (
              <Link key={l.href} href={l.href}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-500 transition-all ${
                  active ? 'text-[#FB923C] bg-[#FFF7ED]' : 'text-[#374151] hover:text-[#111827] hover:bg-[#FAFAF9]'
                }`}>
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profile"
                className="text-sm text-[#374151] hover:text-[#111827] transition-colors px-3 py-2 rounded-lg hover:bg-[#FAFAF9]">
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                suppressHydrationWarning
                className="text-sm text-[#374151] hover:text-[#111827] transition-colors px-3 py-2 rounded-lg hover:bg-[#FAFAF9]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-[#374151] hover:text-[#111827] transition-colors px-3 py-2 rounded-lg hover:bg-[#FAFAF9]">
                Sign in
              </Link>
              <Link href="/login"
                className="px-4 py-2 bg-[#FB923C] hover:bg-[#F59E0B] text-white rounded-lg font-semibold text-sm transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="text-[#374151] hover:text-[#111827] p-2 rounded-lg border border-[#E5E7EB] bg-white transition-all"
            onClick={() => setMenuOpen(v => !v)}
            suppressHydrationWarning
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] px-4 py-4 flex flex-col gap-1 bg-white shadow-lg rounded-b-2xl">
          {NAV_LINKS.map(l => {
            const lx = l as { href: string; label: string; highlight?: boolean; shareEarn?: boolean }
            return (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm transition-all font-${lx.highlight || lx.shareEarn ? '700' : '500'}`}
                style={
                  pathname === l.href && lx.shareEarn
                    ? { color: '#F59E0B', background: 'rgba(245,158,11,0.08)' }
                  : lx.shareEarn
                    ? { color: '#F59E0B' }
                  : pathname === l.href && lx.highlight
                    ? { color: '#FB923C', background: '#FFF7ED' }
                  : lx.highlight
                    ? { color: '#FB923C' }
                  : pathname === l.href
                    ? { color: '#FB923C', background: '#FFF7ED' }
                  : { color: '#374151' }
                }>
                {l.label}
              </Link>
            )
          })}
          {user ? (
            <button
              onClick={handleSignOut}
              suppressHydrationWarning
              className="mt-2 px-4 py-3 rounded-xl text-sm text-[#374151] text-left hover:text-[#111827] hover:bg-[#FAFAF9] transition-all"
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="mt-2 px-4 py-3 rounded-xl text-sm text-center bg-[#FB923C] text-white font-semibold">
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
