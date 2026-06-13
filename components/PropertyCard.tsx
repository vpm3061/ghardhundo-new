'use client'
import Link from 'next/link'
import WhatsAppButton from './WhatsAppButton'
import type { Property } from '@/lib/supabase/types'
import { getShareTags } from '@/lib/property-tags'

const AMENITY_ICONS: Record<string, string> = {
  'Swimming Pool': '🏊',
  'Gym':           '🏋️',
  '24hr Security': '🔒',
  'Parking':       '🅿️',
  'Club House':    '🏛️',
  'Power Backup':  '⚡',
  'Garden':        '🌿',
  'Kids Zone':     '🎠',
}

const STATUS_LABEL: Record<string, string> = {
  'Ready to Move':      'Ready to Move',
  'Under Construction': 'Under Construction',
  'New Launch':         'New Launch',
}

function fmtPrice(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

function priceRange(min: number | null, max: number | null): string {
  if (min && max) return `${fmtPrice(min)} – ${fmtPrice(max)}`
  if (min) return `From ${fmtPrice(min)}`
  if (max) return `Up to ${fmtPrice(max)}`
  return 'Price on request'
}

export default function PropertyCard({ property, userId }: { property: Property; userId?: string }) {
  const photo = property.photos?.[0]
  const price = priceRange(property.price_min, property.price_max)
  const location = [property.sector, property.city].filter(Boolean).join(', ')
  const bhkStr = property.bhk?.length ? property.bhk.join('/') + ' BHK' : null
  const statusText = property.status ? STATUS_LABEL[property.status] : null
  const shareTags = getShareTags(property)

  return (
    <div
      className="glass overflow-hidden rounded-2xl group flex flex-col"
      style={property.is_featured
        ? { boxShadow: '0 0 0 1.5px rgba(245,158,11,0.45), 0 0 28px rgba(245,158,11,0.08)' }
        : {}}
    >
      {/* ── Photo ── */}
      <Link href={`/property/${property.id}`} className="block relative h-52 overflow-hidden bg-[#12121A] shrink-0">
        {photo ? (
          <img
            src={photo}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121A]/65 via-[#12121A]/10 to-transparent" />

        {/* Stacked badges — top-right */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {property.is_featured && (
            <span
              className="text-[10px] font-800 tracking-wider px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(245,158,11,0.18)',
                color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.45)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              ⭐ FEATURED
            </span>
          )}
          {property.rera_number && (
            <span
              className="text-[10px] font-700 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(16,185,129,0.14)',
                color: '#10B981',
                border: '1px solid rgba(16,185,129,0.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              ✓ RERA
            </span>
          )}
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1 gap-0">

        {/* Title */}
        <Link href={`/property/${property.id}`}>
          <h3 className="font-heading font-800 text-base leading-snug line-clamp-1 mb-1 transition-colors"
            style={{ color: '#F1F0FF' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#A78BFA')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#F1F0FF')}>
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        {location && (
          <p className="text-xs mb-3 flex items-center gap-1 truncate" style={{ color: '#8B8BA8' }}>
            <span className="shrink-0">📍</span>
            <span className="truncate">{location}</span>
          </p>
        )}

        {/* Price */}
        <p className="font-heading font-800 text-lg mb-0.5 leading-tight" style={{ color: '#A78BFA' }}>
          {price}
        </p>

        {/* BHK */}
        {bhkStr && (
          <p className="text-xs mb-3" style={{ color: '#8B8BA8' }}>{bhkStr}</p>
        )}

        {/* Status + amenity emojis */}
        <div className="flex items-center justify-between mt-auto pt-3 mb-3">
          <span className="text-[11px]" style={{ color: '#4A4A6A' }}>
            {statusText || ''}
          </span>
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex items-center gap-1">
              {property.amenities.slice(0, 4).map(a =>
                AMENITY_ICONS[a] ? (
                  <span key={a} title={a} className="text-sm leading-none select-none">
                    {AMENITY_ICONS[a]}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/property/${property.id}`}
            className="flex-1 text-center py-2 rounded-xl text-xs font-700 transition-all"
            style={{
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.25)',
              color: '#A78BFA',
            }}
          >
            Site Visit
          </Link>
          <WhatsAppButton
            propertyTitle={property.title}
            price={price}
            location={location || property.city || ''}
            propertyId={property.id}
            referralUserId={userId}
            tags={shareTags}
            label="Share & Earn"
            className="flex-1 justify-center"
          />
        </div>
      </div>
    </div>
  )
}
