import Link from 'next/link'
import TripStatusBadge from '@/components/TripStatusBadge'
import type { Trip } from '@/types/trip'

type TripCardProps = {
  trip: Trip
  onEdit: (trip: Trip) => void
  onDelete: (trip: Trip) => void
  onStatusChange: (trip: Trip, status: Trip['status']) => void
}

export default function TripCard({ trip, onEdit, onDelete, onStatusChange }: TripCardProps) {
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{trip.trip_number}</h2>
            <TripStatusBadge status={trip.status} />
          </div>
          <p className="text-sm text-gray-600">{trip.vehicle_number} • {trip.driver_name}</p>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>{trip.from_location} → {trip.to_location}</p>
        <p>{trip.trip_date}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/trips/${trip.id}`} className="btn-secondary text-sm">
          View
        </Link>
        <button type="button" onClick={() => onEdit(trip)} className="btn-secondary text-sm">
          Edit
        </button>
        <select
          value={trip.status}
          onChange={(event) => onStatusChange(trip, event.target.value as Trip['status'])}
          className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          {['Pending','Dispatched','In Transit','Delivered','Closed','Cancelled'].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => onDelete(trip)} className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Delete
        </button>
      </div>
    </div>
  )
}
