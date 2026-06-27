"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getInvoiceById, updateInvoiceStatus, markInvoicePaid, duplicateInvoice } from "@/lib/invoiceStorage"
import type { Invoice } from "@/types/invoice"
import InvoiceDetails from "@/components/billing/InvoiceDetails"

type GR = {
  id: string
  gr_number: string
  from_city?: string
  to_city?: string
  freight?: number
  vehicle_number?: string
}

export default function InvoiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [customerName, setCustomerName] = useState<string | undefined>()
  const [grs, setGrs] = useState<GR[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")

  useEffect(() => {
    async function loadInvoiceDetails() {
      setLoading(true)
      try {
        const invoiceData = await getInvoiceById(invoiceId)
        if (!invoiceData) {
          setLoading(false)
          return
        }

        setInvoice(invoiceData)

        const [{ data: customerData }, { data: itemsData }] = await Promise.all([
          supabase.from("customers").select("customer_name").eq("id", invoiceData.customer_id).single(),
          supabase
            .from("invoice_items")
            .select(`
              trip_id,
              trips!inner(
                id,
                gr_number,
                from_city,
                to_city,
                freight_amount,
                vehicle_number
              )
            `)
            .eq("invoice_id", invoiceId),
        ])

        if (customerData) {
          setCustomerName((customerData as any).customer_name)
        }

        if (itemsData) {
          const tripData = itemsData.map((item: any) => ({
            id: item.trips.id,
            gr_number: item.trips.gr_number,
            from_city: item.trips.from_city,
            to_city: item.trips.to_city,
            freight: item.trips.freight_amount,
            vehicle_number: item.trips.vehicle_number,
          }))
          setGrs(tripData)
        }
      } catch (error) {
        console.error("Error loading invoice details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (invoiceId) {
      loadInvoiceDetails()
    }
  }, [invoiceId])

  async function handleMarkPaid() {
    if (!invoice) return

    setActionLoading(true)
    try {
      const updated = await markInvoicePaid(invoice.id, invoice.total_amount)
      if (updated) {
        setInvoice(updated)
        alert("Invoice marked as paid!")
      } else {
        alert("Failed to mark invoice as paid")
      }
    } catch (error) {
      console.error("Error marking paid:", error)
      alert("Failed to mark invoice as paid")
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePartialPayment() {
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (!invoice) return

    setActionLoading(true)
    setShowPaymentModal(false)
    try {
      const updated = await markInvoicePaid(invoice.id, amount)
      if (updated) {
        setInvoice(updated)
        setPaymentAmount("")
        alert("Payment recorded successfully!")
      } else {
        alert("Failed to record payment")
      }
    } catch (error) {
      console.error("Error recording payment:", error)
      alert("Failed to record payment")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancelDraft() {
    if (!invoice || invoice.status !== "DRAFT") {
      alert("Only draft invoices can be cancelled")
      return
    }

    if (!confirm("Are you sure you want to cancel this draft invoice?")) {
      return
    }

    setActionLoading(true)
    try {
      const updated = await updateInvoiceStatus(invoice.id, "CANCELLED")
      if (updated) {
        setInvoice(updated)
        alert("Draft invoice cancelled!")
      } else {
        alert("Failed to cancel draft")
      }
    } catch (error) {
      console.error("Error cancelling draft:", error)
      alert("Failed to cancel draft")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDuplicate() {
    if (!invoice) return

    if (!confirm("Are you sure you want to duplicate this invoice?")) {
      return
    }

    setActionLoading(true)
    try {
      const duplicated = await duplicateInvoice(invoice.id)
      if (duplicated) {
        alert("Invoice duplicated successfully!")
        router.push(`/billing/${duplicated.id}`)
      } else {
        alert("Failed to duplicate invoice")
      }
    } catch (error) {
      console.error("Error duplicating invoice:", error)
      alert("Failed to duplicate invoice")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/billing" className="btn-secondary">
            ← Back
          </Link>
          <h1 className="section-title">Invoice Details</h1>
        </div>
        <div className="card h-64 animate-pulse bg-gray-100" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/billing" className="btn-secondary">
            ← Back
          </Link>
          <h1 className="section-title">Invoice Details</h1>
        </div>
        <div className="card">
          <div className="py-12 text-center">
            <p className="text-gray-500">Invoice not found</p>
          </div>
        </div>
      </div>
    )
  }

  const isDraft = invoice.status === "DRAFT"
  const isFinalized = invoice.status === "FINALIZED"
  const isPaid = invoice.payment_status === "PAID"

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/billing" className="btn-secondary">
          ← Back
        </Link>
        <h1 className="section-title">Invoice Details</h1>
      </div>

      <InvoiceDetails invoice={invoice} customerName={customerName} grs={grs} />

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {isDraft && (
            <>
              <button
                onClick={handleCancelDraft}
                disabled={actionLoading}
                className="btn-secondary disabled:opacity-50 text-red-600 hover:text-red-800"
              >
                {actionLoading ? "Cancelling..." : "Cancel Draft"}
              </button>
              <button
                onClick={handleDuplicate}
                disabled={actionLoading}
                className="btn-secondary disabled:opacity-50"
              >
                {actionLoading ? "Duplicating..." : "Duplicate Invoice"}
              </button>
            </>
          )}

          {isFinalized && !isPaid && (
            <>
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={actionLoading}
                className="btn-secondary disabled:opacity-50"
              >
                Record Payment
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={actionLoading}
                className="btn-primary disabled:opacity-50"
              >
                {actionLoading ? "Marking..." : "Mark Fully Paid"}
              </button>
              <button
                onClick={handleDuplicate}
                disabled={actionLoading}
                className="btn-secondary disabled:opacity-50"
              >
                {actionLoading ? "Duplicating..." : "Duplicate Invoice"}
              </button>
            </>
          )}

          {isFinalized && isPaid && (
            <button
              onClick={handleDuplicate}
              disabled={actionLoading}
              className="btn-secondary disabled:opacity-50"
            >
              {actionLoading ? "Duplicating..." : "Duplicate Invoice"}
            </button>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 py-6">
          <div
            onClick={() => setShowPaymentModal(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full md:w-96 card rounded-t-2xl md:rounded-2xl">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
                <p className="text-sm text-gray-600">Enter payment amount</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="text-sm text-gray-600">
                Balance Due: ₹{(invoice.total_amount - (invoice.paid_amount || 0)).toFixed(2)}
              </div>
              <button
                onClick={handlePartialPayment}
                disabled={actionLoading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {actionLoading ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
