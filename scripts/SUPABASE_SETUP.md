# Supabase setup – fix "Could not find the table 'public.profiles'"

The app expects tables in your Supabase project (especially `public.profiles`). If you see:

- **"Could not find the table 'public.profiles' in the schema cache"**
- **"Profile load timeout"**

then the schema has not been applied yet.

## Option A: Full schema (recommended)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **SQL Editor** → **New query**.
3. Open **`public/dana_complete_database_schema.sql`** in your editor, select all (Ctrl+A), copy.
4. Paste into the SQL Editor and click **Run**.
5. If the trigger fails with a syntax error, change `EXECUTE FUNCTION` to `EXECUTE PROCEDURE` on the last line of Section 1 and run again.
6. (Optional) After you have signed up, run Section 15 to set super_admin:  
   `UPDATE profiles SET user_role = 'super_admin' WHERE email = 'your@email.com';`

This creates: profiles, profile_photos, user_preferences, quiz_questions, quiz_responses, connections, venues, date_invites, community_posts, notifications, wallets, wallet_transactions, analytics_events, deals, plus RLS and seed data.

## Option B: Minimal (profiles only)

If you only want the bare minimum to fix profile load:

1. Supabase Dashboard → SQL Editor → New query.
2. Copy the contents of **`scripts/RUN_THIS_IN_SUPABASE.sql`** (profiles table + trigger only).
3. Paste and Run.

## Env and restart

- **Next.js:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- **Mobile:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env` or `app.config.js`.

Restart the dev server after changing env or running SQL.
