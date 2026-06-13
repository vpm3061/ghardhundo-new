'use client'
import QRCode from 'react-qr-code'

interface AppointmentSlipProps {
  leadId: string
  buyerName: string
  buyerPhone: string
  propertyTitle: string
  propertyCity?: string
  visitDate: string
}

export default function AppointmentSlip({
  leadId, buyerName, buyerPhone, propertyTitle, propertyCity, visitDate,
}: AppointmentSlipProps) {
  const slipUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/leads/${leadId}`

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
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <div>
            <div className="font-bold text-xl text-[#0c0c0c]" style={{ fontFamily: 'Syne, sans-serif' }}>GharDhundo</div>
            <div className="text-xs text-gray-500 mt-0.5">Site Visit Appointment</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Lead ID</div>
            <div className="font-mono text-xs font-bold text-gray-700">{leadId.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>

        {/* Buyer */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Buyer Details</div>
          <div className="font-bold text-lg">{buyerName}</div>
          <div className="text-gray-600 text-sm">{buyerPhone}</div>
        </div>

        {/* Property */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Property</div>
          <div className="font-semibold text-sm">{propertyTitle}</div>
          {propertyCity && <div className="text-gray-500 text-xs mt-0.5">{propertyCity}</div>}
        </div>

        {/* Visit Date */}
        <div className="flex items-center justify-between mb-5 p-3 bg-[#E8FF47]/10 border border-[#E8FF47]/30 rounded-xl">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Visit Date</div>
            <div className="font-bold text-[#0c0c0c]">{visitDate}</div>
          </div>
          <div className="text-2xl">📅</div>
        </div>

        {/* QR + CP Stamp */}
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <QRCode value={slipUrl} size={90} bgColor="white" fgColor="#0c0c0c" level="M" />
          </div>
          <div className="flex-1">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">CP / Agent Stamp</div>
              <div className="h-10" />
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[10px] text-gray-400">
          This slip is valid for the scheduled visit only · GharDhundo · Real Estate Advisory
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
