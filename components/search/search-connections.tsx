"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Search, MapPin, X, Loader2, UserPlus, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { sendConnectionRequest } from "@/lib/actions/connection-actions"
import Link from "next/link"
import Image from "next/image"
import { AdvancedFilters, type SearchFilters } from "./advanced-filters"

// Sample matched profiles
const matchedProfiles = [
  {
    id: "1",
    name: "Sophie",
    age: 26,
    location: "Manhattan, NY",
    distance: 3,
    image: "/match-profile-1.jpg",
    compatibility: 92,
    hobbies: ["Art", "Wine"],
    verified: true,
  },
  {
    id: "2",
    name: "Emma",
    age: 28,
    location: "Brooklyn, NY",
    distance: 5,
    image: "/match-profile-2.jpg",
    compatibility: 88,
    hobbies: ["Yoga", "Travel"],
    verified: true,
  },
  {
    id: "3",
    name: "Olivia",
    age: 25,
    location: "Queens, NY",
    distance: 8,
    image: "/match-profile-3.jpg",
    compatibility: 85,
    hobbies: ["Music", "Food"],
    verified: false,
  },
  {
    id: "4",
    name: "Ava",
    age: 29,
    location: "Bronx, NY",
    distance: 12,
    image: "/match-profile-4.jpg",
    compatibility: 82,
    hobbies: ["Fitness", "Reading"],
    verified: true,
  },
  {
    id: "5",
    name: "Isabella",
    age: 27,
    location: "Jersey City, NJ",
    distance: 6,
    image: "/match-profile-5.jpg",
    compatibility: 79,
    hobbies: ["Photography", "Coffee"],
    verified: true,
  },
  {
    id: "6",
    name: "Mia",
    age: 24,
    location: "Hoboken, NJ",
    distance: 7,
    image: "/match-profile-6.jpg",
    compatibility: 76,
    hobbies: ["Dancing", "Cooking"],
    verified: false,
  },
]

const hobbiesOptions = [
  "Art",
  "Music",
  "Travel",
  "Fitness",
  "Food",
  "Wine",
  "Photography",
  "Reading",
  "Yoga",
  "Dancing",
  "Cooking",
  "Coffee",
  "Movies",
  "Gaming",
  "Sports",
]

const lifestyleOptions = ["Non-smoker", "Social drinker", "Vegan", "Vegetarian", "Active lifestyle", "Homebody"]

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIME_SLOTS = ["Morning (8am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-9pm)", "Late Night (9pm-12am)"]

export function SearchConnections() {
  const { user, isGuest } = useAuth()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingTo, setSendingTo] = useState<string | null>(null)
  const [invitingTo, setInvitingTo] = useState<string | null>(null)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    ageMin: 18,
    ageMax: 65,
    gender: [],
    interests: [],
    distance: 25,
    postcode: "",
    sortBy: "distance",
    occupation: "",
  })
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase.from("profiles").select(`
      *,
      user_preferences (
        available_days,
        available_times
      )
    `)

    if (user?.id) {
      query = query.neq("id", user.id)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      console.error("[v0] Error loading profiles:", error)
    } else {
      console.log("[v0] Loaded profiles:", data?.length)
      setProfiles(data || [])
      applyFiltersToProfiles(data || [], filters)
    }

    setLoading(false)
  }

  const handleConnect = async (profileId: string) => {
    if (isGuest) {
      setShowSignInPrompt(true)
      return
    }
    if (!user) return

    setSendingTo(profileId)
    await sendConnectionRequest(user.id, profileId)
    setSendingTo(null)
  }

  const handleInviteOut = async (profileId: string) => {
    if (isGuest) {
      setShowSignInPrompt(true)
      return
    }
    if (!user) return

    setInvitingTo(profileId)
    // TODO: Open date invite modal or navigate to booking page
    console.log("[v0] Invite out:", profileId)
    setTimeout(() => setInvitingTo(null), 1000)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const applyFiltersToProfiles = (profilesList: any[], currentFilters: SearchFilters) => {
    console.log("[v0] Applying filters:", currentFilters)
    let results = profilesList.filter((profile) => {
      // Age filter
      if (profile.age && (profile.age < currentFilters.ageMin || profile.age > currentFilters.ageMax)) return false

      // Gender filter
      if (currentFilters.gender.length > 0 && !currentFilters.gender.includes(profile.gender)) return false

      // Occupation filter
      if (
        currentFilters.occupation &&
        profile.occupation &&
        !profile.occupation.toLowerCase().includes(currentFilters.occupation.toLowerCase())
      )
        return false

      // Interests filter
      if (currentFilters.interests.length > 0) {
        const hasMatchingInterest =
          profile.interests && profile.interests.some((interest: string) => currentFilters.interests.includes(interest))
        if (!hasMatchingInterest) return false
      }

      return true
    })

    // Distance filtering and calculation
    if (currentFilters.postcode && currentFilters.distance < 100) {
      // For now, we'll add a placeholder distance field
      // In production, you'd use a geocoding API to convert postcode to lat/lng
      results = results.map((profile) => {
        if (profile.latitude && profile.longitude) {
          // Placeholder: In real implementation, convert postcode to coordinates
          const userLat = 51.5074 // London coordinates as default
          const userLon = -0.1278
          const distance = calculateDistance(userLat, userLon, profile.latitude, profile.longitude)
          return { ...profile, calculatedDistance: distance }
        }
        return { ...profile, calculatedDistance: 999 }
      })

      results = results.filter((profile) => profile.calculatedDistance <= currentFilters.distance)
    }

    // Sorting
    if (currentFilters.sortBy === "distance") {
      results = results.sort((a, b) => (a.calculatedDistance || 999) - (b.calculatedDistance || 999))
    } else if (currentFilters.sortBy === "newest") {
      results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (currentFilters.sortBy === "activity") {
      results = results.sort(
        (a, b) => new Date(b.last_active || b.created_at).getTime() - new Date(a.last_active || a.created_at).getTime(),
      )
    }

    console.log("[v0] Filtered results:", results.length)
    setFilteredProfiles(results)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    console.log("[v0] Filters changed:", newFilters)
    setFilters(newFilters)
    applyFiltersToProfiles(profiles, newFilters)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#E91E8C] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Discover</h1>
            <AdvancedFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          {(filters.gender.length > 0 || filters.interests.length > 0 || filters.occupation || filters.postcode) && (
            <div className="flex gap-2 mt-3 px-4 overflow-x-auto pb-2">
              {filters.gender.length > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#E91E8C]/20 text-[#E91E8C] text-xs rounded-full whitespace-nowrap">
                  {filters.gender.join(", ")}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFiltersChange({ ...filters, gender: [] })}
                  />
                </span>
              )}
              {filters.interests.length > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#FF6B35]/20 text-[#FF6B35] text-xs rounded-full whitespace-nowrap">
                  {filters.interests.length} interest(s)
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFiltersChange({ ...filters, interests: [] })}
                  />
                </span>
              )}
              {filters.occupation && (
                <span className="flex items-center gap-1 px-3 py-1 bg-[#22C55E]/20 text-[#22C55E] text-xs rounded-full whitespace-nowrap">
                  {filters.occupation}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFiltersChange({ ...filters, occupation: "" })}
                  />
                </span>
              )}
              {filters.postcode && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full whitespace-nowrap">
                  {filters.distance === 100 ? "Unlimited" : `${filters.distance} miles`}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleFiltersChange({ ...filters, postcode: "", distance: 25 })}
                  />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-3 text-sm text-white/60">
        {filteredProfiles.length} {filteredProfiles.length === 1 ? "profile" : "profiles"} found
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#E91E8C]" />
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-lg font-semibold mb-2">No profiles found</p>
          <p className="text-sm text-white/60">Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4 pb-6">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
              <div className="relative aspect-[3/4]">
                <Image
                  src={profile.avatar_url || "/placeholder.svg?height=400&width=300"}
                  alt={profile.username || "User"}
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleConnect(profile.id)}
                      disabled={sendingTo === profile.id}
                      className="w-full bg-[#E91E8C] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#E91E8C]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {sendingTo === profile.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleInviteOut(profile.id)}
                      disabled={invitingTo === profile.id}
                      className="w-full bg-[#FF6B35] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {invitingTo === profile.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Heart className="w-4 h-4" />
                          Invite Out
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <div className="overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap">
                    <span className="font-semibold text-base">{profile.username || "Anonymous"}</span>
                    {profile.age && <span className="text-sm text-white/60 mx-2">·</span>}
                    {profile.age && <span className="text-sm text-white/60">{profile.age}</span>}
                    {profile.occupation && <span className="text-sm text-white/60 mx-2">·</span>}
                    {profile.occupation && <span className="text-sm text-white/60">{profile.occupation}</span>}
                  </div>
                </div>

                {profile.location && (
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{profile.location}</span>
                  </div>
                )}

                {profile.calculatedDistance && profile.calculatedDistance < 999 && (
                  <div className="text-xs text-white/40">{profile.calculatedDistance.toFixed(1)} miles away</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Sign in to connect</h3>
            <p className="text-white/60 text-sm mb-6">
              Create an account to send connection requests and start meeting new people.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/auth">
                <Button className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white">
                  Sign In or Create Account
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowSignInPrompt(false)}
                className="w-full bg-transparent border-white/20 text-white/60"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
