import { supabase } from '@/lib/supabase'

export type LedgerSummary = {
  totalTrips: number
  totalFreight: number
  totalExpenses: number
  netProfit: number
}

export type DriverLedgerSummary = {
  totalTrips: number
  totalAdvances: number
  totalEarnings: number
  pendingAmount: number
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('[ledger] getUser error:', error)
    return null
  }

  return user?.id ?? null
}

export async function getVehicleLedger(): Promise<Array<{ vehicle_id: string; vehicle_number: string; totalTrips: number; totalFreight: number; totalExpenses: number; netProfit: number }>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getVehicleLedger] No authenticated user')
    return []
  }

  const [{ data: trips, error: tripsError }, { data: expenses, error: expensesError }] = await Promise.all([
    supabase.from('trips').select('vehicle_id, vehicle_number, freight_amount').eq('user_id', userId),
    supabase.from('expenses').select('vehicle_id, vehicle_number, amount').eq('user_id', userId),
  ])

  if (tripsError) {
    console.error('Query error:', tripsError)
    return []
  }

  if (expensesError) {
    console.error('Query error:', expensesError)
    return []
  }

  if (trips?.length) {
    const grouped = new Map<string, { vehicle_id: string; vehicle_number: string; totalTrips: number; totalFreight: number; totalExpenses: number; netProfit: number }>()

    trips.forEach((trip) => {
      const key = trip.vehicle_id as string
      const current = grouped.get(key) ?? {
        vehicle_id: key,
        vehicle_number: (trip.vehicle_number as string) || 'Unknown',
        totalTrips: 0,
        totalFreight: 0,
        totalExpenses: 0,
        netProfit: 0,
      }
      current.totalTrips += 1
      current.totalFreight += Number(trip.freight_amount ?? 0)
      grouped.set(key, current)
    })

    expenses?.forEach((expense) => {
      const key = expense.vehicle_id as string
      const current = grouped.get(key) ?? {
        vehicle_id: key,
        vehicle_number: (expense.vehicle_number as string) || 'Unknown',
        totalTrips: 0,
        totalFreight: 0,
        totalExpenses: 0,
        netProfit: 0,
      }
      current.totalExpenses += Number(expense.amount ?? 0)
      current.netProfit = current.totalFreight - current.totalExpenses
      grouped.set(key, current)
    })

    return Array.from(grouped.values()).map((item) => ({ ...item, netProfit: item.totalFreight - item.totalExpenses }))
  }

  return []
}

export async function getDriverLedger(): Promise<Array<{ driver_id: string; driver_name: string; totalTrips: number; totalAdvances: number; totalEarnings: number; pendingAmount: number }>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getDriverLedger] No authenticated user')
    return []
  }

  const [{ data: trips, error: tripsError }, { data: expenses, error: expensesError }] = await Promise.all([
    supabase.from('trips').select('id, driver_id, driver_name, freight_amount, advance_paid').eq('user_id', userId),
    supabase.from('expenses').select('trip_id, amount').eq('user_id', userId),
  ])

  if (tripsError) {
    console.error('Query error:', tripsError)
    return []
  }

  if (expensesError) {
    console.error('Query error:', expensesError)
    return []
  }

  const grouped = new Map<string, { driver_id: string; driver_name: string; totalTrips: number; totalAdvances: number; totalEarnings: number; pendingAmount: number }>()

  trips?.forEach((trip) => {
    const key = trip.driver_id as string
    const current = grouped.get(key) ?? {
      driver_id: key,
      driver_name: (trip.driver_name as string) || 'Unknown',
      totalTrips: 0,
      totalAdvances: 0,
      totalEarnings: 0,
      pendingAmount: 0,
    }
    current.totalTrips += 1
    current.totalAdvances += Number(trip.advance_paid ?? 0)
    current.totalEarnings += Number(trip.freight_amount ?? 0)
    grouped.set(key, current)
  })

  expenses?.forEach((expense) => {
    if (!expense.trip_id) return
    const tripEntry = trips?.find((trip) => trip.id === expense.trip_id)
    if (!tripEntry) return
    const current = grouped.get(tripEntry.driver_id as string) ?? {
      driver_id: tripEntry.driver_id as string,
      driver_name: (tripEntry.driver_name as string) || 'Unknown',
      totalTrips: 0,
      totalAdvances: 0,
      totalEarnings: 0,
      pendingAmount: 0,
    }
    current.pendingAmount += Number(expense.amount ?? 0)
    grouped.set(current.driver_id, current)
  })

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    pendingAmount: item.totalEarnings - item.totalAdvances - item.pendingAmount,
  }))
}
