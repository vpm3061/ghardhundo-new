import type { Property } from '@/lib/supabase/types'
import { priceBreakdown } from '@/lib/trust'

export default function PriceBreakdown({ property }: { property: Property }) {
  if (property.property_category === 'rental') return null
  const { base, total } = priceBreakdown(property)
  const money = (value: number | null | undefined) => value == null ? 'Awaiting quote' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  return (
    <details className="my-5 rounded-2xl border border-slate-200 bg-white p-5" open>
      <summary className="cursor-pointer font-bold text-slate-800">Price Structure &amp; Estimated Cost</summary>
      <dl className="mt-4 space-y-3 text-sm">
        {[
          ['Base carpet rate / sq. ft.', property.base_carpet_rate],
          ['Base cost (carpet rate × carpet area)', base],
          ['Government charges (registry / stamp duty)', property.government_charges_estimate],
          ['GST estimate', property.gst_estimate],
          ['Maintenance estimate', property.maintenance_estimate],
          ['Other disclosed charges', property.other_charges_estimate],
        ].map(([label, value]) => (
          <div key={String(label)} className="flex justify-between gap-4"><dt className="text-slate-600">{label}</dt><dd className="shrink-0 font-medium text-slate-800">{money(value as number | null | undefined)}</dd></div>
        ))}
        <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 font-bold"><dt>Total estimated cost</dt><dd>{total == null ? 'Pending full quote' : money(total)}</dd></div>
      </dl>
      {property.direct_builder_pricing && property.orenzaa_verified && total != null && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">100% Direct Builder Pricing — No Hidden Fees</p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Property-specific estimates supplied for this listing, not a tax calculation. Confirm the final written quote, applicable government charges and maintenance period before purchase. Unavailable amounts are not treated as zero.</p>
    </details>
  )
}
