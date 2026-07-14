'use client'
import Link from 'next/link'
import WhatsAppButton from './WhatsAppButton'
import HeartButton from './HeartButton'
import type { Property } from '@/lib/supabase/types'

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

function getPriceDisplay(property: Property): string {
  if (property.property_category === 'rental') {
    return `₹${Number(property.monthly_rent || 0).toLocaleString('en-IN')}/mo`
  }
  if (property.price_min) {
    return `₹${Math.round(Number(property.price_min) / 100000)}L`
  }
  return 'Price on request'
}

function getSubtitle(property: Property): string {
  const place = property.locality || property.city || ''
  if (property.property_category === 'plot') {
    return `${property.plot_area_sqyard || ''} sq.yd • ${place}`
  }
  if (property.property_category === 'commercial') {
    return `${property.super_area || ''} sqft • ${place}`
  }
  const bhk = Array.isArray(property.bhk) ? property.bhk[0] : property.bhk
  return `${bhk || ''} BHK • ${place}`
}

export default function PropertyCard({ property, userId, savedIds }: { property: Property; userId?: string; savedIds?: Set<string> }) {
  const photo = property.photos?.[0]
  const price = getPriceDisplay(property)
  const subtitle = getSubtitle(property)
  const location = [property.locality || property.sector, property.city].filter(Boolean).join(', ')
  const statusText = property.status ? STATUS_LABEL[property.status] : null

  return (
    <div
      className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden group flex flex-col hover:shadow-lg hover:border-[#FB923C]/30 transition-all property-card"
      style={property.is_featured
        ? { border: '1.5px solid #FED7AA', boxShadow: '0 0 20px rgba(251,146,60,0.08)' }
        : {}}
    >
      {/* Photo */}
      <Link href={`/property/${property.id}`} className="block relative h-52 overflow-hidden bg-[#F5F5F4] shrink-0">
        {photo ? (
          <img
            src={photo}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Heart button */}
        <div className="absolute top-3 left-3">
          <HeartButton propertyId={property.id} userId={userId} initialSaved={savedIds?.has(property.id)} />
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {property.is_featured && (
            <span className="text-[10px] font-800 tracking-wider px-2.5 py-1 rounded-full bg-[#FB923C] text-white">
              ⭐ FEATURED
            </span>
          )}
          {property.rera_number && (
            <span className="text-[10px] font-700 px-2.5 py-1 rounded-full bg-white/90 text-[#22C55E] border border-green-100">
              ✓ RERA
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-0">

        {/* Title */}
        <Link href={`/property/${property.id}`}>
          <h3 className="font-heading font-700 text-base leading-snug line-clamp-1 mb-1 text-[#111827] hover:text-[#FB923C] transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Price */}
        <p className="font-heading font-800 text-lg mb-0.5 leading-tight text-[#111827]">
          {price}
        </p>

        {/* Subtitle — BHK/area + location, per property type */}
        <p className="text-xs mb-2 flex items-center gap-1 truncate text-[#6B7280]">
          <span className="shrink-0">📍</span>
          <span className="truncate">{subtitle}</span>
        </p>

        {/* Status + amenities */}
        <div className="flex items-center justify-between mt-auto pt-3 mb-3">
          <span className="text-[11px] text-[#22C55E] font-medium">
            {statusText === 'Ready to Move' ? statusText : ''}
          </span>
          <span className="text-[11px] text-[#F59E0B] font-medium">
            {statusText && statusText !== 'Ready to Move' ? statusText : ''}
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
            className="flex-1 text-center py-2 rounded-xl text-xs font-700 transition-all bg-[#FB923C] hover:bg-[#F59E0B] text-white"
          >
            Site Visit
          </Link>
          <WhatsAppButton
            propertyTitle={property.title}
            price={price}
            location={location || property.city || ''}
            propertyId={property.id}
            label="Share & Earn"
            className="flex-1 justify-center"
          />
        </div>
      </div>
    </div>
  )
}
