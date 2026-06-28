import { supabase } from "@/lib/supabase"

export async function getAuthenticatedSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("[auth] getSession error:", error)
    return null
  }

  if (!session) {
    console.warn("[auth] No authenticated session")
    return null
  }

  return session
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getAuthenticatedSession()
  return session?.user?.id ?? null
}