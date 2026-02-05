"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Match {
  id: number
  name: string
  age: number
  location: string
  bio: string
  image: string
  verified: boolean
}

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <Card className="border-border overflow-hidden hover:border-primary/50 transition-colors">
      <CardContent className="p-0 space-y-4">
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={match.image || "/placeholder.svg"}
            alt={match.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {match.verified && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              Verified
            </div>
          )}
        </div>

        <div className="px-4 pb-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg">
              {match.name}, {match.age}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              {match.location}
            </p>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{match.bio}</p>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 bg-transparent">
              Pass
            </Button>
            <Button className="flex-1">Invite</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
