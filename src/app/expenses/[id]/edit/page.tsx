"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ExpenseForm from '@/components/ExpenseForm'
import { getExpenseById, updateExpense } from '@/lib/expenseService'
import type { Expense, ExpenseInput } from '@/types/expense'

export default function EditExpensePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!params?.id) return
      setLoading(true)
      const data = await getExpenseById(params.id)
      setExpense(data)
      setLoading(false)
    }

    load()
  }, [params?.id])

  async function handleSubmit(payload: ExpenseInput) {
    if (!expense?.id) return
    setSubmitting(true)
    setError(null)
    const updated = await updateExpense(expense.id, payload)
    setSubmitting(false)
    if (updated) {
      router.push('/expenses')
    } else {
      setError('Unable to update expense right now.')
    }
  }

  if (loading) {
    return <div className="page-container"><div className="card h-40 animate-pulse" /></div>
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div>
          <h1 className="section-title">Edit Expense</h1>
          <p className="mt-2 text-sm text-gray-600">Update expense details and category.</p>
        </div>
        {error ? <div className="card border border-red-200 bg-red-50 text-sm text-red-700">{error}</div> : null}
        <div className="card">
          <ExpenseForm initialData={expense as Partial<ExpenseInput>} onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Save Changes" submitting={submitting} />
        </div>
      </div>
    </main>
  )
}
