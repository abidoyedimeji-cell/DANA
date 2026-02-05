"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const profiles = [
  { id: "1", name: "Sophie", age: 28, image: "/professional-woman-smiling.png", verified: true, online: true },
  {
    id: "2",
    name: "Emma",
    age: 26,
    image: "/young-professional-woman-entrepreneur-portrait.jpg",
    verified: true,
    online: false,
  },
  { id: "3", name: "Jessica", age: 30, image: "/elegant-woman-portrait-dark-hair.jpg", verified: true, online: true },
  { id: "4", name: "Olivia", age: 27, image: "/professional-woman-smiling-blonde.jpg", verified: true, online: false },
  { id: "5", name: "Ava", age: 29, image: "/fashionable-woman-portrait.png", verified: true, online: true },
  { id: "6", name: "Isabella", age: 25, image: "/young-professional-woman.png", verified: true, online: false },
  { id: "7", name: "Mia", age: 31, image: "/stylish-woman-portrait.png", verified: true, online: true },
  { id: "8", name: "Charlotte", age: 28, image: "/business-woman-portrait-confident.jpg", verified: true, online: false },
  { id: "9", name: "Amelia", age: 26, image: "/casual-woman-portrait-smile.jpg", verified: true, online: true },
  { id: "10", name: "Harper", age: 29, image: "/elegant-woman-portrait-evening.jpg", verified: false, online: false },
  { id: "11", name: "Luna", age: 27, image: "/creative-woman-portrait-artistic.jpg", verified: true, online: true },
  { id: "12", name: "Chloe", age: 30, image: "/placeholder.svg?height=200&width=150", verified: true, online: false },
]

export function DiscoverGrid() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-foreground uppercase tracking-wide">FIND THE PERFECT DATE</h1>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <Input
          placeholder="Search by name or interests..."
          className="pl-10 bg-card border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-4 gap-1.5">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className={cn(
              "relative aspect-[3/4] rounded-lg overflow-hidden transition-all",
              selectedProfile === profile.id && "ring-2 ring-primary scale-105 z-10",
            )}
            onClick={() => setSelectedProfile(profile.id === selectedProfile ? null : profile.id)}
          >
            <img src={profile.image || "/placeholder.svg"} alt={profile.name} className="w-full h-full object-cover" />
            {/* Online indicator */}
            {profile.online && (
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            )}
            {/* Verified badge */}
            {profile.verified && (
              <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
            )}
            {/* Name overlay on hover/select */}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 transition-opacity",
                selectedProfile === profile.id ? "opacity-100" : "opacity-0",
              )}
            >
              <p className="text-xs font-medium text-white truncate">
                {profile.name}, {profile.age}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Profile Actions */}
      {selectedProfile && (
        <div className="fixed inset-x-4 bottom-20 z-40 bg-card border border-border rounded-xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <img
              src={profiles.find((p) => p.id === selectedProfile)?.image || "/placeholder.svg"}
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {profiles.find((p) => p.id === selectedProfile)?.name},{" "}
                {profiles.find((p) => p.id === selectedProfile)?.age}
              </h3>
              <p className="text-sm text-muted-foreground">London</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedProfile(null)}>
              View Profile
            </Button>
            <Button className="flex-1 bg-primary">Invite Her</Button>
          </div>
        </div>
      )}
    </div>
  )
}
