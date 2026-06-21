'use client'
import { useRef } from 'react'
import QRCode from 'react-qr-code'

interface QRSlipProps {
  leadId: string
  buyerName: string
  buyerPhone: string
  propertyTitle: string
  visitDate: string
}

export default function QRSlip({ leadId, buyerName, buyerPhone, propertyTitle, visitDate }: QRSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => window.print()

  const qrValue = `Orenzaa Lead: ${leadId} | ${buyerName} | ${propertyTitle} | ${visitDate}`

  return (
    <div>
      <div
        ref={slipRef}
        className="bg-white text-black rounded-2xl p-6 max-w-sm mx-auto border-2 border-[#E8FF47] print-only"
        id="qr-slip"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            <h2 className="font-heading font-800 text-xl text-black">Orenzaa</h2>
            <p className="text-gray-500 text-xs">Channel Partner Slip</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Date</div>
            <div className="text-sm font-600">{visitDate}</div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white border border-gray-200 rounded-xl">
            <QRCode value={qrValue} size={120} />
          </div>
        </div>

        {/* Lead ID */}
        <div className="text-center mb-4">
          <div className="text-xs text-gray-500 mb-1">Lead ID</div>
          <div className="font-mono text-sm font-700 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
            {leadId.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Buyer Name</span>
            <span className="font-600">{buyerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="font-600">{buyerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Property</span>
            <span className="font-600 text-right max-w-[160px] leading-tight">{propertyTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">CP Name</span>
            <span className="font-600">Orenzaa</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">Present this slip at the site visit</p>
          <p className="text-xs text-gray-400">Valid for 30 days from issuance</p>
        </div>
      </div>

      <div className="flex justify-center mt-4 no-print">
        <button onClick={handlePrint} className="btn-accent text-sm">
          🖨️ Print Slip
        </button>
      </div>
    </div>
  )
}
