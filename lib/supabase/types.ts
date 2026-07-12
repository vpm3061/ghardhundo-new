export type Profile = {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'buyer' | 'dealer' | 'builder' | 'expert' | 'owner' | 'admin'
  is_partner: boolean
  expert_registered: boolean
  registration_paid_at: string | null
  profile_complete: boolean
  whatsapp_number: string | null
  verification_status: 'none' | 'pending' | 'verified' | 'rejected'
  verification_requested_at: string | null
  created_at: string
}

export type PropertyCategory = 'flat' | 'plot' | 'rental' | 'commercial'

export type Property = {
  id: string
  title: string
  builder: string | null
  sector: string | null
  locality: string | null
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
  created_by: string | null
  listing_type: 'builder' | 'expert' | 'owner' | null
  possession_date: string | null
  owner_contact: string | null
  property_category: PropertyCategory
  contact_preference: 'call' | 'whatsapp' | 'both'
  // flat / shared
  floor_number: number | null
  total_floors: number | null
  super_area: number | null
  carpet_area: number | null
  furnished: 'Furnished' | 'Semi' | 'Unfurnished' | null
  parking: boolean
  age_years: number | null
  // plot
  plot_area_sqyard: number | null
  plot_type: 'Residential' | 'Commercial' | 'Agricultural' | null
  corner_plot: boolean
  facing: 'North' | 'South' | 'East' | 'West' | null
  registry_done: boolean
  boundary_wall: boolean
  // rental
  monthly_rent: number | null
  deposit_months: number | null
  available_from: string | null
  tenant_preference: 'Family' | 'Bachelor' | 'Any' | null
  gender_preference: 'Any' | 'Male' | 'Female' | null
  pets_allowed: boolean
  // commercial
  commercial_type: 'Shop' | 'Office' | 'Showroom' | 'Warehouse' | 'Garage' | null
  power_load: string | null
  frontage_width: number | null
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

export type AdvertiseEnquiry = {
  id: string
  name: string
  company: string | null
  phone: string
  city: string | null
  package: string | null
  message: string | null
  status: 'new' | 'contacted' | 'deal_done'
  created_at: string
}

export type ExpertSubscription = {
  id: string
  expert_id: string
  plan: 'Pro-Monthly' | 'Pro-6Month'
  amount: number
  started_at: string
  expires_at: string | null
  status: 'Active' | 'Expired' | 'Cancelled'
  created_at: string
}

export type Banner = {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: 'home_top' | 'home_mid' | 'properties_top' | 'property_detail_side'
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_by: string | null
  created_at: string
}

export type CplDeal = {
  id: string
  builder_id: string | null
  builder_name: string
  cost_per_lead: number
  leads_purchased: number
  leads_delivered: number
  status: 'Active' | 'Paused' | 'Completed'
  notes: string | null
  started_at: string
  created_at: string
}

export type PartnerApplication = {
  id: string
  user_id: string
  full_name: string | null
  city: string | null
  phone: string | null
  rera_number: string | null
  partner_type: string | null
  status: 'pending' | 'approved' | 'rejected'
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
