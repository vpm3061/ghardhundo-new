import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-6">🏠</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8">This page does not exist or has been removed.</p>
      <Link href="/" className="px-6 py-3 bg-[#FB923C] text-white font-semibold rounded-xl hover:bg-[#F59E0B]">
        ← Go Home
      </Link>
    </div>
  )
}
