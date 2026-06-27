"use client"

import React from "react"

type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="card space-y-2 border-red-200 bg-red-50 text-red-700">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm">The screen could not be loaded. Please refresh and try again.</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
