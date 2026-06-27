"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getInvoiceStats } from "@/lib/invoiceStorage"
import { formatCurrency, isBrowser } from "@/lib/utils"
import BillingStatsCard from "@/components/billing/BillingStatsCard"
import Link from "next/link"

type BillingDashboardStats = {
  totalInvoices: number
  draftInvoices: number
  finalizedInvoices: number
  totalRevenue: number
}

const emptyStats: BillingDashboardStats = {
  totalInvoices: 0,
  draftInvoices: 0,
  finalizedInvoices: 0,
  totalRevenue: 0,
}

export default function BillingDashboardPage() {
  const [stats, setStats] = useState<BillingDashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)

  async function loadStats(userId: string) {
    setLoading(true)

    try {
      console.log("Billing dashboard loading stats for:", userId)

      const invoiceStats = await getInvoiceStats()

      setStats(invoiceStats)
    } catch (error) {
      console.error("Billing dashboard initialization failed:", error)
      setStats(emptyStats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeDashboard = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        console.log("Billing dashboard user:", user)

        if (!mounted) return

        if (!user) {
          console.warn("Billing dashboard: no authenticated user")
          setLoading(false)
          return
        }

        await loadStats(user.id)
      } catch (error) {
        console.error("Billing dashboard initialization failed:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadStats(session.user.id)
      }
    })

    const handleFocus = () => {
      void supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.id) {
          void loadStats(user.id)
        }
      })
    }

    if (isBrowser) {
      window.addEventListener("focus", handleFocus)
    }

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (isBrowser) {
        window.removeEventListener("focus", handleFocus)
      }
    }
  }, [])

  const cards = [
    { label: "Total Invoices", value: stats.totalInvoices, href: "/billing/invoices" },
    { label: "Draft Invoices", value: stats.draftInvoices, href: "/billing/invoices" },
    { label: "Finalized Invoices", value: stats.finalizedInvoices, href: "/billing/invoices" },
    { label: "Revenue", value: formatCurrency(stats.totalRevenue), href: "/billing/invoices" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Billing Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Overview of invoices and revenue.</p>
        </div>
        <Link href="/billing/new" className="btn-primary">
          New Invoice
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card h-24 animate-pulse bg-gray-100" />
            ))
          : cards.map((card) => (
              <BillingStatsCard key={card.label} label={card.label} value={card.value} href={card.href} />
            ))}
      </div>

      {!loading && stats.totalInvoices === 0 && (
        <div className="card">
          <div className="py-12 text-center">
            <p className="text-gray-500">No invoices yet. Create your first invoice to get started.</p>
            <Link href="/billing/new" className="mt-4 inline-block btn-primary">
              Create Invoice
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
