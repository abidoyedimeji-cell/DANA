"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, Check, MapPin, DollarSign, Target } from "lucide-react"
import Link from "next/link"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIME_SLOTS = ["Morning (8am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-9pm)", "Late Night (9pm-12am)"]

const DISTANCE_OPTIONS = ["1 mile", "5 miles", "10 miles", "25 miles", "Unlimited"]

const BUDGET_OPTIONS = ["£", "££", "£££", "££££"]

export default function PreferencesPage() {
  const { user, isGuest } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [maxDistance, setMaxDistance] = useState("Unlimited")
  const [budgetPreference, setBudgetPreference] = useState<string[]>([])
  const [datingIntentions, setDatingIntentions] = useState("")

  useEffect(() => {
    loadAvailability()
  }, [user])

  const loadAvailability = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      console.log("[v0] Loading preferences for user:", user.id)

      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("[v0] Error loading preferences:", error)
      }

      if (data) {
        console.log("[v0] Loaded preferences:", data)
        setAvailableDays(data.available_days || [])
        setAvailableTimes(data.available_times || [])
        setMaxDistance(data.max_distance || "Unlimited")
        setBudgetPreference(data.budget_preference || [])
        setDatingIntentions(data.dating_intentions || "")
      }
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDay = (day: string) => {
    setAvailableDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const toggleTime = (time: string) => {
    setAvailableTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]))
  }

  const toggleBudget = (budget: string) => {
    setBudgetPreference((prev) => (prev.includes(budget) ? prev.filter((b) => b !== budget) : [...prev, budget]))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      console.log("[v0] Saving preferences")

      const preferences = {
        available_days: availableDays,
        available_times: availableTimes,
        max_distance: maxDistance,
        budget_preference: budgetPreference,
        dating_intentions: datingIntentions,
        updated_at: new Date().toISOString(),
      }

      const { data: existing } = await supabase.from("user_preferences").select("id").eq("user_id", user.id).single()

      if (existing) {
        const { error } = await supabase.from("user_preferences").update(preferences).eq("user_id", user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("user_preferences").insert({
          user_id: user.id,
          ...preferences,
        })

        if (error) throw error
      }

      console.log("[v0] Preferences saved successfully")
      alert("Preferences saved successfully!")
    } catch (error: any) {
      console.error("[v0] Error saving preferences:", error)
      alert(`Error saving preferences: ${error.message || "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <Calendar className="w-16 h-16 text-[#E91E8C] mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Sign in to set preferences</h2>
        <p className="text-white/60 text-center mb-8">Set your dating preferences and availability</p>
        <Link href="/auth">
          <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white rounded-full px-8 py-6">Sign In</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-6 h-6 text-[#E91E8C] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-white/10 px-4 py-4">
        <h1 className="text-white font-bold text-xl">Dating Preferences</h1>
        <p className="text-white/60 text-sm mt-1">Customize your dating experience</p>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Days of Week */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#E91E8C]" />
            <h2 className="text-white font-semibold text-lg">Available Days</h2>
          </div>
          <p className="text-white/60 text-sm">Select the days you're usually available</p>

          <div className="grid grid-cols-2 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = availableDays.includes(day)
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`relative px-4 py-4 rounded-2xl border-2 transition-all ${
                    isSelected ? "border-[#E91E8C] bg-[#E91E8C]/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isSelected ? "text-[#E91E8C]" : "text-white"}`}>{day}</span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#E91E8C] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF6B35]" />
            <h2 className="text-white font-semibold text-lg">Preferred Times</h2>
          </div>
          <p className="text-white/60 text-sm">When do you prefer to go out?</p>

          <div className="space-y-3">
            {TIME_SLOTS.map((time) => {
              const isSelected = availableTimes.includes(time)
              return (
                <button
                  key={time}
                  onClick={() => toggleTime(time)}
                  className={`w-full px-5 py-4 rounded-2xl border-2 transition-all ${
                    isSelected ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isSelected ? "text-[#FF6B35]" : "text-white"}`}>{time}</span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Distance Preference */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2DD4BF]" />
            <h2 className="text-white font-semibold text-lg">Distance Radius</h2>
          </div>
          <p className="text-white/60 text-sm">How far are you willing to travel?</p>

          <div className="grid grid-cols-3 gap-3">
            {DISTANCE_OPTIONS.map((distance) => {
              const isSelected = maxDistance === distance
              return (
                <button
                  key={distance}
                  onClick={() => setMaxDistance(distance)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    isSelected ? "border-[#2DD4BF] bg-[#2DD4BF]/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className={`font-medium text-sm ${isSelected ? "text-[#2DD4BF]" : "text-white"}`}>
                    {distance}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Budget Preference */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#FFD166]" />
            <h2 className="text-white font-semibold text-lg">Budget Preference</h2>
          </div>
          <p className="text-white/60 text-sm">Select all that apply</p>

          <div className="grid grid-cols-4 gap-3">
            {BUDGET_OPTIONS.map((budget) => {
              const isSelected = budgetPreference.includes(budget)
              return (
                <button
                  key={budget}
                  onClick={() => toggleBudget(budget)}
                  className={`px-4 py-4 rounded-xl border-2 transition-all ${
                    isSelected ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className={`font-bold text-lg ${isSelected ? "text-[#FFD166]" : "text-white"}`}>{budget}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dating Intentions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#9333EA]" />
            <h2 className="text-white font-semibold text-lg">Dating Intentions</h2>
          </div>
          <p className="text-white/60 text-sm">What are you looking for?</p>

          <div className="space-y-3">
            {["Long-term relationship", "Casual dating", "New friends", "Networking", "Not sure yet"].map(
              (intention) => (
                <button
                  key={intention}
                  onClick={() => setDatingIntentions(intention)}
                  className={`w-full px-5 py-4 rounded-2xl border-2 transition-all ${
                    datingIntentions === intention ? "border-[#9333EA] bg-[#9333EA]/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${datingIntentions === intention ? "text-[#9333EA]" : "text-white"}`}>
                      {intention}
                    </span>
                    {datingIntentions === intention && (
                      <div className="w-6 h-6 bg-[#9333EA] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 bg-gradient-to-br from-[#E91E8C]/10 to-[#FF6B35]/10 border border-[#E91E8C]/20 rounded-2xl">
          <p className="text-white/80 text-sm">
            Your preferences help us match you with compatible people and suggest venues that fit your lifestyle. You
            can update these anytime.
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-[#E91E8C] to-[#FF6B35] hover:opacity-90 text-white rounded-full py-6 font-semibold text-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  )
}
