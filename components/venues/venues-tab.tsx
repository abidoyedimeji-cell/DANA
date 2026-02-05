"use client"

import { useState, useEffect } from "react"
import { MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VenuesTab() {
  const [filter, setFilter] = useState<"all" | "new" | "deals">("all")
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    try {
      const response = await fetch("/api/venues")
      if (!response.ok) {
        throw new Error("Failed to fetch venues")
      }
      const data = await response.json()
      setVenues(data)
    } catch (error) {
      console.error("[v0] Error loading venues:", error)
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  const filteredVenues = venues.filter((v) => {
    if (filter === "new") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return new Date(v.created_at) > thirtyDaysAgo
    }
    if (filter === "deals") return v.promo_text
    return true
  })

  if (loading) {
    return (
      <div className="px-4 py-4">
        <p className="text-white/60 text-center">Loading venues...</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          size="sm"
          onClick={() => setFilter("all")}
          className={`rounded-full ${
            filter === "all" ? "bg-[#FF6B35] text-white" : "bg-white/5 text-white/60 border border-white/10"
          }`}
        >
          All Venues
        </Button>
        <Button
          size="sm"
          onClick={() => setFilter("new")}
          className={`rounded-full ${
            filter === "new" ? "bg-[#FF6B35] text-white" : "bg-white/5 text-white/60 border border-white/10"
          }`}
        >
          Newly Added
        </Button>
        <Button
          size="sm"
          onClick={() => setFilter("deals")}
          className={`rounded-full ${
            filter === "deals" ? "bg-[#FF6B35] text-white" : "bg-white/5 text-white/60 border border-white/10"
          }`}
        >
          Deals & Offers
        </Button>
      </div>

      {/* Venue Cards - Postcard Style */}
      {filteredVenues.length === 0 ? (
        <p className="text-white/60 text-center py-8">No venues found</p>
      ) : (
        <div className="space-y-4">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF6B35]/50 transition-colors cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[16/9]">
                <img
                  src={venue.image_url || "/placeholder.svg?height=400&width=600"}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                {new Date(venue.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                  <div className="absolute top-3 left-3 bg-[#FBBF24] text-black px-3 py-1 rounded-full text-xs font-bold">
                    NEW
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg">{venue.name}</h3>
                  <p className="text-white/80 text-sm">{venue.category}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{venue.address || venue.city}</span>
                </div>

                <p className="text-white/80 text-sm">{venue.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                    <span className="text-white font-medium text-sm">{venue.rating}</span>
                  </div>
                  <Button size="sm" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white rounded-full">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
