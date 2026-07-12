'use client'
import type { WizardFieldProps } from './types'

const RENTAL_TYPES = ['1RK', '1BHK', '2BHK', 'Room', 'PG', 'House']
const TENANT_PREF = ['Family', 'Bachelor', 'Any']
const GENDER_PREF = ['Any', 'Male', 'Female']
const FURNISHED_OPTS = ['Furnished', 'Semi', 'Unfurnished']
const AMENITIES = ['AC', 'WiFi', 'Geyser', 'Washing Machine']

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

export default function RentalFields({ form, setF, toggleArr }: WizardFieldProps) {
  const isPG = form.bhk[0] === 'PG'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Property type</label>
        <div className="flex flex-wrap gap-2">
          {RENTAL_TYPES.map(t => (
            <Chip key={t} active={form.bhk[0] === t} onClick={() => setF('bhk', [t])}>{t}</Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input className="input-dark text-sm" placeholder="Monthly rent (₹)" type="number"
          value={form.monthly_rent} onChange={e => setF('monthly_rent', e.target.value)} suppressHydrationWarning />
        <input className="input-dark text-sm" placeholder="Deposit (months)" type="number"
          value={form.deposit_months} onChange={e => setF('deposit_months', e.target.value)} suppressHydrationWarning />
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Available from</label>
        <input className="input-dark text-sm w-full" type="date"
          value={form.available_from} onChange={e => setF('available_from', e.target.value)} suppressHydrationWarning />
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Tenant preference</label>
        <div className="flex flex-wrap gap-2">
          {TENANT_PREF.map(t => (
            <Chip key={t} active={form.tenant_preference === t} onClick={() => setF('tenant_preference', t)}>{t}</Chip>
          ))}
        </div>
      </div>

      {isPG && (
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Gender preference</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_PREF.map(g => (
              <Chip key={g} active={form.gender_preference === g} onClick={() => setF('gender_preference', g)}>{g}</Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Furnishing</label>
        <div className="flex flex-wrap gap-2">
          {FURNISHED_OPTS.map(f => (
            <Chip key={f} active={form.furnished === f} onClick={() => setF('furnished', f)}>{f}</Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(a => (
            <Chip key={a} active={form.amenities.includes(a)} onClick={() => toggleArr('amenities', a)}>{a}</Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Parking</label>
          <div className="flex gap-2">
            <Chip active={form.parking === true} onClick={() => setF('parking', true)}>Yes</Chip>
            <Chip active={form.parking === false} onClick={() => setF('parking', false)}>No</Chip>
          </div>
        </div>
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Pets allowed</label>
          <div className="flex gap-2">
            <Chip active={form.pets_allowed === true} onClick={() => setF('pets_allowed', true)}>Yes</Chip>
            <Chip active={form.pets_allowed === false} onClick={() => setF('pets_allowed', false)}>No</Chip>
          </div>
        </div>
      </div>
    </div>
  )
}
