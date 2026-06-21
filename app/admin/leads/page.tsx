import { createClient } from '@/lib/supabase/server'
import LeadsClient from './LeadsClient'

export default async function AdminLeadsPage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*, properties(title)')
    .order('ai_score', { ascending: false })

  const cities = [...new Set((leads || []).map(l => l.city).filter(Boolean) as string[])].sort()

  return (
    <div>
      <LeadsClient leads={leads || []} cities={cities} />
    </div>
  )
}
