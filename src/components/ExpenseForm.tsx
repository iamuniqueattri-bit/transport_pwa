"use client"

import { useEffect, useState } from 'react'
import type { ExpenseInput } from '@/types/expense'

type ExpenseFormProps = {
  initialData?: Partial<ExpenseInput> | null
  onSubmit: (payload: ExpenseInput) => Promise<void> | void
  onCancel: () => void
  submitLabel: string
  submitting?: boolean
}

const emptyForm: ExpenseInput = {
  trip_id: '',
  vehicle_id: '',
  vehicle_number: '',
  category: 'Misc',
  amount: 0,
  date: '',
  remarks: '',
}

export default function ExpenseForm({ initialData, onSubmit, onCancel, submitLabel, submitting = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseInput>(emptyForm)

  useEffect(() => {
    if (initialData) {
      setFormData({ ...emptyForm, ...initialData })
    }
  }, [initialData])

  function updateField(field: keyof ExpenseInput, value: string | number) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    onSubmit({
      ...formData,
      trip_id: formData.trip_id?.trim() || undefined,
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
          <label className="mb-1 block text-sm font-semibold text-gray-700">Trip ID</label>
          <input value={formData.trip_id ?? ''} onChange={(event) => updateField('trip_id', event.target.value)} className="input" placeholder="Optional trip reference" />
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
