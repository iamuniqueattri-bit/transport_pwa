"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
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
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)

  async function loadStats(userId: string) {
    setLoading(true)

    try {
      console.log("Dashboard loading stats for:", userId)

      const today = new Date().toISOString().split("T")[0]
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0]
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString().split("T")[0]

      const [customers, vehicles, drivers, grs, todaysGrs, trips, expenses] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("vehicles").select("*", { count: "exact", head: true }),
        supabase.from("drivers").select("*", { count: "exact", head: true }),
        supabase.from("gr_entries").select("*", { count: "exact", head: true }),
        supabase.from("gr_entries").select("*", { count: "exact", head: true }).eq("gr_date", today),
        supabase.from("trips").select("freight_amount, status").eq("user_id", userId),
        supabase.from("expenses").select("amount").eq("user_id", userId).gte("date", startOfMonth).lt("date", endOfMonth),
      ])

      console.log("Customers result:", customers)
      console.log("Vehicles result:", vehicles)
      console.log("Drivers result:", drivers)
      console.log("GR result:", grs)

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

      const tripRows = (trips.data as Array<{ freight_amount?: number; status?: string }> | null) || []
      const expenseRows = (expenses.data as Array<{ amount?: number }> | null) || []

      const activeTrips = tripRows.filter((trip) => ["Pending", "Dispatched", "In Transit"].includes(trip.status ?? "")).length
      const inTransitTrips = tripRows.filter((trip) => trip.status === "In Transit").length
      const deliveredTrips = tripRows.filter((trip) => trip.status === "Delivered").length
      const totalExpenses = expenseRows.reduce((sum, item) => sum + toSafeNumber(item.amount), 0)
      const monthlyRevenue = tripRows.reduce((sum, trip) => sum + toSafeNumber(trip.freight_amount), 0)
      const vehicleProfit = monthlyRevenue - totalExpenses

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
      })
    } catch (error) {
      console.error("Dashboard initialization failed:", error)
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

        console.log("Dashboard user:", user)

        if (!mounted) return

        if (!user) {
          console.warn("Dashboard: no authenticated user")
          setLoading(false)
          return
        }

        await loadStats(user.id)
      } catch (error) {
        console.error("Dashboard initialization failed:", error)
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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  const cards = [
    { label: "Active Trips", value: stats.activeTrips, href: "/trips" },
    { label: "Trips In Transit", value: stats.inTransitTrips, href: "/trips" },
    { label: "Delivered Trips", value: stats.deliveredTrips, href: "/trips" },
    { label: "Total Expenses", value: formatCurrency(stats.totalExpenses), href: "/expenses" },
    { label: "Vehicle Profit", value: formatCurrency(stats.vehicleProfit), href: "/vehicle-ledger" },
    { label: "Monthly Revenue", value: formatCurrency(stats.monthlyRevenue), href: "/trips" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Operations Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Live transport KPIs for trips, expenses, and profitability.</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card h-24 animate-pulse bg-gray-100" />
            ))
          : cards.map((card) => (
              <Link key={card.label} href={card.href} className="card block transition hover:shadow-lg active:scale-[0.98]">
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
              </Link>
            ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="card h-24 animate-pulse bg-gray-100" />)
          : [
              <Link key="customers" href="/customers" className="card block transition hover:shadow-lg active:scale-[0.98]">
                <h3 className="font-semibold">Customers</h3>
                <p className="mt-2 text-2xl">{stats.customerCount}</p>
              </Link>,
              <Link key="vehicles" href="/vehicles" className="card block transition hover:shadow-lg active:scale-[0.98]">
                <h3 className="font-semibold">Vehicles</h3>
                <p className="mt-2 text-2xl">{stats.vehicleCount}</p>
              </Link>,
              <Link key="drivers" href="/drivers" className="card block transition hover:shadow-lg active:scale-[0.98]">
                <h3 className="font-semibold">Drivers</h3>
                <p className="mt-2 text-2xl">{stats.driverCount}</p>
              </Link>,
              <Link key="gr" href="/gr" className="card block transition hover:shadow-lg active:scale-[0.98]">
                <h3 className="font-semibold">GR Entries</h3>
                <p className="mt-2 text-2xl">{stats.grCount}</p>
              </Link>,
            ]}
      </div>

      <div className="card">
        {loading ? <div className="h-8 animate-pulse rounded bg-gray-100" /> : <>
          <h3 className="font-semibold">GR Today</h3>
          <p className="mt-2 text-2xl">{stats.grTodayCount}</p>
        </>}
      </div>
    </div>
  )
}