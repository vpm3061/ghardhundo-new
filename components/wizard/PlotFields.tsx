'use client'
import type { WizardFieldProps } from './types'

const PLOT_TYPES = ['Residential', 'Commercial', 'Agricultural']
const FACING_OPTS = ['North', 'South', 'East', 'West']

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

export default function PlotFields({ form, persona, setF }: WizardFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <input className="input-dark text-sm" placeholder="Plot area (sq.yard)" type="number"
        value={form.plot_area_sqyard} onChange={e => setF('plot_area_sqyard', e.target.value)} suppressHydrationWarning />

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Plot type</label>
        <div className="flex flex-wrap gap-2">
          {PLOT_TYPES.map(t => (
            <Chip key={t} active={form.plot_type === t} onClick={() => setF('plot_type', t)}>{t}</Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Facing</label>
        <div className="flex flex-wrap gap-2">
          {FACING_OPTS.map(f => (
            <Chip key={f} active={form.facing === f} onClick={() => setF('facing', f)}>{f}</Chip>
          ))}
        </div>
      </div>

      <input className="input-dark text-sm" placeholder={persona === 'builder' ? 'RERA Number *' : 'RERA Number (optional)'}
        value={form.rera_number} onChange={e => setF('rera_number', e.target.value)} suppressHydrationWarning />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Corner plot</label>
          <div className="flex gap-2">
            <Chip active={form.corner_plot === true} onClick={() => setF('corner_plot', true)}>Yes</Chip>
            <Chip active={form.corner_plot === false} onClick={() => setF('corner_plot', false)}>No</Chip>
          </div>
        </div>
        <div>
          <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Boundary wall</label>
          <div className="flex gap-2">
            <Chip active={form.boundary_wall === true} onClick={() => setF('boundary_wall', true)}>Yes</Chip>
            <Chip active={form.boundary_wall === false} onClick={() => setF('boundary_wall', false)}>No</Chip>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-700 uppercase tracking-wider mb-2 block" style={{ color: '#9CA3AF' }}>Registry done</label>
        <div className="flex gap-2">
          <Chip active={form.registry_done === true} onClick={() => setF('registry_done', true)}>Yes</Chip>
          <Chip active={form.registry_done === false} onClick={() => setF('registry_done', false)}>No</Chip>
        </div>
      </div>
    </div>
  )
}
