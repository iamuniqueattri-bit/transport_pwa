import { formatCurrency } from "@/lib/utils"

type InvoiceSummaryProps = {
  freightTotal: number
  taxType: "GST" | "RCM" | "EXEMPT"
}

export default function InvoiceSummary({ freightTotal, taxType }: InvoiceSummaryProps) {
  let gstRate = 0
  let taxLabel = "No Tax"

  switch (taxType) {
    case "GST":
      gstRate = 0.18
      taxLabel = "GST (18%)"
      break
    case "RCM":
      gstRate = 0.18
      taxLabel = "RCM (18%)"
      break
    case "EXEMPT":
      gstRate = 0
      taxLabel = "Exempt"
      break
  }

  const gstAmount = freightTotal * gstRate
  const totalAmount = freightTotal + gstAmount

  return (
    <div className="card space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Freight Total</span>
        <span className="font-semibold text-gray-900">{formatCurrency(freightTotal)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-600">{taxLabel}</span>
        <span className="font-semibold text-gray-900">{formatCurrency(gstAmount)}</span>
      </div>
      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
        <span className="font-semibold text-gray-900">Grand Total</span>
        <span className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  )
}
