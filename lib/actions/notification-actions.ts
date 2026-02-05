"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getNotifications(userId: string, limit = 50) {
  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(`
      *,
      related_user:related_user_id(id, username, display_name, avatar_url)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching notifications:", error)
    return { notifications: [], error: error.message }
  }

  return { notifications: notifications || [] }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) {
    console.error("[v0] Error marking notification as read:", error)
    return { error: error.message }
  }

  revalidatePath("/app/community")
  return { success: true }
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId)

  if (error) {
    console.error("[v0] Error marking all notifications as read:", error)
    return { error: error.message }
  }

  revalidatePath("/app/community")
  return { success: true }
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("[v0] Error getting unread count:", error)
    return { count: 0, error: error.message }
  }

  return { count: count || 0 }
}
