"use client"

import type React from "react"

interface FeatureGuardProps {
  children: React.ReactNode
  featureName?: string
  lockedMessage?: string
}

export function FeatureGuard({ children }: FeatureGuardProps) {
  return <>{children}</>
}
