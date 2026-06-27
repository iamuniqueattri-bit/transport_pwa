"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import DriverForm from "@/components/DriverForm"
import ErrorBoundary from "@/components/ErrorBoundary"
import { getDriverById, updateDriver, type Driver } from "@/lib/driverStorage"
import { isBrowser } from "@/lib/utils"

export default function EditDriverPage() {
  const router = useRouter()
  const params = useParams()
  const driverId = params?.id
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!driverId || Array.isArray(driverId)) {
      setDriver(null)
      setLoading(false)
      return
    }

    const driverIdString = driverId

    async function loadDriver() {
      setLoading(true)
      const saved = await getDriverById(driverIdString)
      setDriver(saved)
      setLoading(false)
    }

    loadDriver()
  }, [driverId])

  async function handleSave(
    updatedData: Omit<Driver, "id" | "createdAt"> & Partial<Pick<Driver, "id" | "createdAt">>
  ) {
    if (!driver) return

    setLoading(true)
    const updated = await updateDriver({ ...driver, ...updatedData })
    setLoading(false)

    if (!updated) {
      setToastMessage("Unable to update driver")
      return
    }

    setToastMessage("Driver updated successfully")
    if (isBrowser) {
      window.setTimeout(() => {
        router.push("/drivers")
      }, 700)
    }
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <main className="min-h-screen bg-gray-50 text-gray-900">
          <div className="page-container">Loading driver…</div>
        </main>
      </ErrorBoundary>
    )
  }

  if (!driver) {
    return (
      <ErrorBoundary>
        <main className="min-h-screen bg-gray-50 text-gray-900">
          <div className="page-container">
            <div className="card text-center">
              <h1 className="section-title">Driver not found</h1>
              <p className="text-gray-600 mt-2">The driver you are trying to edit does not exist.</p>
              <button type="button" onClick={() => router.push("/drivers")} className="btn-primary mt-6">
                Back to Drivers
              </button>
            </div>
          </div>
        </main>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <div className="page-container pb-24">
          <div className="mb-6">
            <h1 className="section-title">Edit Driver</h1>
            <p className="text-gray-600 mt-2">Update driver details and save your changes.</p>
          </div>

          <div className="card">
            <DriverForm
              initialData={driver}
              submitLabel="Save Changes"
              onCancel={() => router.push("/drivers")}
              onSave={handleSave}
            />
          </div>
        </div>

        {toastMessage && (
          <div className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-black/90 px-4 py-3 text-center text-sm text-white">
            {toastMessage}
          </div>
        )}
      </main>
    </ErrorBoundary>
  )
}
