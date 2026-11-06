'use client'
import { useEffect, useState } from 'react'

export default function PropertyDetailClient({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => {
    if (!isViewerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsViewerOpen(false)
      if (event.key === 'ArrowLeft') setCurrent(index => (index - 1 + photos.length) % photos.length)
      if (event.key === 'ArrowRight') setCurrent(index => (index + 1) % photos.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isViewerOpen, photos.length])

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-72 bg-[#161616] border border-[#2a2a2a] rounded-2xl flex items-center justify-center">
        <div className="text-center text-[#555]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative w-full h-72 sm:h-96 bg-slate-100 rounded-2xl overflow-hidden">
        <img
          src={photos[current]}
          alt={`Photo ${current + 1}`}
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setIsViewerOpen(true)}
        />
        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/80"
          aria-label="View full-size photo"
        >
          View full image
        </button>
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(c => (c - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </button>
            <button
              onClick={() => setCurrent(c => (c + 1) % photos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {current + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {photos.map((ph, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? 'border-[#E8FF47]' : 'border-transparent'
              }`}
            >
              <img src={ph} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Property photo ${current + 1} of ${photos.length}`}
          onClick={() => setIsViewerOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsViewerOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
            aria-label="Close full-size photo"
          >
            Close ✕
          </button>
          {photos.length > 1 && (
            <button
              type="button"
              onClick={event => { event.stopPropagation(); setCurrent(index => (index - 1 + photos.length) % photos.length) }}
              className="absolute left-3 sm:left-8 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}
          <img
            src={photos[current]}
            alt={`Property photo ${current + 1}`}
            className="max-h-full max-w-full object-contain"
            onClick={event => event.stopPropagation()}
          />
          {photos.length > 1 && (
            <button
              type="button"
              onClick={event => { event.stopPropagation(); setCurrent(index => (index + 1) % photos.length) }}
              className="absolute right-3 sm:right-8 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
              aria-label="Next photo"
            >
              ›
            </button>
          )}
          <div className="absolute bottom-4 rounded-full bg-white/15 px-3 py-1 text-sm text-white">
            {current + 1} / {photos.length} · use arrow keys to browse
          </div>
        </div>
      )}
    </div>
  )
}
