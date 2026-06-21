'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-[#FAFAF9]">
      <div className="mb-6 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-red-50 border border-red-100">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="font-heading text-2xl font-800 mb-2 text-[#111827]">Kuch galat ho gaya</h1>
      <p className="text-sm mb-8 text-[#6B7280]">
        Ek unexpected error aaya. Please dobara try karo.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl font-600 text-sm text-white transition-all bg-[#FB923C] hover:bg-[#F59E0B]"
      >
        Dobara Try Karo
      </button>
    </div>
  )
}
