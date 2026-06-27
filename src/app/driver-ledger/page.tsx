"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ErrorBoundary from '@/components/ErrorBoundary'
import { formatCurrency } from '@/lib/utils'
import { getDriverLedger } from '@/lib/ledger'

export default function DriverLedgerPage() {
  const [rows, setRows] = useState<Array<{ driver_id: string; driver_name: string; totalTrips: number; totalAdvances: number; totalEarnings: number; pendingAmount: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getDriverLedger()
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
          <h1 className="section-title">Driver Ledger</h1>
          <p className="mt-2 text-sm text-gray-600">Monitor trip count, advances, earnings, and pending amounts per driver.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (<div key={index} className="card h-24 animate-pulse bg-gray-100" />))}
          </div>
        ) : rows.length === 0 ? (
          <div className="card text-center text-gray-600">No driver ledger data yet.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.driver_id} className="card space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{row.driver_name}</h2>
                    <p className="text-sm text-gray-600">{row.totalTrips} trips</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">Pending ₹{row.pendingAmount}</p>
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
                  <div>Advances: ₹{row.totalAdvances}</div>
                  <div>Earnings: ₹{row.totalEarnings}</div>
                  <div>Pending: ₹{row.pendingAmount}</div>
                </div>
                <Link href={`/driver-ledger/${row.driver_id}`} className="btn-secondary text-sm">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
    </ErrorBoundary>
  )
}
