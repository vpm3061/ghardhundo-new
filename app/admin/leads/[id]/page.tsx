import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LeadDetailClient from './LeadDetailClient'
import AppointmentSlip from '@/components/AppointmentSlip'
import PurchaseSlip from '@/components/PurchaseSlip'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('*, properties(title, city, builder)')
    .eq('id', id)
    .single()

  if (!lead) notFound()

  const visitDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const tierGradient =
    lead.tier === 'HOT'  ? { from: 'rgba(239,68,68,0.12)',   color: '#EF4444' } :
    lead.tier === 'WARM' ? { from: 'rgba(245,158,11,0.12)',  color: '#F59E0B' } :
                           { from: 'rgba(59,130,246,0.12)',  color: '#3B82F6' }

  return (
    <div className="max-w-2xl mx-auto">
      <a href="/admin" className="inline-flex items-center gap-1.5 text-[#8B8BA8] hover:text-[#F1F0FF] text-sm mb-6 transition-colors">
        ← Back to Leads
      </a>

      <div className="glass p-6 mb-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-800 text-[#F1F0FF]">{lead.name}</h1>
            <p className="text-[#8B8BA8] text-sm mt-1">{lead.phone}</p>
          </div>
          <div className="text-center shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1.5"
              style={{ background: tierGradient.from, border: `1px solid ${tierGradient.color}30` }}>
              <span className="font-heading text-2xl font-800" style={{ color: tierGradient.color }}>
                {lead.ai_score}
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-700 tier-${lead.tier?.toLowerCase()}`}>
              {lead.tier}
            </span>
          </div>
        </div>

        {/* AI Answers grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label: 'City',        value: lead.city        },
            { label: 'Budget',      value: lead.budget      },
            { label: 'Timeline',    value: lead.timeline    },
            { label: 'BHK',         value: lead.bhk         },
            { label: 'Loan Status', value: lead.loan_status },
            { label: 'Purpose',     value: lead.purpose     },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[#4A4A6A] text-[10px] uppercase tracking-wider mb-0.5">{label}</div>
              <div className="text-sm font-600 text-[#F1F0FF]">{value}</div>
            </div>
          ))}
        </div>

        {lead.properties && (
          <div className="rounded-xl p-3 mb-5" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <div className="text-[#4A4A6A] text-[10px] uppercase tracking-wider mb-0.5">Interested Property</div>
            <div className="font-700 text-[#F1F0FF]">{lead.properties.title}</div>
            <div className="text-[#8B8BA8] text-xs mt-0.5">
              {[lead.properties.builder, lead.properties.city].filter(Boolean).join(' · ')}
            </div>
          </div>
        )}

        <LeadDetailClient leadId={lead.id} currentStatus={lead.status} />
      </div>

      {/* Appointment Slip */}
      {lead.status === 'Visit Fixed' && (
        <div>
          <h2 className="font-heading font-700 mb-4 text-[#F1F0FF]">Appointment Slip</h2>
          <AppointmentSlip
            leadId={lead.id} buyerName={lead.name} buyerPhone={lead.phone}
            propertyTitle={lead.properties?.title || 'Property Visit'}
            propertyCity={lead.properties?.city || undefined}
            visitDate={visitDate}
          />
        </div>
      )}

      {/* Purchase Slip */}
      {lead.status === 'Deal Done' && (
        <div>
          <h2 className="font-heading font-700 mb-4 text-[#F1F0FF]">Purchase Confirmation</h2>
          <PurchaseSlip
            leadId={lead.id} buyerName={lead.name} buyerPhone={lead.phone}
            propertyTitle={lead.properties?.title || 'Property'}
            propertyCity={lead.properties?.city || undefined}
            dealAmount={lead.deal_amount || null}
            dealDate={visitDate}
          />
        </div>
      )}
    </div>
  )
}
