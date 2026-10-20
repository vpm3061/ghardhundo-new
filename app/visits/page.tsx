import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import DigitalVipPass from '@/components/DigitalVipPass'

export const metadata: Metadata = { title: 'My VIP Visit Passes', robots: { index: false, follow: true } }

export default async function VisitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/visits')
  const { data, error } = await supabase.from('leads').select('id,name,project_name,vip_pass_id,visit_date')
    .eq('user_id', user.id).not('vip_pass_id', 'is', null).order('created_at', { ascending: false }).limit(50)
  return <>
    <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-10 pb-28">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">My VIP Visit Passes</h1>
      {error ? <p role="alert">Could not load your passes. Please reload to retry.</p> : !data?.length ? <p>No visit passes yet. Choose a property and schedule your first visit.</p> : (
        <div className="grid gap-6 md:grid-cols-2">{data.map(lead => <DigitalVipPass key={lead.id} pass={{ id: lead.vip_pass_id, name: lead.name, project: lead.project_name, visitDate: lead.visit_date }} />)}</div>
      )}
    </main>
    <MobileNav />
  </>
}
