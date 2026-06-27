type ExpenseFiltersProps = {
  search: string
  category: string
  vehicle: string
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onVehicleChange: (value: string) => void
  vehicleOptions: Array<{ id: string; label: string }>
}

const categories = ['All', 'Diesel', 'Toll', 'Repair', 'Tyre', 'Food', 'Advance', 'Misc']

export default function ExpenseFilters({ search, category, vehicle, onSearchChange, onCategoryChange, onVehicleChange, vehicleOptions }: ExpenseFiltersProps) {
  return (
    <div className="card space-y-3">
      <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search remarks or vehicle" className="input" />
      <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="input">
        {categories.map((item) => (
          <option key={item} value={item}>
            {item === 'All' ? 'All categories' : item}
          </option>
        ))}
      </select>
      <select value={vehicle} onChange={(event) => onVehicleChange(event.target.value)} className="input">
        <option value="All">All vehicles</option>
        {vehicleOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
