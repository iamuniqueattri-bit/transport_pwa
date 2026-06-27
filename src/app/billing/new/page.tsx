"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CustomerSelector from "@/components/billing/CustomerSelector"
import GRSelector from "@/components/billing/GRSelector"
import InvoicePreview from "@/components/billing/InvoicePreview"
import { saveDraftInvoice, finalizeInvoice } from "@/lib/invoiceStorage"

type Step = 1 | 2 | 3 | 4

type Customer = {
  id: string
  name: string
  gst_number?: string | null
  phone?: string | null
  city?: string | null
}

type GR = {
  id: string
  gr_number: string
  gr_date: string
  from_city?: string | null
  to_city?: string | null
  freight?: number | null
  vehicle_number?: string | null
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedGRs, setSelectedGRs] = useState<GR[]>([])
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [taxType, setTaxType] = useState<"GST" | "RCM" | "EXEMPT">("GST")
  const [notes, setNotes] = useState("")
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null)

  function handleNextStep() {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  function handlePreviousStep() {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  function handleGRSelect(gr: GR) {
    setSelectedGRs((prev) => [...prev, gr])
  }

  function handleGRDeselect(grId: string) {
    setSelectedGRs((prev) => prev.filter((gr) => gr.id !== grId))
  }

  async function handleSaveDraft() {
    if (!selectedCustomer || selectedGRs.length === 0) {
      alert("Please select a customer and at least one GR")
      return
    }

    setLoading(true)
    try {
      const invoice = await saveDraftInvoice({
        customer_id: selectedCustomer.id,
        invoice_date: invoiceDate,
        due_date: dueDate || undefined,
        invoice_type: "DRAFT",
        tax_type: taxType,
        remarks: notes || undefined,
        gr_ids: selectedGRs.map((gr) => gr.id),
      })

      if (invoice) {
        setCreatedInvoiceId(invoice.id)
        alert("Draft invoice saved successfully!")
        router.push("/billing")
      } else {
        alert("Failed to save draft invoice")
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      alert("Failed to save draft invoice")
    } finally {
      setLoading(false)
    }
  }

  async function handleFinalize() {
    if (!createdInvoiceId) {
      await handleSaveDraft()
      return
    }

    setLoading(true)
    try {
      const invoice = await finalizeInvoice(createdInvoiceId)
      if (invoice) {
        alert("Invoice finalized successfully!")
        router.push("/billing")
      } else {
        alert("Failed to finalize invoice")
      }
    } catch (error) {
      console.error("Error finalizing:", error)
      alert("Failed to finalize invoice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/billing" className="btn-secondary">
          ← Back
        </Link>
        <h1 className="section-title">New Invoice</h1>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step < 4 ? "flex-1" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Select Customer</h2>
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelect={setSelectedCustomer}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 2: Select GRs</h2>
              {selectedCustomer ? (
                <GRSelector
                  customerId={selectedCustomer.id}
                  selectedGRs={selectedGRs}
                  onSelect={handleGRSelect}
                  onDeselect={handleGRDeselect}
                />
              ) : (
                <div className="card text-center text-gray-600">
                  Please select a customer first.
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 3: Invoice Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Type
                  </label>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value as "GST" | "RCM" | "EXEMPT")}
                    className="input"
                  >
                    <option value="GST">GST</option>
                    <option value="RCM">RCM</option>
                    <option value="EXEMPT">EXEMPT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes or remarks..."
                    className="input min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 4: Preview & Finalize</h2>
              {selectedCustomer && selectedGRs.length > 0 ? (
                <InvoicePreview
                  customer={selectedCustomer}
                  selectedGRs={selectedGRs}
                  invoiceDate={invoiceDate}
                  dueDate={dueDate}
                  taxType={taxType}
                  notes={notes}
                />
              ) : (
                <div className="card text-center text-gray-600">
                  Missing information for preview.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          {currentStep === 4 ? (
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={loading || !selectedCustomer || selectedGRs.length === 0}
                className="btn-secondary disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={handleFinalize}
                disabled={loading || !selectedCustomer || selectedGRs.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Finalizing..." : "Finalize Invoice"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleNextStep}
              disabled={
                (currentStep === 1 && !selectedCustomer) ||
                (currentStep === 2 && selectedGRs.length === 0)
              }
              className="btn-primary disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
