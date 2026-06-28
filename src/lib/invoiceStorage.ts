import { supabase } from '@/lib/supabase'
import { getAuthenticatedUserId } from '@/lib/auth'
import type { Invoice, InvoiceListItem } from '@/types/invoice'

const TABLE = 'invoices'

type InvoiceRow = {
  id: string
  user_id: string
  invoice_no: string
  customer_id: string
  invoice_date: string
  due_date?: string | null
  invoice_type: Invoice['invoice_type']
  status: Invoice['status']
  payment_status?: Invoice['payment_status']
  revision_no: number
  gr_count: number
  subtotal: number
  gst_amount: number
  total_amount: number
  paid_amount?: number | null
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
    due_date: row.due_date ?? undefined,
    invoice_type: row.invoice_type,
    status: row.status,
    payment_status: row.payment_status ?? undefined,
    revision_no: row.revision_no,
    gr_count: row.gr_count,
    subtotal: Number(row.subtotal ?? 0),
    gst_amount: Number(row.gst_amount ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    paid_amount: row.paid_amount ?? undefined,
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
  return getAuthenticatedUserId()
}

export async function getInvoices(): Promise<InvoiceListItem[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getInvoices] No authenticated user')
    return []
  }

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
  if (!userId) {
    console.error('[getInvoiceById] No authenticated user')
    return null
  }

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
    console.error('[getInvoiceStats] No authenticated user')
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

export async function generateInvoiceNumber(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[generateInvoiceNumber] No authenticated user')
    const timestamp = Date.now()
    return `INV-${timestamp}`
  }

  const year = new Date().getFullYear()
  const { data, error } = await supabase
    .from(TABLE)
    .select('invoice_no')
    .eq('user_id', userId)
    .like('invoice_no', `INV-${year}-%`)
    .order('invoice_no', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return `INV-${year}-001`
  }

  const lastInvoiceNo = data[0].invoice_no as string
  const lastNumber = parseInt(lastInvoiceNo.split('-').pop() || '0')
  const nextNumber = String(lastNumber + 1).padStart(3, '0')
  return `INV-${year}-${nextNumber}`
}

export async function getInvoicesByCustomer(customerId: string): Promise<InvoiceListItem[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getInvoicesByCustomer] No authenticated user')
    return []
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      customers(customer_name)
    `)
    .eq('user_id', userId)
    .eq('customer_id', customerId)
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

export interface InvoiceTotals {
  subtotal: number
  gstAmount: number
  totalAmount: number
}

export function calculateInvoiceTotals(
  freightTotal: number,
  taxType: Invoice['tax_type']
): InvoiceTotals {
  let gstRate = 0

  switch (taxType) {
    case 'GST':
      gstRate = 0.18
      break
    case 'RCM':
      gstRate = 0.18
      break
    case 'EXEMPT':
      gstRate = 0
      break
    default:
      gstRate = 0
  }

  const gstAmount = freightTotal * gstRate
  const totalAmount = freightTotal + gstAmount

  return {
    subtotal: freightTotal,
    gstAmount,
    totalAmount,
  }
}

export interface InvoiceInput {
  customer_id: string
  invoice_date: string
  due_date?: string
  invoice_type: Invoice['invoice_type']
  tax_type: Invoice['tax_type']
  remarks?: string
  gr_ids: string[]
}

export async function saveDraftInvoice(input: InvoiceInput): Promise<Invoice | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[saveDraftInvoice] No authenticated user')
    return null
  }

  const invoiceNo = await generateInvoiceNumber()

  const { data: grData, error: grError } = await supabase
    .from('trips')
    .select('id, freight_amount')
    .in('id', input.gr_ids)

  if (grError || !grData) {
    console.error('Error fetching GRs:', grError)
    return null
  }

  const freightTotal = grData.reduce((sum: number, gr: any) => sum + Number(gr.freight_amount ?? 0), 0)
  const totals = calculateInvoiceTotals(freightTotal, input.tax_type)

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      user_id: userId,
      invoice_no: invoiceNo,
      customer_id: input.customer_id,
      invoice_date: input.invoice_date,
      due_date: input.due_date || null,
      invoice_type: input.invoice_type,
      status: 'DRAFT',
      payment_status: 'UNPAID',
      revision_no: 0,
      gr_count: input.gr_ids.length,
      subtotal: totals.subtotal,
      gst_amount: totals.gstAmount,
      total_amount: totals.totalAmount,
      paid_amount: 0,
      tax_type: input.tax_type,
      remarks: input.remarks,
    }])
    .select()
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  const invoice = data ? mapInvoiceRow(data as InvoiceRow) : null

  if (invoice) {
    const { error: linkError } = await supabase
      .from('invoice_items')
      .insert(input.gr_ids.map((grId: string) => ({
        invoice_id: invoice.id,
        trip_id: grId,
      })))

    if (linkError) {
      console.error('Error linking GRs to invoice:', linkError)
    }
  }

  return invoice
}

export async function finalizeInvoice(invoiceId: string): Promise<Invoice | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[finalizeInvoice] No authenticated user')
    return null
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: 'FINALIZED' })
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  return data ? mapInvoiceRow(data as InvoiceRow) : null
}

export async function updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<Invoice | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[updateInvoiceStatus] No authenticated user')
    return null
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({ status })
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  return data ? mapInvoiceRow(data as InvoiceRow) : null
}

export async function markInvoicePaid(invoiceId: string, amount: number): Promise<Invoice | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[markInvoicePaid] No authenticated user')
    return null
  }

  const invoice = await getInvoiceById(invoiceId)
  if (!invoice) return null

  const currentPaid = invoice.paid_amount || 0
  const newPaid = currentPaid + amount
  const total = invoice.total_amount

  let paymentStatus: Invoice['payment_status'] = 'UNPAID'
  if (newPaid >= total) {
    paymentStatus = 'PAID'
  } else if (newPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID'
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      paid_amount: newPaid,
      payment_status: paymentStatus,
    })
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  return data ? mapInvoiceRow(data as InvoiceRow) : null
}

export async function duplicateInvoice(invoiceId: string): Promise<Invoice | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[duplicateInvoice] No authenticated user')
    return null
  }

  const originalInvoice = await getInvoiceById(invoiceId)
  if (!originalInvoice) return null

  const { data: itemsData, error: itemsError } = await supabase
    .from('invoice_items')
    .select('trip_id')
    .eq('invoice_id', invoiceId)

  if (itemsError || !itemsData) {
    console.error('Error fetching invoice items:', itemsError)
    return null
  }

  const tripIds = itemsData.map((item: any) => item.trip_id)

  const newInvoiceNo = await generateInvoiceNumber()

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      user_id: userId,
      invoice_no: newInvoiceNo,
      customer_id: originalInvoice.customer_id,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: originalInvoice.due_date || null,
      invoice_type: 'DRAFT',
      status: 'DRAFT',
      payment_status: 'UNPAID',
      revision_no: 0,
      gr_count: originalInvoice.gr_count,
      subtotal: originalInvoice.subtotal,
      gst_amount: originalInvoice.gst_amount,
      total_amount: originalInvoice.total_amount,
      paid_amount: 0,
      tax_type: originalInvoice.tax_type,
      remarks: originalInvoice.remarks || null,
    }])
    .select()
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  const newInvoice = data ? mapInvoiceRow(data as InvoiceRow) : null

  if (newInvoice && tripIds.length > 0) {
    const { error: linkError } = await supabase
      .from('invoice_items')
      .insert(tripIds.map((tripId: string) => ({
        invoice_id: newInvoice.id,
        trip_id: tripId,
      })))

    if (linkError) {
      console.error('Error linking GRs to invoice:', linkError)
    }
  }

  return newInvoice
}
