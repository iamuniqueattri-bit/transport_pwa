"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TripForm from '@/components/TripForm'
import { createTrip } from '@/lib/tripService'
import { isBrowser } from '@/lib/utils'

export default function NewTripPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  async function handleSubmit(payload: Parameters<typeof createTrip>[0]) {
    setSubmitting(true)
    setError(null)
    const created = await createTrip(payload)
    setSubmitting(false)
    if (created) {
      setToastMessage('Trip created successfully')
      if (isBrowser) {
        window.setTimeout(() => {
          router.push('/trips')
        }, 700)
      }
    } else {
      setError('Unable to create trip. Please check console for details and try again.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4 pb-24">
        <div>
          <h1 className="section-title">New Trip</h1>
          <p className="mt-2 text-sm text-gray-600">Create a new trip record for dispatch planning.</p>
        </div>
        {error ? <div className="card border border-red-200 bg-red-50 text-sm text-red-700">{error}</div> : null}
        <div className="card">
          <TripForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Create Trip" submitting={submitting} />
        </div>
      </div>
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-black/90 px-4 py-3 text-center text-sm text-white">
          {toastMessage}
        </div>
      )}
    </main>
  )
}
