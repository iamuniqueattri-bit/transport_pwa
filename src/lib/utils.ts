export const isBrowser = typeof window !== "undefined"

export function toSafeNumber(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0)
  return Number.isFinite(numericValue) ? numericValue : 0
}

export function formatCurrency(value: unknown): string {
  return `₹${toSafeNumber(value).toLocaleString("en-IN")}`
}

export function safeDate(value?: string | null): Date | null {
  if (!value) return null

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function formatDate(value?: string | null): string {
  const parsedDate = safeDate(value)
  return parsedDate ? parsedDate.toLocaleDateString("en-IN") : "Not set"
}

export function generateId(): string {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined

  if (cryptoObj && typeof (cryptoObj as { randomUUID?: unknown }).randomUUID === "function") {
    try {
      return (cryptoObj as { randomUUID: () => string }).randomUUID()
    } catch {
      // Fallback to safe string-based ID generation
    }
  }

  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}
