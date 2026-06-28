export interface Expense {
  id: string
  user_id: string
  vehicle_id: string
  vehicle_number: string
  category: "Diesel" | "Toll" | "Repair" | "Tyre" | "Food" | "Advance" | "Misc"
  amount: number
  date: string
  remarks?: string | null
  created_at: string
}

export type ExpenseInput = Omit<Expense, "id" | "user_id" | "created_at">
