"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getAuthenticatedSession } from "@/lib/auth"
import { formatCurrency, isBrowser, toSafeNumber } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

type DashboardStats = {
  customerCount: number
  vehicleCount: number
  driverCount: number
  grCount: number
  grTodayCount: number
  activeTrips: number
  inTransitTrips: number
  deliveredTrips: number
  totalExpenses: number
  vehicleProfit: number
  monthlyRevenue: number
  vehiclesOnRoad: number
  deliveriesToday: number
  pendingPOD: number
  outstandingReceivables: number
}

const emptyStats: DashboardStats = {
  customerCount: 0,
  vehicleCount: 0,
  driverCount: 0,
  grCount: 0,
  grTodayCount: 0,
  activeTrips: 0,
  inTransitTrips: 0,
  deliveredTrips: 0,
  totalExpenses: 0,
  vehicleProfit: 0,
  monthlyRevenue: 0,
  vehiclesOnRoad: 0,
  deliveriesToday: 0,
  pendingPOD: 0,
  outstandingReceivables: 0,
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)

  async function loadStats(userId: string) {
    setLoading(true)

    try {
      console.log("[DashboardPage] Loading stats for:", userId)

      // Safari-compatible date parsing using ISO strings
      const now = new Date()
      const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().split("T")[0]
      const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().split("T")[0]
      const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1)).toISOString().split("T")[0]

      const [customers, vehicles, drivers, grs, todaysGrs, trips, expenses] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("drivers").select("*", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("gr_entries").select("*", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("gr_entries").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("gr_date", today),
        supabase.from("trips").select("freight_amount, status").eq("user_id", userId),
        supabase.from("expenses").select("amount").eq("user_id", userId).gte("date", startOfMonth).lt("date", endOfMonth),
      ])

      console.log("[DashboardPage] Customers result:", customers)
      console.log("[DashboardPage] Vehicles result:", vehicles)
      console.log("[DashboardPage] Drivers result:", drivers)
      console.log("[DashboardPage] GR result:", grs)

      if (customers.error) {
        console.error("Query error:", customers.error)
      }
      if (vehicles.error) {
        console.error("Query error:", vehicles.error)
      }
      if (drivers.error) {
        console.error("Query error:", drivers.error)
      }
      if (grs.error) {
        console.error("Query error:", grs.error)
      }
      if (todaysGrs.error) {
        console.error("Query error:", todaysGrs.error)
      }
      if (trips.error) {
        console.error("Query error:", trips.error)
      }
      if (expenses.error) {
        console.error("Query error:", expenses.error)
      }

      const tripRows = (trips.data as Array<{ status?: string }> | null) || []
      const expenseRows = (expenses.data as Array<{ amount?: number }> | null) || []

      const activeTrips = tripRows.filter((trip) => ["Created", "Dispatched", "In Transit"].includes(trip.status ?? "")).length
      const inTransitTrips = tripRows.filter((trip) => trip.status === "In Transit").length
      const deliveredTrips = tripRows.filter((trip) => trip.status === "Delivered").length
      const totalExpenses = expenseRows.reduce((sum, item) => sum + toSafeNumber(item.amount), 0)
      const monthlyRevenue = 0 // Revenue will be calculated from billing/invoices in future
      const vehicleProfit = monthlyRevenue - totalExpenses
      const vehiclesOnRoad = inTransitTrips
      const deliveriesToday = deliveredTrips
      const pendingPOD = activeTrips - deliveredTrips
      const outstandingReceivables = 0 // Will be calculated from billing

      setStats({
        customerCount: customers.count ?? 0,
        vehicleCount: vehicles.count ?? 0,
        driverCount: drivers.count ?? 0,
        grCount: grs.count ?? 0,
        grTodayCount: todaysGrs.count ?? 0,
        activeTrips,
        inTransitTrips,
        deliveredTrips,
        totalExpenses,
        vehicleProfit,
        monthlyRevenue,
        vehiclesOnRoad,
        deliveriesToday,
        pendingPOD,
        outstandingReceivables,
      })
    } catch (error) {
      console.error("[DashboardPage] loadStats failed:", error)
      setStats(emptyStats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeDashboard = async () => {
      try {
        const session = await getAuthenticatedSession()

        console.log("[DashboardPage] Session:", session?.user?.id)

        if (!mounted) return

        if (!session?.user) {
          console.warn("[DashboardPage] No authenticated session")
          setLoading(false)
          return
        }

        await loadStats(session.user.id)
      } catch (error) {
        console.error("[DashboardPage] initialization failed:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadStats(session.user.id)
      }
    })

    const handleFocus = () => {
      void getAuthenticatedSession().then((session) => {
        if (session?.user?.id) {
          void loadStats(session.user.id)
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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Transport operations overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/trips/new" className="btn-primary">
            + New Trip
          </Link>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* Section 1: Today's Operations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Operations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="card h-24 animate-pulse bg-gray-100" />
              ))
            : [
                <Link key="active" href="/trips" className="card block transition hover:shadow-lg active:scale-[0.98]">
                  <p className="text-sm text-gray-600">Active Trips</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.activeTrips}</p>
                </Link>,
                <div key="onroad" className="card">
                  <p className="text-sm text-gray-600">Vehicles On Road</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.vehiclesOnRoad}</p>
                </div>,
                <div key="deliveries" className="card">
                  <p className="text-sm text-gray-600">Deliveries Today</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.deliveriesToday}</p>
                </div>,
                <div key="pod" className="card">
                  <p className="text-sm text-gray-600">Pending POD</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.pendingPOD}</p>
                </div>,
              ]}
        </div>
      </div>

      {/* Section 2: Financial Snapshot */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Financial Snapshot</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card h-24 animate-pulse bg-gray-100" />
              ))
            : [
                <div key="revenue" className="card">
                  <p className="text-sm text-gray-600">Revenue This Month</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>,
                <div key="expenses" className="card">
                  <p className="text-sm text-gray-600">Expenses This Month</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
                </div>,
                <div key="receivables" className="card">
                  <p className="text-sm text-gray-600">Outstanding Receivables</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(stats.outstandingReceivables)}</p>
                </div>,
              ]}
        </div>
      </div>

      {/* Section 3: Business Performance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Business Performance</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card h-32 animate-pulse bg-gray-100" />
              ))
            : [
                <div key="month" className="card">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">This Month</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trips</span>
                      <span className="text-sm font-semibold">{stats.activeTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="text-sm font-semibold">{formatCurrency(stats.monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit</span>
                      <span className="text-sm font-semibold">{formatCurrency(stats.vehicleProfit)}</span>
                    </div>
                  </div>
                </div>,
                <div key="quarter" className="card">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">This Quarter</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trips</span>
                      <span className="text-sm font-semibold">{stats.activeTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="text-sm font-semibold">{formatCurrency(stats.monthlyRevenue * 3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit</span>
                      <span className="text-sm font-semibold">{formatCurrency(stats.vehicleProfit * 3)}</span>
                    </div>
                  </div>
                </div>,
                <div key="year" className="card">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">This Year</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trips</span>
                      <span className="text-sm font-semibold">{stats.activeTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="text-sm font-semibold">{formatCurrency(stats.monthlyRevenue * 12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit</span>
                      <span className="text-sm font-semibold">{formatCurrency(stats.vehicleProfit * 12)}</span>
                    </div>
                  </div>
                </div>,
              ]}
        </div>
      </div>

      {/* Section 4: Quick Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="card h-24 animate-pulse bg-gray-100" />
              ))
            : [
                <Link key="customers" href="/customers" className="card block transition hover:shadow-lg active:scale-[0.98]">
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.customerCount}</p>
                </Link>,
                <Link key="vehicles" href="/vehicles" className="card block transition hover:shadow-lg active:scale-[0.98]">
                  <p className="text-sm text-gray-600">Total Vehicles</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.vehicleCount}</p>
                </Link>,
                <Link key="drivers" href="/drivers" className="card block transition hover:shadow-lg active:scale-[0.98]">
                  <p className="text-sm text-gray-600">Total Drivers</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.driverCount}</p>
                </Link>,
                <Link key="gr" href="/gr" className="card block transition hover:shadow-lg active:scale-[0.98]">
                  <p className="text-sm text-gray-600">Total GR</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.grCount}</p>
                </Link>,
              ]}
        </div>
      </div>
    </div>
  )
}