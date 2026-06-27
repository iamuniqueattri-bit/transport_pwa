import Link from 'next/link'

type BillingStatsCardProps = {
  label: string
  value: string | number
  href: string
}

export default function BillingStatsCard({ label, value, href }: BillingStatsCardProps) {
  return (
    <Link href={href} className="card block transition hover:shadow-lg active:scale-[0.98]">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </Link>
  )
}
