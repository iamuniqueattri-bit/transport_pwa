import type { Invoice } from '@/types/invoice'
import InvoiceStatusBadge from './InvoiceStatusBadge'
import PaymentStatusBadge from './PaymentStatusBadge'
import { formatCurrency } from '@/lib/utils'

type InvoiceDetailsProps = {
  invoice: Invoice
  customerName?: string
  grs?: Array<{
    id: string
    gr_number: string
    from_city?: string
    to_city?: string
    freight?: number
    vehicle_number?: string
  }>
}

export default function InvoiceDetails({ invoice, customerName, grs = [] }: InvoiceDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Invoice Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Invoice Number</span>
            <span className="font-medium text-gray-900">{invoice.invoice_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
          </div>
          {invoice.due_date && (
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date</span>
              <span className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tax Type</span>
            <span className="text-gray-900">{invoice.tax_type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          {invoice.payment_status && invoice.status === 'FINALIZED' && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Status</span>
              <PaymentStatusBadge status={invoice.payment_status} />
            </div>
          )}
          {invoice.remarks && (
            <div className="pt-2">
              <span className="text-gray-600">Notes: </span>
              <span className="text-gray-900">{invoice.remarks}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
        <div className="text-sm text-gray-900 font-medium">{customerName || 'Unknown Customer'}</div>
      </div>

      {grs.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Included GRs ({grs.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {grs.map((gr) => (
              <div key={gr.id} className="flex justify-between items-start text-sm border-b border-gray-100 pb-2 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">GR #{gr.gr_number}</div>
                  <div className="text-gray-600">{gr.from_city} → {gr.to_city}</div>
                  {gr.vehicle_number && (
                    <div className="text-gray-600">{gr.vehicle_number}</div>
                  )}
                </div>
                <div className="font-medium text-gray-900">{formatCurrency(gr.freight || 0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Totals</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST Amount</span>
            <span className="text-gray-900">{formatCurrency(invoice.gst_amount)}</span>
          </div>
          {invoice.paid_amount !== undefined && invoice.paid_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Paid Amount</span>
              <span className="text-green-600 font-medium">{formatCurrency(invoice.paid_amount)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
          </div>
          {invoice.paid_amount !== undefined && invoice.paid_amount < invoice.total_amount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Balance Due</span>
              <span className="font-semibold text-red-600">{formatCurrency(invoice.total_amount - invoice.paid_amount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
