'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const FIELDS = [
  ['base_carpet_rate', 'Base carpet rate (INR / sq. ft.)'],
  ['government_charges_estimate', 'Registry + stamp duty estimate (INR)'],
  ['gst_estimate', 'GST estimate (INR)'],
  ['maintenance_estimate', 'Maintenance estimate (INR)'],
  ['other_charges_estimate', 'Other disclosed charges (INR)'],
] as const
type PricingKey = typeof FIELDS[number][0]

export default function AdminPropertyTrust({ propertyId }: { propertyId: string }) {
  const [values, setValues] = useState<Record<PricingKey, string>>({ base_carpet_rate: '', government_charges_estimate: '', gst_estimate: '', maintenance_estimate: '', other_charges_estimate: '' })
  const [verified, setVerified] = useState(false)
  const [direct, setDirect] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    void createClient().from('properties').select('orenzaa_verified, direct_builder_pricing, base_carpet_rate, government_charges_estimate, gst_estimate, maintenance_estimate, other_charges_estimate')
      .eq('id', propertyId).single().then(({ data, error }) => {
        if (!active) return
        if (error) { setMessage('Could not load verification settings. Reload to retry.'); return }
        setValues(Object.fromEntries(FIELDS.map(([key]) => [key, data[key] == null ? '' : String(data[key])])) as Record<PricingKey, string>)
        setVerified(data.orenzaa_verified); setDirect(data.direct_builder_pricing); setReady(true)
      })
    return () => { active = false }
  }, [propertyId])
  async function save() {
    setBusy(true); setMessage('')
    const amounts = Object.fromEntries(FIELDS.map(([key]) => [key, values[key].trim() === '' ? null : Number(values[key])]))
    if (Object.values(amounts).some(n => n != null && (!Number.isFinite(n) || n < 0))) {
      setMessage('Amounts must be valid non-negative numbers.'); setBusy(false); return
    }
    const { data, error } = await createClient().from('properties').update({
      ...amounts, orenzaa_verified: verified, direct_builder_pricing: direct,
    }).eq('id', propertyId).select('id').single()
    setBusy(false)
    setMessage(error || !data ? error?.message || 'Could not save.' : 'Verification and pricing saved.')
  }
  return <section className="my-6 rounded-2xl border border-emerald-200 bg-white p-5">
    <h2 className="text-lg font-bold text-slate-800">Orenzaa Verification &amp; Price Transparency</h2>
    <p className="mt-2 text-sm text-slate-600">Save listing changes first. Verify the RERA record and builder quote before approving. Enter total charge amounts, not percentages; leave unknown amounts blank. Enter 0 only when a charge does not apply.</p>
    <fieldset disabled={!ready || busy} className="mt-4 space-y-4">
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} /> I have checked this property and its RERA number.</label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{FIELDS.map(([key, label]) => <label key={key} className="text-sm text-slate-700">{label}<input type="number" min="0" step="0.01" value={values[key]} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))} className="input-dark mt-1 w-full" /></label>)}</div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={direct} onChange={e => setDirect(e.target.checked)} /> Builder listing: I have confirmed direct pricing and all fees in the written quote.</label>
      <button type="button" onClick={save} className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save Verification & Pricing'}</button>
    </fieldset>
    {message && <p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}
  </section>
}
