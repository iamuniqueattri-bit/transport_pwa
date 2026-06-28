export interface Trip {
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
  status: "Created" | "Dispatched" | "In Transit" | "Delivered" | "Closed"
  remarks?: string
  created_at: string
  updated_at: string
}

export type TripInput = Omit<Trip, "id" | "user_id" | "created_at" | "updated_at">
