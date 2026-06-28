"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getAuthenticatedSession } from "@/lib/auth"
import { getInvoices } from "@/lib/invoiceStorage"
import type { InvoiceListItem } from "@/types/invoice"
import InvoiceCard from "@/components/billing/InvoiceCard"
import InvoiceFilters from "@/components/billing/InvoiceFilters"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  async function loadInvoices(userId: string) {
    setLoading(true)

    try {
      console.log("[BillingPage] Loading invoices for:", userId)

      const invoiceData = await getInvoices()

      setInvoices(invoiceData)
    } catch (error) {
      console.error("[BillingPage] loadInvoices failed:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeBilling = async () => {
      try {
        const session = await getAuthenticatedSession()

        console.log("[BillingPage] Session:", session?.user?.id)

        if (!mounted) return

        if (!session?.user) {
          console.warn("[BillingPage] No authenticated session")
          setLoading(false)
          return
        }

        await loadInvoices(session.user.id)
      } catch (error) {
        console.error("[BillingPage] initialization failed:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeBilling()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadInvoices(session.user.id)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      searchQuery === "" ||
      invoice.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.customer_name && invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    const matchesPayment = paymentFilter === "all" || invoice.payment_status === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const handleView = (id: string) => {
    router.push(`/billing/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Invoices</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and track your invoices.</p>
        </div>
        <Link href="/billing/new" className="btn-primary">
          New Invoice
        </Link>
      </div>

      <div className="card space-y-4">
        <InvoiceFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
        />

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card h-32 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="card">
            <div className="py-12 text-center">
              <p className="text-gray-500">No invoices found</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} onView={handleView} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
