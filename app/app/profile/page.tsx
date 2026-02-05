"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Edit2, MapPin, X, Check, LogIn, TrendingUp, Wallet, Settings, Calendar } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, profile, isGuest, logout, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    age: "",
    location: "",
    height: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        age: profile.age?.toString() || "",
        location: profile.location || "",
        height: "",
      })
    }
  }, [profile])

  useEffect(() => {
    if (user) {
      fetchWalletBalance()
    }
  }, [user])

  const fetchWalletBalance = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from("wallets").select("balance").eq("user_id", user?.id).single()

      if (data) {
        setWalletBalance(data.balance)
      }
    } catch (error) {
      // Wallet might not exist yet
      setWalletBalance(0)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      console.log("[v0] Saving profile data:", formData)

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          username: formData.username,
          bio: formData.bio,
          age: Number.parseInt(formData.age) || null,
          location: formData.location,
        })
        .eq("id", user.id)

      if (error) {
        console.error("[v0] Error saving profile:", error)
        throw error
      }

      console.log("[v0] Profile saved successfully")
      await refreshProfile()
      setIsEditing(false)
    } catch (error: any) {
      console.error("[v0] Error saving profile:", error)
      alert(`Error saving profile: ${error.message || "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center mb-6">
          <LogIn className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Sign in to view your profile</h2>
        <p className="text-white/60 text-center mb-8">
          Create an account to set up your profile, connect with others, and request dates.
        </p>
        <Link href="/auth" className="w-full max-w-xs">
          <Button className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white rounded-full py-6">
            Sign In or Create Account
          </Button>
        </Link>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#E91E8C] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Profile</h1>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <button onClick={handleSave} disabled={isSaving} className="text-[#E91E8C] hover:text-[#E91E8C]/80">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-white/60 hover:text-white">
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Profile Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {(profile.display_name || profile.username || user?.email || "U")[0].toUpperCase()}
              </span>
            </div>
            {profile.is_verified && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#2DD4BF] rounded-full flex items-center justify-center border-2 border-black">
                <Check className="w-3 h-3 text-black" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/app/analytics">
            <div className="bg-gradient-to-br from-[#E91E8C]/20 to-[#E91E8C]/5 border border-[#E91E8C]/20 rounded-2xl p-4 hover:border-[#E91E8C]/40 transition-colors">
              <TrendingUp className="w-6 h-6 text-[#E91E8C] mb-2" />
              <p className="text-white font-semibold text-sm">Analytics</p>
              <p className="text-white/60 text-xs">View your stats</p>
            </div>
          </Link>
          <Link href="/app/wallet">
            <div className="bg-gradient-to-br from-[#2DD4BF]/20 to-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-2xl p-4 hover:border-[#2DD4BF]/40 transition-colors">
              <Wallet className="w-6 h-6 text-[#2DD4BF] mb-2" />
              <p className="text-white font-semibold text-sm">Wallet</p>
              <p className="text-white/60 text-xs">£{walletBalance.toFixed(2)}</p>
            </div>
          </Link>
          <Link href="/app/availability">
            <div className="bg-gradient-to-br from-[#FFD166]/20 to-[#FFD166]/5 border border-[#FFD166]/20 rounded-2xl p-4 hover:border-[#FFD166]/40 transition-colors">
              <Calendar className="w-6 h-6 text-[#FFD166] mb-2" />
              <p className="text-white font-semibold text-sm">Availability</p>
              <p className="text-white/60 text-xs">Set your schedule</p>
            </div>
          </Link>
          <Link href="/app/settings">
            <div className="bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-2xl p-4 hover:border-[#FF6B35]/40 transition-colors">
              <Settings className="w-6 h-6 text-[#FF6B35] mb-2" />
              <p className="text-white font-semibold text-sm">Settings</p>
              <p className="text-white/60 text-xs">Edit profile</p>
            </div>
          </Link>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="text-white/60 text-sm mb-1 block">Display Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your display name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#E91E8C] focus:outline-none"
              />
            ) : (
              <p className="text-white text-lg">{profile.display_name || "Not set"}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="text-white/60 text-sm mb-1 block">Username</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#E91E8C] focus:outline-none"
              />
            ) : (
              <p className="text-white">@{profile.username || "Not set"}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-white/60 text-sm mb-1 block">Email</label>
            <p className="text-white">{user?.email}</p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-white/60 text-sm mb-1 block">Bio</label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#E91E8C] focus:outline-none resize-none"
              />
            ) : (
              <p className="text-white/80">{profile.bio || "No bio yet"}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="text-white/60 text-sm mb-1 block">Age</label>
            {isEditing ? (
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Your age"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#E91E8C] focus:outline-none"
              />
            ) : (
              <p className="text-white">{profile.age || "Not set"}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-white/60 text-sm mb-1 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#E91E8C] focus:outline-none"
              />
            ) : (
              <p className="text-white">{profile.location || "Not set"}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Link href="/app/search">
            <Button className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white rounded-full py-6">
              Find Connections
            </Button>
          </Link>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-500/10 rounded-full py-6 bg-transparent"
          >
            Log Out
          </Button>
        </div>

        <div className="pt-8 pb-2 text-center">
          <h3 className="text-white font-bold text-2xl mb-1">DANA</h3>
          <p className="text-white/60 text-xs">The next generation of human connections</p>
        </div>
      </div>
    </div>
  )
}
