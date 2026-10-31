import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import DigitalVipPass from '@/components/DigitalVipPass'
import { hideOwnerContact } from '@/lib/property-privacy'
import type { Property } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'My VIP Visit Passes', robots: { index: false, follow: true } }

export default async function VisitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/visits')

  const [{ data: passes, error }, { data: savedRows }] = await Promise.all([
    supabase.from('vip_passes').select('pass_id,buyer_name,buyer_phone_masked,property_id,visit_timestamp,tagging_valid_until,purpose,urgency_timeline,base_price_amount,stamp_duty_amount,legal_fees_amount,leads(project_name)')
      .eq('buyer_user_id', user.id).gt('tagging_valid_until', new Date().toISOString()).order('created_at', { ascending: false }).limit(50),
    supabase.from('saved_properties').select('properties(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const savedProperties = (savedRows || []).map(row => {
    const property = Array.isArray(row.properties) ? row.properties[0] : row.properties
    return property ? hideOwnerContact(property as Property) : null
  }).filter(Boolean) as Property[]

  return <>
    <Navbar />
    <main className="mx-auto max-w-5xl px-4 py-10 pb-28">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">My VIP Visit Passes</h1>
      <p className="mb-6 text-sm text-slate-600">Your active visit tickets and saved property shortlist.</p>
      {error ? <p role="alert">Could not load your passes. Please reload to retry.</p> : !passes?.length ? <p className="mb-8 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">No active passes. Pick a property and request a site visit to create one.</p> : (
        <div className="mb-10 grid gap-6 md:grid-cols-2">{passes.map(pass => {
          const leadData = Array.isArray(pass.leads) ? pass.leads[0] : pass.leads
          const base = pass.base_price_amount == null ? null : Number(pass.base_price_amount)
          const stampDuty = pass.stamp_duty_amount == null ? null : Number(pass.stamp_duty_amount)
          const legalFees = pass.legal_fees_amount == null ? null : Number(pass.legal_fees_amount)
          return <DigitalVipPass key={pass.pass_id} pass={{
            id: pass.pass_id, name: pass.buyer_name, project: leadData?.project_name || 'Property visit',
            visitDate: pass.visit_timestamp.slice(0, 10), maskedPhone: `+91 XXXXX-${pass.buyer_phone_masked.slice(-4)}`,
            purpose: pass.purpose || undefined,
            urgencyTimeline: pass.urgency_timeline || undefined,
            costBreakdown: { base, stampDuty, legalFees, onRoad: base == null || stampDuty == null || legalFees == null ? null : base + stampDuty + legalFees },
          }} />
        })}</div>
      )}
      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-800">Saved Properties</h2>
        {savedProperties.length ? <div className="grid gap-3 sm:grid-cols-2">{savedProperties.map(property => (
          <Link key={property.id} href={`/property/${property.id}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-orange-300">
            <p className="font-semibold text-slate-800">{property.title}</p>
            <p className="mt-1 text-xs text-slate-500">{[property.locality, property.city].filter(Boolean).join(', ')}</p>
            <p className="mt-2 text-sm text-slate-700">{property.listing_intent === 'rent' || property.property_category === 'rental'
              ? `₹${Number(property.monthly_rent || 0).toLocaleString('en-IN')} / month`
              : property.total_on_road_valuation != null
                ? `Estimated on-road ₹${Number(property.total_on_road_valuation).toLocaleString('en-IN')}`
                : property.price_min != null ? `Base price ₹${Number(property.price_min).toLocaleString('en-IN')} · full quote pending` : 'Price on request'}</p>
          </Link>
        ))}</div> : <p className="text-sm text-slate-500">You have not saved any properties yet.</p>}
      </section>
    </main>
    <MobileNav />
  </>
}
