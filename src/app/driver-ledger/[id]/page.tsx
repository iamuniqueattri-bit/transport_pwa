"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DriverLedgerDetailPage() {
  const params = useParams<{ id: string }>()
  const [driver, setDriver] = useState<{ name: string } | null>(null)
  const [trips, setTrips] = useState<Array<{ id: string; gr_number: string; freight_amount: number; advance_paid: number; status: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!params?.id) return
      setLoading(true)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('[DriverLedger] No authenticated user:', userError)
        setLoading(false)
        return
      }

      const [{ data: driverData }, { data: tripData }] = await Promise.all([
        supabase.from('drivers').select('name').eq('id', params.id).eq('user_id', user.id).single(),
        supabase.from('trips').select('id, gr_number, freight_amount, advance_paid, status').eq('driver_id', params.id).eq('user_id', user.id),
      ])
      setDriver(driverData as { name: string } | null)
      setTrips((tripData as Array<{ id: string; gr_number: string; freight_amount: number; advance_paid: number; status: string }>) || [])
      setLoading(false)
    }

    load()
  }, [params?.id])

  if (loading) {
    return <div className="page-container"><div className="card h-40 animate-pulse" /></div>
  }

  const totalEarnings = trips.reduce((sum, trip) => sum + Number(trip.freight_amount || 0), 0)
  const totalAdvances = trips.reduce((sum, trip) => sum + Number(trip.advance_paid || 0), 0)
  const pendingAmount = totalEarnings - totalAdvances

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div>
          <h1 className="section-title">{driver?.name ?? 'Driver Ledger'}</h1>
          <p className="mt-2 text-sm text-gray-600">Per-driver trip and settlement summary.</p>
        </div>

        <div className="card space-y-3">
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div><p className="text-gray-600">Trips</p><p className="text-xl font-semibold">{trips.length}</p></div>
            <div><p className="text-gray-600">Advances</p><p className="text-xl font-semibold">₹{totalAdvances}</p></div>
            <div><p className="text-gray-600">Pending</p><p className="text-xl font-semibold">₹{pendingAmount}</p></div>
          </div>
          <div className="text-sm font-semibold text-gray-900">Total Earnings: ₹{totalEarnings}</div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold">Trips</h2>
          <div className="mt-3 space-y-2">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm">
                <span>{trip.gr_number}</span>
                <span>{trip.status}</span>
                <span className="font-semibold">₹{trip.freight_amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
