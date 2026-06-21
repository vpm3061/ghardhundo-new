'use client'
import { useState, useEffect } from 'react'

interface WhatsAppButtonProps {
  propertyTitle: string
  price: string
  location: string
  propertyId: string
  referralUserId?: string
  tags?: string[]
  label?: string
  className?: string
}

export default function WhatsAppButton({
  propertyTitle, price, location, propertyId, referralUserId, tags, label = 'Share', className = '',
}: WhatsAppButtonProps) {
  const [href, setHref] = useState('https://wa.me/')

  useEffect(() => {
    const path = referralUserId
      ? `/p/${propertyId}?ref=${referralUserId}`
      : `/property/${propertyId}`
    const url = window.location.origin + path
    const tagLine = tags?.length ? `\n\n${tags.join(' ')}` : ''
    const text = `Dekho ye property Orenzaa pe — ${propertyTitle}, ${price}, ${location}: ${url}${tagLine}`
    setHref('https://wa.me/?text=' + encodeURIComponent(text))
  }, [propertyTitle, price, location, propertyId, referralUserId, tags])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      suppressHydrationWarning
      className={`flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-full transition-all ${className}`}
      style={{
        background: 'rgba(37,211,102,0.12)',
        border: '1px solid rgba(37,211,102,0.3)',
        color: '#25D366',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.53 5.857L0 24l6.335-1.502A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.66-.502-5.193-1.382l-.373-.22-3.76.892.944-3.66-.242-.386A9.98 9.98 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      {label}
    </a>
  )
}
