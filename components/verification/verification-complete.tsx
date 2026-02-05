"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function VerificationComplete() {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleNavigate = (path: string) => {
    console.log("[v0] VerificationComplete: navigating to", path)
    window.location.href = path
  }

  return (
    <div className="space-y-6 text-center py-4">
      {/* Success animation */}
      <div className="relative">
        <div className="w-24 h-24 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in-50 duration-500">
          <svg
            className="w-12 h-12 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  backgroundColor: ["#4ade80", "#60a5fa", "#E91E8C", "#fbbf24"][i % 4],
                  animationDelay: `${i * 100}ms`,
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-balance">Verification Complete!</h2>
        <p className="text-muted-foreground text-pretty">
          Your identity has been verified. You now have full access to all features.
        </p>
      </div>

      {/* What's unlocked */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-left">
        <p className="text-sm font-medium text-center">What's now unlocked:</p>
        <div className="grid gap-2">
          {[
            { icon: "👁️", label: "Browse verified profiles" },
            { icon: "💌", label: "Send connection invites" },
            { icon: "⭐", label: "Access premium features" },
            { icon: "🎯", label: "Get personalized recommendations" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={() => handleNavigate("/onboarding/mode")}
          size="lg"
          className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90"
        >
          Complete Your Profile
        </Button>
        <Button onClick={() => handleNavigate("/dashboard")} variant="outline" size="lg" className="w-full">
          Go to App
        </Button>
      </div>
    </div>
  )
}
