import { supabase } from "@/lib/supabase"
import { getAuthenticatedUserId } from "@/lib/auth"

export type Driver = {
  id: string
  name: string
  mobile: string
  licenseNumber: string
  licenseExpiry?: string | null
  address?: string | null
  emergencyContact?: string | null
  remarks?: string | null
  createdAt: string
}

type DriverRow = {
  id: string
  name: string
  mobile: string
  license_number: string
  license_expiry?: string | null
  address?: string | null
  emergency_contact?: string | null
  remarks?: string | null
  created_at: string
  user_id?: string | null
}

type DriverInput = Omit<Driver, "id" | "createdAt"> & {
  licenseExpiry?: string | null
  address?: string | null
  emergencyContact?: string | null
  remarks?: string | null
}

function mapDriverRow(row: DriverRow): Driver {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    licenseNumber: row.license_number,
    licenseExpiry: row.license_expiry ?? null,
    address: row.address ?? null,
    emergencyContact: row.emergency_contact ?? null,
    remarks: row.remarks ?? null,
    createdAt: row.created_at,
  }
}

function mapDriverInput(driver: DriverInput) {
  return {
    name: driver.name,
    mobile: driver.mobile,
    license_number: driver.licenseNumber,
    license_expiry: driver.licenseExpiry || null,
    address: driver.address || null,
    emergency_contact: driver.emergencyContact || null,
    remarks: driver.remarks || null,
  }
}

async function getCurrentUserId(): Promise<string | null> {
  return getAuthenticatedUserId()
}

function dispatchDriversUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("driversUpdated"))
  }
}

export async function getDrivers(): Promise<Driver[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getDrivers] No authenticated user')
    return []
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Query error:", error)
    return []
  }

  return (data || []).map(mapDriverRow)
}

export async function getDriverById(id: string): Promise<Driver | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[getDriverById] No authenticated user')
    return null
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (error) {
    console.error("Query error:", error)
    return null
  }

  return data ? mapDriverRow(data) : null
}

export async function createDriver(driver: DriverInput): Promise<Driver | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('Driver creation failed: No authenticated user')
    return null
  }

  console.log('Creating driver with input:', driver)

  const payload = {
    ...mapDriverInput(driver),
    user_id: userId,
  }

  const { data, error } = await supabase
    .from("drivers")
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error('Driver creation failed:', error)
    console.error('Error details:', { message: error.message, code: error.code, details: error.details })
    return null
  }

  console.log('Driver created successfully:', data)
  const result = data ? mapDriverRow(data) : null
  if (result) dispatchDriversUpdated()
  return result
}

export async function updateDriver(driver: Driver): Promise<Driver | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[updateDriver] No authenticated user')
    return null
  }

  const payload = mapDriverInput(driver)

  const { data, error } = await supabase
    .from("drivers")
    .update(payload)
    .eq("id", driver.id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Query error:", error)
    return null
  }

  const result = data ? mapDriverRow(data) : null
  if (result) dispatchDriversUpdated()
  return result
}

export async function deleteDriver(id: string): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) {
    console.error('[deleteDriver] No authenticated user')
    return false
  }

  const { error } = await supabase
    .from("drivers")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) {
    console.error("Query error:", error)
    return false
  }

  dispatchDriversUpdated()
  return true
}
