"use client"

import { useState, useEffect } from "react"
import { SignupForm } from "@/components/auth/signup-form"
import { LoginForm } from "@/components/auth/login-form"
import { X, Users, Heart, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/app")
    }
  }, [user, isLoading, router])

  const handleClose = () => {
    router.push("/")
  }

  if (isLoading) {
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

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center">
        {/* Left side: Explanation */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6 px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to DANA</h1>
            <p className="text-white/70 text-lg leading-relaxed">
              The next generation of meaningful connections through curated experiences
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-[#E91E8C]/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-[#E91E8C]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Complete Your Profile</h3>
                <p className="text-white/60 text-sm">
                  Take our quiz to find compatible matches based on your interests
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-[#9333EA]/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#9333EA]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Connect & Match</h3>
                <p className="text-white/60 text-sm">See compatibility scores and send date requests to your matches</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Discover Venues</h3>
                <p className="text-white/60 text-sm">
                  Get exclusive deals at top restaurants, bars, spas, and activities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Auth forms */}
        <div className="w-full lg:w-1/2 max-w-md">
          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggle={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </main>
  )
}
