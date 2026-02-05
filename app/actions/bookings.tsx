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
    // Validate input
    const validated = bookingActionSchema.parse({ bookingId, action: "accept" })

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("date_invites")
      .select("*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*), venue:venues(*)")
      .eq("id", validated.bookingId)
      .single()

    if (bookingError || !booking) {
      return { error: "Booking not found" }
    }

    if (booking.recipient_id !== user.id) {
      return { error: "Unauthorized" }
    }

    // Check wallet balance
    const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()

    if (!wallet || wallet.balance < 5) {
      return { error: "Insufficient wallet balance. Please add funds." }
    }

    // Deduct £5 from wallet and hold
    await supabase
      .from("wallets")
      .update({
        balance: wallet.balance - 5,
        held_balance: (wallet.held_balance || 0) + 5,
      })
      .eq("user_id", user.id)

    // Create booking payment record with 7-day hold
    const holdUntil = new Date()
    holdUntil.setDate(holdUntil.getDate() + 7)

    await supabase.from("booking_payments").insert({
      booking_id: validated.bookingId,
      user_id: user.id,
      amount: 5.0,
      status: "held",
      hold_until: holdUntil.toISOString(),
    })

    // Update booking status
    await supabase
      .from("date_invites")
      .update({
        accept_status: "accepted",
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", validated.bookingId)

    // Generate £10 promo code for both parties
    const promoCode = `DANA${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30) // Valid for 30 min after booking start

    await supabase.from("promo_codes").insert([
      {
        code: promoCode,
        amount: 10.0,
        booking_id: validated.bookingId,
        created_for_user_id: booking.sender_id,
        valid_until: expiresAt.toISOString(),
      },
      {
        code: promoCode,
        amount: 10.0,
        booking_id: validated.bookingId,
        created_for_user_id: booking.recipient_id,
        valid_until: expiresAt.toISOString(),
      },
    ])

    // Send confirmation emails
    await sendEmail({
      to: booking.sender.email,
      subject: "Date Confirmed!",
      html: `<h1>Great news!</h1><p>${booking.recipient.first_name} has accepted your date invitation.</p><p>Your promo code: <strong>${promoCode}</strong></p><p>Use it at ${booking.venue.name} within 30 minutes of your booking time.</p>`,
    })

    await sendEmail({
      to: booking.recipient.email,
      subject: "Date Confirmed!",
      html: `<h1>Booking Confirmed!</h1><p>You've accepted the date with ${booking.sender.first_name}.</p><p>Your promo code: <strong>${promoCode}</strong></p><p>Use it at ${booking.venue.name} within 30 minutes of your booking time.</p>`,
    })

    return { success: true, promoCode }
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
      .select("*, sender:profiles!sender_id(*)")
      .eq("id", validated.bookingId)
      .single()

    if (!booking) {
      return { error: "Booking not found" }
    }

    // Update booking status
    await supabase
      .from("date_invites")
      .update({
        accept_status: "declined",
        decline_reason: sanitizeInput(reason || ""),
        status: "cancelled",
      })
      .eq("id", validated.bookingId)

    // Refund sender's £5
    const { data: senderWallet } = await supabase
      .from("wallets")
      .select("balance, held_balance")
      .eq("user_id", booking.sender_id)
      .single()

    if (senderWallet) {
      await supabase
        .from("wallets")
        .update({
          balance: senderWallet.balance + 5,
          held_balance: Math.max(0, (senderWallet.held_balance || 0) - 5),
        })
        .eq("user_id", booking.sender_id)

      await supabase.from("wallet_transactions").insert({
        user_id: booking.sender_id,
        type: "refund",
        amount: 5.0,
        description: "Booking declined - deposit refunded",
        status: "completed",
      })
    }

    // Send notification email
    await sendEmail({
      to: booking.sender.email,
      subject: "Date Invitation Declined",
      html: `<h1>Update on your invitation</h1><p>Unfortunately, your date invitation has been declined.</p><p>Your £5 deposit has been refunded to your wallet.</p>`,
    })

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
      .select("*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)")
      .eq("id", validated.bookingId)
      .single()

    if (!booking) {
      return { error: "Booking not found" }
    }

    const bookingDate = new Date(booking.date_time)
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

    // Update booking
    await supabase
      .from("date_invites")
      .update({
        status: "cancelled",
      })
      .eq("id", validated.bookingId)

    // Process refunds if applicable
    if (refundAmount > 0) {
      for (const userId of [booking.sender_id, booking.recipient_id]) {
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single()

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

    // Send emails
    await sendEmail({
      to: booking.sender.email,
      subject: "Booking Cancelled",
      html: `<h1>Booking Cancelled</h1><p>Your booking has been cancelled.</p><p>${refundMessage}</p>`,
    })

    await sendEmail({
      to: booking.recipient.email,
      subject: "Booking Cancelled",
      html: `<h1>Booking Cancelled</h1><p>The booking has been cancelled.</p><p>${refundMessage}</p>`,
    })

    return { success: true, message: refundMessage }
  } catch (error) {
    console.error("Cancel booking error:", error)
    return { error: "Failed to cancel booking" }
  }
}

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

    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", validated.code)
      .eq("created_for_user_id", user.id)
      .is("used_by_user_id", null)
      .single()

    if (promoError || !promo) {
      return { error: "Invalid or already used promo code" }
    }

    if (new Date(promo.valid_until) < new Date()) {
      return { error: "Promo code has expired" }
    }

    // Apply promo code
    const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

    if (!wallet) {
      return { error: "Wallet not found" }
    }

    await supabase
      .from("wallets")
      .update({
        balance: wallet.balance + promo.amount,
      })
      .eq("user_id", user.id)

    await supabase
      .from("promo_codes")
      .update({
        used_by_user_id: user.id,
        used_at: new Date().toISOString(),
        times_used: (promo.times_used || 0) + 1,
      })
      .eq("id", promo.id)

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: promo.amount,
      description: `Promo code applied: ${validated.code}`,
      status: "completed",
    })

    return { success: true, amount: promo.amount }
  } catch (error) {
    console.error("Apply promo code error:", error)
    return { error: "Failed to apply promo code" }
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
      .select("*, venue:venues(*), sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)")
      .eq("id", bookingId)
      .single()

    if (!booking) {
      return { error: "Booking not found" }
    }

    const startDate = new Date(booking.date_time)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const otherPerson = booking.sender_id === user.id ? booking.recipient : booking.sender

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
