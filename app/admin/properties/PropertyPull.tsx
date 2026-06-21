'use client'
import { useState } from 'react'

export type PullResult = {
  title?: string | null
  builder?: string | null
  city?: string | null
  sector?: string | null
  price_min?: string | number | null
  price_max?: string | number | null
  bhk?: string | null
  status?: string | null
  rera_number?: string | null
  possession_date?: string | null
  description?: string | null
  amenities?: string | null
  youtube_url?: string | null
  confidence?: number | null
}

const FIELD_LABELS: [keyof PullResult, string][] = [
  ['title',          'Title'],
  ['builder',        'Builder'],
  ['city',           'City'],
  ['sector',         'Sector'],
  ['price_min',      'Min Price'],
  ['price_max',      'Max Price'],
  ['bhk',            'BHK'],
  ['status',         'Status'],
  ['rera_number',    'RERA'],
  ['possession_date','Possession'],
  ['description',    'Description'],
  ['amenities',      'Amenities'],
]

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#22C55E' : score >= 55 ? '#F59E0B' : '#EF4444'
  const bg    = score >= 80 ? 'rgba(16,185,129,0.1)' : score >= 55 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'
  const border= score >= 80 ? 'rgba(16,185,129,0.3)' : score >= 55 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'
  const label = score >= 80 ? 'High confidence' : score >= 55 ? 'Medium confidence — please verify' : 'Low confidence — review carefully'
  return (
    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
      style={{ background: bg, border: `1px solid ${border}`, color }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20,6 9,17 4,12"/>
      </svg>
      <span className="font-700">{score}% confident</span>
      <span style={{ color: '#6B7280' }}>— {label}</span>
    </div>
  )
}

export default function PropertyPull({ onFill }: { onFill: (data: PullResult) => void }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<PullResult | null>(null)

  const handleExtract = async () => {
    const trimmed = input.trim()
    if (!trimmed) { setError('Paste a URL, brochure text, or any property details'); return }
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/property-pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      })
      const data: PullResult = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error || 'Extraction failed')
      setResult(data)
      onFill(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const filledFields = result
    ? FIELD_LABELS.filter(([k]) => result[k] != null && result[k] !== '')
    : []

  return (
    <div className="mb-5 rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(251,146,60,0.15)', background: 'rgba(124,58,237,0.04)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(251,146,60,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <p className="font-heading font-700 text-sm" style={{ color: '#111827' }}>AI Property Extractor</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Paste a URL, brochure text, WhatsApp message — Claude fills all fields
          </p>
        </div>
      </div>

      {/* Textarea */}
      <div className="px-5 pt-4 pb-3">
        <textarea
          className="input-dark text-sm w-full resize-none"
          style={{ minHeight: '110px' }}
          placeholder={`Paste anything:\n• https://99acres.com/listing/...\n• "Shalimar Mannat, 2/3 BHK, Sector 3 Lucknow, ₹35L–₹45L, RERA UP123, possession Dec 2026"\n• Copy-paste from any brochure or WhatsApp`}
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); setResult(null) }}
          disabled={loading}
          suppressHydrationWarning
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleExtract}
            disabled={loading || !input.trim()}
            suppressHydrationWarning
            className="btn-accent text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
                  <path d="M12 3a9 9 0 019 9"/>
                </svg>
                Extracting…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
                </svg>
                Extract with AI
              </>
            )}
          </button>
          {result && (
            <button
              onClick={() => { setInput(''); setResult(null) }}
              className="text-xs transition-colors"
              style={{ color: '#9CA3AF' }}
              suppressHydrationWarning
            >
              Clear
            </button>
          )}
          <span className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
            Powered by Claude Sonnet
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-4 flex items-start gap-2 text-xs px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Result summary */}
      {result && (
        <div className="mx-5 mb-5 flex flex-col gap-3">
          {/* Confidence */}
          {result.confidence != null && <ConfidenceBadge score={result.confidence} />}

          {/* Extracted fields preview */}
          {filledFields.length > 0 && (
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <p className="text-[10px] font-700 uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
                {filledFields.length} fields extracted — form auto-filled ↓
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {filledFields.map(([k, label]) => (
                  <span key={k} className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}>
                    <span style={{ color: '#22C55E' }}>✓</span> {label}
                  </span>
                ))}
                {result.possession_date && (
                  <span className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}>
                    <span style={{ color: '#F59E0B' }}>📅</span> {result.possession_date}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
