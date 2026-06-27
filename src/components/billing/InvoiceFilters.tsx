type InvoiceFiltersProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  paymentFilter: string
  onPaymentFilterChange: (value: string) => void
}

export default function InvoiceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search by invoice number or customer..."
        className="input flex-1"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        className="input"
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="DRAFT">Draft</option>
        <option value="FINALIZED">Finalized</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <select
        className="input"
        value={paymentFilter}
        onChange={(e) => onPaymentFilterChange(e.target.value)}
      >
        <option value="all">All Payment</option>
        <option value="UNPAID">Unpaid</option>
        <option value="PARTIALLY_PAID">Partially Paid</option>
        <option value="PAID">Paid</option>
        <option value="OVERDUE">Overdue</option>
      </select>
    </div>
  )
}
