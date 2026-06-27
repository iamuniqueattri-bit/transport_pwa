import { formatCurrency } from "@/lib/utils"
import InvoiceSummary from "./InvoiceSummary"

type Customer = {
  id: string
  name: string
  gst_number?: string | null
  phone?: string | null
  city?: string | null
}

type GR = {
  id: string
  gr_number: string
  gr_date: string
  from_city?: string | null
  to_city?: string | null
  freight?: number | null
  vehicle_number?: string | null
}

type InvoicePreviewProps = {
  customer: Customer
  selectedGRs: GR[]
  invoiceDate: string
  dueDate: string
  taxType: "GST" | "RCM" | "EXEMPT"
  notes?: string
}

export default function InvoicePreview({
  customer,
  selectedGRs,
  invoiceDate,
  dueDate,
  taxType,
  notes,
}: InvoicePreviewProps) {
  const freightTotal = selectedGRs.reduce((sum, gr) => sum + (gr.freight || 0), 0)

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
        <div className="space-y-1 text-sm">
          <div className="text-gray-900 font-medium">{customer.name}</div>
          <div className="text-gray-600">{customer.city || "City not set"}</div>
          <div className="text-gray-600">GST: {customer.gst_number || "—"}</div>
          <div className="text-gray-600">Phone: {customer.phone || "—"}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Invoice Details</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Invoice Date</span>
            <span className="text-gray-900">{new Date(invoiceDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date</span>
            <span className="text-gray-900">{new Date(dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax Type</span>
            <span className="text-gray-900">{taxType}</span>
          </div>
          {notes && (
            <div className="pt-2">
              <span className="text-gray-600">Notes: </span>
              <span className="text-gray-900">{notes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Selected GRs ({selectedGRs.length})</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {selectedGRs.map((gr) => (
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

      <InvoiceSummary freightTotal={freightTotal} taxType={taxType} />
    </div>
  )
}
