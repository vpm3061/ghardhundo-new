'use client'

import type { PropertyPillar, WizardFieldProps } from './types'

const PILLAR_TYPES: Record<PropertyPillar, string[]> = {
  residential: ['House', '2BHK Apartment', '3BHK Apartment', 'Independent Villa', 'Studio Apartment', 'PG / Co-Living'],
  commercial: ['Corporate Office', 'Retail Shop', 'High-Street Outlet', 'Mall Space', 'Showroom'],
  industrial: ['Warehouse / Godown', 'Factory', 'Cold Storage', 'Logistics Hub'],
  land: ['Residential Gated Plot', 'Commercial Enclave', 'Agricultural Land', 'Raw Land'],
}

const labelFor: Record<PropertyPillar, string> = {
  residential: 'Home type', commercial: 'Commercial space type', industrial: 'Industrial facility type', land: 'Land type',
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="rounded-xl border px-3 py-2 text-sm transition-colors"
    style={active ? { background: '#FFF7ED', color: '#C2410C', borderColor: '#FDBA74' } : { background: 'white', color: '#475569', borderColor: '#E2E8F0' }}>
    {children}
  </button>
}

export default function PillarFields({ form, setF, pillar }: WizardFieldProps & { pillar: PropertyPillar }) {
  const basePrice = Number(form.price_min || 0)
  const stampDuty = Number(form.stamp_duty_estimate || 0)
  const legalFees = Number(form.legal_fees_estimate || 0)

  return <div className="flex flex-col gap-4">
    <section className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-800">Listing intent</h3>
      <div className="flex flex-wrap gap-2">
        <Choice active={form.intent === 'sale'} onClick={() => setF('intent', 'sale')}>FOR SALE</Choice>
        <Choice active={form.intent === 'rent'} onClick={() => setF('intent', 'rent')}>FOR RENT / LEASE</Choice>
      </div>
    </section>

    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{labelFor[pillar]}</label>
      <div className="flex flex-wrap gap-2">
        {PILLAR_TYPES[pillar].map(type => <Choice key={type} active={form.property_subtype === type} onClick={() => setF('property_subtype', type)}>{type}</Choice>)}
      </div>
    </div>

    {form.intent === 'sale' ? <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-slate-600">Base property price (₹) *
        <input className="input-dark mt-1 w-full text-sm" type="number" min="1" value={form.price_min} onChange={e => setF('price_min', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Stamp duty / registry estimate (₹) *
        <input className="input-dark mt-1 w-full text-sm" type="number" min="0" value={form.stamp_duty_estimate} onChange={e => setF('stamp_duty_estimate', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Legal fees estimate (₹) *
        <input className="input-dark mt-1 w-full text-sm" type="number" min="0" value={form.legal_fees_estimate} onChange={e => setF('legal_fees_estimate', e.target.value)} />
      </label>
      <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700 sm:self-end">
        Estimated on-road total: <strong>₹{(basePrice + stampDuty + legalFees).toLocaleString('en-IN')}</strong>
        <span className="mt-1 block text-xs text-slate-500">Estimate only; confirm all amounts and legal charges independently.</span>
      </div>
    </div> : <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-slate-600">Monthly rent / lease amount (₹) *
        <input className="input-dark mt-1 w-full text-sm" type="number" min="1" value={form.monthly_rent} onChange={e => setF('monthly_rent', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Security deposit amount (₹)
        <input className="input-dark mt-1 w-full text-sm" type="number" min="0" value={form.security_deposit_amount} onChange={e => setF('security_deposit_amount', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Advance terms
        <input className="input-dark mt-1 w-full text-sm" maxLength={240} placeholder="e.g. 2 months advance" value={form.advance_terms} onChange={e => setF('advance_terms', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Lease duration (months)
        <input className="input-dark mt-1 w-full text-sm" type="number" min="1" max="120" value={form.lease_duration_months} onChange={e => setF('lease_duration_months', e.target.value)} />
      </label>
    </div>}

    {pillar === 'residential' && <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-slate-600">Bedrooms / BHK
        <select className="input-dark mt-1 w-full text-sm" value={form.bhk[0] || ''} onChange={e => setF('bhk', e.target.value ? [e.target.value] : [])}>
          <option value="">Select</option>{['Studio', '1', '2', '3', '4', '5+'].map(x => <option key={x} value={x}>{x === 'Studio' ? x : `${x} BHK`}</option>)}
        </select>
      </label>
      <label className="text-xs text-slate-600">Furnishing
        <select className="input-dark mt-1 w-full text-sm" value={form.furnished} onChange={e => setF('furnished', e.target.value)}>
          <option value="">Select</option>{['Furnished', 'Semi', 'Unfurnished'].map(x => <option key={x}>{x}</option>)}
        </select>
      </label>
    </div>}

    {(pillar === 'residential' || pillar === 'commercial' || pillar === 'industrial') && <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-slate-600">Built-up / super area (sq. ft.)
        <input className="input-dark mt-1 w-full text-sm" type="number" min="0" value={form.super_area} onChange={e => setF('super_area', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Floor number
        <input className="input-dark mt-1 w-full text-sm" type="number" value={form.floor_number} onChange={e => setF('floor_number', e.target.value)} />
      </label>
    </div>}

    {pillar === 'industrial' && <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-slate-600">Power load
        <input className="input-dark mt-1 w-full text-sm" maxLength={80} placeholder="e.g. 100 KW" value={form.power_load} onChange={e => setF('power_load', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Loading / frontage width (ft.)
        <input className="input-dark mt-1 w-full text-sm" type="number" min="0" value={form.frontage_width} onChange={e => setF('frontage_width', e.target.value)} />
      </label>
    </div>}

    {pillar === 'land' && <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-slate-600">Land area
        <input className="input-dark mt-1 w-full text-sm" type="number" min="0" value={form.plot_area_sqyard} onChange={e => setF('plot_area_sqyard', e.target.value)} />
      </label>
      <label className="text-xs text-slate-600">Area unit
        <select className="input-dark mt-1 w-full text-sm" value={form.land_area_unit} onChange={e => setF('land_area_unit', e.target.value)}>
          {['sq. yard', 'sq. ft.', 'acre', 'hectare'].map(x => <option key={x}>{x}</option>)}
        </select>
      </label>
      <label className="text-xs text-slate-600">Facing
        <select className="input-dark mt-1 w-full text-sm" value={form.facing} onChange={e => setF('facing', e.target.value)}>
          <option value="">Select</option>{['North', 'South', 'East', 'West'].map(x => <option key={x}>{x}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.registry_done} onChange={e => setF('registry_done', e.target.checked)} /> Registry already done</label>
    </div>}
  </div>
}
