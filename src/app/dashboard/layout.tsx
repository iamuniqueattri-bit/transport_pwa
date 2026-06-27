"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import ErrorBoundary from "@/components/ErrorBoundary"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trips", label: "Trips" },
  { href: "/expenses", label: "Expenses" },
  { href: "/billing", label: "Billing" },
  { href: "/vehicle-ledger", label: "Vehicle Ledger" },
  { href: "/driver-ledger", label: "Driver Ledger" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? ""

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="page-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Transport</p>
            <h1 className="text-xl font-bold text-gray-900">Operations Hub</h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="p-4">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  )
}