import type { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { count } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })

  res.status(200).json({ count: count || 0 })
}
