"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth, type ProfileMode } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const modes = [
  {
    id: "dating" as ProfileMode,
    title: "Dating",
    description: "Find romantic connections with verified singles in London",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    features: ["Browse dating profiles", "Send date invites", "Meet at partner venues"],
  },
  {
    id: "business" as ProfileMode,
    title: "Business",
    description: "Network with professionals and grow your career",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    features: ["Professional networking", "Job opportunities", "Mentorship connections"],
  },
  {
    id: "both" as ProfileMode,
    title: "Both",
    description: "Access dating and business features with separate profiles",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    features: ["All dating features", "All business features", "Toggle between modes"],
  },
]

export default function ModeSelectionPage() {
  const router = useRouter()
  const { setProfileMode } = useAuth()
  const [selectedMode, setSelectedMode] = useState<ProfileMode | null>(null)

  const handleContinue = () => {
    if (selectedMode) {
      setProfileMode(selectedMode)
      router.push("/app")
    }
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">How do you want to use Dana?</h1>
          <p className="text-muted-foreground">Choose your primary mode. You can change this anytime.</p>
        </div>

        <div className="space-y-4 mb-8">
          {modes.map((mode) => (
            <Card
              key={mode.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                selectedMode === mode.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              )}
              onClick={() => setSelectedMode(mode.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      selectedMode === mode.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {mode.title}
                      {selectedMode === mode.id && (
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                    </CardTitle>
                    <CardDescription>{mode.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleContinue} disabled={!selectedMode} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    </main>
  )
}
