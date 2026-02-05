"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isAdminRole } from "./admin-utils"

/** Use in admin layout/pages: redirects if not authenticated or not admin/super_admin */
export async function checkAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || !isAdminRole(profile.user_role)) {
    redirect("/profile")
  }

  return { user, profile }
}

/** Legacy: same as checkAdmin but requires super_admin only */
export async function checkSuperAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.user_role !== "super_admin") {
    redirect("/profile")
  }

  return { user, profile }
}
