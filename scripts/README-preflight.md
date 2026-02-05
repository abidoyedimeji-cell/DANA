# DANA Pre-flight Health Check

## Purpose

The preflight script validates that your database schema matches your TypeScript types. This prevents "stacking" features without running migrations, which is the #1 cause of dev build failures.

## Quick Start

1. **Run the helper SQL** (one-time setup):
   ```sql
   -- In Supabase SQL Editor, run:
   scripts/025_health_check_helper.sql
   ```

2. **Run the health check**:
   ```bash
   pnpm health-check
   # or
   pnpm preflight:db
   ```

3. **Before starting dev server**:
   ```bash
   pnpm health-check && pnpm mobile:start
   ```

## What It Checks

The script validates that all required columns exist in your database:

- **profiles**: Tiered Trust fields, Contextual Identity fields, Calendar links
- **meeting_requests**: Intent types, durations, proposed times
- **venues**: Suitability tags, business amenities
- **date_invites**: Duration tracking

## When to Run

- ✅ **Before starting dev server** (catch missing migrations)
- ✅ **After pulling new migrations** (verify they ran)
- ✅ **Before deploying** (ensure production schema matches)
- ✅ **When app won't load** (diagnose schema mismatches)

## Adding New Fields

When you add a new feature that requires a database column:

1. Add the column to your migration script
2. Add it to `REQUIRED_SCHEMA` in `scripts/dana-preflight.ts`
3. Run the migration
4. Run `pnpm health-check` to verify

## Example Output

### ✅ Success
```
🔍 DANA Pre-flight: Checking the stack...

📡 Testing database connection...
✅ Database reachable

📋 Checking table: profiles
   ✅ bio_social
   ✅ professional_intents
   ✅ calendar_link_business
   ...

✨ All systems go. Stack is healthy.
   Safe to boot the dev server.
```

### ❌ Failure
```
🚨 MISSING: duration_minutes

❌ Schema sync failed. Fix the following:
   • Table meeting_requests: Missing columns: duration_minutes

💡 Run the missing migrations in Supabase SQL Editor:
   - scripts/024_calendar_optimization_and_durations.sql
```

## Troubleshooting

**"Helper function missing"**
- Run `scripts/025_health_check_helper.sql` in Supabase SQL Editor

**"Database connection failed"**
- Check your `.env` file has `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**"Table not found"**
- Run the migration scripts in order (020 → 025)

## Why This Matters

Without this check, you might:
- Add code that expects `duration_minutes` but the DB doesn't have it
- Get cryptic "Cannot read property of undefined" errors
- Waste hours debugging when a simple migration would fix it

With this check, you catch schema mismatches **before** the app tries to load.
