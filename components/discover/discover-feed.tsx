"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

// Sample profiles for demo
const sampleProfiles = [
  {
    id: "1",
    name: "Sophie",
    age: 28,
    location: "Shoreditch",
    bio: "Creative director by day, foodie by night. Looking for someone to explore London's hidden gems with.",
    industry: "Marketing",
    jobTitle: "Creative Director",
    interests: ["Art", "Food", "Travel"],
    image: "/professional-woman-smiling.png",
    verified: true,
  },
  {
    id: "2",
    name: "James",
    age: 32,
    location: "Canary Wharf",
    bio: "Finance professional who loves weekend hikes and trying new restaurants. Let's grab coffee!",
    industry: "Finance",
    jobTitle: "Investment Analyst",
    interests: ["Hiking", "Wine", "Tech"],
    image: "/professional-man-business-casual-portrait.jpg",
    verified: true,
  },
  {
    id: "3",
    name: "Emma",
    age: 26,
    location: "Notting Hill",
    bio: "Startup founder passionate about sustainability. Looking to connect with like-minded professionals.",
    industry: "Technology",
    jobTitle: "CEO & Founder",
    interests: ["Sustainability", "Yoga", "Reading"],
    image: "/young-professional-woman-entrepreneur-portrait.jpg",
    verified: true,
  },
]

export function DiscoverFeed() {
  const { profileMode } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)

  const currentProfile = sampleProfiles[currentIndex]
  const isDating = profileMode === "dating" || profileMode === "both"

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleProfiles.length)
      setDirection(null)
    }, 300)
  }

  if (!currentProfile) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No more profiles to show</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Card
        className={`overflow-hidden transition-transform duration-300 ${
          direction === "left" ? "-translate-x-full opacity-0" : ""
        } ${direction === "right" ? "translate-x-full opacity-0" : ""}`}
      >
        <div className="relative aspect-[3/4] bg-muted">
          <img
            src={currentProfile.image || "/placeholder.svg"}
            alt={currentProfile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">
                {currentProfile.name}, {currentProfile.age}
              </h2>
              {currentProfile.verified && (
                <Badge className="bg-accent text-accent-foreground border-0">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/80 flex items-center gap-1 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              {currentProfile.location}
            </p>
            {!isDating && (
              <p className="text-sm text-white/80 mb-2">
                {currentProfile.jobTitle} at {currentProfile.industry}
              </p>
            )}
            <p className="text-sm text-white/90 line-clamp-2">{currentProfile.bio}</p>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Interests/Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentProfile.interests.map((interest, idx) => (
              <Badge key={idx} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              onClick={() => handleSwipe("left")}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>

            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => handleSwipe("right")}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Tap the calendar to invite {currentProfile.name} to a meet-up
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
