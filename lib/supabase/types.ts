export type Profile = {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export type Property = {
  id: string
  title: string
  builder: string | null
  sector: string | null
  city: string | null
  price_min: number | null
  price_max: number | null
  bhk: string[] | null
  status: 'Under Construction' | 'Ready to Move' | 'New Launch' | null
  rera_number: string | null
  description: string | null
  photos: string[] | null
  amenities: string[] | null
  is_active: boolean
  is_featured: boolean
  listed_by: string | null
  created_at: string
}

export type Lead = {
  id: string
  user_id: string | null
  property_id: string | null
  name: string
  phone: string
  budget: string | null
  bhk: string | null
  timeline: string | null
  loan_status: string | null
  purpose: string | null
  city: string | null
  ai_score: number
  tier: 'HOT' | 'WARM' | 'COLD' | null
  status: 'New' | 'Called' | 'Visit Fixed' | 'Deal Done' | 'Not Interested'
  referrer_id: string | null
  deal_amount: number | null
  created_at: string
}

export type Commission = {
  id: string
  lead_id: string | null
  builder_name: string | null
  amount: number | null
  status: 'Pending' | 'Received' | 'Partial'
  created_at: string
}

export type Coin = {
  id: string
  user_id: string
  amount: number
  type: 'earned' | 'spent'
  description: string | null
  created_at: string
}

export type Referral = {
  id: string
  referrer_id: string | null
  lead_id: string | null
  property_id: string | null
  earned_coins: number
  created_at: string
}

export type LeadReveal = {
  id: string
  dealer_id: string
  lead_id: string
  created_at: string
}

export type AIAnswers = {
  city: string
  timeline: string
  budget: string
  loan_status: string
  purpose: string
}
