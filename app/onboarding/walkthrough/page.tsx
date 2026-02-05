"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WalkthroughSlide {
  id: number
  title: string
  description: string
  image: string
  action?: string
}

const slides: WalkthroughSlide[] = [
  {
    id: 1,
    title: "Welcome to Our App",
    description: "Connect with verified users and build meaningful relationships.",
    image: "/welcome-onboarding.jpg",
  },
  {
    id: 2,
    title: "Identity Verified",
    description: "Your identity has been verified. You can trust everyone on the platform.",
    image: "/verified-badge.jpg",
  },
  {
    id: 3,
    title: "Browse Matches",
    description: "Discover people who match your interests and preferences.",
    image: "/browse-matches.jpg",
    action: "Available after verification",
  },
  {
    id: 4,
    title: "Send Invites",
    description: "Connect with people you're interested in.",
    image: "/send-invites.jpg",
    action: "Available after verification",
  },
  {
    id: 5,
    title: "Premium Features",
    description: "Unlock advanced features to enhance your experience.",
    image: "/premium-features.jpg",
    action: "Available after verification",
  },
]

export default function WalkthroughPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const isLastSlide = currentSlide === slides.length - 1

  const handleNext = () => {
    if (isLastSlide) {
      // Check if user is verified
      const isVerified = localStorage.getItem("isVerified") === "true"
      router.push(isVerified ? "/dashboard" : "/dashboard/limited")
    } else {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }

  const slide = slides[currentSlide]

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-border">
          <CardHeader className="space-y-2">
            <CardTitle>{slide.title}</CardTitle>
            <CardDescription>{slide.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            </div>

            {slide.action && (
              <div className="p-3 bg-muted rounded-lg border border-border text-sm text-muted-foreground">
                {slide.action}
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? "bg-primary w-6" : "bg-muted w-2"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSlide === 0}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {isLastSlide ? "Get Started" : "Next"}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {currentSlide + 1} of {slides.length}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
