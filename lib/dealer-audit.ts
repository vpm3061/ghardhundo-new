export type DealerAuditLead = {
  id: string
  buyer_label: string
  phone_masked: string
  property_id: string | null
  property_title: string | null
  pass_id: string | null
  visit_date: string | null
  purpose: string | null
  urgency_timeline: string | null
  created_at: string
  ai_score: number
  tier: 'HOT' | 'WARM' | 'COLD' | null
  status: 'Pending' | 'Visited' | 'Deal Closed'
}

export type DealerAudit = {
  totals: { impressions: number; views: number; vip_passes: number; active_passes: number; pending: number; visited: number; deal_closed: number }
  properties: Array<{ id: string; title: string; impressions: number; views: number; vip_passes: number; active_passes: number; pending: number; visited: number; deal_closed: number; audit_score: number }>
  leads: DealerAuditLead[]
  status_history: Array<{ lead_id: string; status: string; changed_at: string }>
}

export const EMPTY_DEALER_AUDIT: DealerAudit = {
  totals: { impressions: 0, views: 0, vip_passes: 0, active_passes: 0, pending: 0, visited: 0, deal_closed: 0 },
  properties: [], leads: [], status_history: [],
}
