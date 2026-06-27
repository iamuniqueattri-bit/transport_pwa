import Link from "next/link"

export default function InvoiceDetailsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/billing/invoices" className="btn-secondary">
          ← Back
        </Link>
        <h1 className="section-title">Invoice Details</h1>
      </div>

      <div className="card">
        <div className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Invoice Details Coming Soon</h2>
          <p className="mt-2 text-gray-600">This feature will be available in a future update.</p>
        </div>
      </div>
    </div>
  )
}
