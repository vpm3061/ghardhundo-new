'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ViewTracker({ propertyId, userId }: { propertyId: string; userId: string | null }) {
  useEffect(() => {
    if (!userId) return
    void (async () => {
      try { await createClient().from('property_views').insert({ property_id: propertyId, user_id: userId }) } catch {}
    })()
  }, [propertyId, userId])

  return null
}
