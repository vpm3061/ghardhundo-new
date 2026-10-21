import upCities from './data/registration-up-cities.json'

// City/town suggestions, not a restrictive allowlist. See data/README.md.
const ncrCities = [
  'Delhi', 'New Delhi', 'Gurugram', 'Faridabad', 'Sonipat', 'Panipat',
  'Rohtak', 'Rewari', 'Jhajjar', 'Bahadurgarh', 'Palwal', 'Nuh', 'Bhiwani',
  'Charkhi Dadri', 'Mahendragarh', 'Narnaul', 'Jind', 'Karnal', 'Alwar',
  'Bharatpur', 'Bhiwadi', 'Neemrana', 'Behror', 'Khairthal', 'Tijara',
  'Tapukara', 'Rajgarh', 'Ramgarh', 'Laxmangarh', 'Govindgarh', 'Kherli',
  'Deeg', 'Kaman', 'Nadbai', 'Kumher', 'Bayana', 'Weir', 'Nagar',
  'Manesar', 'Sohna', 'Pataudi', 'Farrukhnagar', 'Hailey Mandi',
  'Ballabgarh', 'Hodal', 'Hathin', 'Tauru', 'Ferozepur Jhirka', 'Punahana',
  'Gohana', 'Ganaur', 'Kharkhoda', 'Samalkha', 'Israna', 'Meham',
  'Kalanaur', 'Beri', 'Bawal', 'Dharuhera', 'Kanina', 'Ateli', 'Nangal Chaudhary',
  'Charkhi Dadri', 'Loharu', 'Siwani', 'Tosham', 'Bawani Khera',
  'Narwana', 'Safidon', 'Julana', 'Uchana', 'Assandh', 'Gharaunda',
  'Indri', 'Nilokheri', 'Taraori', 'Nissing',
]

const districtSets = new Map<string, Set<string>>()
for (const { city, district } of upCities) {
  const districts = districtSets.get(city) || new Set<string>()
  districts.add(district)
  districtSets.set(city, districts)
}

const suggestions = [
  ...upCities.map(({ city, district }) => ({
    value: (districtSets.get(city)?.size || 0) > 1 ? `${city} (${district})` : city,
    label: `${district}, Uttar Pradesh`,
  })),
  // Development-authority cities are not part of municipal-body lists.
  ...['Noida', 'Greater Noida', 'Greater Noida West', 'Mathura', 'Vrindavan', 'Ayodhya', 'Faizabad'].map(value => ({ value, label: 'Uttar Pradesh' })),
  ...ncrCities.map(value => ({ value, label: value === 'Gurugram' ? 'Gurgaon, Delhi NCR' : 'Delhi NCR' })),
]

export const REGISTRATION_CITIES = Array.from(new Map(suggestions.map(city => [city.value, city])).values())
  .sort((a, b) => a.value.localeCompare(b.value, 'en'))
