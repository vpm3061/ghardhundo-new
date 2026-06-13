import type { Property } from './supabase/types'

function toSlug(str: string): string {
  return str
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '')
}

const CITY_TAGS: Record<string, string[]> = {
  'Noida':         ['#NoidaFlats', '#NoidaProperty'],
  'Lucknow':       ['#LucknowProperty', '#LucknowFlats'],
  'Greater Noida': ['#GreaterNoidaFlats', '#GreaterNoidaProperty'],
  'Ayodhya':       ['#AyodhyaProperty', '#AyodhyaRealEstate'],
}

export function generatePropertyTags(p: Property): string[] {
  const tags: string[] = []

  // BHK (first — most specific & searched)
  if (p.bhk?.length) p.bhk.forEach(b => tags.push(`#${b}BHK`))

  // City
  if (p.city && CITY_TAGS[p.city]) tags.push(...CITY_TAGS[p.city])

  // Status
  if (p.status === 'Ready to Move')      tags.push('#ReadyToMove', '#ImmediatePossession')
  if (p.status === 'Under Construction') tags.push('#UnderConstruction', '#BookNow')
  if (p.status === 'New Launch')         tags.push('#NewLaunch', '#EarlyBirdOffer')

  // RERA
  if (p.rera_number) tags.push('#RERAVerified', '#RERAApproved')

  // Sector — "#Sector50" or "#GomtiNagar" etc.
  if (p.sector) {
    const slug = toSlug(p.sector)
    if (slug) tags.push(`#${slug}`)
  }

  // Price bracket (prefer price_max, fall back to price_min)
  const ref = p.price_max ?? p.price_min
  if (ref) {
    const L = Math.round(ref / 1e5)
    if      (L <= 30)  tags.push('#Under30Lakh',   '#AffordableHomes')
    else if (L <= 50)  tags.push('#Under50Lakh',   '#AffordableHomes')
    else if (L <= 60)  tags.push('#Under60Lakh')
    else if (L <= 80)  tags.push('#Under80Lakh')
    else if (L <= 100) tags.push('#Under1Cr',       '#PremiumHomes')
    else if (L <= 150) tags.push('#Under1Cr50Lakh', '#PremiumHomes')
    else               tags.push('#LuxuryProperty', '#LuxuryHomes')
  }

  // Builder
  if (p.builder) {
    const slug = toSlug(p.builder)
    if (slug) tags.push(`#${slug}`)
  }

  // Featured
  if (p.is_featured) tags.push('#FeaturedProperty')

  // Brand
  tags.push('#GharDhundo', '#RealEstateIndia')

  return tags
}

// Compact set for WhatsApp share (≤6 tags)
export function getShareTags(p: Property): string[] {
  const tags: string[] = []
  if (p.bhk?.length)   tags.push(`#${p.bhk[0]}BHK`)
  if (p.city)          tags.push(CITY_TAGS[p.city]?.[0] ?? `#${toSlug(p.city)}`)
  if (p.rera_number)   tags.push('#RERAVerified')
  if (p.status === 'Ready to Move') tags.push('#ReadyToMove')
  if (p.status === 'New Launch')    tags.push('#NewLaunch')
  tags.push('#GharDhundo')
  return tags.slice(0, 6)
}

// 3 most card-representative tags (BHK, city, RERA/status)
export function getCardTags(p: Property): string[] {
  const tags: string[] = []
  if (p.bhk?.[0])      tags.push(`#${p.bhk[0]}BHK`)
  if (p.city)          tags.push(CITY_TAGS[p.city]?.[0] ?? `#${toSlug(p.city)}Property`)
  if (p.rera_number)   tags.push('#RERAVerified')
  else if (p.status)   tags.push(p.status === 'Ready to Move' ? '#ReadyToMove' : p.status === 'New Launch' ? '#NewLaunch' : '#UnderConstruction')
  return tags.slice(0, 3)
}
