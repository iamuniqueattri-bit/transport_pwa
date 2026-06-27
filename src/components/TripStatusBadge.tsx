type TripStatusBadgeProps = {
  status: string
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-700',
  Dispatched: 'bg-blue-100 text-blue-700',
  'In Transit': 'bg-orange-100 text-orange-700',
  Delivered: 'bg-green-100 text-green-700',
  Closed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function TripStatusBadge({ status }: TripStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
