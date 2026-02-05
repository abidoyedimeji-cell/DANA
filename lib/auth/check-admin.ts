"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function checkSuperAdmin() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth")
  }

  // Check if user is super admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.user_role !== "super_admin") {
    redirect("/app/profile")
  }

  return { user, profile }
}
