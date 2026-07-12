'use client'
import type { WizardFieldProps } from './types'

const COMMERCIAL_TYPES = ['Shop', 'Office', 'Showroom', 'Warehouse', 'Garage']

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} suppressHydrationWarning
      className="text-sm px-3 py-1.5 rounded-xl transition-all"
      style={{
        background: active ? 'rgba(251,146,60,0.08)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${active ? 'rgba(251,146,60,0.35)' : 'rgba(0,0,0,0.06)'}`,
        color: active ? '#FB923C' : '#6B7280',
      }}>
      {children}
    </button>
  )
}

export default function CommercialFields({ form, setF }: WizardFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Commercial type</label>
        <div className="flex flex-wrap gap-2">
          {COMMERCIAL_TYPES.map(t => (
            <Chip key={t} active={form.commercial_type === t} onClick={() => setF('commercial_type', t)}>{t}</Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Deal type</label>
        <div className="flex gap-2">
          <Chip active={form.commercial_deal === 'Rent'} onClick={() => setF('commercial_deal', 'Rent')}>For Rent</Chip>
          <Chip active={form.commercial_deal === 'Sale'} onClick={() => setF('commercial_deal', 'Sale')}>For Sale</Chip>
        </div>
      </div>

      {form.commercial_deal === 'Rent' ? (
        <input className="input-dark text-sm" placeholder="Monthly rent (₹)" type="number"
          value={form.monthly_rent} onChange={e => setF('monthly_rent', e.target.value)} suppressHydrationWarning />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <input className="input-dark text-sm" placeholder="Super area (sq.ft)" type="number"
          value={form.super_area} onChange={e => setF('super_area', e.target.value)} suppressHydrationWarning />
        <input className="input-dark text-sm" placeholder="Floor number" type="number"
          value={form.floor_number} onChange={e => setF('floor_number', e.target.value)} suppressHydrationWarning />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input className="input-dark text-sm" placeholder="Power load (e.g. 5 KW)"
          value={form.power_load} onChange={e => setF('power_load', e.target.value)} suppressHydrationWarning />
        <input className="input-dark text-sm" placeholder="Frontage width (ft)" type="number"
          value={form.frontage_width} onChange={e => setF('frontage_width', e.target.value)} suppressHydrationWarning />
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Parking</label>
        <div className="flex gap-2">
          <Chip active={form.parking === true} onClick={() => setF('parking', true)}>Yes</Chip>
          <Chip active={form.parking === false} onClick={() => setF('parking', false)}>No</Chip>
        </div>
      </div>
    </div>
  )
}
