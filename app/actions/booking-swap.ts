"use server"

import { createClient } from "@/lib/supabase/server"

const SWAP_FEE = 1.99

/**
 * Charge the inviter £1.99 and execute the booking swap. Only the inviter can call this.
 */
export async function chargeAndExecuteSwap(
  dateInviteId: string,
  newVenueId: string,
  newTimeSlot: string,
  newProposedDate?: string,
  newProposedTime?: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: invite, error: inviteError } = await supabase
    .from("date_invites")
    .select("inviter_id")
    .eq("id", dateInviteId)
    .single()

  if (inviteError || !invite) return { error: "Invite not found" }
  if (invite.inviter_id !== user.id) return { error: "Only the inviter can reschedule" }

  const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle()
  if (!wallet || (wallet.balance ?? 0) < SWAP_FEE) {
    return { error: "Insufficient balance. Add funds to pay the £1.99 swap fee." }
  }

  await supabase
    .from("wallets")
    .update({ balance: (wallet.balance ?? 0) - SWAP_FEE })
    .eq("user_id", user.id)

  const { error: rpcError } = await supabase.rpc("execute_booking_swap", {
    p_date_invite_id: dateInviteId,
    p_new_venue_id: newVenueId,
    p_new_time_slot: newTimeSlot,
    p_new_proposed_date: newProposedDate ?? null,
    p_new_proposed_time: newProposedTime ?? null,
  })

  if (rpcError) {
    await supabase
      .from("wallets")
      .update({ balance: (wallet.balance ?? 0) + SWAP_FEE })
      .eq("user_id", user.id)
    return { error: rpcError.message }
  }

  return {}
}
