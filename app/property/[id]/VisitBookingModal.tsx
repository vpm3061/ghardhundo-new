'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  propertyId: string
  propertyTitle: string
  userId: string | null
}

export default function VisitBookingModal({ propertyId, propertyTitle, userId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'slip'>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [slipNumber, setSlipNumber] = useState('')
  const [slipDate, setSlipDate] = useState('')

  const openModal = () => {
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setOpen(true)
    setStep('form')
    setName('')
    setPhone('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const slip = 'ORZ-' + String(Math.floor(100000 + Math.random() * 900000))
    const validity = new Date()
    validity.setDate(validity.getDate() + 30)

    const supabase = createClient()
    await supabase.from('leads').insert({
      property_id: propertyId,
      user_id: userId,
      name,
      phone,
      message: `Site visit booking. Slip: ${slip}`,
    })

    setSlipNumber(slip)
    setSlipDate(validity.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
    setStep('slip')
    setLoading(false)
  }

  const waText = encodeURIComponent(
    `Hi, I have a site visit booking.\nSlip: ${slipNumber}\nProperty: ${propertyTitle}\nName: ${name}`
  )

  return (
    <>
      <button
        onClick={openModal}
        className="w-full py-3.5 rounded-xl text-white font-700 text-sm transition-all mb-4"
        style={{ background: 'linear-gradient(135deg, #FB923C, #F59E0B)', boxShadow: '0 4px 16px rgba(251,146,60,0.3)' }}
      >
        📅 Book Site Visit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {step === 'form' ? (
              <>
                <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-800 text-[#111827]">Book a Site Visit</h2>
                    <p className="text-sm text-[#6B7280] mt-0.5 truncate max-w-xs">{propertyTitle}</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#F5F5F4] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wider text-[#6B7280] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] outline-none focus:border-[#FB923C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wider text-[#6B7280] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] outline-none focus:border-[#FB923C] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-700 text-sm disabled:opacity-60 mt-2"
                    style={{ background: 'linear-gradient(135deg, #FB923C, #F59E0B)' }}
                  >
                    {loading ? 'Booking…' : 'Confirm Booking →'}
                  </button>
                </form>
              </>
            ) : (
              <div className="p-6">
                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3 text-2xl">
                    ✅
                  </div>
                  <h2 className="font-heading text-xl font-800 text-[#111827]">Visit Confirmed!</h2>
                  <p className="text-sm text-[#6B7280] mt-1">Your digital visit slip is ready</p>
                </div>

                <div className="border-2 border-dashed border-[#FB923C] rounded-2xl p-5 mb-5 bg-[#FFF7ED]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-800 text-[#111827] text-lg">
                      ORENZ<span className="text-[#FB923C]">AA</span>
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-[#FB923C] font-700">
                      SITE VISIT SLIP
                    </span>
                  </div>
                  <div className="space-y-2.5 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Slip No.</span>
                      <span className="font-700 text-[#111827]">{slipNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Visitor</span>
                      <span className="font-700 text-[#111827]">{name}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#6B7280] shrink-0">Property</span>
                      <span className="font-700 text-[#111827] text-right truncate">{propertyTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Valid Until</span>
                      <span className="font-700 text-green-600">{slipDate}</span>
                    </div>
                  </div>
                  <div className="border-t border-orange-200 pt-3 text-xs text-[#6B7280]">
                    Special Offers: Pre-launch pricing available · Free site visit assistance
                  </div>
                </div>

                <div className="flex gap-3 mb-3">
                  <a
                    href={`https://wa.me/919643693090?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl text-sm font-700 text-center transition-all"
                    style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}
                  >
                    WhatsApp Us
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 rounded-xl text-sm font-700 text-center bg-[#F5F5F4] text-[#374151] hover:bg-[#E5E7EB] transition-colors"
                  >
                    🖨️ Print Slip
                  </button>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-2.5 rounded-xl text-sm text-[#9CA3AF] hover:text-[#374151] transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
