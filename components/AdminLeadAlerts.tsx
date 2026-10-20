'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Alert = { id: string; lead_id: string; event_type: string; created_at: string }

export default function AdminLeadAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [error, setError] = useState('')
  const router = useRouter()
  useEffect(() => {
    const supabase = createClient()
    let active = true
    async function load() {
      const { data, error } = await supabase.from('lead_notifications')
        .select('id, lead_id, event_type, created_at').is('read_at', null)
        .order('created_at', { ascending: false }).limit(5)
      if (active) {
        if (error) setError('Lead alerts are temporarily unavailable.')
        else { setAlerts(data || []); setError('') }
      }
    }
    void load()
    const channel = supabase.channel('admin-lead-alerts').on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'lead_notifications' },
      () => { void load(); router.refresh() }).subscribe()
    // Also recover missed events after reconnecting/backgrounding.
    const timer = setInterval(() => { void load() }, 30000)
    return () => { active = false; clearInterval(timer); void supabase.removeChannel(channel) }
  }, [router])
  async function acknowledge(id: string) {
    const { error } = await createClient().from('lead_notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    if (error) { setError('Could not acknowledge alert. Please retry.'); return }
    setAlerts(items => items.filter(item => item.id !== id))
  }
  if (!alerts.length && !error) return null
  return <section aria-label="New lead notifications" aria-live="polite" className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
    <h2 className="font-semibold text-slate-800">New enquiries</h2>
    {error && <p className="text-sm text-red-700">{error}</p>}
    {alerts.map(alert => <div key={alert.id} className="mt-2 flex items-center justify-between gap-3 text-sm">
      <Link className="font-medium text-orange-800 underline" href={`/admin/leads/${alert.lead_id}`}>{alert.event_type === 'visit.requested' ? 'New VIP site visit request' : 'New private enquiry'}</Link>
      <button type="button" onClick={() => acknowledge(alert.id)} className="shrink-0 rounded-lg border border-orange-200 px-3 py-2">Mark read</button>
    </div>)}
  </section>
}
