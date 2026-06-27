"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

type GR = {
  id: string
  gr_number: string
  gr_date: string
  from_city?: string | null
  to_city?: string | null
  freight?: number | null
  vehicle_number?: string | null
}

type GRSelectorProps = {
  customerId: string
  selectedGRs: GR[]
  onSelect: (gr: GR) => void
  onDeselect: (grId: string) => void
}

export default function GRSelector({ customerId, selectedGRs, onSelect, onDeselect }: GRSelectorProps) {
  const [availableGRs, setAvailableGRs] = useState<GR[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customerId) {
      fetchUnbilledGRs()
    }
  }, [customerId])

  async function fetchUnbilledGRs() {
    setLoading(true)

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("customer_id", customerId)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching GRs:", error)
    } else {
      setAvailableGRs((data as GR[]) || [])
    }
    setLoading(false)
  }

  const isSelected = (grId: string) => selectedGRs.some((gr) => gr.id === grId)

  const selectedGRIds = selectedGRs.map((gr) => gr.id)
  const displayGRs = availableGRs.filter((gr) => !selectedGRIds.includes(gr.id))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select GRs to Invoice</label>
        {loading && <div className="text-sm text-gray-600">Loading GRs...</div>}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {displayGRs.map((gr) => (
          <button
            key={gr.id}
            onClick={() => onSelect(gr)}
            className="card w-full text-left transition hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-900">GR #{gr.gr_number}</div>
                <div className="text-sm text-gray-600">{gr.from_city} → {gr.to_city}</div>
                <div className="text-sm text-gray-600">{gr.gr_date}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{formatCurrency(gr.freight || 0)}</div>
                {gr.vehicle_number && (
                  <div className="text-sm text-gray-600">{gr.vehicle_number}</div>
                )}
              </div>
            </div>
          </button>
        ))}

        {!loading && displayGRs.length === 0 && availableGRs.length === 0 && (
          <div className="card text-center text-gray-600">No unbilled GRs found for this customer.</div>
        )}

        {!loading && displayGRs.length === 0 && availableGRs.length > 0 && (
          <div className="card text-center text-gray-600">All GRs have been selected.</div>
        )}
      </div>

      {selectedGRs.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Selected GRs ({selectedGRs.length})</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedGRs.map((gr) => (
              <div key={gr.id} className="card bg-green-50 flex justify-between items-center">
                <div>
                  <div className="font-medium text-green-900">GR #{gr.gr_number}</div>
                  <div className="text-sm text-green-700">{formatCurrency(gr.freight || 0)}</div>
                </div>
                <button
                  onClick={() => onDeselect(gr.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
