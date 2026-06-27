"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ExpenseForm from '@/components/ExpenseForm'
import { createExpense } from '@/lib/expenseService'

export default function NewExpensePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(payload: Parameters<typeof createExpense>[0]) {
    setSubmitting(true)
    setError(null)
    const created = await createExpense(payload)
    setSubmitting(false)
    if (created) {
      router.push('/expenses')
    } else {
      setError('Unable to create expense right now.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="page-container space-y-4">
        <div>
          <h1 className="section-title">Add Expense</h1>
          <p className="mt-2 text-sm text-gray-600">Record daily vehicle or trip expenses.</p>
        </div>
        {error ? <div className="card border border-red-200 bg-red-50 text-sm text-red-700">{error}</div> : null}
        <div className="card">
          <ExpenseForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Save Expense" submitting={submitting} />
        </div>
      </div>
    </main>
  )
}
