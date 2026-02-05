"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, MessageCircle, Calendar, Eye, Users, TrendingUp, MapPin, Clock } from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  totalLikes: number
  totalComments: number
  totalDates: number
  profileViews: number
  connections: number
  matchRate: number
  datesByMonth: { month: string; count: number }[]
  topVenues: { name: string; count: number }[]
  interactionsByDay: { day: string; likes: number; comments: number }[]
  recentDates: {
    id: string
    venue: string
    date: string
    status: string
    partnerName: string
  }[]
}

export default function AnalyticsPage() {
  const { user, profile, isGuest } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "dates" | "interactions">("overview")

  useEffect(() => {
    if (user) {
      console.log("[v0] Loading analytics for user:", user.id)
      fetchAnalytics()
    } else {
      console.log("[v0] No user found, showing placeholder data")
      setAnalytics(getPlaceholderData())
      setLoading(false)
    }
  }, [user])

  const getPlaceholderData = (): AnalyticsData => ({
    totalLikes: 247,
    totalComments: 89,
    totalDates: 12,
    profileViews: 1834,
    connections: 45,
    matchRate: 78,
    datesByMonth: [
      { month: "Aug", count: 2 },
      { month: "Sep", count: 3 },
      { month: "Oct", count: 4 },
      { month: "Nov", count: 2 },
      { month: "Dec", count: 1 },
    ],
    topVenues: [
      { name: "The Ivy Chelsea", count: 4 },
      { name: "Sketch London", count: 3 },
      { name: "Duck & Waffle", count: 2 },
      { name: "Chiltern Firehouse", count: 2 },
      { name: "Hakkasan", count: 1 },
    ],
    interactionsByDay: [
      { day: "Mon", likes: 12, comments: 5 },
      { day: "Tue", likes: 18, comments: 8 },
      { day: "Wed", likes: 25, comments: 12 },
      { day: "Thu", likes: 20, comments: 9 },
      { day: "Fri", likes: 35, comments: 15 },
      { day: "Sat", likes: 42, comments: 20 },
      { day: "Sun", likes: 28, comments: 11 },
    ],
    recentDates: [
      { id: "1", venue: "The Ivy Chelsea", date: "Dec 28, 2025", status: "completed", partnerName: "Emma" },
      { id: "2", venue: "Sketch London", date: "Dec 15, 2025", status: "completed", partnerName: "Sophia" },
      { id: "3", venue: "Duck & Waffle", date: "Jan 5, 2026", status: "upcoming", partnerName: "Olivia" },
    ],
  })

  const fetchAnalytics = async () => {
    try {
      console.log("[v0] Fetching analytics data...")
      const supabase = createClient()

      // Fetch connections count
      const { count: connectionsCount, error: connectionsError } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .or(`requester_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .eq("status", "accepted")

      if (connectionsError) {
        console.error("[v0] Error fetching connections:", connectionsError)
      } else {
        console.log("[v0] Connections count:", connectionsCount)
      }

      // Fetch date invites
      const { data: dateInvites, error: datesError } = await supabase
        .from("date_invites")
        .select("*, venues(name)")
        .or(`inviter_id.eq.${user?.id},invitee_id.eq.${user?.id}`)

      if (datesError) {
        console.error("[v0] Error fetching date invites:", datesError)
      } else {
        console.log("[v0] Date invites count:", dateInvites?.length)
      }

      // Use placeholder data mixed with real data
      const placeholder = getPlaceholderData()
      setAnalytics({
        ...placeholder,
        connections: connectionsCount || placeholder.connections,
        totalDates: dateInvites?.length || placeholder.totalDates,
      })

      console.log("[v0] Analytics loaded successfully")
    } catch (error) {
      console.error("[v0] Error fetching analytics:", error)
      setAnalytics(getPlaceholderData())
    } finally {
      setLoading(false)
    }
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <TrendingUp className="w-16 h-16 text-[#E91E8C] mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Sign in to view analytics</h2>
        <p className="text-white/60 text-center mb-6">Track your dating journey and interactions</p>
        <Link href="/auth">
          <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white rounded-full px-8 py-6">Sign In</Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E91E8C] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const maxInteraction = Math.max(...analytics!.interactionsByDay.map((d) => Math.max(d.likes, d.comments)))

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-white font-bold text-xl">Analytics Dashboard</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto">
        {(["overview", "dates", "interactions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab ? "bg-[#E91E8C] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-6">
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#E91E8C]/20 to-[#E91E8C]/5 rounded-2xl p-4 border border-[#E91E8C]/20">
                <Heart className="w-6 h-6 text-[#E91E8C] mb-2" />
                <p className="text-3xl font-bold text-white">{analytics?.totalLikes}</p>
                <p className="text-white/60 text-sm">Total Likes</p>
              </div>
              <div className="bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 rounded-2xl p-4 border border-[#FF6B35]/20">
                <MessageCircle className="w-6 h-6 text-[#FF6B35] mb-2" />
                <p className="text-3xl font-bold text-white">{analytics?.totalComments}</p>
                <p className="text-white/60 text-sm">Comments</p>
              </div>
              <div className="bg-gradient-to-br from-[#FFD166]/20 to-[#FFD166]/5 rounded-2xl p-4 border border-[#FFD166]/20">
                <Calendar className="w-6 h-6 text-[#FFD166] mb-2" />
                <p className="text-3xl font-bold text-white">{analytics?.totalDates}</p>
                <p className="text-white/60 text-sm">Dates</p>
              </div>
              <div className="bg-gradient-to-br from-[#2DD4BF]/20 to-[#2DD4BF]/5 rounded-2xl p-4 border border-[#2DD4BF]/20">
                <Eye className="w-6 h-6 text-[#2DD4BF] mb-2" />
                <p className="text-3xl font-bold text-white">{analytics?.profileViews}</p>
                <p className="text-white/60 text-sm">Profile Views</p>
              </div>
            </div>

            {/* Match Rate */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-[#E91E8C]" />
                  <div>
                    <p className="text-white font-semibold">Match Rate</p>
                    <p className="text-white/60 text-sm">{analytics?.connections} connections</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#E91E8C]">{analytics?.matchRate}%</p>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E91E8C] to-[#FF6B35] rounded-full transition-all duration-1000"
                  style={{ width: `${analytics?.matchRate}%` }}
                />
              </div>
            </div>

            {/* Interactions Chart */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Weekly Activity</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {analytics?.interactionsByDay.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="w-full bg-[#E91E8C] rounded-t"
                        style={{ height: `${(day.likes / maxInteraction) * 80}px` }}
                      />
                      <div
                        className="w-full bg-[#FF6B35] rounded-b"
                        style={{ height: `${(day.comments / maxInteraction) * 40}px` }}
                      />
                    </div>
                    <p className="text-white/60 text-xs">{day.day}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#E91E8C] rounded" />
                  <span className="text-white/60 text-xs">Likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#FF6B35] rounded" />
                  <span className="text-white/60 text-xs">Comments</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "dates" && (
          <>
            {/* Dates by Month */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Dates by Month</h3>
              <div className="flex items-end justify-between gap-3 h-40">
                {analytics?.datesByMonth.map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-[#E91E8C] to-[#FF6B35] rounded-lg transition-all"
                      style={{ height: `${(month.count / 5) * 100}px` }}
                    />
                    <p className="text-white/60 text-xs">{month.month}</p>
                    <p className="text-white text-sm font-semibold">{month.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Venues */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E91E8C]" />
                Favourite Venues
              </h3>
              <div className="space-y-3">
                {analytics?.topVenues.map((venue, index) => (
                  <div key={venue.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#E91E8C]/20 text-[#E91E8C] text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{venue.name}</p>
                      <div className="w-full h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#E91E8C] rounded-full"
                          style={{ width: `${(venue.count / analytics.topVenues[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-white/60 text-sm">{venue.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Dates */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FFD166]" />
                Recent Dates
              </h3>
              <div className="space-y-3">
                {analytics?.recentDates.map((date) => (
                  <div key={date.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center">
                      <span className="text-white font-bold">{date.partnerName[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{date.venue}</p>
                      <p className="text-white/60 text-xs">
                        with {date.partnerName} • {date.date}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        date.status === "completed"
                          ? "bg-[#2DD4BF]/20 text-[#2DD4BF]"
                          : "bg-[#FFD166]/20 text-[#FFD166]"
                      }`}
                    >
                      {date.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "interactions" && (
          <>
            {/* Interaction Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <Heart className="w-6 h-6 text-[#E91E8C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{analytics?.totalLikes}</p>
                <p className="text-white/60 text-xs">Likes Given</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <Heart className="w-6 h-6 text-[#FF6B35] mx-auto mb-2 fill-current" />
                <p className="text-2xl font-bold text-white">312</p>
                <p className="text-white/60 text-xs">Likes Received</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <MessageCircle className="w-6 h-6 text-[#2DD4BF] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{analytics?.totalComments}</p>
                <p className="text-white/60 text-xs">Comments</p>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-gradient-to-br from-[#E91E8C]/20 to-[#FF6B35]/10 rounded-2xl p-5 border border-[#E91E8C]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-lg">Engagement Rate</p>
                  <p className="text-white/60 text-sm">Based on your activity</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">8.4%</p>
                  <p className="text-[#2DD4BF] text-sm">+2.1% this week</p>
                </div>
              </div>
            </div>

            {/* Peak Activity Times */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Peak Activity Times</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Most active day</span>
                  <span className="text-white font-medium">Saturday</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Peak hours</span>
                  <span className="text-white font-medium">7PM - 10PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Avg. response time</span>
                  <span className="text-white font-medium">2.5 hours</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
