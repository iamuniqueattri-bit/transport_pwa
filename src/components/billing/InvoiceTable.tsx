import type { InvoiceListItem } from '@/types/invoice'
import InvoiceStatusBadge from './InvoiceStatusBadge'

type InvoiceTableProps = {
  invoices: InvoiceListItem[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onRevise: (id: string) => void
  onCancel: (id: string) => void
  onPrint: (id: string) => void
}

export default function InvoiceTable({ invoices, onView, onEdit, onRevise, onCancel, onPrint }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="card">
        <div className="py-12 text-center">
          <p className="text-gray-500">No invoices found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice No</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">GR Count</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Revision</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoice_no}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{invoice.customer_name || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{invoice.gr_count}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{invoice.total_amount.toLocaleString()}</td>
              <td className="px-4 py-3">
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{invoice.revision_no}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(invoice.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  {invoice.status === 'DRAFT' && (
                    <button
                      onClick={() => onEdit(invoice.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => onRevise(invoice.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Revise
                  </button>
                  <button
                    onClick={() => onCancel(invoice.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onPrint(invoice.id)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Print
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
