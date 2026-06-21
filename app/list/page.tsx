import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'List Property — Orenzaa',
  description: 'List your property for free as an owner, or access buyer leads as an agent/dealer, or showcase projects as a builder.',
}

const CARDS = [
  {
    icon: '🏗️',
    title: 'Builder / Developer',
    subtitle: 'Apne naye projects list karo',
    features: ['Unlimited project uploads', 'Analytics dashboard', 'Lead management'],
    btn: 'See Packages →',
    href: '/pricing#builder',
    accentColor: '#FB923C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    badge: null,
  },
  {
    icon: '🤝',
    title: 'Agent / Dealer / Channel Partner',
    subtitle: 'Properties list karo, leads kamao',
    features: ['AI scored buyer leads', 'Commission tracking', 'Site visit management'],
    btn: 'See Plans →',
    href: '/pricing#dealer',
    accentColor: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.04)',
    borderColor: 'rgba(59,130,246,0.2)',
    badge: null,
  },
  {
    icon: '🏠',
    title: 'Owner',
    subtitle: 'Apna ghar ya plot list karo',
    features: ['Free listing', 'Direct buyer contact', 'No commission'],
    btn: 'List Free →',
    href: '/owner/list',
    accentColor: '#22C55E',
    bgColor: 'rgba(34,197,94,0.04)',
    borderColor: 'rgba(34,197,94,0.2)',
    badge: 'FREE',
  },
]

export default function ListPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-28 md:pb-16">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-700 tracking-wider uppercase mb-5 bg-orange-50 border border-orange-200 text-[#FB923C]">
            Property Listing
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-800 mb-3 text-[#111827]">
            Kaun hain aap?
          </h1>
          <p className="text-base max-w-md mx-auto text-[#6B7280]">
            Apni category choose karo — har type ke liye alag features hain.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {CARDS.map(card => (
            <a key={card.title} href={card.href}
              className="relative flex flex-col rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-[1.02] bg-white border border-[#E5E7EB] hover:border-[#FB923C]/30">
              {card.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-800 px-2.5 py-1 rounded-full bg-green-50 text-[#22C55E] border border-green-200">
                  {card.badge}
                </span>
              )}
              <div className="text-4xl mb-4">{card.icon}</div>
              <h2 className="font-heading text-xl font-800 mb-1 text-[#111827]">{card.title}</h2>
              <p className="text-sm mb-5 text-[#6B7280]">{card.subtitle}</p>
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {card.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#374151]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <circle cx="7" cy="7" r="7" fill={`${card.accentColor}22`} />
                      <path d="M4 7l2 2 4-4" stroke={card.accentColor} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="text-sm font-700 py-2.5 text-center rounded-xl transition-all"
                style={{ background: card.bgColor, border: `1px solid ${card.borderColor}`, color: card.accentColor }}>
                {card.btn}
              </div>
            </a>
          ))}
        </div>

      </main>
      <MobileNav />
    </>
  )
}
