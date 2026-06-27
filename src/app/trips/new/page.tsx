"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TripForm from '@/components/TripForm'
import { createTrip } from '@/lib/tripService'

export default function NewTripPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(payload: Parameters<typeof createTrip>[0]) {
    setSubmitting(true)
    setError(null)
    const created = await createTrip(payload)
    setSubmitting(false)
    if (created) {
      router.push('/trips')
    } else {
      setError('Unable to create trip right now.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div>
          <h1 className="section-title">New Trip</h1>
          <p className="mt-2 text-sm text-gray-600">Create a new trip record for dispatch planning.</p>
        </div>
        {error ? <div className="card border border-red-200 bg-red-50 text-sm text-red-700">{error}</div> : null}
        <div className="card">
          <TripForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Create Trip" submitting={submitting} />
        </div>
      </div>
    </main>
  )
}
