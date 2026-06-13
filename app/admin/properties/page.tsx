import { createClient } from '@/lib/supabase/server'
import PropertiesManageClient from './PropertiesManageClient'
import type { Property } from '@/lib/supabase/types'

export default async function AdminPropertiesPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-heading text-2xl font-700 mb-6">Property Management</h1>
      <PropertiesManageClient properties={(properties || []) as Property[]} />
    </div>
  )
}
