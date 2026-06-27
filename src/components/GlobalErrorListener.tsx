"use client"

import { useEffect } from "react"

export default function GlobalErrorListener() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error ?? event.message)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise:", event.reason)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return null
}
