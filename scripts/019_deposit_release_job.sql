-- Deposit release job: mark eligible held deposits as released_to_stripe.
-- Run periodically (e.g. daily via pg_cron or Edge Function).
-- Eligible: status = 'held', created_at + 7 days < now(), no dispute (status not 'disputed').
-- After this, your app should trigger Stripe payout for the released amounts.

CREATE OR REPLACE FUNCTION public.release_eligible_booking_deposits()
RETURNS TABLE (id UUID, date_invite_id UUID, user_id UUID, amount DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH updated AS (
    UPDATE public.booking_deposits
    SET status = 'released_to_stripe', released_at = NOW()
    WHERE booking_deposits.status = 'held'
      AND booking_deposits.created_at + interval '7 days' < NOW()
    RETURNING booking_deposits.id, booking_deposits.date_invite_id, booking_deposits.user_id, booking_deposits.amount
  )
  SELECT updated.id, updated.date_invite_id, updated.user_id, updated.amount FROM updated;
END;
$$;

-- Grant to service role or authenticated (cron/edge function typically uses service role).
-- GRANT EXECUTE ON FUNCTION public.release_eligible_booking_deposits() TO service_role;

COMMENT ON FUNCTION public.release_eligible_booking_deposits() IS
  'Marks booking_deposits with status=held and created_at+7 days < now() as released_to_stripe. Returns the released rows. Call Stripe payout logic after.';
