"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { error } from "console"

type GR = {
  id: string
  gr_number: string
  gr_date: string
  from_city?: string | null
  to_city?: string | null
  freight?: number | null
  payment_type?: string | null
  status?: string | null
  remarks?: string | null
  created_at?: string | null
}

export default function GRPage() {
  const [grs, setGrs] = useState<GR[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<GR | null>(null)
 
  const paymentTypes = [
  "To Pay",
  "Paid",
  "Billing",
]

const [isFormOpen, setIsFormOpen] = useState(false)
const [grNumber, setGrNumber] = useState("")
const [grDate, setGrDate] = useState(
  new Date().toISOString().split("T")[0]
)
const [fromCity, setFromCity] = useState("")
const [toCity, setToCity] = useState("")
const [freight, setFreight] = useState("")
const [paymentType, setPaymentType] = useState("To Pay")
const [status, setStatus] = useState("Pending")
const [remarks, setRemarks] = useState("")

const statuses = [
  "Pending",
  "Dispatched",
  "Delivered",
]

  useEffect(() => {
    fetchGRs()
  }, [])

  async function fetchGRs() {
    setLoading(true)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('[fetchGRs] No authenticated user:', userError)
      setGrs([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
  .from("gr_entries")
  .select("*")
  .eq("user_id", user.id)
  .order("gr_date", { ascending: false })

console.log("GR Data:", data)
console.log("GR Error:", error)

    console.log("GR fetch data:", data)
console.log("GR fetch error:", error)

if (error) {
  console.error(error)
} else {
  setGrs((data as GR[]) || [])
}

    setLoading(false)
  }

  async function saveGR() {
  if (!grNumber.trim()) {
    alert("Please enter GR Number")
    return
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('[saveGR] No authenticated user:', userError)
    alert('Authentication required. Please log in.')
    return
  }

  try {
    setLoading(true)

    if (editing) {
  const { error } = await supabase
    .from("gr_entries")
    .update({
      gr_number: grNumber,
      gr_date: grDate,
      from_city: fromCity,
      to_city: toCity,
      freight: Number(freight) || 0,
      payment_type: paymentType,
      status,
      remarks,
    })
    .eq("id", editing.id)
    .eq("user_id", user.id)

  if (error) throw error
} else {
  const { error } = await supabase
    .from("gr_entries")
    .insert({
      gr_number: grNumber,
      gr_date: grDate,
      from_city: fromCity,
      to_city: toCity,
      freight: Number(freight) || 0,
      payment_type: paymentType,
      status,
      remarks,
      user_id: user.id,
    })

  }


    await fetchGRs()
    setEditing(null)

    setIsFormOpen(false)

    // Reset form
    setGrNumber("")
    setFromCity("")
    setToCity("")
    setFreight("")
    setPaymentType("To Pay")
    setStatus("Pending")
    setRemarks("")

  } catch (error) {
    console.error(error)
    alert("Failed to save GR")
  } finally {
    setLoading(false)
  }
}

  function filteredGRs() {
    if (!search.trim()) return grs

    return grs.filter((gr) =>
      gr.gr_number.toLowerCase().includes(search.toLowerCase())
    )
  }

  function openEditForm(gr: GR) {
  setEditing(gr)

  setGrNumber(gr.gr_number || "")
  setGrDate(gr.gr_date || "")
  setFromCity(gr.from_city || "")
  setToCity(gr.to_city || "")
  setFreight(String(gr.freight || ""))
  setPaymentType(gr.payment_type || "To Pay")
  setStatus(gr.status || "Pending")
  setRemarks(gr.remarks || "")

  setIsFormOpen(true)
}

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">GR Entries</h1>
            <p className="text-gray-600 mt-2">
              Manage transport GR records.
            </p>
          </div>

          <button
  onClick={() => {
    setEditing(null)
    setGrNumber("")
    setFromCity("")
    setToCity("")
    setFreight("")
    setPaymentType("To Pay")
    setStatus("Pending")
    setRemarks("")
    setIsFormOpen(true)
  }}
  className="btn-primary"
>
  Add GR
</button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by GR Number"
          className="input mb-4"
        />

        {loading && (
          <div className="text-sm text-gray-600">
            Loading...
          </div>
        )}

        <div className="grid gap-4">
          <p>Total GRs: {grs.length}</p>
          {filteredGRs().map((gr) => (
            <button
  key={gr.id}
  onClick={() => openEditForm(gr)}
  className="card text-left transition hover:shadow-md"
>
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    GR #{gr.gr_number}
                  </h2>

                  <p className="text-sm text-gray-600">
                    {gr.from_city} → {gr.to_city}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    ₹ {gr.freight || 0}
                  </p>

                  <p className="text-sm text-gray-600">
                    {gr.status || "Pending"}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {gr.payment_type || "To Pay"}
              </div>
            </button>
          ))}

          {!loading && filteredGRs().length === 0 && (
            <div className="card text-center text-gray-600">
              No GR entries found.
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
  <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 py-6">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setIsFormOpen(false)}
    />

    <div className="relative w-full md:w-[500px] card rounded-t-2xl md:rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
  {editing ? "Edit GR Entry" : "Add GR Entry"}
</h2>

        <button
          onClick={() => setIsFormOpen(false)}
          className="btn-secondary"
        >
          Close
        </button>
      </div>

      <div className="space-y-4">
        <input
          placeholder="GR Number"
          value={grNumber}
          onChange={(e) => setGrNumber(e.target.value)}
          className="input"
        />

        <input
          type="date"
          value={grDate}
          onChange={(e) => setGrDate(e.target.value)}
          className="input"
        />

        <input
          placeholder="From City"
          value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          className="input"
        />

        <input
          placeholder="To City"
          value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          className="input"
        />

        <input
          type="number"
          placeholder="Freight"
          value={freight}
          onChange={(e) => setFreight(e.target.value)}
          className="input"
        />

        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="input"
        >
          {paymentTypes.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input"
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <textarea
          placeholder="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="input min-h-[100px]"
        />

        <button
  onClick={saveGR}
  disabled={loading}
  className="btn-primary w-full"
>
  {loading ? "Saving..." : "Save GR"}
</button>



      </div>
    </div>
  </div>
)}

    </main>
  )
}