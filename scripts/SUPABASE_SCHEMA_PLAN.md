# Supabase schema alignment with shared domain

This document aligns the DB schema, RLS, and indexes with `shared/types` and `shared/validation/schemas`.

## Existing tables (aligned)

### profiles
- **Types:** `Profile`, `User` (auth.users).
- **RLS:** select all; insert/update/delete own. Trigger `handle_new_user` creates profile on signup.
- **Audit:** `created_at`, `updated_at` (add `updated_at` trigger if missing).
- **Enums:** `profile_mode` CHECK ('dating','business','both').

### venues
- **Types:** `Venue`.
- **RLS:** SELECT all (public discovery); INSERT/UPDATE/DELETE for admin only (add admin policies if needed).
- **Audit:** `created_at`. Add `updated_at` if needed.
- **Indexes:** `CREATE INDEX IF NOT EXISTS idx_venues_category ON venues(category);` `CREATE INDEX IF NOT EXISTS idx_venues_is_partner ON venues(is_partner);` for discovery.

### date_invites
- **Types:** `DateRequest`, `Date`.
- **RLS:** SELECT/UPDATE where inviter_id or invitee_id = auth.uid(); INSERT with CHECK inviter_id = auth.uid().
- **Audit:** `created_at`, `updated_at`.
- **Status enum:** CHECK (status IN ('pending','accepted','declined','cancelled','completed')).
- **Indexes:** `CREATE INDEX IF NOT EXISTS idx_date_invites_inviter ON date_invites(inviter_id);` `CREATE INDEX IF NOT EXISTS idx_date_invites_invitee ON date_invites(invitee_id);` `CREATE INDEX IF NOT EXISTS idx_date_invites_status ON date_invites(status);`

---

## New tables (migrations to add)

### event_slots (venue availability)
```sql
CREATE TABLE IF NOT EXISTS public.event_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2 CHECK (max_guests >= 1 AND max_guests <= 20),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.event_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_slots_select_all" ON public.event_slots FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_event_slots_venue ON public.event_slots(venue_id);
CREATE INDEX IF NOT EXISTS idx_event_slots_start ON public.event_slots(slot_start);
```

### reviews (post-date review)
```sql
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_request_id UUID NOT NULL REFERENCES public.date_invites(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date_request_id, reviewer_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_own" ON public.reviews FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
```

### verifications (id/selfie verification)
```sql
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('id_scan','selfie')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verifications_select_own" ON public.verifications FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "verifications_insert_own" ON public.verifications FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE INDEX IF NOT EXISTS idx_verifications_profile ON public.verifications(profile_id);
```

---

## Migration files to create

1. `scripts/009_event_slots.sql` – event_slots table + RLS + indexes.
2. `scripts/010_reviews.sql` – reviews table + RLS + indexes.
3. `scripts/011_verifications.sql` – verifications table + RLS + indexes.
4. `scripts/012_indexes_date_invites_venues.sql` – indexes on date_invites and venues if not present.

Apply in order after existing migrations.
