"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DriverForm from "@/components/DriverForm"
import ErrorBoundary from "@/components/ErrorBoundary"
import { createDriver } from "@/lib/driverStorage"
import { isBrowser } from "@/lib/utils"

export default function NewDriverPage() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSave(driver: Parameters<typeof createDriver>[0]) {
    setLoading(true)
    try {
      const saved = await createDriver(driver)

      if (!saved) {
        setToastMessage("Unable to save driver")
        return
      }

      setToastMessage("Driver saved successfully")
      if (isBrowser) {
        window.setTimeout(() => {
          router.push("/drivers")
        }, 700)
      }
    } catch (error) {
      console.error('[NewDriverPage] Driver creation failed:', error)
      setToastMessage(error instanceof Error ? error.message : "Unable to save driver")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container pb-24">
        <div className="mb-6">
          <h1 className="section-title">Add Driver</h1>
          <p className="text-gray-600 mt-2">Enter driver details and save to Supabase.</p>
        </div>

        <div className="card">
          <DriverForm
            submitLabel="Save Driver"
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
