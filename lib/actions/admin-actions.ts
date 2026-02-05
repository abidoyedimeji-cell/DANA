"use server"

import { checkAdmin } from "@/lib/auth/check-admin"
import { createClient } from "@/lib/supabase/server"

export interface AdminStats {
  totalUsers: number
  totalVenues: number
  totalDateInvites: number
  revenuePlaceholder: number
  pendingVerifications: number
}

export async function getAdminStats(): Promise<AdminStats> {
  await checkAdmin()
  const supabase = await createClient()

  const [profilesRes, venuesRes, dateInvitesRes, verificationsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("venues").select("id", { count: "exact", head: true }),
    supabase.from("date_invites").select("id", { count: "exact", head: true }),
    supabase
      .from("verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then((r) => ({ count: r.count ?? 0 }), () => ({ count: 0 })),
  ])

  return {
    totalUsers: profilesRes.count ?? 0,
    totalVenues: venuesRes.count ?? 0,
    totalDateInvites: dateInvitesRes.count ?? 0,
    revenuePlaceholder: 0,
    pendingVerifications: verificationsRes.count ?? 0,
  }
}

export async function getAdminUsers(): Promise<Record<string, unknown>[]> {
  await checkAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, first_name, last_name, email, profile_mode, is_verified, created_at, updated_at")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Record<string, unknown>[]
}

export async function getAdminVenues(): Promise<Record<string, unknown>[]> {
  await checkAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Record<string, unknown>[]
}

export async function getAdminDateInvites(): Promise<Record<string, unknown>[]> {
  await checkAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("date_invites")
    .select("id, inviter_id, invitee_id, venue_id, proposed_date, proposed_time, status, message, created_at, updated_at")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Record<string, unknown>[]
}

export async function getAdminVerifications(): Promise<Record<string, unknown>[]> {
  await checkAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("verifications")
    .select("id, profile_id, type, status, created_at, updated_at")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Record<string, unknown>[]
}
