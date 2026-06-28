"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import TripStatusBadge from '@/components/TripStatusBadge'
import { getTripById } from '@/lib/tripService'
import type { Trip } from '@/types/trip'

export default function TripDetailPage() {
  const params = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!params?.id) return
      setLoading(true)
      const data = await getTripById(params.id)
      setTrip(data)
      setLoading(false)
    }

    load()
  }, [params?.id])

  if (loading) {
    return <div className="page-container"><div className="card h-40 animate-pulse" /></div>
  }

  if (!trip) {
    return <div className="page-container"><div className="card text-center text-gray-600">Trip not found.</div></div>
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="section-title">{trip.trip_number}</h1>
            <p className="mt-2 text-sm text-gray-600">{trip.vehicle_number} • {trip.driver_name}</p>
          </div>
          <TripStatusBadge status={trip.status} />
        </div>

        <div className="card space-y-3">
          <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p><span className="font-semibold">From:</span> {trip.from_location}</p>
            <p><span className="font-semibold">To:</span> {trip.to_location}</p>
            <p><span className="font-semibold">Date:</span> {trip.trip_date}</p>
            <p><span className="font-semibold">Driver:</span> {trip.driver_name}</p>
          </div>
          {trip.remarks ? <p className="text-sm text-gray-600">{trip.remarks}</p> : null}
          <div className="flex gap-2">
            <Link href={`/trips/${trip.id}/edit`} className="btn-primary">Edit Trip</Link>
            <Link href="/trips" className="btn-secondary">Back</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
