"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TripInput } from '@/types/trip'

type Vehicle = { id: string; vehicle_number: string }
type Driver = { id: string; name: string }

type TripFormProps = {
  initialData?: Partial<TripInput> | null
  onSubmit: (payload: TripInput) => Promise<void> | void
  onCancel: () => void
  submitLabel: string
  submitting?: boolean
}

const emptyForm: TripInput = {
  trip_number: '',
  trip_date: '',
  vehicle_id: '',
  vehicle_number: '',
  driver_id: '',
  driver_name: '',
  from_location: '',
  to_location: '',
  status: 'Created',
  remarks: '',
}

export default function TripForm({ initialData, onSubmit, onCancel, submitLabel, submitting = false }: TripFormProps) {
  const [formData, setFormData] = useState<TripInput>(emptyForm)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({ ...emptyForm, ...initialData })
    }
    loadVehiclesAndDrivers()
  }, [initialData])

  async function loadVehiclesAndDrivers() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [vehiclesRes, driversRes] = await Promise.all([
      supabase.from('vehicles').select('id, vehicle_number').eq('user_id', user.id).eq('is_active', true),
      supabase.from('drivers').select('id, name').eq('user_id', user.id),
    ])

    setVehicles((vehiclesRes.data as Vehicle[]) || [])
    setDrivers((driversRes.data as Driver[]) || [])
    setLoading(false)
  }

  function updateField(field: keyof TripInput, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleVehicleChange(vehicleId: string) {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    updateField('vehicle_id', vehicleId)
    updateField('vehicle_number', vehicle?.vehicle_number || '')
  }

  function handleDriverChange(driverId: string) {
    const driver = drivers.find(d => d.id === driverId)
    updateField('driver_id', driverId)
    updateField('driver_name', driver?.name || '')
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSubmit({
      ...formData,
      trip_date: formData.trip_date,
      vehicle_id: formData.vehicle_id.trim(),
      vehicle_number: formData.vehicle_number.trim(),
      driver_id: formData.driver_id.trim(),
      driver_name: formData.driver_name.trim(),
      from_location: formData.from_location.trim(),
      to_location: formData.to_location.trim(),
      status: formData.status,
      remarks: formData.remarks?.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Trip Date</label>
          <input type="date" value={formData.trip_date} onChange={(event) => updateField('trip_date', event.target.value)} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Vehicle</label>
          <select 
            value={formData.vehicle_id} 
            onChange={(event) => handleVehicleChange(event.target.value)} 
            className="input"
            disabled={loading}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_number}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Driver</label>
          <select 
            value={formData.driver_id} 
            onChange={(event) => handleDriverChange(event.target.value)} 
            className="input"
            disabled={loading}
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">From Location</label>
          <input value={formData.from_location} onChange={(event) => updateField('from_location', event.target.value)} className="input" placeholder="Origin" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">To Location</label>
          <input value={formData.to_location} onChange={(event) => updateField('to_location', event.target.value)} className="input" placeholder="Destination" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Remarks</label>
        <textarea value={formData.remarks ?? ''} onChange={(event) => updateField('remarks', event.target.value)} className="input min-h-[96px]" placeholder="Optional remarks" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
