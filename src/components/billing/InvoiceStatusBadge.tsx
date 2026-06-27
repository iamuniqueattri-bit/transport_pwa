import type { InvoiceStatus } from '@/types/invoice'

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus
}

const statusStyles: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  FINALIZED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
