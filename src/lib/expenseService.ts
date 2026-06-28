import { supabase } from '@/lib/supabase'
import type { Expense, ExpenseInput } from '@/types/expense'

const TABLE = 'expenses'

type ExpenseRow = {
  id: string
  user_id: string
  trip_id?: string | null
  vehicle_id: string
  vehicle_number: string
  category: Expense['category']
  amount: number
  date: string
  remarks?: string | null
  created_at: string
}

function mapExpenseRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    user_id: row.user_id,
    vehicle_id: row.vehicle_id,
    vehicle_number: row.vehicle_number,
    category: row.category,
    amount: Number(row.amount ?? 0),
    date: row.date,
    remarks: row.remarks ?? undefined,
    created_at: row.created_at,
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('[expenseService] getUser error:', error)
    return null
  }

  return user?.id ?? null
}

export async function getExpenses(): Promise<Expense[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getExpenses] No authenticated user')
    return []
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Query error:', error)
    return []
  }

  return (data || []).map(mapExpenseRow)
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getExpenseById] No authenticated user')
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

  return data ? mapExpenseRow(data as ExpenseRow) : null
}

export async function createExpense(input: ExpenseInput): Promise<Expense | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[createExpense] No authenticated user')
    return null
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ...input, user_id: userId }])
    .select()
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  return data ? mapExpenseRow(data as ExpenseRow) : null
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<Expense | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[updateExpense] No authenticated user')
    return null
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Query error:', error)
    return null
  }

  return data ? mapExpenseRow(data as ExpenseRow) : null
}

export async function deleteExpense(id: string): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[deleteExpense] No authenticated user')
    return false
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('Query error:', error)
    return false
  }

  return true
}
