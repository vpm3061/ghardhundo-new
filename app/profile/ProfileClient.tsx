'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  email: string
  fullName: string | null
  phone: string | null
  avatarUrl: string | null
  coinBalance: number
}

export default function ProfileClient({ userId, email, fullName, phone, avatarUrl, coinBalance }: Props) {
  const router = useRouter()

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/properties?ref=${userId}`
    : `/properties?ref=${userId}`

  const copyReferral = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralUrl)
    }
  }

  const initials = (fullName || email).slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col gap-5">
      {/* Avatar + name */}
      <div className="glass p-6 flex items-center gap-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-800 text-xl shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#F1F0FF' }}>
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-heading font-800 text-lg truncate" style={{ color: '#F1F0FF' }}>
            {fullName || 'User'}
          </div>
          <div className="text-sm truncate" style={{ color: '#8B8BA8' }}>{email}</div>
          {phone && <div className="text-xs mt-1" style={{ color: '#4A4A6A' }}>{phone}</div>}
        </div>
      </div>

      {/* Coins */}
      <div className="glass p-5 flex items-center justify-between"
        style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
        <div>
          <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#4A4A6A' }}>Coin Balance</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-heading font-800 text-2xl" style={{ color: '#A78BFA' }}>{coinBalance}</span>
            <span className="text-sm" style={{ color: '#8B8BA8' }}>coins</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: '#4A4A6A' }}>Each coin = ₹1</div>
          <div className="text-xs mt-0.5" style={{ color: '#4A4A6A' }}>Reveal leads for 10 🪙</div>
        </div>
      </div>

      {/* Referral */}
      <div className="glass p-5">
        <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#4A4A6A' }}>Your Referral Link</div>
        <p className="text-xs mb-3" style={{ color: '#8B8BA8' }}>
          Share this link. When someone books via it, you earn <span className="font-700" style={{ color: '#A78BFA' }}>0.25% of the deal value</span>.
        </p>
        <div className="flex gap-2">
          <div className="flex-1 text-xs px-3 py-2.5 rounded-xl truncate font-mono"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#8B8BA8' }}
            suppressHydrationWarning>
            {referralUrl}
          </div>
          <button onClick={copyReferral} suppressHydrationWarning
            className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-700 transition-all"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
            Copy
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="glass p-5">
        <div className="text-xs font-700 uppercase tracking-wider mb-3" style={{ color: '#4A4A6A' }}>Quick Links</div>
        <div className="flex flex-col gap-2">
          {[
            { href: '/properties', label: '🔍 Browse Properties' },
            { href: '/ai',         label: '🤖 AI Match' },
            { href: '/list',       label: '🏢 List a Property' },
            { href: '/pricing',    label: '💎 Pricing Plans' },
          ].map(({ href, label }) => (
            <a key={href} href={href}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#8B8BA8' }}>
              {label}
              <span style={{ color: '#4A4A6A' }}>→</span>
            </a>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={signOut} suppressHydrationWarning
        className="w-full py-3 rounded-xl text-sm font-700 transition-all"
        style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
        Sign Out
      </button>
    </div>
  )
}
