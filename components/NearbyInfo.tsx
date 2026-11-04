export default function NearbyInfo({ nearby }: { city?: string | null; nearby?: Record<string, unknown> | null }) {
  const categories: { icon: string; label: string; items: { name: string; distance: string }[] }[] = []
  const metro = nearby?.metro
  const railway = nearby?.railway_station
  const toItems = (value: unknown) => Array.isArray(value)
    ? value.filter((item): item is { name: string; distance?: string } => !!item && typeof item === 'object' && typeof (item as { name?: unknown }).name === 'string')
      .map(item => ({ name: item.name, distance: item.distance || '' }))
    : []
  const metroItems = toItems(metro)
  const railwayItems = toItems(railway)
  if (metroItems.length) categories.push({ icon: '🚇', label: 'Metro', items: metroItems })
  if (railwayItems.length) categories.push({ icon: '🚆', label: 'Railway Station', items: railwayItems })
  if (!categories.length) return null

  return (
    <div className="mb-5">
      <h2 className="font-heading text-lg font-700 mb-3 text-[#111827]">Nearby Places</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(cat => (
          <div key={cat.label} className="glass-2 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-xs font-700 tracking-wider uppercase text-[#6B7280]">{cat.label}</span>
            </div>
            <div className="flex flex-col gap-2">
              {cat.items.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-sm text-[#111827]">{item.name}</span>
                  <span className="text-xs font-700 ml-2 shrink-0" style={{ color: '#FB923C' }}>{item.distance}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
