import Link from 'next/link'

export default function Footer() {
  return <footer className="bg-slate-900 px-4 py-8 text-white sm:px-6">
    <div className="mx-auto max-w-7xl">
      <p className="text-sm leading-relaxed">Orenzaa is a technology-enabled Real Estate Aggregator &amp; Discovery Platform. Orenzaa is NOT a developer, property owner, or title guarantor. Orenzaa holds zero financial or legal liability for property disputes. All transactions must be verified independently.</p>
      <p className="mt-3 text-xs text-slate-300">Orenzaa does not collect property booking or token funds. Property payments go directly between the buyer and the dealer or builder.</p>
      <p className="mt-4 text-xs text-slate-400">© {new Date().getFullYear()} Orenzaa · <Link href="/trust" className="underline">Trust &amp; Transparency</Link></p>
    </div>
  </footer>
}
