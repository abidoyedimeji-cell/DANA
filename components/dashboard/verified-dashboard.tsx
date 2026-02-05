"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { MatchCard } from "./match-card"
import { ProfileMenu } from "./profile-menu"

export function VerifiedDashboard() {
  const router = useRouter()
  const { logout } = useAuth()
  const [matches] = useState([
    {
      id: 1,
      name: "Sarah",
      age: 28,
      location: "New York, NY",
      bio: "Adventure enthusiast, love hiking and coffee",
      image: "/woman-portrait-1.png",
      verified: true,
    },
    {
      id: 2,
      name: "Emma",
      age: 26,
      location: "Brooklyn, NY",
      bio: "Artist and music lover",
      image: "/woman-portrait-2.png",
      verified: true,
    },
    {
      id: 3,
      name: "Jessica",
      age: 29,
      location: "Manhattan, NY",
      bio: "Foodie, startup enthusiast",
      image: "/woman-portrait-3.jpg",
      verified: true,
    },
  ])

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Browse Matches</h1>
            <p className="text-sm text-muted-foreground">All users are verified and authentic</p>
          </div>
          <ProfileMenu onLogout={handleLogout} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="invites">My Invites</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Discover Matches</CardTitle>
                <CardDescription>Verified profiles of people who match your interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Sent Invites</CardTitle>
                <CardDescription>Track the invites you've sent to other users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't sent any invites yet</p>
                  <Button onClick={() => document.querySelector('[value="browse"]')?.click()}>Browse Matches</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="premium" className="space-y-6">
            <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle>Premium Features</CardTitle>
                <CardDescription>Unlock exclusive features with a premium subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Advanced Filters</p>
                      <p className="text-sm text-muted-foreground">Filter by interests, hobbies, and more</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Unlimited Invites</p>
                      <p className="text-sm text-muted-foreground">Send as many invites as you want</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">See Who Likes You</p>
                      <p className="text-sm text-muted-foreground">Know who's interested before you invite</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4">Upgrade to Premium</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
