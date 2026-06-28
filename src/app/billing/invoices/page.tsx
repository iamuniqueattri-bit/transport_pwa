"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getAuthenticatedSession } from "@/lib/auth"
import { getInvoices } from "@/lib/invoiceStorage"
import type { InvoiceListItem } from "@/types/invoice"
import InvoiceTable from "@/components/billing/InvoiceTable"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  async function loadInvoices(userId: string) {
    setLoading(true)

    try {
      console.log("[InvoicesPage] Loading invoices for:", userId)

      const invoiceData = await getInvoices()

      setInvoices(invoiceData)
    } catch (error) {
      console.error("[InvoicesPage] loadInvoices failed:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeInvoices = async () => {
      try {
        const session = await getAuthenticatedSession()

        console.log("[InvoicesPage] Session:", session?.user?.id)

        if (!mounted) return

        if (!session?.user) {
          console.warn("[InvoicesPage] No authenticated session")
          setLoading(false)
          return
        }

        await loadInvoices(session.user.id)
      } catch (error) {
        console.error("[InvoicesPage] initialization failed:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeInvoices()

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

    const matchesDate = dateFilter === "all" || (() => {
      const invoiceDate = new Date(invoice.invoice_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dateFilter === "today") {
        return invoiceDate.toDateString() === today.toDateString()
      }
      if (dateFilter === "week") {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return invoiceDate >= weekAgo
      }
      if (dateFilter === "month") {
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return invoiceDate >= monthAgo
      }
      return true
    })()

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleView = (id: string) => {
    router.push(`/billing/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/billing/${id}/edit`)
  }

  const handleRevise = (id: string) => {
    console.log("Revise invoice:", id)
    // TODO: Implement revision logic
  }

  const handleCancel = (id: string) => {
    console.log("Cancel invoice:", id)
    // TODO: Implement cancellation logic
  }

  const handlePrint = (id: string) => {
    console.log("Print invoice:", id)
    // TODO: Implement print logic
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search invoices..."
            className="input flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="FINALIZED">Finalized</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            className="input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {loading ? (
          <div className="card h-64 animate-pulse bg-gray-100" />
        ) : (
          <InvoiceTable
            invoices={filteredInvoices}
            onView={handleView}
            onEdit={handleEdit}
            onRevise={handleRevise}
            onCancel={handleCancel}
            onPrint={handlePrint}
          />
        )}
      </div>
    </div>
  )
}
