import type { InvoiceListItem } from '@/types/invoice'
import InvoiceStatusBadge from './InvoiceStatusBadge'
import PaymentStatusBadge from './PaymentStatusBadge'
import { formatCurrency } from '@/lib/utils'

type InvoiceCardProps = {
  invoice: InvoiceListItem
  onView: (id: string) => void
}

export default function InvoiceCard({ invoice, onView }: InvoiceCardProps) {
  return (
    <button
      onClick={() => onView(invoice.id)}
      className="card w-full text-left transition hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-gray-900">{invoice.invoice_no}</div>
          <div className="text-sm text-gray-600">{invoice.customer_name || 'Unknown Customer'}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</div>
          <div className="text-xs text-gray-500">{new Date(invoice.invoice_date).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <InvoiceStatusBadge status={invoice.status} />
        {invoice.payment_status && invoice.status === 'FINALIZED' && (
          <PaymentStatusBadge status={invoice.payment_status} />
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        {invoice.gr_count} GR{invoice.gr_count !== 1 ? 's' : ''}
      </div>
    </button>
  )
}
