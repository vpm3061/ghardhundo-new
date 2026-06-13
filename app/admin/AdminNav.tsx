'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin',               label: 'Leads',       icon: '👥' },
  { href: '/admin/properties',    label: 'Properties',  icon: '🏢' },
  { href: '/admin/commissions',   label: 'Commissions', icon: '💰' },
]

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-40"
      style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-heading font-800 text-[#F1F0FF] text-base">GharDhundo</span>
            <span className="text-[10px] font-700 tracking-wider uppercase px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
              Admin
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-0.5">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background: pathname === item.href ? 'rgba(124,58,237,0.12)' : 'transparent',
                  color: pathname === item.href ? '#A78BFA' : '#8B8BA8',
                }}
                onMouseEnter={e => { if (pathname !== item.href) (e.currentTarget as HTMLElement).style.color = '#F1F0FF' }}
                onMouseLeave={e => { if (pathname !== item.href) (e.currentTarget as HTMLElement).style.color = '#8B8BA8' }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-[#4A4A6A]">{userEmail}</span>
          <Link href="/" className="text-xs text-[#8B8BA8] hover:text-[#F1F0FF] transition-colors">← Site</Link>
          <button onClick={handleSignOut} className="text-xs text-[#8B8BA8] hover:text-[#F1F0FF] transition-colors" suppressHydrationWarning>
            Sign out
          </button>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <div className="sm:hidden flex border-t border-white/[0.06]">
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href}
            className="flex-1 flex flex-col items-center py-2.5 text-xs gap-0.5 transition-colors"
            style={{ color: pathname === item.href ? '#A78BFA' : '#4A4A6A' }}>
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
