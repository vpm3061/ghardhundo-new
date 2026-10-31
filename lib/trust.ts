export type VipPass = {
  id: string
  name: string
  project: string
  visitDate: string
  maskedPhone?: string
  costBreakdown?: { base: number | null; stampDuty: number | null; legalFees: number | null; onRoad: number | null }
  purpose?: string
  urgencyTimeline?: string
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
  if (data.disclaimer_accepted !== true) throw new Error('Please accept the buyer safety and independent legal checks notice')
  const purpose = text('purpose')
  if (!purpose || !['Self Use', 'Long-Term Investment ROI', 'Rental Income'].includes(purpose)) {
    throw new Error('Choose the purpose of your property search')
  }
  const urgencyTimeline = text('urgency_timeline')
  if (!urgencyTimeline || !['today_tomorrow', 'next_3_7_days', 'next_15_days'].includes(urgencyTimeline)) {
    throw new Error('Choose your preferred visit timeline')
  }
  if (visitDate) {
    const daysFromToday = Math.round((Date.parse(`${visitDate}T00:00:00Z`) - Date.parse(`${indiaToday(now)}T00:00:00Z`)) / 86400000)
    if (urgencyTimeline === 'today_tomorrow' && daysFromToday > 1) throw new Error('Today / Tomorrow visits must be within the next 2 days')
    if (urgencyTimeline === 'next_3_7_days' && (daysFromToday < 3 || daysFromToday > 7)) throw new Error('Choose a date from 3 to 7 days from now')
    if (urgencyTimeline === 'next_15_days' && daysFromToday > 15) throw new Error('Choose a date within the next 15 days')
  }
  return {
    name, phone, request_id: requestId, property_id: propertyId, referrer_id: referrerId,
    visit_date: visitDate, whatsapp_consent: data.whatsapp_consent === true,
    budget: text('budget'), bhk: text('bhk'), timeline: text('timeline'),
    loan_status: text('loan_status'), purpose, urgency_timeline: urgencyTimeline, city: text('city'),
  }
}

export function passMessage(pass: VipPass) {
  const costs = pass.costBreakdown
  return `ORENZAA DIGITAL VIP SITE VISIT PASS\nClient: ${pass.name}\n${pass.maskedPhone ? `Buyer phone: ${pass.maskedPhone}\n` : ''}Project: ${pass.project}\nMicro-market: Prayagraj\nPass ID: ${pass.id}\nRequested visit date: ${pass.visitDate}\n${pass.purpose ? `Purpose: ${pass.purpose}\n` : ''}${costs ? `Base price: ${costs.base == null ? 'Awaiting quote' : `INR ${costs.base.toLocaleString('en-IN')}`}\nStamp duty / registry: ${costs.stampDuty == null ? 'Awaiting quote' : `INR ${costs.stampDuty.toLocaleString('en-IN')}`}\nLegal fees: ${costs.legalFees == null ? 'Awaiting quote' : `INR ${costs.legalFees.toLocaleString('en-IN')}`}\nEstimated on-road total: ${costs.onRoad == null ? 'Pending full quote' : `INR ${costs.onRoad.toLocaleString('en-IN')}`}\n` : ''}Buyer Safety Advisory: Independently verify legal title and registry before paying any advance token money.\nOrenzaa is a technology-enabled property aggregator, not a developer, property owner, or title guarantor. It does not hold financial or legal liability for property disputes. Verify every transaction independently.\nओरेन्ज़ा केवल तकनीक-सक्षम एग्रीगेटर है, संपत्ति का मालिक या टाइटल गारंटर नहीं। संपत्ति विवादों की कोई वित्तीय या कानूनी देयता ओरेन्ज़ा की नहीं है। सभी लेन-देन की स्वतंत्र रूप से जाँच करें।\nOrenzaa does not collect property booking funds. Pay the dealer or builder directly.\nOur team will confirm the visit time.`
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
