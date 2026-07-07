import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import AdminPartnersClient from './AdminPartnersClient'
import type { Metadata } from 'next'
import type { Application } from './AdminPartnersClient'

export const metadata: Metadata = { title: 'Partner Applications | Admin' }

export default async function AdminPartnersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('partner_applications')
    .select(`
      id,
      status,
      created_at,
      user_id,
      full_name,
      city,
      phone,
      rera_number,
      partner_type,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  const applications = (data || []) as Application[]

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-12">
        <div className="mb-6">
          <div className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: '#FB923C' }}>Admin</div>
          <h1 className="font-heading text-2xl font-800 text-[#111827]">Partner Applications</h1>
          <p className="text-sm text-[#6B7280] mt-1">{applications.length} total applications</p>
        </div>
        <AdminPartnersClient applications={applications} />
      </main>
    </>
  )
}
