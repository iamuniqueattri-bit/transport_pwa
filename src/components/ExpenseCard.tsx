import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense } from '@/types/expense'

type ExpenseCardProps = {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export default function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{expense.category}</h2>
          <p className="text-sm text-gray-600">{expense.vehicle_number}</p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
          <p>{formatDate(expense.date)}</p>
        </div>
      </div>

      {expense.remarks ? <p className="text-sm text-gray-600">{expense.remarks}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/expenses/${expense.id}/edit`} className="btn-secondary text-sm">
          Edit
        </Link>
        <button type="button" onClick={() => onDelete(expense)} className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          Delete
        </button>
      </div>
    </div>
  )
}
