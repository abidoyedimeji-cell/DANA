"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, MapPin, Calendar, Heart, Briefcase, GraduationCap, User, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SettingsPage() {
  const { user, profile, isGuest, refreshProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    age: "",
    gender: "",
    location: "",
    height: "",
    occupation: "",
    education: "",
    relationship_goals: "",
    interests: [] as string[],
    drinking: "",
    smoking: "",
    exercise: "",
  })

  useEffect(() => {
    if (profile) {
      console.log("[v0] Loading profile data:", profile)
      setFormData({
        display_name: profile.display_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        location: profile.location || "",
        height: profile.height || "",
        occupation: profile.occupation || "",
        education: profile.education || "",
        relationship_goals: profile.relationship_goals || "",
        interests: profile.interests || [],
        drinking: profile.drinking || "",
        smoking: profile.smoking || "",
        exercise: profile.exercise || "",
      })
      setProfileImageUrl(profile.profile_image_url || profile.avatar_url || null)
    }
  }, [profile])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploadingImage(true)
    try {
      const supabase = createClient()

      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      console.log("[v0] Available buckets:", buckets)

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log("[v0] Uploading image to avatars bucket:", filePath)

      const { error: uploadError, data: uploadData } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("[v0] Upload error:", uploadError)
        throw uploadError
      }

      console.log("[v0] Upload successful:", uploadData)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      console.log("[v0] Image uploaded, URL:", publicUrl)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          profile_image_url: publicUrl,
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Profile update error:", updateError)
        throw updateError
      }

      setProfileImageUrl(publicUrl)
      await refreshProfile()
      console.log("[v0] Profile image updated successfully")
    } catch (error: any) {
      console.error("[v0] Error uploading image:", error)
      alert(`Error uploading image: ${error.message || "Unknown error"}. Check console for details.`)
    } finally {
      setIsUploadingImage(false)
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
          gender: formData.gender,
          location: formData.location,
          height: formData.height,
          occupation: formData.occupation,
          education: formData.education,
          relationship_goals: formData.relationship_goals,
          interests: formData.interests,
          drinking: formData.drinking,
          smoking: formData.smoking,
          exercise: formData.exercise,
        })
        .eq("id", user.id)

      if (error) {
        console.error("[v0] Error saving profile:", error)
        throw error
      }

      console.log("[v0] Profile saved successfully")
      await refreshProfile()
      alert("Profile updated successfully!")
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
        <h2 className="text-white text-xl font-bold mb-4">Sign in to access settings</h2>
        <Link href="/auth">
          <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white rounded-full px-8 py-6">Sign In</Button>
        </Link>
      </div>
    )
  }

  if (!profile) {
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
        <h1 className="text-white font-bold text-xl">Profile Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl || "/placeholder.svg"}
                alt="Profile"
                width={112}
                height={112}
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#FF6B35] flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {(formData.display_name || formData.username || "U")[0].toUpperCase()}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#E91E8C] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#E91E8C]/90">
              {isUploadingImage ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
            </label>
          </div>
          <p className="text-white/60 text-sm">Click camera icon to upload photo</p>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h2>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Display Name *</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="Your display name"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
              placeholder="@username"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="London, UK"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Height</label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="5'10&quot; / 178 cm"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional
          </h2>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Software Engineer"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              Education
            </label>
            <select
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
            >
              <option value="">Select</option>
              <option value="high-school">High School</option>
              <option value="bachelors">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Relationship Preferences */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Dating Preferences
          </h2>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Looking for</label>
            <select
              value={formData.relationship_goals}
              onChange={(e) => setFormData({ ...formData, relationship_goals: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
            >
              <option value="">Select</option>
              <option value="relationship">Long-term relationship</option>
              <option value="dating">Casual dating</option>
              <option value="friends">New friends</option>
              <option value="unsure">Not sure yet</option>
            </select>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Lifestyle
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Drinking</label>
              <select
                value={formData.drinking}
                onChange={(e) => setFormData({ ...formData, drinking: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
              >
                <option value="">Select</option>
                <option value="never">Never</option>
                <option value="socially">Socially</option>
                <option value="regularly">Regularly</option>
              </select>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">Smoking</label>
              <select
                value={formData.smoking}
                onChange={(e) => setFormData({ ...formData, smoking: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
              >
                <option value="">Select</option>
                <option value="never">Never</option>
                <option value="sometimes">Sometimes</option>
                <option value="regularly">Regularly</option>
              </select>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">Exercise</label>
              <select
                value={formData.exercise}
                onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#E91E8C] focus:outline-none"
              >
                <option value="">Select</option>
                <option value="never">Never</option>
                <option value="sometimes">Sometimes</option>
                <option value="active">Active</option>
                <option value="very-active">Very Active</option>
              </select>
            </div>
          </div>
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
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
