"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Star, ChevronRight, Bell, MapPin, Users, ChevronLeft } from "lucide-react"
import { QuizModal } from "@/components/quiz/quiz-modal"

const PLACEHOLDER_VENUES = [
  {
    id: "venue-1",
    name: "The Ivy Chelsea Garden",
    category: "Fine Dining",
    description: "Elegant British cuisine in a botanical setting",
    promo_text: "30% off mains this week",
    rating: 4.8,
    price_range: "£££",
    image_url: "/placeholder.svg?height=400&width=400",
    is_partner: true,
  },
  {
    id: "venue-2",
    name: "Nightjar",
    category: "Cocktail Bar",
    description: "Art Deco speakeasy with live jazz",
    promo_text: "2-for-1 cocktails on Fridays",
    rating: 4.7,
    price_range: "£££",
    image_url: "/placeholder.svg?height=400&width=400",
    is_partner: true,
  },
  {
    id: "venue-3",
    name: "Sketch Gallery",
    category: "Restaurant & Bar",
    description: "Instagram-worthy dining experience",
    promo_text: "Complimentary dessert with dinner",
    rating: 4.6,
    price_range: "££££",
    image_url: "/placeholder.svg?height=400&width=400",
    is_partner: true,
  },
]

const PLACEHOLDER_CONNECTIONS = [
  {
    id: "user-1",
    display_name: "Olivia Bennett",
    username: "olivia_b",
    age: 28,
    location: "Chelsea",
    is_verified: true,
    user_preferences: [{ hobbies: ["Art Galleries", "Wine Tasting", "Theater"] }],
  },
  {
    id: "user-2",
    display_name: "Marcus Johnson",
    username: "marcus_j",
    age: 32,
    location: "Shoreditch",
    is_verified: true,
    user_preferences: [{ hobbies: ["Jazz Music", "Photography", "Fine Dining"] }],
  },
  {
    id: "user-3",
    display_name: "Sophie Anderson",
    username: "sophie_a",
    age: 26,
    location: "Notting Hill",
    is_verified: true,
    user_preferences: [{ hobbies: ["Yoga", "Brunch", "Travel"] }],
  },
  {
    id: "user-4",
    display_name: "James Taylor",
    username: "james_t",
    age: 30,
    location: "Mayfair",
    is_verified: true,
    user_preferences: [{ hobbies: ["Fitness", "Cocktails", "Startups"] }],
  },
  {
    id: "user-5",
    display_name: "Emma Wilson",
    username: "emma_w",
    age: 27,
    location: "Kensington",
    is_verified: true,
    user_preferences: [{ hobbies: ["Fashion", "Art", "Live Music"] }],
  },
  {
    id: "user-6",
    display_name: "Alexander Chen",
    username: "alex_c",
    age: 31,
    location: "Canary Wharf",
    is_verified: true,
    user_preferences: [{ hobbies: ["Skiing", "Wine", "Business"] }],
  },
]

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

function getGenderGreeting(gender?: string) {
  if (!gender) return "Beautiful"
  const lowerGender = gender.toLowerCase()
  if (lowerGender === "female" || lowerGender === "woman" || lowerGender === "she") return "Beautiful"
  if (lowerGender === "male" || lowerGender === "man" || lowerGender === "he") return "Handsome"
  return "Beautiful"
}

export default function HomeDashboard() {
  const { profile, user, supabase } = useAuth()
  const router = useRouter()
  const [recommendedVenues, setRecommendedVenues] = useState<any[]>([])
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([])
  const [featuredDeals, setFeaturedDeals] = useState<any[]>([])
  const [suggestedConnections, setSuggestedConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDealIndex, setCurrentDealIndex] = useState(0)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [selectedQuizUser, setSelectedQuizUser] = useState<string | null>(null)

  const firstName = profile?.display_name?.split(" ")[0] || profile?.username || "Friend"
  const genderGreeting = getGenderGreeting(profile?.gender)
  const timeGreeting = getTimeGreeting()

  useEffect(() => {
    loadRecommendations()
  }, [user])

  const loadRecommendations = async () => {
    const { data: deals } = await supabase.from("venues").select("*").not("promo_text", "is", null).limit(5)

    if (deals && deals.length > 0) {
      setFeaturedDeals(deals)
    } else {
      setFeaturedDeals(PLACEHOLDER_VENUES)
    }

    const { data: venues } = await supabase.from("venues").select("*").eq("is_partner", true).limit(3)

    if (venues && venues.length > 0) {
      setRecommendedVenues(venues)
    } else {
      setRecommendedVenues(PLACEHOLDER_VENUES)
    }

    if (user?.id) {
      const { data: userPrefs } = await supabase
        .from("user_preferences")
        .select("available_days, available_times")
        .eq("user_id", user.id)
        .single()

      const userQuery = supabase
        .from("profiles")
        .select(`
          *,
          user_preferences (
            available_days,
            available_times,
            hobbies
          )
        `)
        .neq("id", user.id)
        .eq("is_verified", true)
        .limit(12)

      const { data: users } = await userQuery

      let matchedUsers = users || []

      if (matchedUsers.length === 0) {
        matchedUsers = PLACEHOLDER_CONNECTIONS
      } else if (userPrefs && userPrefs.available_days?.length > 0) {
        matchedUsers = matchedUsers.filter((u) => {
          const uPrefs = u.user_preferences?.[0]
          if (!uPrefs || !uPrefs.available_days) return false
          return userPrefs.available_days.some((day: string) => uPrefs.available_days.includes(day))
        })
      }

      setRecommendedUsers(matchedUsers.slice(0, 6))
      setSuggestedConnections(matchedUsers.slice(0, 6))
    } else {
      setRecommendedUsers(PLACEHOLDER_CONNECTIONS.slice(0, 6))
      setSuggestedConnections(PLACEHOLDER_CONNECTIONS.slice(0, 6))
    }

    setLoading(false)
  }

  const nextDeal = () => {
    setCurrentDealIndex((prev) => (prev + 1) % featuredDeals.length)
  }

  const prevDeal = () => {
    setCurrentDealIndex((prev) => (prev - 1 + featuredDeals.length) % featuredDeals.length)
  }

  const handleRequestConnection = async (userId: string) => {
    if (!user?.id) return
    const { error } = await supabase.from("connections").insert({
      requester_id: user.id,
      recipient_id: userId,
      status: "pending",
    })

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "connection_request",
        title: "New Connection Request",
        message: `${profile?.display_name || "Someone"} wants to connect with you`,
        related_user_id: user.id,
      })
    }
  }

  const handleTakeQuiz = (userId: string) => {
    setSelectedQuizUser(userId)
    setShowQuizModal(true)
  }

  return (
    <div className="flex flex-col h-full bg-black pb-2">
      <div className="relative h-80 overflow-hidden">
        <img src="/dramatic-sunset-golden-hour-sky.jpg" alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Hi {genderGreeting}</h1>
          <p className="text-xl text-white/90">
            {timeGreeting}, {firstName}
          </p>

          {user ? (
            <div className="flex gap-3 mt-8">
              <Link href="/profile">
                <Button
                  size="lg"
                  className="bg-[var(--dana-yellow)] text-black hover:bg-[var(--dana-gold)] font-semibold rounded-full px-8"
                >
                  Edit Profile
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 rounded-full px-8 bg-transparent"
              >
                Invite Guest
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-[var(--dana-yellow)] text-black hover:bg-[var(--dana-gold)] font-semibold rounded-full px-8 mt-8"
              >
                Join Dana
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="space-y-3">
          <Link
            href="/community"
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--dana-pink)] to-[var(--dana-pink)]/80 flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">The Wall</h3>
              <p className="text-white/60 text-sm">Social feed & venue discovery</p>
            </div>
          </Link>

          <Link
            href="/spots"
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--dana-orange)] to-[var(--dana-orange)]/80 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg whitespace-nowrap">Venues and Deals</h3>
              <p className="text-white/60 text-sm">Discover exclusive offers & book dates</p>
            </div>
          </Link>

          <Link
            href="/search"
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">Discover</h3>
              <p className="text-white/60 text-sm">Find members near you</p>
            </div>
          </Link>

          <Link
            href="/notifications"
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--dana-yellow)] to-[var(--dana-gold)] flex items-center justify-center flex-shrink-0">
              <Bell className="w-7 h-7 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">Notifications</h3>
              <p className="text-white/60 text-sm">Stay updated on activity</p>
            </div>
          </Link>
        </div>
      </div>

      {recommendedVenues.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-white font-bold text-lg mb-4">Recommended for You</h2>
          <div className="space-y-3">
            {recommendedVenues.map((venue) => (
              <Link
                key={venue.id}
                href={`/spots`}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors block relative"
              >
                {venue.promo_text && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-[var(--dana-orange)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      FEATURED
                    </span>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--dana-orange)] to-[var(--dana-pink)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-semibold text-lg line-clamp-1">{venue.name}</h3>
                      {venue.rating && (
                        <div className="flex items-center gap-1 text-[var(--dana-yellow)] flex-shrink-0">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{venue.rating}</span>
                        </div>
                      )}
                    </div>
                    {venue.category && <p className="text-white/60 text-sm mb-2">{venue.category}</p>}
                    {venue.promo_text && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--dana-pink)]/20 rounded-full max-w-full">
                        <span className="text-[var(--dana-pink)] text-xs font-medium truncate">{venue.promo_text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommendedUsers.length > 0 && (
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Members You Might Like</h2>
            <Link
              href="/search"
              className="text-[var(--dana-pink)] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recommendedUsers.map((member) => {
              const hobbies = member.user_preferences?.[0]?.hobbies || []
              return (
                <div key={member.id} className="flex flex-col items-center group">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2">
                    <div className="w-full h-full bg-gradient-to-br from-[var(--dana-pink)] to-[var(--dana-orange)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white text-2xl font-bold">
                        {(member.display_name || member.username || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequestConnection(member.id)}
                    className="w-full bg-[var(--dana-pink)] hover:bg-[var(--dana-pink)]/90 text-white text-xs font-medium px-2 py-1.5 rounded-full mb-2 transition-colors"
                  >
                    Connect
                  </button>
                  <p className="text-white font-medium text-xs text-center line-clamp-1">
                    {member.display_name || member.username}
                  </p>
                  <p className="text-white/60 text-[10px] text-center line-clamp-1">
                    {member.age && `${member.age}`}
                    {member.age && member.location && " · "}
                    {member.location && member.location}
                    {hobbies.length > 0 && " · "}
                    {hobbies.length > 0 && hobbies[0]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {featuredDeals.length > 0 && (
        <div className="px-4 pb-6 flex flex-col items-center">
          <div className="w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4 text-center">Featured This Week</h2>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentDealIndex * 100}%)` }}
                >
                  {featuredDeals.map((deal, index) => (
                    <div key={deal.id} className="min-w-full">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl overflow-hidden">
                        <div className="p-5 text-center">
                          <p className="text-white/90 text-xs uppercase tracking-wider mb-1.5">
                            {deal.category || "Special Offer"}
                          </p>
                          <h3 className="text-white font-bold text-lg mb-1.5">{deal.name}</h3>
                          <p className="text-white/80 text-xs mb-3 whitespace-nowrap overflow-hidden text-ellipsis px-2">
                            {deal.promo_text}
                          </p>
                          <Button
                            className="bg-white text-black hover:bg-white/90 rounded-full px-5 text-sm h-9"
                            onClick={() => router.push("/spots")}
                          >
                            View Deal
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {featuredDeals.length > 1 && (
                <>
                  <button
                    onClick={prevDeal}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                    aria-label="Previous deal"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={nextDeal}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                    aria-label="Next deal"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>

                  <div className="flex justify-center gap-2 mt-3">
                    {featuredDeals.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentDealIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentDealIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                        }`}
                        aria-label={`Go to deal ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {suggestedConnections.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Suggested New Connections</h2>
            <Link
              href="/search"
              className="text-[var(--dana-pink)] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {suggestedConnections.map((member) => {
              const hobbies = member.user_preferences?.[0]?.hobbies || []
              return (
                <div
                  key={member.id}
                  className="flex items-start gap-3 bg-white/5 rounded-2xl p-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-white font-semibold text-base line-clamp-1 mb-1">
                      {member.display_name || member.username}
                    </p>
                    <p className="text-white/60 text-sm mb-1.5">
                      {member.age && `${member.age}`}
                      {member.age && member.location && " · "}
                      {member.location}
                    </p>
                    {hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {hobbies.slice(0, 2).map((hobby: string, idx: number) => (
                          <span key={idx} className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full">
                            {hobby}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleTakeQuiz(member.id)}
                      className="bg-[var(--dana-pink)] hover:bg-[var(--dana-pink)]/90 text-white rounded-full text-xs h-8 px-4 whitespace-nowrap"
                    >
                      Take Quiz
                    </Button>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--dana-pink)] to-[var(--dana-orange)] flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {(member.display_name || member.username || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DANA Footer */}
      <div className="px-4 pb-2 text-center">
        <h3 className="text-white font-bold text-2xl mb-1">DANA</h3>
        <p className="text-white/60 text-xs">The next generation of human connections</p>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && selectedQuizUser && (
        <QuizModal userId={selectedQuizUser} onClose={() => setShowQuizModal(false)} />
      )}
    </div>
  )
}
