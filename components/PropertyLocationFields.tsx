'use client'
import { useState } from 'react'
import { NCR_PROPERTY_LOCATIONS, UP_DISTRICTS } from '@/lib/property-locations'

type Region = '' | 'Uttar Pradesh' | 'Delhi NCR'

export default function PropertyLocationFields({ value, onChange }: {
  value: string
  onChange: (value: string) => void
}) {
  const [chosenRegion, setChosenRegion] = useState<Region | null>(null)
  // Saved district names take precedence where UP and NCR overlap.
  const inferredRegion: Region = !value ? '' : UP_DISTRICTS.includes(value)
    ? 'Uttar Pradesh' : NCR_PROPERTY_LOCATIONS.includes(value) ? 'Delhi NCR' : 'Uttar Pradesh'
  const region = chosenRegion ?? inferredRegion
  const options = region === 'Uttar Pradesh' ? UP_DISTRICTS : region === 'Delhi NCR' ? NCR_PROPERTY_LOCATIONS : []

  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 col-span-full">
    <label className="block text-xs text-[#6B7280]">
      State / Region
      <select className="input-dark text-sm mt-1" value={region} onChange={event => {
        setChosenRegion(event.target.value as Region)
        onChange('')
      }}>
        <option value="">Select State / Region</option>
        <option value="Delhi NCR">Delhi NCR</option>
        <option value="Uttar Pradesh">Uttar Pradesh</option>
      </select>
    </label>
    <label className="block text-xs text-[#6B7280]">
      {region === 'Delhi NCR' ? 'City / District' : 'District'}
      <select className="input-dark text-sm mt-1 disabled:opacity-50" disabled={!region}
        value={value} onChange={event => onChange(event.target.value)}>
        <option value="">{!region ? 'Choose State / Region first' : region === 'Uttar Pradesh' ? 'Select District' : 'Select City / District'}</option>
        {value && !options.includes(value) && <option value={value}>{value} (saved location)</option>}
        {options.map(location => <option key={location} value={location}>{location}</option>)}
      </select>
    </label>
  </div>
}
