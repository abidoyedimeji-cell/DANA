"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const venues = [
  {
    id: "1",
    name: "The Blue Lounge",
    type: "Cocktail Bar",
    cuisine: "Cocktails & Small Plates",
    location: "Shoreditch",
    rating: 4.8,
    reviews: 342,
    priceRange: "££",
    description: "Intimate cocktail bar with speakeasy vibes, perfect for first dates.",
    features: ["Cocktails", "Live Jazz", "Quiet Tables"],
    image: "/elegant-cocktail-bar-lounge.jpg",
    promo: "20% OFF",
    promoText: "SPECIAL OFFER",
    sponsored: false,
    nextAvailable: "Today 7:00 PM",
    bookedToday: 24,
  },
  {
    id: "2",
    name: "Ember & Oak",
    type: "Fine Dining",
    cuisine: "Modern British",
    location: "Mayfair",
    rating: 4.9,
    reviews: 567,
    priceRange: "£££",
    description: "Modern British cuisine in an elegant setting. Ideal for business dinners.",
    features: ["Fine Dining", "Private Rooms", "Wine List"],
    image: "/modern-fine-dining-restaurant.jpg",
    promo: null,
    sponsored: true,
    nextAvailable: "Tomorrow 12:30 PM",
    bookedToday: 48,
  },
  {
    id: "3",
    name: "Café Botanica",
    type: "Café",
    cuisine: "Brunch & Coffee",
    location: "Notting Hill",
    rating: 4.6,
    reviews: 234,
    priceRange: "£",
    description: "Charming garden café with excellent coffee and brunch options.",
    features: ["Brunch", "Outdoor Seating", "Pet Friendly"],
    image: "/charming-garden-cafe-patio.jpg",
    promo: "Free pastry",
    promoText: "MEMBER PERK",
    sponsored: false,
    nextAvailable: "Today 10:00 AM",
    bookedToday: 12,
  },
  {
    id: "4",
    name: "The Rooftop",
    type: "Bar & Restaurant",
    cuisine: "International",
    location: "Canary Wharf",
    rating: 4.7,
    reviews: 445,
    priceRange: "££",
    description: "Stunning city views with contemporary dining and cocktails.",
    features: ["Rooftop", "City Views", "Cocktails"],
    image: "/rooftop-bar-city-skyline-view.jpg",
    promo: null,
    sponsored: false,
    nextAvailable: "Today 8:30 PM",
    bookedToday: 36,
  },
]

const categories = ["All", "Restaurant", "Bar", "Café", "Activities"]

export function SpotsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || venue.type.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground uppercase tracking-wide">FIND THE PERFECT SPOT</h1>
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
      <div className="relative">
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
          placeholder="Location, Restaurant, or Cuisine"
          className="pl-10 bg-card border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-shrink-0 rounded-full",
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-transparent border-border text-foreground hover:bg-card",
            )}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Featured Promo Banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#FF6B35] to-[#FF8F00]">
        <div className="px-4 py-3">
          <p className="text-xs font-bold text-white/90 uppercase tracking-wider">SPECIAL OFFER</p>
          <p className="text-2xl font-bold text-white">20% OFF</p>
          <p className="text-xs text-white/80">For Dana members this week</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/20 to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredVenues.map((venue) => (
          <Card
            key={venue.id}
            className={cn(
              "overflow-hidden border-border bg-card cursor-pointer transition-all hover:border-primary",
              selectedVenue === venue.id && "ring-2 ring-primary",
            )}
            onClick={() => setSelectedVenue(venue.id === selectedVenue ? null : venue.id)}
          >
            <div className="relative aspect-[4/3]">
              <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-full object-cover" />
              {venue.promo && (
                <Badge className="absolute top-2 left-2 bg-[#FF6B35] text-white border-0 text-[10px] px-1.5">
                  {venue.promoText || "OFFER"} {venue.promo}
                </Badge>
              )}
              {venue.sponsored && (
                <Badge className="absolute top-2 right-2 bg-dana-yellow text-black border-0 text-[10px] px-1.5">
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm text-foreground line-clamp-1">{venue.name}</h3>
              <p className="text-xs text-muted-foreground">{venue.cuisine}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center gap-0.5">
                  <svg className="w-3 h-3 text-[#FF6B35] fill-[#FF6B35]" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-medium text-foreground">{venue.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({venue.reviews})</span>
                <span className="text-xs text-muted-foreground ml-auto">{venue.priceRange}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {venue.location}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Venue Detail - OpenTable Style */}
      {selectedVenue && (
        <VenueBookingSheet venue={venues.find((v) => v.id === selectedVenue)!} onClose={() => setSelectedVenue(null)} />
      )}

      {filteredVenues.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No venues found matching your search</p>
        </div>
      )}
    </div>
  )
}

function VenueBookingSheet({ venue, onClose }: { venue: (typeof venues)[0]; onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [partySize, setPartySize] = useState(2)

  const dates = [
    { label: "Today", date: "Jan 1" },
    { label: "Tomorrow", date: "Jan 2" },
    { label: "Fri", date: "Jan 3" },
    { label: "Sat", date: "Jan 4" },
    { label: "Sun", date: "Jan 5" },
  ]

  const times = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM"]

  return (
    <Card className="fixed inset-x-4 bottom-20 z-40 bg-card border-border shadow-2xl rounded-t-2xl max-h-[60vh] overflow-y-auto">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{venue.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <svg className="w-4 h-4 text-[#FF6B35] fill-[#FF6B35]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-medium text-foreground">{venue.rating}</span>
              </div>
              <span>({venue.reviews} reviews)</span>
              <span>·</span>
              <span>{venue.cuisine}</span>
              <span>·</span>
              <span>{venue.priceRange}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Booked Today Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Booked {venue.bookedToday} times today
          </Badge>
        </div>

        {/* Party Size */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Party Size</label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setPartySize(Math.max(1, partySize - 1))}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </Button>
            <span className="text-lg font-semibold w-12 text-center">{partySize}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setPartySize(Math.min(10, partySize + 1))}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </Button>
            <span className="text-sm text-muted-foreground ml-2">people</span>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Select Date</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {dates.map((d) => (
              <Button
                key={d.date}
                variant={selectedDate === d.date ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-shrink-0 flex-col h-auto py-2 px-3",
                  selectedDate === d.date ? "bg-primary text-primary-foreground" : "bg-transparent",
                )}
                onClick={() => setSelectedDate(d.date)}
              >
                <span className="text-xs">{d.label}</span>
                <span className="text-sm font-semibold">{d.date}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">Select Time</label>
          <div className="grid grid-cols-3 gap-2">
            {times.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                className={cn(selectedTime === time ? "bg-primary text-primary-foreground" : "bg-transparent")}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* Book Button */}
        <Button
          className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
          disabled={!selectedDate || !selectedTime}
        >
          {selectedDate && selectedTime
            ? `Book for ${partySize} on ${selectedDate} at ${selectedTime}`
            : "Select date and time to book"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-3">
          £5 deposit per person · Fully refundable if cancelled 24h in advance
        </p>
      </CardContent>
    </Card>
  )
}
