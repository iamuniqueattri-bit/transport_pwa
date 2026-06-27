import type { PaymentStatus } from '@/types/invoice'

type PaymentStatusBadgeProps = {
  status: PaymentStatus
}

const statusStyles: Record<PaymentStatus, string> = {
  UNPAID: 'bg-gray-100 text-gray-700',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
