# Mobile routes checklist

For each route: **wired** (navigation), **data-backed** (real or stubbed API), **validated** (Zod/input), **RLS-safe** (via shared API only), **tested** (manual/automated).

All tab routes are **gated** by root: user + profile + `profile_mode` set (onboarding complete). Auth routes **redirect** to tabs or onboarding when already logged in.

## Root & auth

| Route | Wired | Data-backed | Validated | RLS-safe | Tested |
|-------|-------|-------------|-----------|----------|--------|
| `/` (index) | ✅ | ✅ (auth + profile) | — | ✅ | ⬜ |
| `/(auth)/login` | ✅ | ✅ (signIn) | ✅ loginSchema | ✅ | ⬜ |
| `/(auth)/signup` | ✅ | ✅ (signUp) | ✅ signupSchema | ✅ | ⬜ |

## Tabs (gated by auth + profile + profile_mode)

| Route | Wired | Data-backed | Validated | RLS-safe | Tested |
|-------|-------|-------------|-----------|----------|--------|
| `/(tabs)` (layout) | ✅ | — | — | — | ⬜ |
| `/(tabs)/index` (Home) | ✅ | ✅ (useAuth profile) | — | ✅ | ⬜ |
| `/(tabs)/discover` | ✅ | ✅ getVenues | — | ✅ | ⬜ |
| `/(tabs)/profile` | ✅ | ✅ (useAuth profile) | — | ✅ | ⬜ |
| `/(tabs)/connections` | ✅ | Stub (loading/empty/error) | — | ✅ | ⬜ |
| `/(tabs)/bookings` | ✅ | ✅ getDateRequestsForUser | — | ✅ | ⬜ |
| `/(tabs)/community` | ✅ | Stub (loading/empty/error) | — | ✅ | ⬜ |
| `/(tabs)/pricing` | ✅ | Stub (loading/empty/error) | — | ✅ | ⬜ |
| `/(tabs)/wallet` | ✅ | Stub (balance —, auth-gated) | — | ✅ | ⬜ |
| `/(tabs)/spots` | ✅ | ✅ getVenues | — | ✅ | ⬜ |
| `/(tabs)/search` | ✅ | Stub (loading/empty/error) | — | ✅ | ⬜ |
| `/(tabs)/notifications` | ✅ | Stub (loading/empty/error) | — | ✅ | ⬜ |
| `/(tabs)/settings` | ✅ | ✅ (useAuth user/profile) | — | ✅ | ⬜ |

## Onboarding (gated: logged in, no profile_mode)

| Route | Wired | Data-backed | Validated | RLS-safe | Tested |
|-------|-------|-------------|-----------|----------|--------|
| `/onboarding` | ✅ | — | — | — | ⬜ |
| `/onboarding/mode` | ✅ | ✅ setProfileMode | — | ✅ | ⬜ |
| `/onboarding/profile` | ✅ | ✅ updateProfile (optional) | ✅ profileUpdateSchema | ✅ | ⬜ |
| `/onboarding/verify` | ✅ | Stub (skip for now) | — | ✅ | ⬜ |
| `/onboarding/walkthrough` | ✅ | ✅ refreshProfile then nav | — | ✅ | ⬜ |

## Future (date request flow, venue detail, review)

| Route | Wired | Data-backed | Validated | RLS-safe | Tested |
|-------|-------|-------------|-----------|----------|--------|
| Venue detail (e.g. `/venue/[id]`) | ⬜ | getVenueById, getEventSlotsByVenue | — | ✅ | ⬜ |
| Date request create | ⬜ | createDateRequest | dateRequestCreateSchema | ✅ | ⬜ |
| Date confirm/decline | ⬜ | updateDateRequestStatus | dateRequestUpdateStatusSchema | ✅ | ⬜ |
| Post-date review | ⬜ | (reviews API) | reviewSchema | ✅ | ⬜ |
