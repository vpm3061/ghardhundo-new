export default function PropertyLocationFields({ value, onChange }: {
  value: string
  onChange: (value: string) => void
}) {
  return <label className="col-span-full block text-xs text-[#6B7280]">
    City / micro-market
    <input className="input-dark mt-1 text-sm" type="text" autoComplete="address-level2" maxLength={100}
      placeholder="Enter any city or micro-market in India" value={value} onChange={event => onChange(event.target.value)} />
  </label>
}
