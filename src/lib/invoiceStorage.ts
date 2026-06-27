import { supabase } from '@/lib/supabase'
import type { Invoice, InvoiceListItem } from '@/types/invoice'

const TABLE = 'invoices'

type InvoiceRow = {
  id: string
  user_id: string
  invoice_no: string
  customer_id: string
  invoice_date: string
  invoice_type: Invoice['invoice_type']
  status: Invoice['status']
  revision_no: number
  gr_count: number
  subtotal: number
  gst_amount: number
  total_amount: number
  tax_type: Invoice['tax_type']
  remarks?: string | null
  created_at: string
  updated_at: string
}

type InvoiceListItemRow = InvoiceRow & {
  customer_name?: string
}

function mapInvoiceRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    invoice_no: row.invoice_no,
    customer_id: row.customer_id,
    invoice_date: row.invoice_date,
    invoice_type: row.invoice_type,
    status: row.status,
    revision_no: row.revision_no,
    gr_count: row.gr_count,
    subtotal: Number(row.subtotal ?? 0),
    gst_amount: Number(row.gst_amount ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    tax_type: row.tax_type,
    remarks: row.remarks ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function mapInvoiceListItemRow(row: InvoiceListItemRow): InvoiceListItem {
  return {
    ...mapInvoiceRow(row),
    customer_name: row.customer_name,
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('[invoiceStorage] getUser error:', error)
    return null
  }

  return user?.id ?? null
}

export async function getInvoices(): Promise<InvoiceListItem[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      customers(customer_name)
    `)
    .eq('user_id', userId)
    .order('invoice_date', { ascending: false })

  if (error) {
    console.error('Query error:', error)
    return []
  }

  return (data || []).map((row: any) => mapInvoiceListItemRow({
    ...row,
    customer_name: row.customers?.customer_name,
  }))
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  return data ? mapInvoiceRow(data as InvoiceRow) : null
}

export interface InvoiceStats {
  totalInvoices: number
  draftInvoices: number
  finalizedInvoices: number
  totalRevenue: number
}

export async function getInvoiceStats(): Promise<InvoiceStats> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      totalInvoices: 0,
      draftInvoices: 0,
      finalizedInvoices: 0,
      totalRevenue: 0,
    }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('status, total_amount')
    .eq('user_id', userId)

  if (error) {
    console.error('Query error:', error)
    return {
      totalInvoices: 0,
      draftInvoices: 0,
      finalizedInvoices: 0,
      totalRevenue: 0,
    }
  }

  const invoices = data || []
  const totalInvoices = invoices.length
  const draftInvoices = invoices.filter((inv: any) => inv.status === 'DRAFT').length
  const finalizedInvoices = invoices.filter((inv: any) => inv.status === 'FINALIZED').length
  const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + Number(inv.total_amount ?? 0), 0)

  return {
    totalInvoices,
    draftInvoices,
    finalizedInvoices,
    totalRevenue,
  }
}
