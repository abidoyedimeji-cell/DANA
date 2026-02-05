"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
}

const SPLASH_STORAGE_KEY = "dana_splash_seen"
const SPLASH_EXPIRY_MS = 25 * 60 * 1000 // 25 minutes

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"brand" | "venue1" | "venue2" | "venue3" | "done">("brand")
  const [showSkip, setShowSkip] = useState(false)
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastSeen = localStorage.getItem(SPLASH_STORAGE_KEY)
      if (lastSeen) {
        const timeSince = Date.now() - Number.parseInt(lastSeen)
        if (timeSince < SPLASH_EXPIRY_MS) {
          setShouldShow(false)
          onComplete()
          return
        }
      }
    }
  }, [onComplete])

  useEffect(() => {
    if (!shouldShow) return

    const skipTimer = setTimeout(() => {
      setShowSkip(true)
    }, 7000)

    const timer1 = setTimeout(() => {
      setPhase("venue1")
    }, 3000)

    const timer2 = setTimeout(() => {
      setPhase("venue2")
    }, 5000)

    const timer3 = setTimeout(() => {
      setPhase("venue3")
    }, 7000)

    const timer4 = setTimeout(() => {
      setPhase("done")
      if (typeof window !== "undefined") {
        localStorage.setItem(SPLASH_STORAGE_KEY, Date.now().toString())
      }
      setTimeout(() => onComplete(), 300)
    }, 9000)

    return () => {
      clearTimeout(skipTimer)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete, shouldShow])

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SPLASH_STORAGE_KEY, Date.now().toString())
    }
    onComplete()
  }

  if (!shouldShow) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {showSkip && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-20 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-all"
        >
          Skip
        </button>
      )}

      <div
        className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ${
          phase === "brand" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-2">DANA</h1>
        <p className="text-white/80 text-sm text-center px-8 whitespace-nowrap">
          The next generation of human connections
        </p>
      </div>

      {/* Phase 2: Arcade Venue */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2000ms] ${
          phase === "venue1" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <img
          src="/colorful-arcade-gaming-space-neon-lights-retro-gam.jpg"
          alt="Arcade venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute bottom-[35%] left-0 right-0 flex justify-center px-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 max-w-[280px] w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#9333EA] text-white text-xs font-bold px-2 py-0.5 rounded-full">FEATURED</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Four Quarters Arcade</h3>
            <p className="text-xs text-gray-600 mb-2">Retro arcade bar • Fun dates</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Free entry</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-xs font-semibold">4.7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 3: Restaurant Venue */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2000ms] ${
          phase === "venue2" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <img
          src="/elegant-restaurant-interior-dining-ambient-lightin.jpg"
          alt="Restaurant venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute bottom-[35%] left-0 right-0 flex justify-center px-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 max-w-[280px] w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FF6B35] text-white text-xs font-bold px-2 py-0.5 rounded-full">POPULAR</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">The Ivy Chelsea</h3>
            <p className="text-xs text-gray-600 mb-2">Elegant dining • Romantic evenings</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">From £45pp</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-xs font-semibold">4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 4: Spa Venue */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2000ms] ${
          phase === "venue3" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <img
          src="/luxurious-spa-wellness-center-tranquil-atmosphere-s.jpg"
          alt="Spa venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute bottom-[35%] left-0 right-0 flex justify-center px-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 max-w-[280px] w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#E91E8C] text-white text-xs font-bold px-2 py-0.5 rounded-full">WELLNESS</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">ESPA Life</h3>
            <p className="text-xs text-gray-600 mb-2">Luxury spa • Couples treatments</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">From £280</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-xs font-semibold">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {["brand", "venue1", "venue2", "venue3"].map((p) => (
          <div
            key={p}
            className={`h-1 rounded-full transition-all duration-300 ${
              phase === p ? "bg-white w-8" : "bg-white/30 w-1"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
