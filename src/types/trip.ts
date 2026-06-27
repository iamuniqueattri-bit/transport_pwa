export interface Trip {
  id: string
  user_id: string
  gr_id: string
  gr_number: string
  customer_id: string
  customer_name: string
  vehicle_id: string
  vehicle_number: string
  driver_id: string
  driver_name: string
  origin: string
  destination: string
  start_date: string
  expected_delivery_date: string
  actual_delivery_date?: string
  freight_amount: number
  advance_paid: number
  status: "Pending" | "Dispatched" | "In Transit" | "Delivered" | "Closed" | "Cancelled"
  remarks?: string
  created_at: string
  updated_at: string
}

export type TripInput = Omit<Trip, "id" | "user_id" | "created_at" | "updated_at">
