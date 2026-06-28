import { supabase } from '@/lib/supabase'
import { getAuthenticatedUserId } from '@/lib/auth'
import type { Trip, TripInput } from '@/types/trip'

const TABLE = 'trips'

type TripRow = {
  id: string
  user_id: string
  trip_number: string
  trip_date: string
  vehicle_id: string
  vehicle_number: string
  driver_id: string
  driver_name: string
  from_location: string
  to_location: string
  status: Trip['status']
  remarks?: string | null
  created_at: string
  updated_at: string
}

function mapTripRow(row: TripRow): Trip {
  return {
    id: row.id,
    user_id: row.user_id,
    trip_number: row.trip_number,
    trip_date: row.trip_date,
    vehicle_id: row.vehicle_id,
    vehicle_number: row.vehicle_number,
    driver_id: row.driver_id,
    driver_name: row.driver_name,
    from_location: row.from_location,
    to_location: row.to_location,
    status: row.status,
    remarks: row.remarks ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

async function getCurrentUserId(): Promise<string | null> {
  return getAuthenticatedUserId()
}

export async function getTrips(): Promise<Trip[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getTrips] No authenticated user')
    return []
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('trip_date', { ascending: false })

  if (error) {
    console.error('Query error:', error)
    return []
  }

  return (data || []).map(mapTripRow)
}

export async function getTripById(id: string): Promise<Trip | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getTripById] No authenticated user')
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

  return data ? mapTripRow(data as TripRow) : null
}

export async function createTrip(input: TripInput): Promise<Trip | null> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('Authentication required before creating a trip')
    }

    console.log('[tripService] Creating trip with input:', input)

    const tripNumber = `TRP${Date.now().toString().slice(-8)}`

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        ...input,
        user_id: userId,
        trip_number: tripNumber,
        origin: input.from_location,
        destination: input.to_location,
        start_date: input.trip_date,
      }])
      .select()
      .single()

    if (error) {
      console.error('[tripService] Trip creation error:', error)
      throw error
    }

    console.log('[tripService] Trip created successfully:', data)
    return data ? mapTripRow(data as TripRow) : null
  } catch (error) {
    console.error('[tripService] createTrip failed:', error)
    throw error instanceof Error ? error : new Error('Unable to create trip')
  }
}

export async function updateTrip(id: string, input: Partial<TripInput>): Promise<Trip | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[updateTrip] No authenticated user')
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

  return data ? mapTripRow(data as TripRow) : null
}

export async function deleteTrip(id: string): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[deleteTrip] No authenticated user')
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

export async function updateTripStatus(id: string, status: Trip['status']): Promise<Trip | null> {
  return updateTrip(id, { status })
}
