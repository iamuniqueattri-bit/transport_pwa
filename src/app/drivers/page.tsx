"use client"

import Link from "next/link"
import { useMemo, useState, useEffect } from "react"
import ErrorBoundary from "@/components/ErrorBoundary"
import { deleteDriver, getDrivers, type Driver } from "@/lib/driverStorage"
import { isBrowser } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState("")
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    if (!toastMessage || !isBrowser) return
    const id = window.setTimeout(() => setToastMessage(null), 2500)
    return () => window.clearTimeout(id)
  }, [toastMessage])

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return drivers

    return drivers.filter((driver) => {
      return (
        driver.name.toLowerCase().includes(query) ||
        driver.mobile.toLowerCase().includes(query) ||
        driver.licenseNumber.toLowerCase().includes(query)
      )
    })
  }, [drivers, search])

  async function fetchDrivers() {
    setLoading(true)
    const nextDrivers = await getDrivers()
    setDrivers(nextDrivers)
    setLoading(false)
  }

  async function handleDeleteConfirmed() {
    if (!deletingDriverId) return

    setLoading(true)
    const deleted = await deleteDriver(deletingDriverId)
    if (deleted) {
      await fetchDrivers()
      setToastMessage("Driver deleted")
    } else {
      setToastMessage("Unable to delete driver")
    }
    setDeletingDriverId(null)
    setLoading(false)
  }

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container pb-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="section-title">Drivers</h1>
            <p className="text-gray-600 mt-2">Manage drivers, licenses, and emergency contacts.</p>
          </div>
          <Link href="/drivers/new" className="btn-primary inline-flex items-center justify-center px-5 py-3">
            Add Driver
          </Link>
        </div>

        <div className="space-y-4">
          <input
            type="search"
            placeholder="Search by name, mobile or license"
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {loading && <div className="text-gray-600">Loading drivers…</div>}

          {!loading && filteredDrivers.length === 0 && (
            <div className="card text-center text-gray-600">
              <p className="font-medium">No drivers found</p>
              <p className="mt-2 text-sm">Add your first driver to manage vehicles and GR assignments.</p>
            </div>
          )}

          <div className="grid gap-4">
            {filteredDrivers.map((driver) => (
              <div key={driver.id} className="card space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.mobile}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    License: {driver.licenseNumber}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-800">Expiry:</span>{" "}
                    {driver.licenseExpiry || "Not set"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">Added:</span>{" "}
                    {new Date(driver.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/drivers/${driver.id}/edit`)}
                    className="btn-primary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingDriverId(driver.id)}
                    className="btn-secondary text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/drivers/new"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-4 text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700"
      >
        + Driver
      </Link>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-black/90 px-4 py-3 text-center text-sm text-white">
          {toastMessage}
        </div>
      )}

      {deletingDriverId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeletingDriverId(null)}
          />
          <div className="relative w-full max-w-md card">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete driver?</h2>
                <p className="text-sm text-gray-600 mt-1">
                  This action cannot be undone. The driver will be removed from Supabase.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingDriverId(null)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  className="btn-primary w-full sm:w-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
    </ErrorBoundary>
  )
}
