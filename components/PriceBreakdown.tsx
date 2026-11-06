import type { Property } from '@/lib/supabase/types'
import { priceBreakdown } from '@/lib/trust'

export default function PriceBreakdown({ property }: { property: Property }) {
  const isRent = property.listing_intent === 'rent' || (!property.listing_intent && property.property_category === 'rental')
  if (isRent) {
    const allTerms: [string, number | string | null | undefined][] = [
      ['Monthly rent', property.monthly_rent],
      ['Security deposit', property.security_deposit_amount],
      ['Advance terms', property.advance_terms],
      ['Lease duration (months)', property.lease_duration_months],
    ]
    const terms = allTerms.filter(([, value]) => value != null && value !== '')
    if (!terms.length) return null
    return <details className="my-5 rounded-2xl border border-slate-200 bg-white p-5" open>
      <summary className="cursor-pointer font-bold text-slate-800">Rent and lease terms</summary>
      <dl className="mt-4 space-y-3 text-sm">
        {terms.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-slate-600">{label}</dt>
            <dd className="shrink-0 font-medium text-slate-800">{typeof value === 'number' ? `INR ${value.toLocaleString('en-IN')}` : value}</dd>
          </div>
        ))}
      </dl>
    </details>
  }

  const { base, total } = priceBreakdown(property)
  const isPillarListing = !!property.property_pillar
  const rows: [string, number | null | undefined][] = isPillarListing ? [
    ['Base property price', property.price_min],
    ['Stamp duty / registry estimate', property.stamp_duty_estimate],
    ['Legal fees estimate', property.legal_fees_estimate],
  ] : [
    ['Base carpet rate / sq. ft.', property.base_carpet_rate],
    ['Base cost (carpet rate × carpet area)', base],
    ['Government charges (registry / stamp duty)', property.government_charges_estimate],
    ['GST estimate', property.gst_estimate],
    ['Maintenance estimate', property.maintenance_estimate],
    ['Other disclosed charges', property.other_charges_estimate],
  ]
  const hasPillarQuote = property.price_min != null && property.stamp_duty_estimate != null && property.legal_fees_estimate != null
  const calculatedPillarTotal = hasPillarQuote
    ? property.price_min! + property.stamp_duty_estimate! + property.legal_fees_estimate!
    : null
  const displayedTotal = property.total_on_road_valuation ?? (isPillarListing ? calculatedPillarTotal : total)
  const visibleRows = rows.filter(([, value]) => value != null)
  if (!visibleRows.length && displayedTotal == null) return null

  const money = (value: number) => `INR ${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  return (
    <details className="my-5 rounded-2xl border border-slate-200 bg-white p-5" open>
      <summary className="cursor-pointer font-bold text-slate-800">Price Structure &amp; Estimated Cost</summary>
      <dl className="mt-4 space-y-3 text-sm">
        {visibleRows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4"><dt className="text-slate-600">{label}</dt><dd className="shrink-0 font-medium text-slate-800">{money(value as number)}</dd></div>
        ))}
        <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 font-bold"><dt>{isPillarListing ? 'Estimated on-road valuation' : 'Total estimated cost'}</dt><dd>{displayedTotal == null ? 'Awaiting final quote' : money(displayedTotal)}</dd></div>
      </dl>
      {property.direct_builder_pricing && property.orenzaa_verified && total != null && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">Direct builder pricing with no hidden fees</p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Estimates are supplied for this listing and are not a tax calculation. Confirm the final written quote and applicable charges with the seller before purchase.</p>
    </details>
  )
}
