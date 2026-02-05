"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/client" // Import singleton instance directly
import type { User, SupabaseClient } from "@supabase/supabase-js"

interface Profile {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  age: number | null
  location: string | null
  is_verified: boolean
  profile_mode: string
  gender?: string | null
  phone?: string | null
  first_name?: string | null
}

export type ProfileMode = "dating" | "business" | "both"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isGuest: boolean
  supabase: SupabaseClient // Export the supabase client instance
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  setProfileMode: (mode: ProfileMode) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initRef = useRef(false)
  // Use singleton client directly instead of creating new instance

  const isGuest = !isLoading && !user

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile load timeout")), 5000),
      )

      const profilePromise = supabase.from("profiles").select("*").eq("id", userId).single()

      const { data, error } = (await Promise.race([profilePromise, timeoutPromise])) as any

      if (error) {
        console.error("[v0] Error loading profile:", error)
        // Don't block - set loading to false even if profile fails
        setIsLoading(false)
        return
      }

      console.log("[v0] Profile loaded successfully:", data?.email, "role:", data?.user_role)
      setProfile(data)
    } catch (error) {
      console.error("[v0] Error in loadProfile:", error)
      // Don't block - allow app to render even if profile load fails
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    let timeoutId: NodeJS.Timeout

    const initAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          console.log("[v0] Auth initialization timeout - proceeding anyway")
          setIsLoading(false)
        }, 2000)

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Error getting session:", error)
          setIsLoading(false)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          console.log("[v0] User session found:", session.user.email)
          await loadProfile(session.user.id)
        }

        clearTimeout(timeoutId)
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Auth init error:", error)
        clearTimeout(timeoutId)
        setIsLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }, [user, loadProfile])

  const setProfileMode = useCallback(
    async (mode: ProfileMode) => {
      if (!user) return

      try {
        const { error } = await supabase.from("profiles").update({ profile_mode: mode }).eq("id", user.id)

        if (error) throw error

        await refreshProfile()
      } catch (error) {
        console.error("[v0] Error setting profile mode:", error)
      }
    },
    [user, refreshProfile],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isGuest,
        supabase, // Expose the singleton client
        logout,
        refreshProfile,
        setProfileMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
