'use client'
import { useState, useMemo } from 'react'

export default function EMICalculator({ defaultAmount = 5000000 }: { defaultAmount?: number }) {
  const [amount, setAmount] = useState(defaultAmount)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)

  const emi = useMemo(() => {
    const r = rate / 12 / 100
    const n = tenure * 12
    if (r === 0) return amount / n
    return (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }, [amount, rate, tenure])

  const totalAmount = emi * tenure * 12
  const totalInterest = totalAmount - amount
  const principalPct = Math.round((amount / totalAmount) * 100)

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${Math.round(n).toLocaleString('en-IN')}`

  const Slider = ({ min, max, step, value, onChange }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void }) => (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(+e.target.value)}
      className="w-full h-1.5 rounded-full cursor-pointer appearance-none"
      style={{
        background: `linear-gradient(to right, #FB923C ${((value - min) / (max - min)) * 100}%, rgba(0,0,0,0.04) ${((value - min) / (max - min)) * 100}%)`,
        accentColor: '#FB923C',
      }}
    />
  )

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        </div>
        <h3 className="font-heading font-700 text-[#111827]">EMI Calculator</h3>
      </div>

      <div className="space-y-5">
        {[
          { label: 'Loan Amount', display: fmt(amount), slider: { min: 500000, max: 50000000, step: 100000, value: amount, onChange: setAmount } },
          { label: 'Interest Rate', display: `${rate}%`, slider: { min: 6, max: 15, step: 0.25, value: rate, onChange: setRate } },
          { label: 'Tenure', display: `${tenure} yrs`, slider: { min: 5, max: 30, step: 1, value: tenure, onChange: setTenure } },
        ].map(({ label, display, slider }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-2.5">
              <span className="text-[#6B7280]">{label}</span>
              <span className="font-700 text-[#FB923C]">{display}</span>
            </div>
            <Slider {...slider} />
          </div>
        ))}
      </div>

      <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
        {/* EMI display */}
        <div className="text-center mb-5 py-4 rounded-2xl"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <div className="text-[#6B7280] text-xs mb-1">Monthly EMI</div>
          <div className="font-heading text-3xl font-800" style={{ color: '#FB923C' }}>
            ₹{Math.round(emi).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Principal vs Interest bar */}
        <div className="mb-4">
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(0,0,0,0.03)' }}>
            <div className="h-full rounded-l-full transition-all duration-500" style={{ width: `${principalPct}%`, background: '#FB923C' }} />
            <div className="h-full flex-1 rounded-r-full" style={{ background: '#F59E0B' }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FB923C] inline-block" /> Principal
            </span>
            <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
              Interest <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Principal', val: fmt(amount) },
            { label: 'Interest', val: fmt(totalInterest) },
            { label: 'Total', val: fmt(totalAmount) },
          ].map(({ label, val }) => (
            <div key={label} className="text-center p-3 rounded-xl" style={{ background: '#FAFAF9', border: '1px solid #E5E7EB' }}>
              <div className="text-[#9CA3AF] text-[10px] mb-1">{label}</div>
              <div className="font-700 text-xs text-[#111827]">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
