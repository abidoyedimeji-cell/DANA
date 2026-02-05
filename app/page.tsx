"use client"

import { useEffect, useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { WelcomeExplainer } from "@/components/welcome-explainer"
import { useRouter } from "next/navigation"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [showExplainer, setShowExplainer] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!showSplash && !showExplainer) {
      // Check if we should show explainer
      if (typeof window !== "undefined") {
        const seen = localStorage.getItem("dana_explainer_seen")
        if (!seen) {
          setShowExplainer(true)
        } else {
          router.push("/dashboard")
        }
      }
    }
  }, [showSplash, showExplainer, router])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (showExplainer) {
    return <WelcomeExplainer />
  }

  // Brief loading state while redirecting
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-[#E91E8C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </main>
  )
}
