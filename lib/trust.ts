export type VipPass = {
  id: string
  name: string
  project: string
  visitDate: string
}

export function indiaToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function validateLead(input: unknown, now = new Date()) {
  if (!input || typeof input !== 'object') throw new Error('Invalid submission')
  const data = input as Record<string, unknown>
  const text = (key: string, max = 100) => {
    const value = data[key]
    if (value == null || value === '') return null
    if (typeof value !== 'string' || value.trim().length > max) throw new Error(`Invalid ${key}`)
    return value.trim()
  }
  const name = text('name')
  const phoneInput = text('phone', 25)?.replace(/[\s()-]/g, '') || ''
  const phone = /^[6-9]\d{9}$/.test(phoneInput) ? `+91${phoneInput}` : phoneInput
  if (!name || name.length < 2) throw new Error('Please enter your full name')
  if (!/^\+?[0-9]{10,15}$/.test(phone)) throw new Error('Please enter a valid phone number')
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const requestId = text('request_id')
  const propertyId = text('property_id')
  const referrerId = text('referrer_id')
  if (!requestId || !uuid.test(requestId)) throw new Error('Invalid request ID')
  if (propertyId && !uuid.test(propertyId)) throw new Error('Invalid property')
  if (referrerId && !uuid.test(referrerId)) throw new Error('Invalid referral')
  const visitDate = text('visit_date')
  if (visitDate) {
    const timestamp = Date.parse(`${visitDate}T00:00:00Z`)
    const today = Date.parse(`${indiaToday(now)}T00:00:00Z`)
    if (!propertyId || !/^\d{4}-\d{2}-\d{2}$/.test(visitDate) || !Number.isFinite(timestamp)
      || new Date(timestamp).toISOString().slice(0, 10) !== visitDate || timestamp < today
      || timestamp > today + 90 * 86400000) throw new Error('Choose a visit date within the next 90 days')
  }
  return {
    name, phone, request_id: requestId, property_id: propertyId, referrer_id: referrerId,
    visit_date: visitDate, whatsapp_consent: data.whatsapp_consent === true,
    budget: text('budget'), bhk: text('bhk'), timeline: text('timeline'),
    loan_status: text('loan_status'), purpose: text('purpose'), city: text('city'),
  }
}

export function passMessage(pass: VipPass) {
  return `ORENZAA DIGITAL VIP SITE VISIT PASS\nClient: ${pass.name}\nProject: ${pass.project}\nPass ID: ${pass.id}\nRequested visit date: ${pass.visitDate}\nMapped under Orenzaa Partner Network\nOur team will confirm the visit time.`
}

export function priceBreakdown(values: {
  base_carpet_rate?: number | null; carpet_area?: number | null;
  government_charges_estimate?: number | null; gst_estimate?: number | null;
  maintenance_estimate?: number | null; other_charges_estimate?: number | null;
}) {
  const amount = (n: number | null | undefined) => n != null && Number.isFinite(Number(n)) && Number(n) >= 0 ? Number(n) : null
  const rate = amount(values.base_carpet_rate)
  const area = amount(values.carpet_area)
  const base = rate && area ? Math.round(rate * area * 100) / 100 : null
  const charges = [values.government_charges_estimate, values.gst_estimate, values.maintenance_estimate, values.other_charges_estimate].map(amount)
  return { base, total: base != null && charges.every(n => n != null) ? Math.round((base + charges.reduce<number>((sum, n) => sum + (n ?? 0), 0)) * 100) / 100 : null }
}
