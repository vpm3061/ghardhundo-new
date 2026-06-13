'use client'
import { useState } from 'react'

export default function PropertyDetailClient({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0)

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
      <div className="relative w-full h-72 sm:h-96 bg-[#161616] rounded-2xl overflow-hidden">
        <img
          src={photos[current]}
          alt={`Photo ${current + 1}`}
          className="w-full h-full object-cover"
        />
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
    </div>
  )
}
