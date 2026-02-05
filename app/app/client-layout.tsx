"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/navigation/bottom-nav"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-white/40 text-sm">Loading Dana...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-16">
      {children}
      <BottomNav />
    </div>
  )
}
