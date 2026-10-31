export type WizardForm = {
  // common
  pillar: PropertyPillar | ''
  intent: ListingIntent
  property_subtype: string
  land_area_unit: string
  stamp_duty_estimate: string
  legal_fees_estimate: string
  security_deposit_amount: string
  advance_terms: string
  lease_duration_months: string
  title: string
  city: string
  locality: string
  price_min: string
  description: string
  photos: string[]
  contact_preference: 'call' | 'whatsapp' | 'both'
  owner_contact: string
  // flat
  bhk: string[]
  floor_number: string
  total_floors: string
  super_area: string
  carpet_area: string
  furnished: string
  rera_number: string
  possession_date: string
  age_years: string
  parking: boolean
  amenities: string[]
  youtube_url: string
  tags: string
  floor_plan: string
  // plot
  plot_area_sqyard: string
  plot_type: string
  corner_plot: boolean
  facing: string
  registry_done: boolean
  boundary_wall: boolean
  // rental
  monthly_rent: string
  deposit_months: string
  available_from: string
  tenant_preference: string
  gender_preference: string
  pets_allowed: boolean
  // commercial
  commercial_type: string
  commercial_deal: 'Rent' | 'Sale'
  power_load: string
  frontage_width: string
}

export const BLANK_WIZARD_FORM: WizardForm = {
  pillar: '', intent: 'sale', property_subtype: '', land_area_unit: 'sq. yard', stamp_duty_estimate: '', legal_fees_estimate: '',
  security_deposit_amount: '', advance_terms: '', lease_duration_months: '',
  title: '', city: '', locality: '', price_min: '', description: '', photos: [],
  contact_preference: 'both', owner_contact: '',
  bhk: [], floor_number: '', total_floors: '', super_area: '', carpet_area: '',
  furnished: '', rera_number: '', possession_date: '', age_years: '', parking: false,
  amenities: [], youtube_url: '', tags: '', floor_plan: '',
  plot_area_sqyard: '', plot_type: '', corner_plot: false, facing: '',
  registry_done: false, boundary_wall: false,
  monthly_rent: '', deposit_months: '', available_from: '',
  tenant_preference: '', gender_preference: '', pets_allowed: false,
  commercial_type: '', commercial_deal: 'Rent', power_load: '', frontage_width: '',
}

export type Persona = 'builder' | 'expert'
export type Category = 'flat' | 'plot' | 'rental' | 'commercial'
export type PropertyPillar = 'residential' | 'commercial' | 'industrial' | 'land'
export type ListingIntent = 'sale' | 'rent'

export interface WizardFieldProps {
  form: WizardForm
  persona: Persona
  setF: (k: keyof WizardForm, v: unknown) => void
  toggleArr: (k: 'bhk' | 'amenities', val: string) => void
}
