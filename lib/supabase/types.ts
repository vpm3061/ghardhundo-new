export type Profile = {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'buyer' | 'dealer' | 'builder' | 'admin'
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
  floor_plan: string | null
  youtube_url: string | null
  tags: string[] | null
  amenities: string[] | null
  is_active: boolean
  is_featured: boolean
  listed_by: string | null
  created_at: string
}

export type Offer = {
  id: string
  property_id: string
  title: string
  description: string | null
  valid_till: string | null
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
  commission_percent: number | null
  deal_date: string | null
  payment_date: string | null
  status: 'Pending' | 'Received' | 'Partial'
  created_at: string
}

export type DealerSubscription = {
  id: string
  dealer_id: string
  plan: 'Starter' | 'Pro' | 'Power'
  amount: number | null
  leads_limit: number
  started_at: string
  expires_at: string | null
  status: 'Active' | 'Expired' | 'Cancelled'
  created_at: string
}

export type BuilderPackage = {
  id: string
  builder_id: string
  plan: 'Basic' | 'Standard' | 'Premium'
  amount: number
  listing_limit: number
  started_at: string
  expires_at: string | null
  status: 'Active' | 'Expired' | 'Cancelled'
  created_at: string
}

export type CoinConversion = {
  id: string
  user_id: string
  coins: number
  cash_amount: number
  upi_id: string | null
  status: 'Pending' | 'Paid' | 'Rejected'
  created_at: string
}

export type DonatedListing = {
  id: string
  user_id: string | null
  title: string
  builder: string | null
  sector: string | null
  city: string | null
  price_min: number | null
  price_max: number | null
  bhk: string[] | null
  description: string | null
  contact_phone: string | null
  status: 'Pending' | 'Approved' | 'Rejected'
  coins_awarded: boolean
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

export type SavedProperty = {
  id: string
  user_id: string
  property_id: string
  created_at: string
}

export type PropertyView = {
  id: string
  property_id: string
  user_id: string | null
  viewed_at: string
}

export type PaymentOrder = {
  id: string
  user_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  plan: string
  role: string
  amount: number
  currency: string
  status: string
  created_at: string
}

export type DealerLeadPurchase = {
  id: string
  dealer_id: string
  lead_id: string
  subscription_id: string | null
  created_at: string
}

export type CoinTransaction = {
  id: string
  user_id: string
  amount: number
  type: 'earned' | 'spent' | 'converted'
  description: string | null
  created_at: string
}

export type AIAnswers = {
  city: string
  timeline: string
  budget: string
  loan_status: string
  purpose: string
}
