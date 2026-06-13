'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/pricing', label: 'Pricing', highlight: true },
  { href: '/list', label: 'List Property' },
  { href: '/dealer', label: 'Find Buyers' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [coins, setCoins] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('coins').select('amount, type').eq('user_id', user.id).then(({ data }) => {
        if (!data) return
        setCoins(data.reduce((s, c) => s + (c.type === 'earned' ? c.amount : -c.amount), 0))
      })
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
        : 'bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/[0.04]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <span className="font-heading font-800 text-lg tracking-tight text-[#F1F0FF] group-hover:text-white transition-colors">
            GharDhundo
          </span>
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
                    ? { background: 'rgba(124,58,237,0.25)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.5)' }
                    : { background: 'rgba(124,58,237,0.08)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }}>
                  💎 {l.label}
                </Link>
              )
            }
            return (
              <Link key={l.href} href={l.href}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-500 transition-all ${
                  active ? 'text-[#A78BFA] bg-[rgba(124,58,237,0.1)]' : 'text-[#8B8BA8] hover:text-[#F1F0FF] hover:bg-white/[0.04]'
                }`}>
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {coins !== null && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-600"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}>
              <span>🪙</span>
              <span>{coins}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            suppressHydrationWarning
            className="text-sm text-[#8B8BA8] hover:text-[#F1F0FF] transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]"
          >
            Sign out
          </button>
        </div>

        {/* Mobile right */}
        <div className="md:hidden flex items-center gap-2">
          {coins !== null && (
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-600"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}>
              🪙 {coins}
            </div>
          )}
          <button
            className="text-[#8B8BA8] hover:text-[#F1F0FF] p-2 rounded-lg hover:bg-white/[0.04] transition-all"
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
        <div className="md:hidden border-t border-white/[0.06] px-4 py-4 flex flex-col gap-1"
          style={{ background: 'rgba(18,18,26,0.95)', backdropFilter: 'blur(20px)' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm transition-all ${
                l.highlight ? 'font-700' : 'font-500'
              } ${
                pathname === l.href
                  ? 'text-[#A78BFA] bg-[rgba(124,58,237,0.1)]'
                  : l.highlight
                    ? 'text-[#A78BFA] hover:bg-[rgba(124,58,237,0.08)]'
                    : 'text-[#8B8BA8] hover:text-[#F1F0FF] hover:bg-white/[0.04]'
              }`}>
              {l.highlight ? `💎 ${l.label}` : l.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            suppressHydrationWarning
            className="mt-2 px-4 py-3 rounded-xl text-sm text-[#8B8BA8] text-left hover:text-[#F1F0FF] hover:bg-white/[0.04] transition-all"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
