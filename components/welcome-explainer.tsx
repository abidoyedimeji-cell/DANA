"use client"

import { useState, useEffect } from "react"
import { Heart, MapPin, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const EXPLAINER_STORAGE_KEY = "dana_explainer_seen"

export function WelcomeExplainer() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(EXPLAINER_STORAGE_KEY)
      if (!seen) {
        setShow(true)
      }
    }
  }, [])

  const handleGetStarted = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(EXPLAINER_STORAGE_KEY, "true")
    }
    setShow(false)
    router.push("/auth")
  }

  const handleExplore = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(EXPLAINER_STORAGE_KEY, "true")
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to DANA</h2>
          <p className="text-white/70 text-base leading-relaxed">
            The next generation of meaningful connections through curated experiences
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#9333EA]/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#9333EA]" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Socialise and Network</h3>
              <p className="text-white/60 text-sm">
                <span className="text-white/80 font-medium">Who:</span> Find others with similar or different interests
                socially or professionally
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Discover Venues</h3>
              <p className="text-white/60 text-sm">
                <span className="text-white/80 font-medium">What:</span> Type of venues for real life connections
                include hospitality, sports, entertainment, food, wellness and coworking
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#E91E8C]/10 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#E91E8C]" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Complete Your Profile</h3>
              <p className="text-white/60 text-sm">
                <span className="text-white/80 font-medium">Where:</span> To share connections with similar or
                interesting individuals
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGetStarted}
            className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white font-semibold py-6 rounded-xl"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <button
            onClick={handleExplore}
            className="w-full text-white/60 hover:text-white text-sm font-medium py-2 transition-colors"
          >
            Explore as guest
          </button>
        </div>
      </div>
    </div>
  )
}
