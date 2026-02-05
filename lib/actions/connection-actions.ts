"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendConnectionRequest(requesterId: string, recipientId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("connections").insert({
    requester_id: requesterId,
    recipient_id: recipientId,
    status: "pending",
  })

  if (error) {
    console.error("[v0] Error sending connection request:", error)
    return { error: error.message }
  }

  await supabase.from("notifications").insert({
    user_id: recipientId,
    type: "connection_request",
    title: "New connection request",
    body: "Someone wants to connect with you",
    related_user_id: requesterId,
  })

  revalidatePath("/search")
  return { success: true }
}

export async function acceptConnectionRequest(connectionId: string) {
  const supabase = await createClient()

  const { data: connection, error: fetchError } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .single()

  if (fetchError || !connection) {
    return { error: "Connection not found" }
  }

  const { error } = await supabase
    .from("connections")
    .update({
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", connectionId)

  if (error) {
    console.error("[v0] Error accepting connection:", error)
    return { error: error.message }
  }

  await supabase.from("notifications").insert({
    user_id: connection.requester_id,
    type: "connection_accepted",
    title: "Connection accepted",
    body: "Your connection request was accepted",
    related_user_id: connection.recipient_id,
  })

  revalidatePath("/community")
  return { success: true }
}

export async function declineConnectionRequest(connectionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("connections")
    .update({
      status: "declined",
      updated_at: new Date().toISOString(),
    })
    .eq("id", connectionId)

  if (error) {
    console.error("[v0] Error declining connection:", error)
    return { error: error.message }
  }

  revalidatePath("/community")
  return { success: true }
}

export async function getMyConnections(userId: string) {
  const supabase = await createClient()

  const { data: connections, error } = await supabase
    .from("connections")
    .select(`
      *,
      requester:requester_id(id, username, display_name, avatar_url),
      recipient:recipient_id(id, username, display_name, avatar_url)
    `)
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq("status", "accepted")

  if (error) {
    console.error("[v0] Error fetching connections:", error)
    return { connections: [], error: error.message }
  }

  return { connections: connections || [] }
}
