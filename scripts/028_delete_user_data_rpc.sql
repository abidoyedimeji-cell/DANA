-- =====================================================
-- DANA Delete User Data RPC (GDPR/CCPA Compliance)
-- Allows users to delete all their data from the platform
-- =====================================================

BEGIN;

-- Create RPC function to delete all user data
CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verify the user is authenticated and can only delete their own data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure user can only delete their own data
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Can only delete your own data';
  END IF;

  v_user_id := p_user_id;

  -- Delete in order of dependencies (child tables first)
  -- Note: Most tables have ON DELETE CASCADE, but we'll be explicit for clarity

  -- Delete user's connections (both as requester and receiver)
  DELETE FROM public.connections WHERE requester_id = v_user_id OR receiver_id = v_user_id;

  -- Delete user's meeting requests (both as sender and receiver)
  DELETE FROM public.meeting_requests WHERE sender_id = v_user_id OR receiver_id = v_user_id;

  -- Delete user's date invites (both as inviter and invitee)
  DELETE FROM public.date_invites WHERE inviter_id = v_user_id OR invitee_id = v_user_id;

  -- Delete user's availability blocks
  DELETE FROM public.dana_availability WHERE user_id = v_user_id;

  -- Delete user's dana events (as host or guest)
  DELETE FROM public.dana_events WHERE host_id = v_user_id OR guest_id = v_user_id;

  -- Delete user's dana holds
  DELETE FROM public.dana_table_holds WHERE host_id = v_user_id OR guest_id = v_user_id;

  -- Delete user's booking deposits
  DELETE FROM public.booking_deposits WHERE user_id = v_user_id;

  -- Delete user's booking swaps
  DELETE FROM public.booking_swaps WHERE EXISTS (
    SELECT 1 FROM public.date_invites di 
    WHERE di.id = booking_swaps.date_invite_id 
    AND (di.inviter_id = v_user_id OR di.invitee_id = v_user_id)
  );

  -- Delete user's reviews (as reviewer or reviewee)
  DELETE FROM public.reviews WHERE reviewer_id = v_user_id OR reviewee_id = v_user_id;

  -- Delete user's verifications
  DELETE FROM public.verifications WHERE profile_id = v_user_id;

  -- Delete user's quiz questions and responses
  DELETE FROM public.quiz_responses WHERE responder_id = v_user_id;
  DELETE FROM public.quiz_questions WHERE user_id = v_user_id;

  -- Delete user's community posts
  DELETE FROM public.community_posts WHERE user_id = v_user_id;

  -- Delete user's notifications
  DELETE FROM public.notifications WHERE user_id = v_user_id;

  -- Delete user's wallet transactions
  DELETE FROM public.wallet_transactions WHERE user_id = v_user_id;

  -- Delete user's wallet
  DELETE FROM public.wallets WHERE user_id = v_user_id;

  -- Delete user's preferences
  DELETE FROM public.user_preferences WHERE user_id = v_user_id;

  -- Delete user's profile photos
  DELETE FROM public.profile_photos WHERE user_id = v_user_id;

  -- Delete user's professional data
  DELETE FROM public.professional_experience WHERE user_id = v_user_id;
  DELETE FROM public.skills WHERE user_id = v_user_id;
  DELETE FROM public.education WHERE user_id = v_user_id;

  -- Delete user's analytics events
  DELETE FROM public.analytics_events WHERE user_id = v_user_id;

  -- Finally, delete the profile (this will cascade to auth.users via ON DELETE CASCADE)
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- Note: auth.users deletion happens automatically via CASCADE
  -- If you need to keep auth.users but delete profile data, remove the CASCADE
  -- and handle auth.users deletion separately

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO authenticated;

COMMENT ON FUNCTION public.delete_user_data(UUID) IS 
  'GDPR/CCPA compliant user data deletion. Deletes all user data including profile, connections, bookings, and related records.';

COMMIT;
