"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TripForm from '@/components/TripForm'
import { getTripById, updateTrip } from '@/lib/tripService'
import type { Trip, TripInput } from '@/types/trip'

export default function EditTripPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleSubmit(payload: TripInput) {
    if (!trip?.id) return
    setSubmitting(true)
    setError(null)
    const updated = await updateTrip(trip.id, payload)
    setSubmitting(false)
    if (updated) {
      router.push('/trips')
    } else {
      setError('Unable to update trip right now.')
    }
  }

  if (loading) {
    return <div className="page-container"><div className="card h-40 animate-pulse" /></div>
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div>
          <h1 className="section-title">Edit Trip</h1>
          <p className="mt-2 text-sm text-gray-600">Adjust trip details and delivery status.</p>
        </div>
        {error ? <div className="card border border-red-200 bg-red-50 text-sm text-red-700">{error}</div> : null}
        <div className="card">
          <TripForm initialData={trip as Partial<TripInput>} onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Save Changes" submitting={submitting} />
        </div>
      </div>
    </main>
  )
}
