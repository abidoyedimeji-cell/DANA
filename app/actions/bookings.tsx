"use server"

import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/resend"
import { bookingActionSchema, promoCodeSchema } from "@/lib/validation/schemas"
import { sanitizeInput } from "@/lib/utils"
import { checkRateLimit } from "@/lib/security"

export async function acceptBooking(bookingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Rate limiting
  if (!(await checkRateLimit(`accept-${user.id}`, 5, 60000))) {
    return { error: "Too many requests. Please try again later." }
  }

  try {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/b3385bf6-370c-4ef0-a5e1-66fa28c0606b", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "bookings.tsx:acceptBooking:entry",
        message: "acceptBooking entry",
        data: { bookingId, userId: user?.id },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H1",
      }),
    }).catch(() => {})
    // #endregion

    // Validate input
    const validated = bookingActionSchema.parse({ bookingId, action: "accept" })

    // Get booking details (inviter_id / invitee_id; no sender_id/recipient_id)
    const { data: booking, error: bookingError } = await supabase
      .from("date_invites")
      .select("*, inviter:profiles!inviter_id(*), invitee:profiles!invitee_id(*), venue:venues(*)")
      .eq("id", validated.bookingId)
      .single()

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/b3385bf6-370c-4ef0-a5e1-66fa28c0606b", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "bookings.tsx:after date_invites select",
        message: "date_invites query result",
        data: {
          bookingErrorCode: bookingError?.code,
          bookingErrorMessage: bookingError?.message,
          hasBooking: !!booking,
          hypothesisId: "H1",
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
      }),
    }).catch(() => {})
    // #endregion

    if (bookingError || !booking) {
      return { error: "Booking not found" }
    }

    if (booking.invitee_id !== user.id) {
      return { error: "Unauthorized" }
    }

    // Check wallet balance (use maybeSingle – wallet may not exist yet)
    const { data: wallet } = await supabase.from("wallets").select("balance, held_balance").eq("user_id", user.id).maybeSingle()

    if (!wallet || (wallet.balance ?? 0) < 5) {
      return { error: "Insufficient wallet balance. Please add funds." }
    }

    // Deduct £5 from wallet and hold (booking_deposits rows created by trigger when dana_events is inserted on confirm)
    await supabase
      .from("wallets")
      .update({
        balance: wallet.balance - 5,
        held_balance: (wallet.held_balance || 0) + 5,
      })
      .eq("user_id", user.id)

    // Mark invitee as paid (RPC sets invitee_paid on date_invites; inviter must have paid first)
    const { error: rpcError } = await supabase.rpc("mark_invitee_paid", { p_invite_id: validated.bookingId })
    if (rpcError) {
      return { error: rpcError.message || "Could not mark payment" }
    }

    // Send confirmation emails (venue credit code is created when inviter confirms via confirm_dana_booking)
    const inviterEmail = (booking.inviter as { email?: string })?.email
    const inviteeEmail = (booking.invitee as { email?: string })?.email
    const inviterFirstName = (booking.inviter as { first_name?: string })?.first_name ?? "Your date"
    const inviteeFirstName = (booking.invitee as { first_name?: string })?.first_name ?? "Your date"
    const venueName = (booking.venue as { name?: string })?.name ?? "the venue"

    if (inviterEmail) {
      await sendEmail({
        to: inviterEmail,
        subject: "Date deposit paid",
        html: `<h1>Great news!</h1><p>${inviteeFirstName} has paid their deposit for your date invitation.</p><p>You can now confirm the booking from your invite (once both have paid).</p><p>Venue: ${venueName}</p>`,
      })
    }
    if (inviteeEmail) {
      await sendEmail({
        to: inviteeEmail,
        subject: "Deposit received",
        html: `<h1>Deposit received</h1><p>Your £5 deposit for the date with ${inviterFirstName} has been received.</p><p>Once the inviter confirms the booking, you'll get venue credit details.</p><p>Venue: ${venueName}</p>`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Accept booking error:", error)
    return { error: "Failed to accept booking" }
  }
}

export async function declineBooking(bookingId: string, reason?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const validated = bookingActionSchema.parse({ bookingId, action: "decline", reason })

    const { data: booking } = await supabase
      .from("date_invites")
      .select("*, inviter:profiles!inviter_id(*)")
      .eq("id", validated.bookingId)
      .single()

    if (!booking) {
      return { error: "Booking not found" }
    }

    // Update booking status (no accept_status column; use status only)
    await supabase
      .from("date_invites")
      .update({
        decline_reason: sanitizeInput(reason || ""),
        status: "declined",
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.bookingId)

    // Refund inviter's £5 if they had already paid
    const inviterId = (booking as { inviter_id: string }).inviter_id
    const { data: inviterWallet } = await supabase
      .from("wallets")
      .select("balance, held_balance")
      .eq("user_id", inviterId)
      .single()

    if (inviterWallet) {
      await supabase
        .from("wallets")
        .update({
          balance: inviterWallet.balance + 5,
          held_balance: Math.max(0, (inviterWallet.held_balance || 0) - 5),
        })
        .eq("user_id", inviterId)

      await supabase.from("wallet_transactions").insert({
        user_id: inviterId,
        type: "refund",
        amount: 5.0,
        description: "Booking declined - deposit refunded",
        status: "completed",
      })
    }

    const inviterEmail = (booking.inviter as { email?: string })?.email
    if (inviterEmail) {
      await sendEmail({
        to: inviterEmail,
        subject: "Date Invitation Declined",
        html: `<h1>Update on your invitation</h1><p>Unfortunately, your date invitation has been declined.</p><p>Your £5 deposit has been refunded to your wallet.</p>`,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Decline booking error:", error)
    return { error: "Failed to decline booking" }
  }
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const validated = bookingActionSchema.parse({ bookingId, action: "cancel", reason })

    const { data: booking } = await supabase
      .from("date_invites")
      .select("*, inviter:profiles!inviter_id(*), invitee:profiles!invitee_id(*)")
      .eq("id", validated.bookingId)
      .single()

    if (!booking) {
      return { error: "Booking not found" }
    }

    const b = booking as { proposed_date: string; proposed_time: string }
    const bookingDate = new Date(`${b.proposed_date}T${b.proposed_time}`)
    const now = new Date()
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundAmount = 0
    let refundMessage = ""

    // Refund policy
    if (hoursUntilBooking >= 48) {
      refundAmount = 10 // Full refund for both parties
      refundMessage = "Full refund issued (48+ hours notice)"
    } else if (hoursUntilBooking >= 24) {
      refundAmount = 5 // Partial refund
      refundMessage = "Partial refund issued (24-48 hours notice)"
    } else {
      refundAmount = 0 // No refund
      refundMessage = "No refund (less than 24 hours notice)"
    }

    await supabase
      .from("date_invites")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", validated.bookingId)

    const inviterId = (booking as { inviter_id: string }).inviter_id
    const inviteeId = (booking as { invitee_id: string }).invitee_id

    if (refundAmount > 0) {
      for (const userId of [inviterId, inviteeId]) {
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle()

        if (wallet) {
          const refundPerPerson = refundAmount / 2
          await supabase
            .from("wallets")
            .update({
              balance: wallet.balance + refundPerPerson,
              held_balance: Math.max(0, (wallet.held_balance || 0) - refundPerPerson),
            })
            .eq("user_id", userId)

          await supabase.from("wallet_transactions").insert({
            user_id: userId,
            type: "refund",
            amount: refundPerPerson,
            description: `Booking cancelled - ${refundMessage}`,
            status: "completed",
          })
        }
      }
    }

    const inviterEmail = (booking.inviter as { email?: string })?.email
    const inviteeEmail = (booking.invitee as { email?: string })?.email
    if (inviterEmail) {
      await sendEmail({
        to: inviterEmail,
        subject: "Booking Cancelled",
        html: `<h1>Booking Cancelled</h1><p>Your booking has been cancelled.</p><p>${refundMessage}</p>`,
      })
    }
    if (inviteeEmail) {
      await sendEmail({
        to: inviteeEmail,
        subject: "Booking Cancelled",
        html: `<h1>Booking Cancelled</h1><p>The booking has been cancelled.</p><p>${refundMessage}</p>`,
      })
    }

    return { success: true, message: refundMessage }
  } catch (error) {
    console.error("Cancel booking error:", error)
    return { error: "Failed to cancel booking" }
  }
}

/** Validate venue credit code for current user. Codes are per-booking (venue_credit_codes); not added to wallet – use at venue. */
export async function applyPromoCode(code: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const validated = promoCodeSchema.parse({ code: sanitizeInput(code.toUpperCase()) })

    const { data: credit, error: creditError } = await supabase
      .from("venue_credit_codes")
      .select("id, code, date_invite_id, valid_from, valid_until, used_at")
      .eq("code", validated.code)
      .single()

    if (creditError || !credit) {
      return { error: "Invalid or unknown venue credit code" }
    }

    const { data: invite } = await supabase
      .from("date_invites")
      .select("inviter_id, invitee_id")
      .eq("id", credit.date_invite_id)
      .single()

    if (!invite || (invite.inviter_id !== user.id && invite.invitee_id !== user.id)) {
      return { error: "This code is not for your booking" }
    }

    if (credit.used_at) {
      return { error: "This venue credit has already been used" }
    }

    const now = new Date()
    if (new Date(credit.valid_until) < now) {
      return { error: "Venue credit has expired" }
    }
    if (new Date(credit.valid_from) > now) {
      return { error: "Venue credit is not yet valid" }
    }

    return { success: true, message: "Venue credit valid. Use this code at the venue." }
  } catch (error) {
    console.error("Apply promo code error:", error)
    return { error: "Failed to validate venue credit code" }
  }
}

export async function generateCalendarEvent(bookingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { data: booking } = await supabase
      .from("date_invites")
      .select("*, venue:venues(*), inviter:profiles!inviter_id(*), invitee:profiles!invitee_id(*)")
      .eq("id", bookingId)
      .single()

    if (!booking) {
      return { error: "Booking not found" }
    }

    const b = booking as { proposed_date: string; proposed_time: string }
    const startDate = new Date(`${b.proposed_date}T${b.proposed_time}`)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const otherPerson = (booking as { inviter_id: string }).inviter_id === user.id ? booking.invitee : booking.inviter

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DANA//Date Booking//EN
BEGIN:VEVENT
UID:${booking.id}@dana.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:DANA Date with ${otherPerson.first_name}
LOCATION:${booking.venue.name}, ${booking.venue.address}
DESCRIPTION:Your DANA date at ${booking.venue.name}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    return { success: true, icsContent }
  } catch (error) {
    console.error("Generate calendar event error:", error)
    return { error: "Failed to generate calendar event" }
  }
}
