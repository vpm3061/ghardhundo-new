'use client'
import Link from 'next/link'
import { passMessage, type VipPass } from '@/lib/trust'

export default function DigitalVipPass({ pass }: { pass: VipPass }) {
  function download() {
    const escape = (s: string) => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!))
    const lines = passMessage(pass).split('\n').slice(1).flatMap(line => line.match(/.{1,62}/gu) || [''])
    const height = Math.max(650, 200 + lines.length * 50)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}"><rect width="1080" height="${height}" rx="32" fill="#fff7ed"/><rect width="1080" height="110" rx="32" fill="#2b3f59"/><text x="48" y="70" font-family="Arial" font-size="38" fill="#ffffff">ORENZAA · DIGITAL VIP PASS</text>${lines.map((line, i) => `<text x="48" y="${175 + i * 50}" font-family="Arial" font-size="25" fill="#2b3f59">${escape(line)}</text>`).join('')}</svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = `${pass.id}.svg`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <div className="space-y-4" role="status">
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
        <img src="/orenzaa-brand.svg" alt="Orenzaa" width={270} height={64} className="mb-5 h-auto w-48 max-w-full" />
        <h3 className="font-bold text-lg text-slate-800">Digital VIP Site Visit Pass</h3>
        <dl className="mt-4 space-y-3 text-sm text-slate-700">
          {[['Client', pass.name], ['Buyer phone', pass.maskedPhone || '****'], ['Project', pass.project], ['Micro-market', 'Prayagraj'], ['Pass ID', pass.id], ['Requested visit date', pass.visitDate]].map(([label, value]) => (
            <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="break-words font-semibold">{value}</dd></div>
          ))}
        </dl>
        <p className="mt-4 border-t border-orange-200 pt-3 text-xs font-semibold text-slate-700">Mapped under Orenzaa Partner Network</p>
        <p className="mt-2 text-xs text-slate-600">Your request is saved. Our team will confirm the visit time.</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a href={`/api/vip-pass/${encodeURIComponent(pass.id)}/pdf`} className="rounded-xl bg-slate-700 px-3 py-3 text-center text-sm font-semibold text-white">Download PDF</a>
        <button type="button" onClick={download} className="rounded-xl bg-slate-800 px-3 py-3 text-sm font-semibold text-white">Download Pass</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(passMessage(pass))}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-700 px-3 py-3 text-center text-sm font-semibold text-white">Share to WhatsApp</a>
      </div>
      <Link href="/visits" className="block text-center text-sm text-orange-700 underline">My saved visit passes</Link>
    </div>
  )
}
