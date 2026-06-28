"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getAuthenticatedSession } from "@/lib/auth"

type Customer = {
  id: string
  name: string
  gst_number?: string | null
  phone?: string | null
  city?: string | null
}

type CustomerSelectorProps = {
  selectedCustomer: Customer | null
  onSelect: (customer: Customer) => void
}

export default function CustomerSelector({ selectedCustomer, onSelect }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    void fetchCustomers(cancelled)

    return () => {
      cancelled = true
    }
  }, [])

  async function fetchCustomers(cancelled = false) {
    setLoading(true)
    try {
      const session = await getAuthenticatedSession()
      if (!session) {
        if (!cancelled) {
          setCustomers([])
        }
        return
      }

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", session.user.id)
        .order("name", { ascending: true })

      if (error) {
        console.error("[CustomerSelector] Error fetching customers:", error)
      } else if (!cancelled) {
        setCustomers((data as Customer[]) || [])
      }
    } catch (error) {
      console.error("[CustomerSelector] Failed to load customers:", error)
      if (!cancelled) {
        setCustomers([])
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  function filteredCustomers() {
    if (!search.trim()) return customers
    const q = search.trim().toLowerCase()
    return customers.filter((c) => (c.name || "").toLowerCase().includes(q))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name"
          className="input"
        />
      </div>

      {loading && <div className="text-sm text-gray-600">Loading customers...</div>}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {loading && <div className="card text-center text-gray-600">Loading customer options...</div>}
        {filteredCustomers().map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer)}
            className={`card w-full text-left transition ${
              selectedCustomer?.id === customer.id ? "ring-2 ring-blue-500" : "hover:shadow-md"
            }`}
          >
            <div className="font-semibold text-gray-900">{customer.name}</div>
            <div className="text-sm text-gray-600">{customer.city || "City not set"}</div>
            <div className="text-sm text-gray-600">{customer.phone || "No phone"}</div>
          </button>
        ))}

        {!loading && filteredCustomers().length === 0 && (
          <div className="card text-center text-gray-600">No customers found.</div>
        )}
      </div>

      {selectedCustomer && (
        <div className="card bg-blue-50">
          <div className="text-sm font-medium text-blue-900">Selected Customer</div>
          <div className="mt-2 font-semibold text-blue-900">{selectedCustomer.name}</div>
          <div className="text-sm text-blue-700">{selectedCustomer.city || "City not set"}</div>
          <div className="text-sm text-blue-700">GST: {selectedCustomer.gst_number || "—"}</div>
        </div>
      )}
    </div>
  )
}
