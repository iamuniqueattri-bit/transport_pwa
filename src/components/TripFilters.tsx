type TripFiltersProps = {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

const statuses = ['All', 'Pending', 'Dispatched', 'In Transit', 'Delivered', 'Closed', 'Cancelled']

export default function TripFilters({ search, status, onSearchChange, onStatusChange }: TripFiltersProps) {
  return (
    <div className="card space-y-3">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by customer, GR, or vehicle"
        className="input"
      />
      <select value={status} onChange={(event) => onStatusChange(event.target.value)} className="input">
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item === 'All' ? 'All statuses' : item}
          </option>
        ))}
      </select>
    </div>
  )
}
