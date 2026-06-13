export type NearbyItem = { name: string; distance: string }
export type NearbyCategory = { icon: string; label: string; items: NearbyItem[] }

export const NEARBY: Record<string, NearbyCategory[]> = {
  Lucknow: [
    { icon: '🚇', label: 'Metro',
      items: [{ name: 'Hazratganj Metro', distance: '0.5 km' }, { name: 'Sachivalaya Metro', distance: '1.2 km' }] },
    { icon: '✈️', label: 'Airport',
      items: [{ name: 'Chaudhary Charan Singh Intl', distance: '15 km' }] },
    { icon: '🏫', label: 'Schools',
      items: [{ name: 'City Montessori School', distance: '1.5 km' }, { name: 'La Martiniere College', distance: '2 km' }] },
    { icon: '🏥', label: 'Hospitals',
      items: [{ name: 'KGMU Hospital', distance: '3 km' }, { name: 'SGPGI', distance: '8 km' }] },
  ],
  Noida: [
    { icon: '🚇', label: 'Metro',
      items: [{ name: 'Sector 18 Metro (Blue)', distance: '1.2 km' }, { name: 'Botanical Garden Metro', distance: '2.5 km' }] },
    { icon: '✈️', label: 'Airport',
      items: [{ name: 'IGI Airport (Delhi)', distance: '35 km' }, { name: 'Jewar Intl (upcoming)', distance: '50 km' }] },
    { icon: '🏫', label: 'Schools',
      items: [{ name: 'DPS Noida', distance: '2 km' }, { name: 'Amity International', distance: '3.5 km' }] },
    { icon: '🏥', label: 'Hospitals',
      items: [{ name: 'Fortis Hospital', distance: '4 km' }, { name: 'Kailash Hospital', distance: '2 km' }] },
  ],
  'Greater Noida': [
    { icon: '🚇', label: 'Metro',
      items: [{ name: 'Knowledge Park II Metro', distance: '1.5 km' }, { name: 'Pari Chowk Metro', distance: '3 km' }] },
    { icon: '✈️', label: 'Airport',
      items: [{ name: 'Jewar Intl Airport', distance: '22 km' }, { name: 'IGI Airport (Delhi)', distance: '52 km' }] },
    { icon: '🏫', label: 'Schools',
      items: [{ name: 'Ryan International', distance: '2 km' }, { name: 'DPS Greater Noida', distance: '3 km' }] },
    { icon: '🏥', label: 'Hospitals',
      items: [{ name: 'Yatharth Hospital', distance: '3 km' }, { name: 'Sharda Hospital', distance: '5 km' }] },
  ],
  Ayodhya: [
    { icon: '🚇', label: 'Metro',
      items: [{ name: 'Metro Phase-1 (planned 2026)', distance: '—' }] },
    { icon: '✈️', label: 'Airport',
      items: [{ name: 'Maharishi Valmiki Intl Airport', distance: '8 km' }] },
    { icon: '🏫', label: 'Schools',
      items: [{ name: "St. Joseph's School", distance: '3 km' }, { name: 'Jawahar Navodaya Vidyalaya', distance: '5 km' }] },
    { icon: '🏥', label: 'Hospitals',
      items: [{ name: 'SRN Hospital', distance: '2 km' }, { name: 'District Hospital', distance: '4 km' }] },
  ],
}
