"use client"

import React, { useEffect, useState } from "react"
import type { Driver } from "@/lib/driverStorage"

type DriverFormData = {
  name: string
  mobile: string
  licenseNumber: string
  licenseExpiry: string
  address: string
  emergencyContact: string
  remarks: string
}

type DriverFormProps = {
  initialData?: Driver | null
  onSave: (driver: Omit<Driver, "id" | "createdAt"> & Partial<Pick<Driver, "id" | "createdAt">>) => void
  onCancel: () => void
  submitLabel: string
}

const EMPTY_FORM: DriverFormData = {
  name: "",
  mobile: "",
  licenseNumber: "",
  licenseExpiry: "",
  address: "",
  emergencyContact: "",
  remarks: "",
}

export default function DriverForm({
  initialData,
  onSave,
  onCancel,
  submitLabel,
}: DriverFormProps) {
  const [formData, setFormData] = useState<DriverFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof DriverFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!initialData) {
      setFormData(EMPTY_FORM)
      setErrors({})
      return
    }

    setFormData({
      name: initialData.name,
      mobile: initialData.mobile,
      licenseNumber: initialData.licenseNumber,
      licenseExpiry: initialData.licenseExpiry || "",
      address: initialData.address || "",
      emergencyContact: initialData.emergencyContact || "",
      remarks: initialData.remarks || "",
    })
    setErrors({})
  }, [initialData])

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof DriverFormData, string>> = {}

    if (!formData.name.trim()) {
      nextErrors.name = "Driver name is required"
    }

    if (!formData.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required"
    } else if (!/^[0-9]{10,15}$/.test(formData.mobile.trim())) {
      nextErrors.mobile = "Enter a valid mobile number"
    }

    if (!formData.licenseNumber.trim()) {
      nextErrors.licenseNumber = "License number is required"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleChange(field: keyof DriverFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setSubmitting(true)

    onSave({
      ...formData,
      licenseExpiry: formData.licenseExpiry.trim() || undefined,
      address: formData.address.trim() || undefined,
      emergencyContact: formData.emergencyContact.trim() || undefined,
      remarks: formData.remarks.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Driver Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(event) => handleChange("name", event.target.value)}
          className="input"
          placeholder="Enter driver name"
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
        <input
          type="tel"
          value={formData.mobile}
          onChange={(event) => handleChange("mobile", event.target.value)}
          className="input"
          placeholder="Enter mobile number"
        />
        {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
        <input
          type="text"
          value={formData.licenseNumber}
          onChange={(event) => handleChange("licenseNumber", event.target.value)}
          className="input"
          placeholder="Enter license number"
        />
        {errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">License Expiry Date</label>
        <input
          type="date"
          value={formData.licenseExpiry}
          onChange={(event) => handleChange("licenseExpiry", event.target.value)}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
        <textarea
          value={formData.address}
          onChange={(event) => handleChange("address", event.target.value)}
          className="input min-h-[96px] resize-none"
          placeholder="Driver address"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
        <input
          type="text"
          value={formData.emergencyContact}
          onChange={(event) => handleChange("emergencyContact", event.target.value)}
          className="input"
          placeholder="Enter emergency contact"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
        <textarea
          value={formData.remarks}
          onChange={(event) => handleChange("remarks", event.target.value)}
          className="input min-h-[96px] resize-none"
          placeholder="Additional notes"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-50">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  )
}
