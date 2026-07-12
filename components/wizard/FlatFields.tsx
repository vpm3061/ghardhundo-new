'use client'
import PhotoUpload from '@/components/PhotoUpload'
import type { WizardFieldProps } from './types'

const BHK_OPTS = ['1', '2', '3', '4']
const FURNISHED_OPTS = ['Furnished', 'Semi', 'Unfurnished']
const AMENITIES = ['Swimming Pool', 'Gym', '24hr Security', 'Parking', 'Club House', 'Power Backup', 'Garden', 'Kids Zone']

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

export default function FlatFields({ form, persona, setF, toggleArr }: WizardFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>BHK</label>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTS.map(b => (
            <Chip key={b} active={form.bhk.includes(b)} onClick={() => toggleArr('bhk', b)}>{b} BHK</Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input className="input-dark text-sm" placeholder="Floor number" type="number"
          value={form.floor_number} onChange={e => setF('floor_number', e.target.value)} suppressHydrationWarning />
        <input className="input-dark text-sm" placeholder="Total floors" type="number"
          value={form.total_floors} onChange={e => setF('total_floors', e.target.value)} suppressHydrationWarning />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input className="input-dark text-sm" placeholder="Super area (sq.ft)" type="number"
          value={form.super_area} onChange={e => setF('super_area', e.target.value)} suppressHydrationWarning />
        <input className="input-dark text-sm" placeholder="Carpet area (sq.ft)" type="number"
          value={form.carpet_area} onChange={e => setF('carpet_area', e.target.value)} suppressHydrationWarning />
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Furnishing</label>
        <div className="flex flex-wrap gap-2">
          {FURNISHED_OPTS.map(f => (
            <Chip key={f} active={form.furnished === f} onClick={() => setF('furnished', f)}>{f}</Chip>
          ))}
        </div>
      </div>

      <input className="input-dark text-sm" placeholder={persona === 'builder' ? 'RERA Number *' : 'RERA Number (optional)'}
        value={form.rera_number} onChange={e => setF('rera_number', e.target.value)} suppressHydrationWarning />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Possession date</label>
          <input className="input-dark text-sm w-full" type="date"
            value={form.possession_date} onChange={e => setF('possession_date', e.target.value)} suppressHydrationWarning />
        </div>
        <input className="input-dark text-sm self-end" placeholder="Age (years, if resale)" type="number"
          value={form.age_years} onChange={e => setF('age_years', e.target.value)} suppressHydrationWarning />
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Parking</label>
        <div className="flex gap-2">
          <Chip active={form.parking === true} onClick={() => setF('parking', true)}>Yes</Chip>
          <Chip active={form.parking === false} onClick={() => setF('parking', false)}>No</Chip>
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

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-1.5 block" style={{ color: '#9CA3AF' }}>Floor plan (optional)</label>
        <PhotoUpload photos={form.floor_plan ? [form.floor_plan] : []}
          setPhotos={v => setF('floor_plan', v[0] || '')} maxFiles={1} />
      </div>

      <input className="input-dark text-sm" placeholder="YouTube URL (optional)"
        value={form.youtube_url} onChange={e => setF('youtube_url', e.target.value)} suppressHydrationWarning />

      <input className="input-dark text-sm" placeholder="Tags (comma separated: Metro nearby, Garden facing)"
        value={form.tags} onChange={e => setF('tags', e.target.value)} suppressHydrationWarning />
    </div>
  )
}
