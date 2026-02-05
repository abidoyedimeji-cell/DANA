"use server"

import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/resend"

/** Generate a short unique code for venue credit. */
function generateVenueCreditCode(): string {
  return "DANA-" + Math.random().toString(36).substring(2, 10).toUpperCase()
}

/**
 * After a meet form is submitted, create a venue credit code (if not already created)
 * and send it by email to both inviter and invitee.
 * Code is valid from 3 hours before event until 30 minutes after that reveal (2.5h before event).
 */
export async function sendVenueCreditEmails(dateInviteId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: invite, error: inviteError } = await supabase
    .from("date_invites")
    .select(
      "id, proposed_date, proposed_time, venue_id, inviter_id, invitee_id, inviter:profiles!inviter_id(email, first_name), invitee:profiles!invitee_id(email, first_name)"
    )
    .eq("id", dateInviteId)
    .single()

  if (inviteError || !invite) return { error: "Invite not found" }
  if (user.id !== invite.inviter_id && user.id !== invite.invitee_id) {
    return { error: "Only participants can request the venue credit" }
  }

  const inviter = invite.inviter as { email?: string; first_name?: string } | null
  const invitee = invite.invitee as { email?: string; first_name?: string } | null
  const inviterEmail = inviter?.email
  const inviteeEmail = invitee?.email
  if (!inviterEmail || !inviteeEmail) return { error: "Missing participant emails" }

  let eventStart: Date
  const { data: event } = await supabase
    .from("dana_events")
    .select("time_slot")
    .eq("date_invite_id", dateInviteId)
    .limit(1)
    .single()

  if (event?.time_slot) {
    const range = event.time_slot as string
    const match = range.replace(/[\[\]()]/g, "").split(",")
    const startStr = match[0]?.replace(/"/g, "").trim()
    eventStart = startStr ? new Date(startStr) : new Date(invite.proposed_date + "T" + invite.proposed_time + "Z")
  } else {
    eventStart = new Date(invite.proposed_date + "T" + invite.proposed_time + "Z")
  }

  const validFrom = new Date(eventStart.getTime() - 3 * 60 * 60 * 1000)
  const validUntil = new Date(eventStart.getTime() - 2.5 * 60 * 60 * 1000)

  const { data: existing } = await supabase
    .from("venue_credit_codes")
    .select("id, code")
    .eq("date_invite_id", dateInviteId)
    .limit(1)
    .single()

  const { data: venue } = await supabase.from("venues").select("name").eq("id", invite.venue_id).single()
  const venueName = venue?.name ?? "the venue"

  let code: string

  if (existing?.code) {
    code = existing.code
  } else {
    code = generateVenueCreditCode()
    const { error: insertError } = await supabase.from("venue_credit_codes").insert({
      date_invite_id: dateInviteId,
      code,
      venue_id: invite.venue_id,
      event_start: eventStart.toISOString(),
      valid_from: validFrom.toISOString(),
      valid_until: validUntil.toISOString(),
    })
    if (insertError) return { error: "Failed to create venue credit code" }
  }

  const dateTimeStr = eventStart.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

  const html = `
    <h2>Your DANA venue credit</h2>
    <p>Your unique code: <strong>${code}</strong></p>
    <p>Venue: <strong>${venueName}</strong></p>
    <p>Date & time: ${dateTimeStr}</p>
    <p>This code is valid from 3 hours before your date until 30 minutes after that. Show the code and your DANA profile or ID at the venue.</p>
  `

  await sendEmail({ to: inviterEmail, subject: "Your DANA venue credit code", html })
  await sendEmail({ to: inviteeEmail, subject: "Your DANA venue credit code", html })

  return {}
}
