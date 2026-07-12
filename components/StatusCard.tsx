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

      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, 1080, 1920)

      if (property.photos?.[0]) {
        try {
          const img = await loadImage(property.photos[0])
          const scale = Math.max(1080 / img.width, 1000 / img.height)
          const w = img.width * scale, h = img.height * scale
          ctx.drawImage(img, (1080 - w) / 2, 0, w, h)
          const gradient = ctx.createLinearGradient(0, 600, 0, 1000)
          gradient.addColorStop(0, 'rgba(17,24,39,0)')
          gradient.addColorStop(1, 'rgba(17,24,39,1)')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 600, 1080, 400)
        } catch { /* fall back to solid background if the photo can't be loaded/drawn */ }
      }

      ctx.fillStyle = '#FB923C'
      ctx.fillRect(0, 0, 1080, 120)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 60px Arial'
      ctx.fillText('ORENZAA', 60, 80)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 64px Arial'
      const title = property.title.length > 26 ? property.title.slice(0, 24) + '…' : property.title
      ctx.fillText(title, 60, 1080)

      ctx.fillStyle = '#D1D5DB'
      ctx.font = '42px Arial'
      const loc = [property.locality || property.sector, property.city].filter(Boolean).join(', ')
      ctx.fillText(`📍 ${loc}`, 60, 1150)

      ctx.fillStyle = '#22C55E'
      ctx.font = '800 90px Arial'
      ctx.fillText(fmtPrice(property), 60, 1280)

      const details = [
        property.bhk?.length ? `${property.bhk.join('/')} BHK` : null,
        property.property_category,
        property.rera_number ? 'RERA Verified' : null,
      ].filter(Boolean).join('   ·   ')
      ctx.fillStyle = '#D1D5DB'
      ctx.font = '40px Arial'
      ctx.fillText(details, 60, 1350)

      ctx.fillStyle = '#FB923C'
      roundRect(ctx, 60, 1420, 960, 100, 20)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 36px Arial'
      ctx.fillText(`orenzaa.com/property/${property.id}`, 90, 1482)

      ctx.fillStyle = '#9CA3AF'
      ctx.font = '38px Arial'
      if (property.owner_contact) ctx.fillText(`Contact: ${property.owner_contact}`, 60, 1620)
      ctx.fillText('Powered by Orenzaa.com', 60, 1670)

      const link = document.createElement('a')
      link.download = `orenzaa-${property.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
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
