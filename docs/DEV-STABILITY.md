# DANA Dev Stability Guide

## Why Your App Won't Stop Loading (Even When Stacking Features)

### The Architecture Advantage

Your app is built on a **Schema-Driven** foundation, not a "Graphics-Heavy" foundation. This means:

✅ **Logic Stacking** = Safe (TypeScript types, Zod schemas, utilities)  
❌ **Asset Stacking** = Risky (large images, videos, 3D models)

### What Makes DANA Stable

1. **Shared Schema Pattern**
   - One source of truth (`shared/src/profile.ts`)
   - Database migrations match TypeScript types
   - No "Type Collisions" between Business/Social modes

2. **Modular Architecture**
   - Small, focused files (`availability.ts`, `calendarSync.ts`)
   - Fast hot-reloads (Metro only rebuilds what changed)
   - No circular dependencies

3. **Defensive Programming**
   - Health check catches schema mismatches **before** dev starts
   - Fallback logic (manual time proposal if calendar sync fails)
   - Buffer checks prevent infinite loops

## The Health Check System

### Setup (One-Time)

```bash
# 1. Run helper SQL in Supabase
# Execute: scripts/025_health_check_helper.sql

# 2. Install tsx (if not already)
pnpm add -D tsx

# 3. Run health check
pnpm health-check
```

### Daily Workflow

```bash
# Before starting dev server
pnpm health-check && pnpm mobile:start

# If health check fails, it tells you exactly which migration to run
```

## Red Flags That Stop Dev Loads

### 1. Schema Mismatch (Most Common)
**Symptom**: "Cannot read property 'duration_minutes' of undefined"  
**Cause**: Code expects field, DB doesn't have it  
**Fix**: Run `pnpm health-check` → Run missing migration

### 2. Missing Env Variables
**Symptom**: White screen on startup  
**Cause**: `EXPO_PUBLIC_SUPABASE_URL` not set  
**Fix**: Check `.env` file

### 3. Infinite Re-render Loop
**Symptom**: Dev server freezes, Metro bundler crashes  
**Cause**: `useEffect` with wrong dependencies  
**Fix**: Check dependency arrays in:
- `mobile/app/profile-building.tsx`
- `mobile/components/Connection/ConnectionRequestModal.tsx`
- `mobile/components/providers/ContextModeProvider.tsx`

### 4. Supabase Realtime Overload
**Symptom**: Slow dev server, high memory usage  
**Cause**: Realtime subscriptions on too many tables  
**Fix**: Only enable Realtime on:
- `messages` (chat)
- `meeting_requests` (notifications)

## Stacking Safely

### ✅ Safe to Stack

- **New Zod schemas** (`shared/src/validation/schemas.ts`)
- **New utility functions** (`shared/src/utils/`)
- **New API functions** (`shared/src/api/`)
- **New UI components** (small, focused files)
- **New database columns** (with migration + health check update)

### ⚠️ Watch Out For

- **Large images** (use Supabase Storage, not bundled assets)
- **Heavy native modules** (AR, Bluetooth, intensive background processing)
- **Recursive contexts** (ContextModeProvider triggering app-wide refresh)
- **Missing migrations** (always run health check first)

## The Preflight Checklist

Before starting dev server:

- [ ] Run `pnpm health-check` (green = safe to proceed)
- [ ] Check `.env` has Supabase credentials
- [ ] Verify no circular dependencies (`pnpm type-check`)
- [ ] Clear cache if previous build failed (`pnpm mobile:start --clear`)

## Why You're in a Good Place

1. **No Asset Bloat**: Using Supabase Storage links, not bundled images
2. **Schema-Driven**: Database is the source of truth, UI follows
3. **Modular Code**: Small files = fast rebuilds
4. **Health Check**: Catches problems before they crash dev

## When Dev Won't Load

### Step 1: Run Health Check
```bash
pnpm health-check
```

### Step 2: Check Error Output
- If schema mismatch → Run missing migration
- If connection error → Check `.env`
- If RPC error → Run `025_health_check_helper.sql`

### Step 3: Clear Cache
```bash
pnpm clean
pnpm install
pnpm mobile:start --clear
```

### Step 4: Check for Infinite Loops
- Open React DevTools Profiler
- Look for components re-rendering thousands of times
- Check `useEffect` dependency arrays

## Maintenance

### Adding a New Feature

1. **Create migration** (`scripts/XXX_feature_name.sql`)
2. **Update shared types** (`shared/src/profile.ts` or `types/index.ts`)
3. **Update health check** (`scripts/dana-preflight.ts` → add to `REQUIRED_SCHEMA`)
4. **Run migration** (Supabase SQL Editor)
5. **Run health check** (`pnpm health-check`)
6. **Start dev** (`pnpm mobile:start`)

### Updating Required Schema

When you add a new column, update `REQUIRED_SCHEMA` in `scripts/dana-preflight.ts`:

```typescript
const REQUIRED_SCHEMA: Record<string, string[]> = {
  profiles: [
    // ... existing fields
    "your_new_field", // Add here
  ],
};
```

## Summary

Your app is **architecturally sound** for stacking features. The health check system ensures you catch schema mismatches before they crash dev. As long as you:

1. Run health check before starting dev
2. Keep migrations in sync with TypeScript types
3. Avoid asset bloat and infinite loops

Your dev environment will remain stable even as you add Mentorship, Investing, Quizzes, and more.
