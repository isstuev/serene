"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl bg-rose-50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-rose-700">Something went wrong.</p>
            <button
              className="mt-3 text-xs text-rose-500 underline underline-offset-2"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
