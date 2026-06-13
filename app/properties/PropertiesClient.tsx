'use client'
import { useState, useMemo } from 'react'
import PropertyCard from '@/components/PropertyCard'
import type { Property } from '@/lib/supabase/types'

const CITIES = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']
const BHK_OPTIONS = ['1', '2', '3', '4']
const STATUS_OPTIONS = ['Ready to Move', 'Under Construction', 'New Launch'] as const
const BUDGET_OPTIONS = [
  { label: 'Under ₹40L',   min: 0,       max: 4000000  },
  { label: '₹40L–₹60L',  min: 4000000,  max: 6000000  },
  { label: '₹60L–₹80L',  min: 6000000,  max: 8000000  },
  { label: '₹80L–₹1Cr',  min: 8000000,  max: 10000000 },
  { label: '₹1Cr+',      min: 10000000, max: Infinity  },
]
const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc',label: 'Price ↓' },
] as const
type SortOption = typeof SORT_OPTIONS[number]['value']

type Filters = { search: string; cities: string[]; bhk: string[]; budget: number | null; status: string[]; sort: SortOption }
const DEFAULT: Filters = { search: '', cities: [], bhk: [], budget: null, status: [], sort: 'newest' }

function countActive(f: Filters) {
  return (f.cities.length > 0 ? 1 : 0) + (f.bhk.length > 0 ? 1 : 0) + (f.budget !== null ? 1 : 0) + (f.status.length > 0 ? 1 : 0) + (f.sort !== 'newest' ? 1 : 0)
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} suppressHydrationWarning
      className={`chip ${active ? 'chip-active' : ''}`}>
      {children}
    </button>
  )
}

export default function PropertiesClient({ properties, userId }: { properties: Property[]; userId?: string }) {
  const [f, setF] = useState<Filters>(DEFAULT)
  const [showFilters, setShowFilters] = useState(false)

  const toggle = <K extends 'cities' | 'bhk' | 'status'>(key: K, val: string) =>
    setF(prev => ({ ...prev, [key]: (prev[key] as string[]).includes(val) ? (prev[key] as string[]).filter(v => v !== val) : [...(prev[key] as string[]), val] }))

  const activeCount = countActive(f)
  const isFiltered = !!f.search || activeCount > 0

  const filtered = useMemo(() => {
    let list = properties.filter(p => {
      if (f.search) {
        const q = f.search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !p.builder?.toLowerCase().includes(q) && !p.city?.toLowerCase().includes(q) && !p.sector?.toLowerCase().includes(q)) return false
      }
      if (f.cities.length && !f.cities.some(c => p.city?.toLowerCase() === c.toLowerCase())) return false
      if (f.bhk.length && !f.bhk.some(b => p.bhk?.includes(b))) return false
      if (f.status.length && !f.status.includes(p.status || '')) return false
      if (f.budget !== null) {
        const { min, max } = BUDGET_OPTIONS[f.budget]
        if ((p.price_max ?? Infinity) < min) return false
        if (max < Infinity && (p.price_min ?? 0) > max) return false
      }
      return true
    })
    if (f.sort === 'price_asc') list = [...list].sort((a, b) => (a.price_min ?? Infinity) - (b.price_min ?? Infinity))
    else if (f.sort === 'price_desc') list = [...list].sort((a, b) => (b.price_max ?? 0) - (a.price_max ?? 0))
    return list
  }, [properties, f])

  const FilterPanel = () => (
    <div className="flex flex-col gap-5">
      {[
        { label: 'City', items: CITIES, key: 'cities' as const },
        { label: 'BHK', items: BHK_OPTIONS.map(b => b), key: 'bhk' as const, labelFn: (b: string) => `${b} BHK` },
        { label: 'Status', items: STATUS_OPTIONS as unknown as string[], key: 'status' as const },
      ].map(({ label, items, key, labelFn }) => (
        <div key={label}>
          <p className="text-xs text-[#4A4A6A] font-700 uppercase tracking-wider mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <Chip key={item} active={(f[key] as string[]).includes(item)} onClick={() => toggle(key, item)}>
                {labelFn ? labelFn(item) : item}
              </Chip>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="text-xs text-[#4A4A6A] font-700 uppercase tracking-wider mb-2">Budget</p>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((opt, i) => (
            <Chip key={opt.label} active={f.budget === i} onClick={() => setF(p => ({ ...p, budget: p.budget === i ? null : i }))}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#4A4A6A] font-700 uppercase tracking-wider mb-2">Sort By</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map(s => (
            <Chip key={s.value} active={f.sort === s.value} onClick={() => setF(p => ({ ...p, sort: s.value }))}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Search + filter toggle */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A4A6A]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search by name, builder, city…"
            className="input-dark pl-10 text-sm"
            value={f.search}
            onChange={e => setF(p => ({ ...p, search: e.target.value }))}
            suppressHydrationWarning
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          suppressHydrationWarning
          className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 transition-all"
          style={{
            background: showFilters ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${showFilters ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: showFilters ? '#A78BFA' : '#8B8BA8',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-800"
              style={{ background: '#7C3AED', color: '#fff', boxShadow: '0 0 8px rgba(124,58,237,0.5)' }}>
              {activeCount}
            </span>
          )}
        </button>
        {isFiltered && (
          <button onClick={() => setF(DEFAULT)} suppressHydrationWarning
            className="hidden sm:flex items-center gap-1 text-sm text-[#8B8BA8] hover:text-[#F1F0FF] whitespace-nowrap px-3 transition-colors">
            ✕ Clear
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="glass p-5 sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <span className="font-heading font-700 text-sm text-[#F1F0FF]">Filters</span>
              {activeCount > 0 && (
                <span className="text-xs font-800 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {activeCount} active
                </span>
              )}
            </div>
            <FilterPanel />
            {isFiltered && (
              <button onClick={() => setF(DEFAULT)} suppressHydrationWarning
                className="mt-5 w-full text-xs text-[#4A4A6A] hover:text-[#8B8BA8] transition-colors text-center">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobile filter panel */}
          {showFilters && (
            <div className="lg:hidden glass p-5 mb-4">
              <FilterPanel />
              {isFiltered && (
                <button onClick={() => { setF(DEFAULT); setShowFilters(false) }} suppressHydrationWarning
                  className="mt-4 w-full text-xs text-[#4A4A6A] hover:text-[#8B8BA8] text-center">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Active chips row */}
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {f.cities.map(c => (
                <button key={c} onClick={() => toggle('cities', c)} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 transition-all"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {c} ✕
                </button>
              ))}
              {f.bhk.map(b => (
                <button key={b} onClick={() => toggle('bhk', b)} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 transition-all"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {b} BHK ✕
                </button>
              ))}
              {f.budget !== null && (
                <button onClick={() => setF(p => ({ ...p, budget: null }))} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 transition-all"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {BUDGET_OPTIONS[f.budget].label} ✕
                </button>
              )}
              {f.status.map(s => (
                <button key={s} onClick={() => toggle('status', s)} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 transition-all"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {s} ✕
                </button>
              ))}
            </div>
          )}

          {/* Count */}
          <p className="text-[#8B8BA8] text-sm mb-5">
            <span className="text-[#F1F0FF] font-700">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'property' : 'properties'} found
          </p>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => <PropertyCard key={p.id} property={p} userId={userId} />)}
            </div>
          ) : (
            <div className="text-center py-20 glass">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-heading text-xl font-700 mb-2 text-[#F1F0FF]">No properties found</h3>
              <p className="text-[#8B8BA8] text-sm mb-5">Try adjusting your filters or search terms</p>
              {isFiltered && (
                <button onClick={() => setF(DEFAULT)} className="btn-outline text-sm px-5 py-2.5" suppressHydrationWarning>
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
