"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ErrorBoundary from '@/components/ErrorBoundary'
import { formatCurrency } from '@/lib/utils'
import { getVehicleLedger } from '@/lib/ledger'

export default function VehicleLedgerPage() {
  const [rows, setRows] = useState<Array<{ vehicle_id: string; vehicle_number: string; totalTrips: number; totalFreight: number; totalExpenses: number; netProfit: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getVehicleLedger()
      setRows(data)
      setLoading(false)
    }

    load()
  }, [])

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div>
          <h1 className="section-title">Vehicle Ledger</h1>
          <p className="mt-2 text-sm text-gray-600">Track trips, revenue, expenses, and net profitability by vehicle.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (<div key={index} className="card h-24 animate-pulse bg-gray-100" />))}
          </div>
        ) : rows.length === 0 ? (
          <div className="card text-center text-gray-600">No vehicle ledger data yet.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.vehicle_id} className="card space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{row.vehicle_number}</h2>
                    <p className="text-sm text-gray-600">{row.totalTrips} trips</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">Net Profit ₹{row.netProfit}</p>
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
                  <div>Freight: ₹{row.totalFreight}</div>
                  <div>Expenses: ₹{row.totalExpenses}</div>
                  <div>Profit: ₹{row.netProfit}</div>
                </div>
                <Link href={`/vehicle-ledger/${row.vehicle_id}`} className="btn-secondary text-sm">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
    </ErrorBoundary>
  )
}
