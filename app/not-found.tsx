'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-[#FAFAF9]">
      <div className="mb-6 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-orange-50 border border-orange-200">
        <span className="text-4xl">🏠</span>
      </div>
      <h1 className="font-heading text-5xl font-800 mb-2 text-[#111827]">404</h1>
      <p className="text-lg mb-1 text-[#6B7280]">Page not found</p>
      <p className="text-sm mb-8 text-[#9CA3AF]">
        Yeh property exist nahi karti ya hata di gayi hai.
      </p>
      <Link href="/"
        className="px-6 py-3 rounded-xl font-600 text-sm text-white transition-all bg-[#FB923C] hover:bg-[#F59E0B]">
        ← Wapas Home
      </Link>
    </div>
  )
}
