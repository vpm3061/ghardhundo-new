import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import PropertyEditClient from './PropertyEditClient'
import type { Property } from '@/lib/supabase/types'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/list-property/${id}/edit`)

  const { data: property } = await supabase.from('properties').select('*').eq('id', id).single()
  if (!property) notFound()
  if (property.created_by !== user.id && property.listed_by !== user.id) redirect('/expert')

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
        <PropertyEditClient property={property as Property} />
      </main>
      <MobileNav />
    </>
  )
}
