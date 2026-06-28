"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthenticatedSession } from '@/lib/auth'

export default function VehicleLedgerDetailPage() {
  const params = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<{ vehicle_number: string } | null>(null)
  const [trips, setTrips] = useState<Array<{ id: string; gr_number: string; freight_amount: number; status: string }>>([])
  const [expenses, setExpenses] = useState<Array<{ id: string; category: string; amount: number; date: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!params?.id) return
      setLoading(true)
      try {
        const session = await getAuthenticatedSession()
        if (!session) {
          setVehicle(null)
          setTrips([])
          setExpenses([])
          return
        }

        const [{ data: vehicleData, error: vehicleError }, { data: tripData, error: tripError }, { data: expenseData, error: expenseError }] = await Promise.all([
          supabase.from('vehicles').select('vehicle_number').eq('id', params.id).eq('user_id', session.user.id).single(),
          supabase.from('trips').select('id, gr_number, freight_amount, status').eq('vehicle_id', params.id).eq('user_id', session.user.id),
          supabase.from('expenses').select('id, category, amount, date').eq('vehicle_id', params.id).eq('user_id', session.user.id),
        ])

        if (vehicleError) {
          console.error('[VehicleLedger] Vehicle lookup failed:', vehicleError)
        }
        if (tripError) {
          console.error('[VehicleLedger] Trip lookup failed:', tripError)
        }
        if (expenseError) {
          console.error('[VehicleLedger] Expense lookup failed:', expenseError)
        }

        setVehicle(vehicleData as { vehicle_number: string } | null)
        setTrips((tripData as Array<{ id: string; gr_number: string; freight_amount: number; status: string }>) || [])
        setExpenses((expenseData as Array<{ id: string; category: string; amount: number; date: string }>) || [])
      } catch (error) {
        console.error('[VehicleLedger] Failed to load detail ledger:', error)
        setVehicle(null)
        setTrips([])
        setExpenses([])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [params?.id])

  if (loading) {
    return <div className="page-container"><div className="card h-40 animate-pulse" /></div>
  }

  const totalFreight = trips.reduce((sum, trip) => sum + Number(trip.freight_amount || 0), 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div>
          <h1 className="section-title">{vehicle?.vehicle_number ?? 'Vehicle Ledger'}</h1>
          <p className="mt-2 text-sm text-gray-600">Detailed movement and expense ledger for this vehicle.</p>
        </div>

        <div className="card space-y-3">
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div><p className="text-gray-600">Trips</p><p className="text-xl font-semibold">{trips.length}</p></div>
            <div><p className="text-gray-600">Freight</p><p className="text-xl font-semibold">₹{totalFreight}</p></div>
            <div><p className="text-gray-600">Expenses</p><p className="text-xl font-semibold">₹{totalExpenses}</p></div>
          </div>
          <div className="text-sm font-semibold text-gray-900">Net Profit: ₹{totalFreight - totalExpenses}</div>
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

        <div className="card">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <div className="mt-3 space-y-2">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm">
                <span>{expense.category}</span>
                <span>{expense.date}</span>
                <span className="font-semibold">₹{expense.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
