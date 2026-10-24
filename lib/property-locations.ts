import { REGISTRATION_CITIES } from './registration-cities'

// Uttar Pradesh district directory: https://igod.gov.in/sg/UP/E042/organizations
export const UP_DISTRICTS = [
  'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh',
  'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti',
  'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria',
  'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar',
  'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras',
  'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj',
  'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj',
  'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar',
  'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal',
  'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur',
  'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi',
]

export const OTHER_PROPERTY_CITIES = REGISTRATION_CITIES.map(city => city.value)
  .filter(city => !UP_DISTRICTS.includes(city))

export const PROPERTY_LOCATIONS = [...UP_DISTRICTS, ...OTHER_PROPERTY_CITIES]

// NCR overlaps UP; keep its familiar property markets available in this region.
export const NCR_PROPERTY_LOCATIONS = Array.from(new Set([
  ...REGISTRATION_CITIES.filter(city => city.label.includes('Delhi NCR')).map(city => city.value),
  'Noida', 'Greater Noida', 'Greater Noida West', 'Ghaziabad', 'Gautam Buddha Nagar',
  'Meerut', 'Hapur', 'Baghpat', 'Bulandshahr', 'Muzaffarnagar', 'Shamli',
])).sort((a, b) => a.localeCompare(b, 'en'))
