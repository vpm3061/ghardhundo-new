'use client'
import QRCode from 'react-qr-code'

interface PurchaseSlipProps {
  leadId: string
  buyerName: string
  buyerPhone: string
  propertyTitle: string
  propertyCity?: string
  dealAmount: number | null
  dealDate: string
}

export default function PurchaseSlip({
  leadId, buyerName, buyerPhone, propertyTitle, propertyCity, dealAmount, dealDate,
}: PurchaseSlipProps) {
  const refNumber = `GD-${leadId.slice(0, 6).toUpperCase()}-${new Date().getFullYear()}`
  const slipUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/leads/${leadId}`

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString('en-IN')}`

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-slip { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>

      <div className="print-slip bg-white text-black rounded-2xl p-6 max-w-md mx-auto font-sans border border-[#2a2a2a] print:border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-4">
          <div>
            <div className="font-bold text-xl text-[#0c0c0c]" style={{ fontFamily: 'Syne, sans-serif' }}>GharDhundo</div>
            <div className="text-xs text-gray-500 mt-0.5">Deal Confirmation Slip</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Reference No.</div>
            <div className="font-mono text-sm font-bold text-gray-900">{refNumber}</div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 mb-4">
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-bold text-green-800 text-sm">Deal Confirmed</div>
            <div className="text-green-600 text-xs">{dealDate}</div>
          </div>
        </div>

        {/* Buyer */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Buyer</div>
          <div className="font-bold text-lg">{buyerName}</div>
          <div className="text-gray-600 text-sm">{buyerPhone}</div>
        </div>

        {/* Property */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Property</div>
          <div className="font-semibold">{propertyTitle}</div>
          {propertyCity && <div className="text-gray-500 text-xs mt-0.5">{propertyCity}</div>}
        </div>

        {/* Deal Amount */}
        {dealAmount && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Deal Value</div>
            <div className="text-2xl font-bold text-[#0c0c0c]">{fmt(dealAmount)}</div>
          </div>
        )}

        {/* QR */}
        <div className="flex items-center gap-4 mt-4">
          <QRCode value={slipUrl} size={80} bgColor="white" fgColor="#0c0c0c" level="M" />
          <div className="text-xs text-gray-400 leading-relaxed">
            Scan to verify this deal record on GharDhundo. Reference: <span className="font-mono font-bold text-gray-700">{refNumber}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400">
          This is a GharDhundo internal deal confirmation. Not a legal document of sale.
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="no-print mt-4 btn-accent w-full text-sm"
        suppressHydrationWarning
      >
        Print / Save as PDF
      </button>
    </>
  )
}
