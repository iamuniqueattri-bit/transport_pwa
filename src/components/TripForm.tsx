"use client"

import { useEffect, useState } from 'react'
import type { TripInput } from '@/types/trip'

type TripFormProps = {
  initialData?: Partial<TripInput> | null
  onSubmit: (payload: TripInput) => Promise<void> | void
  onCancel: () => void
  submitLabel: string
  submitting?: boolean
}

const emptyForm: TripInput = {
  gr_id: '',
  gr_number: '',
  customer_id: '',
  customer_name: '',
  vehicle_id: '',
  vehicle_number: '',
  driver_id: '',
  driver_name: '',
  origin: '',
  destination: '',
  start_date: '',
  expected_delivery_date: '',
  actual_delivery_date: '',
  freight_amount: 0,
  advance_paid: 0,
  status: 'Pending',
  remarks: '',
}

export default function TripForm({ initialData, onSubmit, onCancel, submitLabel, submitting = false }: TripFormProps) {
  const [formData, setFormData] = useState<TripInput>(emptyForm)

  useEffect(() => {
    if (initialData) {
      setFormData({ ...emptyForm, ...initialData, actual_delivery_date: initialData.actual_delivery_date ?? '' })
    }
  }, [initialData])

  function updateField(field: keyof TripInput, value: string | number) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSubmit({
      ...formData,
      gr_id: formData.gr_id.trim(),
      gr_number: formData.gr_number.trim(),
      customer_id: formData.customer_id.trim(),
      customer_name: formData.customer_name.trim(),
      vehicle_id: formData.vehicle_id.trim(),
      vehicle_number: formData.vehicle_number.trim(),
      driver_id: formData.driver_id.trim(),
      driver_name: formData.driver_name.trim(),
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      start_date: formData.start_date,
      expected_delivery_date: formData.expected_delivery_date,
      actual_delivery_date: formData.actual_delivery_date?.trim() || undefined,
      freight_amount: Number(formData.freight_amount || 0),
      advance_paid: Number(formData.advance_paid || 0),
      status: formData.status,
      remarks: formData.remarks?.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">GR ID</label>
          <input value={formData.gr_id} onChange={(event) => updateField('gr_id', event.target.value)} className="input" placeholder="GR reference" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">GR Number</label>
          <input value={formData.gr_number} onChange={(event) => updateField('gr_number', event.target.value)} className="input" placeholder="GR number" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Customer ID</label>
          <input value={formData.customer_id} onChange={(event) => updateField('customer_id', event.target.value)} className="input" placeholder="Customer reference" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Customer Name</label>
          <input value={formData.customer_name} onChange={(event) => updateField('customer_name', event.target.value)} className="input" placeholder="Customer name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Vehicle ID</label>
          <input value={formData.vehicle_id} onChange={(event) => updateField('vehicle_id', event.target.value)} className="input" placeholder="Vehicle reference" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Vehicle Number</label>
          <input value={formData.vehicle_number} onChange={(event) => updateField('vehicle_number', event.target.value)} className="input" placeholder="Vehicle number" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Driver ID</label>
          <input value={formData.driver_id} onChange={(event) => updateField('driver_id', event.target.value)} className="input" placeholder="Driver reference" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Driver Name</label>
          <input value={formData.driver_name} onChange={(event) => updateField('driver_name', event.target.value)} className="input" placeholder="Driver name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Origin</label>
          <input value={formData.origin} onChange={(event) => updateField('origin', event.target.value)} className="input" placeholder="Origin" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Destination</label>
          <input value={formData.destination} onChange={(event) => updateField('destination', event.target.value)} className="input" placeholder="Destination" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Start Date</label>
          <input type="date" value={formData.start_date} onChange={(event) => updateField('start_date', event.target.value)} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Expected Delivery</label>
          <input type="date" value={formData.expected_delivery_date} onChange={(event) => updateField('expected_delivery_date', event.target.value)} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Actual Delivery</label>
          <input type="date" value={formData.actual_delivery_date ?? ''} onChange={(event) => updateField('actual_delivery_date', event.target.value)} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Freight Amount</label>
          <input type="number" value={formData.freight_amount} onChange={(event) => updateField('freight_amount', Number(event.target.value))} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Advance Paid</label>
          <input type="number" value={formData.advance_paid} onChange={(event) => updateField('advance_paid', Number(event.target.value))} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Status</label>
          <select value={formData.status} onChange={(event) => updateField('status', event.target.value)} className="input">
            {['Pending','Dispatched','In Transit','Delivered','Closed','Cancelled'].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
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
