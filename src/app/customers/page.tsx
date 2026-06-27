"use client"

import React, { useEffect, useState } from "react"
import ErrorBoundary from "@/components/ErrorBoundary"
import { supabase } from "@/lib/supabase"

type Customer = {
  id: string
  name: string
  gst_number?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  is_active?: boolean | null
  created_at?: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    setLoading(true)
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customers:", error)
    } else {
      setCustomers((data as Customer[]) || [])
    }
    setLoading(false)
  }

  function openAddForm() {
    setEditing(null)
    setName("")
    setPhone("")
    setGstNumber("")
    setCity("")
    setAddress("")
    setIsFormOpen(true)
  }

  function openEditForm(c: Customer) {
    setEditing(c)
    setName(c.name || "")
    setPhone(c.phone || "")
    setGstNumber(c.gst_number || "")
    setCity(c.city || "")
    setAddress(c.address || "")
    setIsFormOpen(true)
  }

  async function handleSave(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault()
    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      gst_number: gstNumber.trim() || null,
      city: city.trim() || null,
      address: address.trim() || null,
    }

    try {
      setLoading(true)
      if (editing) {
        const { error } = await supabase
          .from("customers")
          .update(payload)
          .eq("id", editing.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("customers").insert(payload)
        if (error) throw error
      }
      await fetchCustomers()
      setIsFormOpen(false)
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setLoading(false)
    }
  }

  function filteredCustomers() {
    if (!search.trim()) return customers
    const q = search.trim().toLowerCase()
    return customers.filter((c) => (c.name || "").toLowerCase().includes(q))
  }

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Customers</h1>
            <p className="text-gray-600 mt-2">Search, add, or edit customer details.</p>
          </div>
          <button onClick={openAddForm} className="btn-primary">
            Add Customer
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name"
            className="input"
          />

          {loading && <div className="text-sm text-gray-600">Loading...</div>}

          <div className="grid grid-cols-1 gap-4">
            {filteredCustomers().map((c) => (
              <button
                key={c.id}
                onClick={() => openEditForm(c)}
                className="card text-left transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-600">{c.city || "City not set"}</div>
                  </div>
                  <div className="text-sm text-gray-600">{c.phone || "No phone"}</div>
                </div>
                <div className="mt-3 text-sm text-gray-600">GST: {c.gst_number || "—"}</div>
                <div className="mt-2 text-sm text-gray-700">{c.address || "No address"}</div>
              </button>
            ))}

            {filteredCustomers().length === 0 && !loading && (
              <div className="card text-center text-gray-600">No customers found.</div>
            )}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 py-6">
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <form
            onSubmit={(e) => handleSave(e)}
            className="relative w-full md:w-96 card rounded-t-2xl md:rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit Customer" : "Add Customer"}</h2>
                <p className="text-sm text-gray-600">{editing ? "Update customer info." : "Enter customer details."}</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">GST Number</label>
                <input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="input min-h-[96px] resize-none" />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
    </ErrorBoundary>
  )
}
