'use client'
import { useState } from 'react'
import type { Property } from '@/lib/supabase/types'

const fmtPrice = (p: Property) => {
  if (p.monthly_rent) return `₹${p.monthly_rent.toLocaleString('en-IN')}/month`
  if (p.price_min) {
    const n = p.price_min
    return n >= 1e7 ? `₹${(n / 1e7).toFixed(1)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : `₹${n.toLocaleString('en-IN')}`
  }
  return 'Price on request'
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export default function StatusCard({ property }: { property: Property }) {
  const [generating, setGenerating] = useState(false)

  const download = async () => {
    setGenerating(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Background — dark gradient
      const bg = ctx.createLinearGradient(0, 0, 0, 1920)
      bg.addColorStop(0, '#0F172A')
      bg.addColorStop(1, '#1E293B')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, 1080, 1920)

      // Property photo — full-bleed top portion, cropped to cover (no stretching)
      if (property.photos?.[0]) {
        try {
          const img = await loadImage(property.photos[0])
          const photoH = 1060
          ctx.save()
          ctx.beginPath()
          ctx.rect(0, 0, 1080, photoH)
          ctx.clip()
          const scale = Math.max(1080 / img.width, photoH / img.height)
          const w = img.width * scale, h = img.height * scale
          ctx.drawImage(img, (1080 - w) / 2, (photoH - h) / 2, w, h)
          ctx.restore()

          const photoOverlay = ctx.createLinearGradient(0, 700, 0, photoH)
          photoOverlay.addColorStop(0, 'rgba(15,23,42,0)')
          photoOverlay.addColorStop(1, 'rgba(15,23,42,0.9)')
          ctx.fillStyle = photoOverlay
          ctx.fillRect(0, 700, 1080, photoH - 700)
        } catch { /* fall back to solid background if the photo can't be loaded/drawn */ }
      }

      // Orange top bar with ORENZAA logo
      ctx.fillStyle = '#FB923C'
      ctx.fillRect(0, 0, 1080, 100)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 56px Arial'
      ctx.fillText('ORENZAA', 50, 68)

      // Property type badge, sized to fit its label
      const badgeLabel = property.property_category === 'rental' ? '🏠 RENTAL'
        : property.property_category === 'plot' ? '🌍 PLOT'
        : property.property_category === 'commercial' ? '🏪 COMMERCIAL'
        : '🏢 FLAT'
      ctx.font = '800 32px Arial'
      const badgeW = ctx.measureText(badgeLabel).width + 60
      ctx.fillStyle = '#FB923C'
      roundRect(ctx, 50, 950, badgeW, 64, 32)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(badgeLabel, 80, 992)

      // Property title — big and bold
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 72px Arial'
      const title = property.title.toUpperCase()
      ctx.fillText(title.length > 20 ? title.slice(0, 19) + '…' : title, 50, 1130)

      // Location
      ctx.fillStyle = '#94A3B8'
      ctx.font = '40px Arial'
      const loc = [property.locality || property.sector, property.city].filter(Boolean).join(', ')
      ctx.fillText(`📍 ${loc}`, 50, 1200)

      // Price — big green (smaller font if the fallback text runs long)
      ctx.fillStyle = '#22C55E'
      const priceText = fmtPrice(property)
      ctx.font = priceText.length > 12 ? '800 56px Arial' : '800 90px Arial'
      ctx.fillText(priceText, 50, 1330)

      // Details row
      ctx.fillStyle = '#CBD5E1'
      ctx.font = '38px Arial'
      const details = [
        property.bhk?.length ? `${property.bhk.join('/')} BHK` : null,
        property.property_category,
        property.rera_number ? 'RERA Verified' : null,
      ].filter(Boolean).join('   ·   ')
      ctx.fillText(details, 50, 1410)

      // Divider line
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, 1460)
      ctx.lineTo(1030, 1460)
      ctx.stroke()

      // Link box — orange rounded rect
      ctx.fillStyle = '#FB923C'
      roundRect(ctx, 50, 1490, 980, 100, 20)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 34px Arial'
      const link = `orenzaa.com/property/${property.id}`
      ctx.fillText(link.length > 42 ? link.slice(0, 42) : link, 80, 1552)

      // Expert / owner contact
      ctx.fillStyle = '#64748B'
      ctx.font = '34px Arial'
      if (property.owner_contact) ctx.fillText(`Contact: ${property.owner_contact}`, 50, 1640)

      // Powered by
      ctx.fillStyle = '#475569'
      ctx.font = '30px Arial'
      ctx.fillText('Powered by Orenzaa.com', 50, 1690)

      // Bottom orange strip with tagline
      ctx.fillStyle = '#FB923C'
      ctx.fillRect(0, 1820, 1080, 100)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Find Where Life Belongs', 540, 1878)
      ctx.textAlign = 'left'

      const linkEl = document.createElement('a')
      linkEl.download = `orenzaa-${property.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`
      linkEl.href = canvas.toDataURL('image/png')
      linkEl.click()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button onClick={download} disabled={generating} suppressHydrationWarning
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 text-white transition-all disabled:opacity-50"
      style={{ background: '#25D366' }}>
      {generating ? 'Generating…' : '📲 Share Status'}
    </button>
  )
}
