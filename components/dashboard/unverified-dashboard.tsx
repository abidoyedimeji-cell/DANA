"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ProfileMenu } from "./profile-menu"

export function UnverifiedDashboard() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const availableFeatures = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      title: "Complete Profile",
      description: "Add photos, bio, and preferences",
      action: () => router.push("/onboarding/profile"),
      buttonText: "Edit Profile",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: "App Guide",
      description: "Learn how the platform works",
      action: () => router.push("/onboarding/walkthrough"),
      buttonText: "View Guide",
    },
  ]

  const lockedFeatures = [
    { icon: "👁️", title: "Browse Matches", description: "View verified profiles" },
    { icon: "💌", title: "Send Invites", description: "Connect with people" },
    { icon: "⭐", title: "Premium Features", description: "Advanced filters and more" },
    { icon: "🎯", title: "Recommendations", description: "Personalized suggestions" },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Verification pending</p>
          </div>
          <ProfileMenu onLogout={handleLogout} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Verification CTA */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold">Complete Identity Verification</h2>
                <p className="text-sm text-muted-foreground">
                  Verify your identity to unlock browsing, invites, and all premium features.
                </p>
              </div>
              <Button onClick={() => router.push("/onboarding/verify")} size="lg">
                Verify Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableFeatures.map((feature) => (
              <Card key={feature.title} className="border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    {feature.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <Button size="sm" variant="outline" onClick={feature.action} className="mt-2 bg-transparent">
                      {feature.buttonText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Locked Features */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Unlocks After Verification</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lockedFeatures.map((feature) => (
              <Card key={feature.title} className="border-muted bg-muted/20">
                <CardContent className="p-4 text-center space-y-2 opacity-60">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <svg className="w-4 h-4 mx-auto text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">How long does verification take?</p>
              <p className="text-muted-foreground">Most verifications complete within 1-2 hours.</p>
            </div>
            <div>
              <p className="font-medium">Why is identity verification required?</p>
              <p className="text-muted-foreground">
                We verify every user to ensure safety and authenticity on the platform.
              </p>
            </div>
            <div>
              <p className="font-medium">Is my data secure?</p>
              <p className="text-muted-foreground">
                Yes, all documents are encrypted and processed securely. Biometric data is only used for verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
