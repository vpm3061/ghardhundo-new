import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CPL Terms',
  description: 'Cost Per Lead pricing and terms for builders on Orenzaa.',
}

export default function CPLTermsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12 pb-28 md:pb-12">
      <h1 className="text-3xl font-bold text-[#111827] mb-2">
        CPL — Cost Per Lead
      </h1>
      <p className="text-[#6B7280] mb-8">
        Orenzaa ke saath leads kharidne ki terms
      </p>

      {/* What builder gets */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-[#111827] text-lg mb-4">
          Har Lead Mein Milega:
        </h2>
        <ul className="space-y-3">
          {[
            { icon: '👤', text: 'Buyer ka poora naam' },
            { icon: '📱', text: 'Verified phone number' },
            { icon: '💰', text: 'Confirmed budget' },
            { icon: '📅', text: 'Timeline — kab lena hai' },
            { icon: '🏠', text: 'Property type preference' },
            { icon: '📍', text: 'Preferred city/locality' },
            { icon: '🏦', text: 'Loan status (ready/required/cash)' },
            { icon: '🔥', text: 'AI HOT Score 70+ — sirf serious buyers' },
          ].map(item => (
            <li key={item.text} className="flex items-center gap-3 text-[#374151]">
              <span className="text-xl">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How leads are delivered */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-[#111827] text-lg mb-4">
          Leads Kaise Milenge:
        </h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'WhatsApp pe seedha', desc: 'Har HOT lead aapke WhatsApp number pe turant bheja jaayega' },
            { step: '2', title: 'Monthly report', desc: 'Excel mein poore mahine ki leads — naam, phone, budget sab' },
            { step: '3', title: 'Response time', desc: 'Lead milne ke 24 ghante ke andar deliver karenge' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#FB923C] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-[#111827]">{item.title}</p>
                <p className="text-sm text-[#6B7280]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-[#111827] text-lg mb-4">
          Terms & Conditions:
        </h2>
        <ul className="space-y-3 text-sm text-[#374151]">
          {[
            'Ek lead = ek buyer — duplicate nahi denge',
            'Lead 30 din ke liye valid hai — baad mein expire',
            'Invalid number ya wrong info pe replacement lead milegi',
            'Deal hone ki guarantee nahi — leads qualified hain lekin conversion aap par hai',
            'Payment advance mein — leads milne shuru hongi 24 ghante mein',
            'Refund policy — invalid leads replace hongi, cancel nahi',
            'Lead details confidential rakho — share mat karo',
            'City/property type specify karo — wahi leads milenge',
          ].map((term, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#FB923C] font-bold flex-shrink-0">{i + 1}.</span>
              <span>{term}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div className="bg-[#111827] rounded-2xl p-6 mb-6 text-white">
        <h2 className="font-bold text-lg mb-4">Current Pricing:</h2>
        <div className="space-y-3">
          {[
            { name: 'Trial Pack', leads: 5, price: '₹2,500', perLead: '₹500/lead' },
            { name: 'Basic Pack', leads: 10, price: '₹4,000', perLead: '₹400/lead' },
            { name: 'Growth Pack', leads: 25, price: '₹8,000', perLead: '₹320/lead' },
          ].map(pkg => (
            <div key={pkg.name} className="flex justify-between items-center py-2 border-b border-gray-700">
              <div>
                <p className="font-semibold">{pkg.name}</p>
                <p className="text-gray-400 text-sm">{pkg.leads} leads • {pkg.perLead}</p>
              </div>
              <p className="text-[#FB923C] font-bold text-lg">{pkg.price}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-4">
          * Introductory pricing — limited time offer
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-[#6B7280] mb-4">
          Interested hain? Abhi contact karein:
        </p>
        <a href="https://wa.me/919643693090"
          className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-lg transition-all">
          💬 WhatsApp: 9643693090
        </a>
        <p className="text-xs text-[#9CA3AF] mt-3">
          Ya email karein: tellitorg1@gmail.com
        </p>
      </div>
      </div>
      <MobileNav />
    </>
  )
}
