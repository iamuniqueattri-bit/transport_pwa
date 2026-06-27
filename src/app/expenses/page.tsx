"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ExpenseCard from '@/components/ExpenseCard'
import ExpenseFilters from '@/components/ExpenseFilters'
import ErrorBoundary from '@/components/ErrorBoundary'
import { deleteExpense, getExpenses } from '@/lib/expenseService'
import { supabase } from '@/lib/supabase'
import { isBrowser } from '@/lib/utils'
import type { Expense } from '@/types/expense'

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [vehicleFilter, setVehicleFilter] = useState('All')
  const [toast, setToast] = useState<string | null>(null)
  const [vehicleOptions, setVehicleOptions] = useState<Array<{ id: string; label: string }>>([])
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef<number | null>(null)

  async function loadExpenses() {
    setLoading(true)
    const [expenseData, vehicleData] = await Promise.all([getExpenses(), supabase.from('vehicles').select('id, vehicle_number').order('vehicle_number')])
    if (vehicleData.data) {
      setVehicleOptions(vehicleData.data.map((item: { id: string; vehicle_number: string }) => ({ id: item.id, label: item.vehicle_number })))
    }
    setExpenses(expenseData)
    setLoading(false)
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  useEffect(() => {
    if (!toast || !isBrowser) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const haystack = `${expense.vehicle_number} ${expense.category} ${expense.remarks ?? ''}`.toLowerCase()
      const matchesSearch = haystack.includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter
      const matchesVehicle = vehicleFilter === 'All' || expense.vehicle_id === vehicleFilter
      return matchesSearch && matchesCategory && matchesVehicle
    })
  }, [categoryFilter, expenses, search, vehicleFilter])

  const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses])

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isBrowser && window.scrollY === 0) {
      touchStartY.current = event.touches[0]?.clientY ?? null
    }
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartY.current === null || !isBrowser || window.scrollY > 0) return
    const delta = (event.touches[0]?.clientY ?? 0) - touchStartY.current
    if (delta > 0) {
      setPullDistance(Math.min(delta, 92))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 70) {
      await loadExpenses()
      setToast('Expenses refreshed')
    }
    setPullDistance(0)
    touchStartY.current = null
  }

  async function handleDelete(expense: Expense) {
    const confirmed = isBrowser ? window.confirm(`Delete ${expense.category} expense?`) : true
    if (!confirmed) return
    const ok = await deleteExpense(expense.id)
    if (ok) {
      setExpenses((current) => current.filter((item) => item.id !== expense.id))
      setToast('Expense deleted')
    }
  }

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-gray-50 text-gray-900" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="page-container space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ transform: `translateY(${pullDistance}px)` }}>
          <div>
            <h1 className="section-title">Expenses</h1>
            <p className="mt-2 text-sm text-gray-600">Track vehicle and trip-related spend history.</p>
          </div>
          <Link href="/expenses/new" className="btn-primary">
            Add Expense
          </Link>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total expenses</p>
            <p className="text-2xl font-semibold">₹{totalExpenses}</p>
          </div>
        </div>

        <ExpenseFilters search={search} category={categoryFilter} vehicle={vehicleFilter} onSearchChange={setSearch} onCategoryChange={setCategoryFilter} onVehicleChange={setVehicleFilter} vehicleOptions={vehicleOptions} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="card h-24 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="card text-center text-gray-600">No expenses found for this view.</div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} onEdit={(selectedExpense) => router.push(`/expenses/${selectedExpense.id}/edit`)} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {toast ? <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div> : null}
    </main>
    </ErrorBoundary>
  )
}
