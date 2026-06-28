"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TripCard from '@/components/TripCard'
import TripFilters from '@/components/TripFilters'
import ErrorBoundary from '@/components/ErrorBoundary'
import { deleteTrip, getTrips, updateTripStatus } from '@/lib/tripService'
import { isBrowser } from '@/lib/utils'
import type { Trip } from '@/types/trip'

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast] = useState<string | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef<number | null>(null)

  async function loadTrips(): Promise<boolean> {
    setLoading(true)
    try {
      const data = await getTrips()
      setTrips(data)
      return true
    } catch (error) {
      console.error('[TripsPage] Failed to load trips:', error)
      setTrips([])
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  useEffect(() => {
    if (!toast || !isBrowser) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const haystack = `${trip.trip_number} ${trip.vehicle_number} ${trip.driver_name}`.toLowerCase()
      const matchesSearch = haystack.includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || trip.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, trips])

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isBrowser && window.scrollY === 0) {
      touchStartY.current = event.touches[0]?.clientY ?? null
    }
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartY.current === null || !isBrowser || window.scrollY > 0) return
    const delta = (event.touches[0]?.clientY ?? 0) - touchStartY.current
    if (delta > 0) {
      setPullDistance(Math.min(delta, 92))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 70) {
      try {
        const refreshed = await loadTrips()
        setToast(refreshed ? 'Trips refreshed' : 'Unable to refresh trips')
      } catch (error) {
        console.error('[TripsPage] Refresh failed:', error)
        setToast('Unable to refresh trips')
      }
    }
    setPullDistance(0)
    touchStartY.current = null
  }

  async function handleDelete(trip: Trip) {
    const confirmed = isBrowser ? window.confirm(`Delete trip ${trip.trip_number}?`) : true
    if (!confirmed) return
    try {
      const ok = await deleteTrip(trip.id)
      if (ok) {
        setTrips((current) => current.filter((item) => item.id !== trip.id))
        setToast('Trip deleted')
      } else {
        setToast('Unable to delete trip')
      }
    } catch (error) {
      console.error('[TripsPage] Delete failed:', error)
      setToast('Unable to delete trip')
    }
  }

  async function handleStatusChange(trip: Trip, status: Trip['status']) {
    try {
      const updated = await updateTripStatus(trip.id, status)
      if (updated) {
        setTrips((current) => current.map((item) => (item.id === trip.id ? updated : item)))
        setToast('Trip status updated')
      }
    } catch (error) {
      console.error('[TripsPage] Status update failed:', error)
      setToast('Unable to update trip status')
    }
  }

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-gray-50 text-gray-900" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="page-container space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ transform: `translateY(${pullDistance}px)` }}>
          <div>
            <h1 className="section-title">Trips</h1>
            <p className="mt-2 text-sm text-gray-600">Track dispatches, in-transit movement, and delivery status.</p>
          </div>
          <Link href="/trips/new" className="btn-primary">
            New Trip
          </Link>
        </div>

        <TripFilters search={search} status={statusFilter} onSearchChange={setSearch} onStatusChange={setStatusFilter} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card h-32 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="card text-center text-gray-600">No trips found for this view.</div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onEdit={(selectedTrip) => router.push(`/trips/${selectedTrip.id}/edit`)} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {toast ? <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div> : null}
    </main>
    </ErrorBoundary>
  )
}
