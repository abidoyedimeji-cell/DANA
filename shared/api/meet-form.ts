export * from "../src/api/meet-form";
/**
 * Meet form – check window and submit completion.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function meetFormWindowOpen(
  supabase: SupabaseClient,
  dateInviteId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("meet_form_window_open", {
    p_date_invite_id: dateInviteId,
  });
  if (error) throw error;
  return Boolean(data);
}

export async function submitMeetFormCompletion(
  supabase: SupabaseClient,
  dateInviteId: string,
  answers?: Record<string, unknown>
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("meet_form_completions").insert({
    date_invite_id: dateInviteId,
    user_id: user.id,
    answers: answers ?? {},
  });
  if (error) throw error;
}
