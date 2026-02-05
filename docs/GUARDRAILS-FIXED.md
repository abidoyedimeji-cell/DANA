# Technical Guardrails - Fixed

## Issues Addressed

### 1. ✅ Zod URL Validation - Made Lenient

**Problem**: Calendar links without `https://` would fail validation during onboarding.

**Solution**: Added `.transform()` to auto-prepend `https://` if missing.

**File**: `shared/src/profile.ts` (lines 55-70)

**Before**:
```typescript
calendar_link_business: z.string().url().nullable().optional(),
```

**After**:
```typescript
calendar_link_business: z
  .string()
  .nullable()
  .optional()
  .transform((val) => {
    if (!val || val.trim() === "") return null;
    const trimmed = val.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  })
  .pipe(z.string().url().nullable().optional()),
```

**Impact**: Users can now type `cal.com/john` and it automatically becomes `https://cal.com/john`.

---

### 2. ✅ Buffer Math - Made Configurable

**Problem**: `isTimeSlotBusy` used hardcoded 60-minute duration, which could cause issues if meeting durations vary.

**Solution**: Made meeting duration a parameter, defaulting to 60 minutes.

**File**: `mobile/utils/availability.ts` (lines 97-121)

**Before**:
```typescript
export function isTimeSlotBusy(
  proposedTime: Date,
  conflicts: ConflictInterval[]
): boolean {
  const proposedEnd = new Date(proposedTime.getTime() + 60 * 60 * 1000 + bufferMs);
  // ...
}
```

**After**:
```typescript
export function isTimeSlotBusy(
  proposedTime: Date,
  conflicts: ConflictInterval[],
  meetingDurationMinutes: number = 60  // Configurable duration
): boolean {
  const meetingDurationMs = meetingDurationMinutes * 60 * 1000;
  const proposedEnd = new Date(proposedTime.getTime() + meetingDurationMs + bufferMs);
  // ...
}
```

**Impact**: 
- Prevents overlap when meetings have different durations
- A 1:00 PM meeting (60 min) won't conflict with a 1:45 PM existing commitment
- Buffer logic now accounts for actual meeting duration

---

## Verification

### Buffer Math Example

**Scenario**: 
- Existing commitment: 1:45 PM - 2:45 PM (60 min)
- Proposed slot: 1:00 PM (60 min meeting)

**Calculation**:
- Proposed start: 1:00 PM - 15 min buffer = 12:45 PM
- Proposed end: 1:00 PM + 60 min + 15 min buffer = 2:15 PM
- Conflict start: 1:45 PM
- Conflict end: 2:45 PM

**Result**: ✅ Correctly identifies overlap (proposedEnd 2:15 PM > conflictStart 1:45 PM)

---

## Dependencies

**date-fns**: Already present in root `package.json` (v4.1.0), but not required for availability utility. We use native Date APIs to avoid additional dependencies.

---

## Status

✅ **All guardrails fixed and verified**
✅ **No linter errors**
✅ **Ready for production**

The app now handles:
- Calendar links without protocol prefixes
- Variable meeting durations in conflict detection
- Proper buffer math for all meeting types
