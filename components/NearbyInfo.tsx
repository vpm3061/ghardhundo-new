type NearbyEntry = { name: string; distance: string }

export default function NearbyInfo({ nearby }: { city?: string | null; nearby?: Record<string, unknown> | null }) {
  const toItems = (value: unknown): NearbyEntry[] => Array.isArray(value)
    ? value
      .filter((item): item is { name: string; distance?: string } => !!item && typeof item === 'object' && typeof (item as { name?: unknown }).name === 'string')
      .map(item => ({ name: item.name, distance: item.distance || '' }))
    : []

  const categories = [
    { key: 'metro', icon: '🚇', label: 'Metro' },
    { key: 'railway_station', icon: '🚆', label: 'Railway Station' },
    { key: 'airport', icon: '✈️', label: 'Airport' },
    { key: 'schools', icon: '🏫', label: 'Schools' },
    { key: 'hospitals', icon: '🏥', label: 'Hospitals' },
  ].map(category => ({ ...category, items: toItems(nearby?.[category.key]) }))
    .filter(category => category.items.length > 0)

  if (!categories.length) return null

  return (
    <section className="mb-5" aria-label="Nearby places">
      <h2 className="font-heading text-lg font-700 mb-3 text-[#111827]">Nearby Places</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(category => (
          <div key={category.key} className="glass-2 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg" aria-hidden="true">{category.icon}</span>
              <span className="text-xs font-700 tracking-wider uppercase text-[#6B7280]">{category.label}</span>
            </div>
            <div className="flex flex-col gap-2">
              {category.items.map(item => (
                <div key={`${category.key}-${item.name}`} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#111827]">{item.name}</span>
                  {item.distance && <span className="text-xs font-700 shrink-0 text-orange-500">{item.distance}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
