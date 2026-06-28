"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Vehicle = {
  id: string
  vehicle_number: string
  vehicle_type?: string | null
  owner_name?: string | null
  driver_name?: string | null
  driver_phone?: string | null
  capacity?: string | null
  is_active?: boolean | null
  created_at?: string | null
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)

  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [driverName, setDriverName] = useState("")
  const [driverPhone, setDriverPhone] = useState("")
  const [capacity, setCapacity] = useState("")

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    setLoading(true)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error("Error fetching user:", userError)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching vehicles:", error)
    } else {
      setVehicles((data as Vehicle[]) || [])
    }
    setLoading(false)
  }

  function openAddForm() {
    setEditing(null)
    setVehicleNumber("")
    setVehicleType("")
    setOwnerName("")
    setDriverName("")
    setDriverPhone("")
    setCapacity("")
    setIsFormOpen(true)
  }

  function openEditForm(vehicle: Vehicle) {
    setEditing(vehicle)
    setVehicleNumber(vehicle.vehicle_number)
    setVehicleType(vehicle.vehicle_type || "")
    setOwnerName(vehicle.owner_name || "")
    setDriverName(vehicle.driver_name || "")
    setDriverPhone(vehicle.driver_phone || "")
    setCapacity(vehicle.capacity || "")
    setIsFormOpen(true)
  }

  async function handleSave(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("Error fetching user:", userError)
      return
    }

    const payload = {
      vehicle_number: vehicleNumber.trim(),
      vehicle_type: vehicleType.trim() || null,
      owner_name: ownerName.trim() || null,
      driver_name: driverName.trim() || null,
      driver_phone: driverPhone.trim() || null,
      capacity: capacity.trim() || null,
      user_id: user.id,
    }

    try {
      setLoading(true)
      if (editing) {
        const { error } = await supabase
          .from("vehicles")
          .update(payload)
          .eq("id", editing.id)
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("vehicles").insert(payload)
        if (error) throw error
      }
      await fetchVehicles()
      setIsFormOpen(false)
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(vehicle: Vehicle) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("Error fetching user:", userError)
      return
    }

    const updated = !vehicle.is_active
    const { error } = await supabase
      .from("vehicles")
      .update({ is_active: updated })
      .eq("id", vehicle.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Toggle active error:", error)
      return
    }
    setVehicles((current) =>
      current.map((item) =>
        item.id === vehicle.id ? { ...item, is_active: updated } : item
      )
    )
  }

  function filteredVehicles() {
    if (!search.trim()) return vehicles
    const q = search.trim().toLowerCase()
    return vehicles.filter((vehicle) =>
      vehicle.vehicle_number.toLowerCase().includes(q)
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Vehicles</h1>
            <p className="text-gray-600 mt-2">Search, add, or edit vehicle records.</p>
          </div>
          <button onClick={openAddForm} className="btn-primary">
            Add Vehicle
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vehicle number"
            className="input"
          />

          {loading && <div className="text-sm text-gray-600">Loading...</div>}

          <div className="grid grid-cols-1 gap-4">
            {filteredVehicles().map((vehicle) => (
              <div key={vehicle.id} className="card transition hover:shadow-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{vehicle.vehicle_number}</div>
                    <div className="text-sm text-gray-600">{vehicle.vehicle_type || "Type not set"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        vehicle.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {vehicle.is_active ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => toggleActive(vehicle)}
                      className="btn-secondary text-sm"
                    >
                      {vehicle.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-800">Owner:</span> {vehicle.owner_name || "—"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">Driver:</span> {vehicle.driver_name || "—"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">Phone:</span> {vehicle.driver_phone || "—"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">Capacity:</span> {vehicle.capacity || "—"}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => openEditForm(vehicle)} className="btn-primary text-sm">
                    Edit
                  </button>
                </div>
              </div>
            ))}

            {filteredVehicles().length === 0 && !loading && (
              <div className="card text-center text-gray-600">No vehicles found.</div>
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
                <h2 className="text-lg font-semibold text-gray-900">{editing ? "Edit Vehicle" : "Add Vehicle"}</h2>
                <p className="text-sm text-gray-600">{editing ? "Update vehicle details." : "Enter vehicle information."}</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vehicle Number</label>
                <input required value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Vehicle Type</label>
                <input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Owner Name</label>
                <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Driver Name</label>
                <input value={driverName} onChange={(e) => setDriverName(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Driver Phone</label>
                <input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} className="input" />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Capacity</label>
                <input value={capacity} onChange={(e) => setCapacity(e.target.value)} className="input" />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? "Saving..." : "Save Vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
