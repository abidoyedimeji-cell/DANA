"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerified?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = "/auth" }: ProtectedRouteProps) {
  const router = useRouter()
  const { userId, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Redirect if not authenticated
    if (!userId) {
      router.push(redirectTo)
      return
    }
  }, [userId, isLoading, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render children if authenticated
  if (!userId) {
    return null
  }

  return <>{children}</>
}
