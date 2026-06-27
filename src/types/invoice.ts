export type InvoiceStatus =
  | 'DRAFT'
  | 'FINALIZED'
  | 'CANCELLED'

export type InvoiceType =
  | 'DRAFT'
  | 'FINAL'
  | 'PROVISIONAL'

export type TaxType =
  | 'GST'
  | 'RCM'
  | 'EXEMPT'

export interface Invoice {
  id: string
  invoice_no: string
  customer_id: string
  invoice_date: string
  invoice_type: InvoiceType
  status: InvoiceStatus
  revision_no: number
  gr_count: number
  subtotal: number
  gst_amount: number
  total_amount: number
  tax_type: TaxType
  remarks?: string
  created_at: string
  updated_at: string
}

export interface InvoiceListItem extends Invoice {
  customer_name?: string
}
