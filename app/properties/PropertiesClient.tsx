'use client'
import { useState, useMemo, useEffect } from 'react'
import PropertyCard from '@/components/PropertyCard'
import type { Property } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { generatePropertyTags } from '@/lib/property-tags'

const TYPE_OPTIONS = [
  { id: 'all',        label: '🏘️ All'        },
  { id: 'flat',       label: '🏢 Flat'       },
  { id: 'plot',       label: '🌍 Plot'       },
  { id: 'rental',     label: '🏠 Rental'     },
  { id: 'commercial', label: '🏪 Commercial' },
] as const
type TypeOption = typeof TYPE_OPTIONS[number]['id']

const CITIES = ['Lucknow', 'Noida', 'Greater Noida', 'Ayodhya']
const BHK_OPTIONS = ['1', '2', '3', '4']
const STATUS_OPTIONS = ['Ready to Move', 'Under Construction', 'New Launch'] as const
const BUDGET_OPTIONS = [
  { label: 'Under ₹40L',  min: 0,        max: 4000000  },
  { label: '₹40L–₹60L',  min: 4000000,  max: 6000000  },
  { label: '₹60L–₹80L',  min: 6000000,  max: 8000000  },
  { label: '₹80L–₹1Cr',  min: 8000000,  max: 10000000 },
  { label: '₹1Cr+',       min: 10000000, max: Infinity  },
]
const SORT_OPTIONS = [
  { value: 'featured',   label: '⭐ Featured' },
  { value: 'newest',     label: 'Newest'       },
  { value: 'price_asc',  label: 'Price ↑'      },
  { value: 'price_desc', label: 'Price ↓'      },
] as const
type SortOption = typeof SORT_OPTIONS[number]['value']

type Filters = {
  search: string; type: TypeOption; cities: string[]; bhk: string[]
  budget: number | null; status: string[]; sort: SortOption; tag: string
}
const DEFAULT: Filters = { search: '', type: 'all', cities: [], bhk: [], budget: null, status: [], sort: 'featured', tag: '' }

function countActive(f: Filters) {
  return (f.type !== 'all' ? 1 : 0) + (f.cities.length > 0 ? 1 : 0) + (f.bhk.length > 0 ? 1 : 0) +
    (f.budget !== null ? 1 : 0) + (f.status.length > 0 ? 1 : 0) +
    (f.tag ? 1 : 0) + (f.sort !== 'featured' ? 1 : 0)
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} suppressHydrationWarning className={`chip ${active ? 'chip-active' : ''}`}>
      {children}
    </button>
  )
}

export default function PropertiesClient({
  properties,
  userId,
  initialTag = '',
}: {
  properties: Property[]
  userId?: string
  initialTag?: string
}) {
  const [f, setF] = useState<Filters>({ ...DEFAULT, tag: initialTag })
  const [showFilters, setShowFilters] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('saved_properties')
      .select('property_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map(d => d.property_id)))
      })
  }, [userId])

  const toggle = <K extends 'cities' | 'bhk' | 'status'>(key: K, val: string) =>
    setF(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(val)
        ? (prev[key] as string[]).filter(v => v !== val)
        : [...(prev[key] as string[]), val],
    }))

  const activeCount = countActive(f)
  const isFiltered = !!f.search || activeCount > 0

  const filtered = useMemo(() => {
    let list = properties.filter(p => {
      if (f.search) {
        const q = f.search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) &&
            !p.builder?.toLowerCase().includes(q) &&
            !p.city?.toLowerCase().includes(q) &&
            !p.sector?.toLowerCase().includes(q)) return false
      }
      if (f.type !== 'all' && p.property_category !== f.type) return false
      if (f.cities.length && !f.cities.some(c => p.city?.toLowerCase() === c.toLowerCase())) return false
      if (f.bhk.length && !f.bhk.some(b => p.bhk?.includes(b))) return false
      if (f.status.length && !f.status.includes(p.status || '')) return false
      if (f.budget !== null) {
        const { min, max } = BUDGET_OPTIONS[f.budget]
        if ((p.price_max ?? Infinity) < min) return false
        if (max < Infinity && (p.price_min ?? 0) > max) return false
      }
      if (f.tag) {
        const propTags = generatePropertyTags(p).map(t => t.replace('#', '').toLowerCase())
        if (!propTags.includes(f.tag.toLowerCase())) return false
      }
      return true
    })

    if (f.sort === 'price_asc')  list = [...list].sort((a, b) => (a.price_min ?? Infinity) - (b.price_min ?? Infinity))
    else if (f.sort === 'price_desc') list = [...list].sort((a, b) => (b.price_max ?? 0) - (a.price_max ?? 0))
    else if (f.sort === 'newest') list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))
    else list = [...list].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))

    return list
  }, [properties, f])

  const FilterPanel = () => (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs text-[#9CA3AF] font-700 uppercase tracking-wider mb-2">Property Type</p>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(opt => (
            <Chip key={opt.id} active={f.type === opt.id}
              onClick={() => setF(p => ({
                ...p,
                type: opt.id,
                bhk: (opt.id === 'rental' || opt.id === 'plot') ? [] : p.bhk,
              }))}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      {[
        { label: 'City',   items: CITIES,                                       key: 'cities' as const },
        { label: 'BHK',    items: BHK_OPTIONS,                                  key: 'bhk'    as const, labelFn: (b: string) => `${b} BHK` },
        { label: 'Status', items: STATUS_OPTIONS as unknown as string[],         key: 'status' as const },
      ].filter(({ key }) => !(key === 'bhk' && (f.type === 'rental' || f.type === 'plot')))
      .map(({ label, items, key, labelFn }) => (
        <div key={label}>
          <p className="text-xs text-[#9CA3AF] font-700 uppercase tracking-wider mb-2">{label}</p>
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
        <p className="text-xs text-[#9CA3AF] font-700 uppercase tracking-wider mb-2">Budget</p>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((opt, i) => (
            <Chip key={opt.label} active={f.budget === i}
              onClick={() => setF(p => ({ ...p, budget: p.budget === i ? null : i }))}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#9CA3AF] font-700 uppercase tracking-wider mb-2">Sort By</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map(s => (
            <Chip key={s.value} active={f.sort === s.value}
              onClick={() => setF(p => ({ ...p, sort: s.value }))}>
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
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by name, builder, city…"
            className="input-dark pl-10 text-sm"
            value={f.search}
            onChange={e => setF(p => ({ ...p, search: e.target.value }))}
            suppressHydrationWarning />
        </div>
        <button onClick={() => setShowFilters(v => !v)} suppressHydrationWarning
          className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 transition-all"
          style={{
            background: showFilters ? '#FFF7ED' : '#FFFFFF',
            border: `1px solid ${showFilters ? '#FED7AA' : '#E5E7EB'}`,
            color: showFilters ? '#FB923C' : '#6B7280',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-800 bg-[#FB923C] text-white">
              {activeCount}
            </span>
          )}
        </button>
        {isFiltered && (
          <button onClick={() => setF(DEFAULT)} suppressHydrationWarning
            className="hidden sm:flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] whitespace-nowrap px-3 transition-colors">
            ✕ Clear
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-5">
              <span className="font-heading font-700 text-sm text-[#111827]">Filters</span>
              {activeCount > 0 && (
                <span className="text-xs font-800 px-2 py-0.5 rounded-full bg-orange-50 text-[#FB923C] border border-orange-200">
                  {activeCount} active
                </span>
              )}
            </div>
            <FilterPanel />
            {isFiltered && (
              <button onClick={() => setF(DEFAULT)} suppressHydrationWarning
                className="mt-5 w-full text-xs text-[#9CA3AF] hover:text-[#374151] transition-colors text-center">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobile filter panel */}
          {showFilters && (
            <div className="lg:hidden bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-4">
              <FilterPanel />
              {isFiltered && (
                <button onClick={() => { setF(DEFAULT); setShowFilters(false) }} suppressHydrationWarning
                  className="mt-4 w-full text-xs text-[#9CA3AF] hover:text-[#374151] text-center">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Active chips row */}
          {(activeCount > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {f.type !== 'all' && (
                <button onClick={() => setF(p => ({ ...p, type: 'all' }))} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 bg-orange-50 text-[#FB923C] border border-orange-200">
                  {TYPE_OPTIONS.find(t => t.id === f.type)?.label} ✕
                </button>
              )}
              {f.tag && (
                <button onClick={() => setF(p => ({ ...p, tag: '' }))} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 bg-orange-50 text-[#FB923C] border border-orange-200">
                  #{f.tag} ✕
                </button>
              )}
              {f.cities.map(c => (
                <button key={c} onClick={() => toggle('cities', c)} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 bg-orange-50 text-[#FB923C] border border-orange-200">
                  {c} ✕
                </button>
              ))}
              {f.bhk.map(b => (
                <button key={b} onClick={() => toggle('bhk', b)} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 bg-orange-50 text-[#FB923C] border border-orange-200">
                  {b} BHK ✕
                </button>
              ))}
              {f.budget !== null && (
                <button onClick={() => setF(p => ({ ...p, budget: null }))} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 bg-orange-50 text-[#FB923C] border border-orange-200">
                  {BUDGET_OPTIONS[f.budget].label} ✕
                </button>
              )}
              {f.status.map(s => (
                <button key={s} onClick={() => toggle('status', s)} suppressHydrationWarning
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-600 bg-orange-50 text-[#FB923C] border border-orange-200">
                  {s} ✕
                </button>
              ))}
            </div>
          )}

          {/* Count */}
          <p className="text-[#6B7280] text-sm mb-5">
            <span className="text-[#111827] font-700">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'property' : 'properties'} found
          </p>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => <PropertyCard key={p.id} property={p} userId={userId} savedIds={savedIds} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-[#E5E7EB] rounded-2xl">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-heading text-xl font-700 mb-2 text-[#111827]">No properties found</h3>
              <p className="text-[#6B7280] text-sm mb-5">Try adjusting your filters or search terms</p>
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
