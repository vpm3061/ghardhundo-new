'use client'
import { useEffect, useState } from 'react'

type Offer = { id: string; title: string; description: string | null; valid_till: string | null }

function Countdown({ validTill }: { validTill: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(validTill).getTime() - Date.now()
      if (diff <= 0) { setText('Offer expired'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      if (days > 30) {
        setText(`Valid till ${new Date(validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`)
      } else if (days > 0) {
        setText(`Expires in ${days}d ${hours}h`)
      } else if (hours > 0) {
        setText(`Expires in ${hours}h ${mins}m`)
      } else {
        setText(`Expires in ${mins}m`)
      }
    }
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [validTill])

  return <>{text}</>
}

export default function OffersDisplay({ offers }: { offers: Offer[] }) {
  if (!offers || offers.length === 0) return null

  return (
    <div className="mb-5">
      <h2 className="font-heading text-lg font-700 mb-3" style={{ color: '#111827' }}>
        🎁 Special Offers
      </h2>
      <div className="flex flex-col gap-3">
        {offers.map(offer => (
          <div key={offer.id} className="rounded-xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(16,185,129,0.02))',
              border: '1px solid rgba(16,185,129,0.22)',
            }}>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: '#22C55E', filter: 'blur(40px)', opacity: 0.07 }} />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <div>
                  <p className="font-700 text-sm" style={{ color: '#111827' }}>{offer.title}</p>
                  {offer.description && (
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6B7280' }}>
                      {offer.description}
                    </p>
                  )}
                </div>
              </div>

              {offer.valid_till && (
                <div className="shrink-0 text-[10px] font-700 px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    color: '#22C55E',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                  <Countdown validTill={offer.valid_till} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
