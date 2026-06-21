'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FAQ = [
  { q: 'Kitna milega?',  a: 'Deal amount ka 0.25% — ₹60L deal pe ₹15,000.' },
  { q: 'Kab milega?',    a: 'Deal confirm hone ke 30 din baad UPI pe transfer.' },
  { q: 'Limit hai?',     a: 'Koi limit nahi — jitna share utna earn.' },
  { q: 'Kaise milega?',  a: 'Apna UPI ID profile mein daalo, hum seedha transfer karte hain.' },
]

export default function ShareEarnClient({
  userId, referralCode, topEarners,
}: {
  userId: string | null
  referralCode: string | null
  topEarners: { masked: string; earned: number }[]
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://orenzaa.com'
  const referralLink = referralCode ? `${origin}/properties?ref=${referralCode}` : ''

  const copy = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 pb-28 md:pb-16">

      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">💰</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-800 mb-3 text-[#111827]">
          Share Karo, <span className="text-[#FB923C]">Kamaao Karo</span>
        </h1>
        <p className="text-base max-w-md mx-auto text-[#6B7280]">
          Kisi ko bhi property recommend karo — deal hone par earn karo
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
        <h2 className="font-heading font-800 text-lg mb-6 text-[#111827]">Kaise Kaam Karta Hai</h2>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-orange-100" />
          <div className="flex flex-col gap-6">
            {[
              { icon: '🔗', step: '1', text: 'Apna referral link copy karo' },
              { icon: '🏠', step: '2', text: 'Kisi ko bhi share karo — WhatsApp, Instagram, family, friends' },
              { icon: '💰', step: '3', text: 'Wo property kharide to aapko commission milega' },
            ].map(({ icon, step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 bg-orange-50 border border-orange-200 text-[#FB923C]">
                  {icon}
                </div>
                <div>
                  <div className="text-[10px] font-700 uppercase tracking-wider mb-0.5 text-[#9CA3AF]">Step {step}</div>
                  <div className="text-sm text-[#374151]">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Math highlight box */}
      <div className="mb-6 p-5 rounded-2xl text-center bg-orange-50 border border-orange-200">
        <div className="text-xs font-700 uppercase tracking-wider mb-2 text-[#9CA3AF]">Example earning</div>
        <div className="font-heading text-3xl font-800 mb-1 text-[#FB923C]">₹15,000</div>
        <div className="text-sm text-[#6B7280]">₹60 lakh flat pe 0.25% = sirf ek share se</div>
      </div>

      {/* Referral section */}
      {userId && referralLink ? (
        <div className="bg-white border border-orange-200 rounded-2xl p-6 mb-6">
          <h3 className="font-heading font-700 mb-1 text-[#111827]">Tera Referral Link</h3>
          <p className="text-xs mb-4 text-[#6B7280]">Iss link se aaye buyers automatically tere naam pe register honge.</p>
          <div className="flex gap-2 mb-3" suppressHydrationWarning>
            <div className="flex-1 text-xs px-3 py-2.5 rounded-xl truncate font-mono bg-[#FAFAF9] border border-[#E5E7EB] text-[#6B7280]">
              {referralLink}
            </div>
            <button onClick={copy} suppressHydrationWarning
              className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-700 transition-all"
              style={copied
                ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }
                : { background: '#FB923C', color: '#fff' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <a href={`https://wa.me/?text=${encodeURIComponent('Ye properties dekho: ' + referralLink)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-700 transition-all"
            style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}>
            Share on WhatsApp
          </a>
        </div>
      ) : (
        <div className="bg-white border border-orange-200 rounded-2xl p-8 mb-6 text-center">
          <div className="text-3xl mb-3">🔗</div>
          <p className="font-heading font-700 mb-3 text-[#111827]">Login karo aur apna link pao</p>
          <button onClick={() => router.push('/login')} suppressHydrationWarning
            className="btn-accent text-sm px-6 py-2.5 inline-block">
            Login to Get Your Link
          </button>
        </div>
      )}

      {/* Leaderboard */}
      {topEarners.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
          <h3 className="font-heading font-700 mb-4 flex items-center gap-2 text-[#111827]">
            🏆 Top Earners
          </h3>
          <div className="flex flex-col gap-2">
            {topEarners.map(({ masked, earned }, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#FAFAF9] border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 shrink-0"
                    style={{
                      background: i === 0 ? '#FFF7ED' : '#F5F5F4',
                      color: i === 0 ? '#FB923C' : '#9CA3AF',
                    }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-600 text-[#111827]">{masked}</span>
                </div>
                <span className="text-sm font-700 text-[#22C55E]">₹{earned.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        <h3 className="font-heading font-700 mb-4 text-[#111827]">FAQ</h3>
        <div className="flex flex-col gap-2">
          {FAQ.map(({ q, a }, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-[#E5E7EB]">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                suppressHydrationWarning
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-[#FAFAF9] hover:bg-[#F5F5F4] transition-colors">
                <span className="text-sm font-600 text-[#111827]">{q}</span>
                <span className="shrink-0 text-lg text-[#9CA3AF]">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 pt-1 text-sm text-[#6B7280]">{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}
