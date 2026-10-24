import { UP_DISTRICTS, OTHER_PROPERTY_CITIES, PROPERTY_LOCATIONS } from '@/lib/property-locations'

export default function PropertyLocationOptions({ currentValue = '' }: { currentValue?: string }) {
  return <>
    <option value="">Select City / District</option>
    {currentValue && !PROPERTY_LOCATIONS.includes(currentValue) && <option value={currentValue}>{currentValue}</option>}
    <optgroup label="Uttar Pradesh - All 75 Districts">
      {UP_DISTRICTS.map(city => <option key={city} value={city}>{city}</option>)}
    </optgroup>
    <optgroup label="Other UP cities and Delhi NCR">
      {OTHER_PROPERTY_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
    </optgroup>
  </>
}
