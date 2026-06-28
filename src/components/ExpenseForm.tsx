"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ExpenseInput } from '@/types/expense'

type Vehicle = { id: string; vehicle_number: string }

type ExpenseFormProps = {
  initialData?: Partial<ExpenseInput> | null
  onSubmit: (payload: ExpenseInput) => Promise<void> | void
  onCancel: () => void
  submitLabel: string
  submitting?: boolean
}

const emptyForm: ExpenseInput = {
  vehicle_id: '',
  vehicle_number: '',
  category: 'Misc',
  amount: 0,
  date: '',
  remarks: '',
}

export default function ExpenseForm({ initialData, onSubmit, onCancel, submitLabel, submitting = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseInput>(emptyForm)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({ ...emptyForm, ...initialData })
    }
    loadVehicles()
  }, [initialData])

  async function loadVehicles() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('vehicles').select('id, vehicle_number').eq('user_id', user.id).eq('is_active', true)
    setVehicles((data as Vehicle[]) || [])
    setLoading(false)
  }

  function updateField(field: keyof ExpenseInput, value: string | number) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleVehicleChange(vehicleId: string) {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    updateField('vehicle_id', vehicleId)
    updateField('vehicle_number', vehicle?.vehicle_number || '')
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    onSubmit({
      ...formData,
      vehicle_id: formData.vehicle_id.trim(),
      vehicle_number: formData.vehicle_number.trim(),
      category: formData.category,
      amount: Number(formData.amount || 0),
      date: formData.date,
      remarks: formData.remarks?.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="mb-1 block text-sm font-semibold text-gray-700">Category</label>
          <select value={formData.category} onChange={(event) => updateField('category', event.target.value)} className="input">
            {['Diesel','Toll','Repair','Tyre','Food','Advance','Misc'].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Amount</label>
          <input type="number" value={formData.amount} onChange={(event) => updateField('amount', Number(event.target.value))} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Date</label>
          <input type="date" value={formData.date} onChange={(event) => updateField('date', event.target.value)} className="input" />
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
