# DANA Infrastructure Testing Guide

## 🧪 Post-Implementation Verification

This guide walks you through testing the three critical infrastructure components you just implemented.

---

## 1. Database Hardening (RLS Privacy Audit)

### Step 1: Run the Migration
Execute `scripts/027_rls_privacy_audit.sql` in Supabase SQL Editor.

**Expected Result**: Migration completes without errors.

### Step 2: Test the RLS Helper Function

In Supabase SQL Editor, run:

```sql
-- Test as authenticated user (replace with your user ID)
SELECT public.are_users_connected(
  'your-user-id-here'::UUID,
  'another-user-id-here'::UUID
);
```

**Expected Result**: Returns `true` if users are connected, `false` otherwise.

### Step 3: Test Profile Privacy Filtering

**In your mobile/web app:**

```typescript
import { filterSensitiveProfileFields } from 'shared';
import { supabase } from '@/lib/supabase';

// Fetch a profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'target-user-id')
  .single();

// Filter sensitive fields
const filteredProfile = await filterSensitiveProfileFields(
  supabase,
  profile,
  currentUserId,
  currentUserId === profile.id
);

// Check results
console.log('Calendar link (should be null if not connected):', filteredProfile.calendar_link_social);
console.log('Bio social (should be null if not connected):', filteredProfile.bio_social);
```

**Expected Results:**
- ✅ If users are **connected**: `calendar_link_social` and `bio_social` are visible
- ✅ If users are **not connected**: `calendar_link_social` and `bio_social` are `null`
- ✅ **Own profile**: All fields visible regardless of connection status

### Step 4: Manual SQL Test (Acid Test)

In Supabase SQL Editor, as a test user:

```sql
-- This should return ALL profiles (row-level access)
SELECT id, display_name, headline, industry 
FROM public.profiles 
LIMIT 10;

-- But sensitive fields should be filtered in application code
-- The RLS policy allows row access, but your app filters columns
```

**Expected Result**: You can see profile rows, but sensitive columns are filtered by your application code using `filterSensitiveProfileFields`.

---

## 2. Error Boundary (Chaos Test)

### Step 1: Create a Test Error Component

Create `mobile/components/TestErrorBoundary.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/config/theme';

export const TestErrorButton: React.FC = () => {
  const triggerError = () => {
    throw new Error('DANA Stability Test - Error Boundary Verification');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={triggerError}>
      <Text style={styles.text}>🚨 Test Error Boundary</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.destructive,
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
```

### Step 2: Add to a Screen

Temporarily add to any screen (e.g., `mobile/app/(tabs)/profile.tsx`):

```typescript
import { TestErrorButton } from '@/components/TestErrorButton';

// In your component's render:
<TestErrorButton />
```

### Step 3: Trigger the Error

1. Open the app
2. Navigate to the screen with the test button
3. Tap "🚨 Test Error Boundary"

**Expected Result:**
- ✅ App does **NOT** crash with a red screen
- ✅ Shows your custom "Something went wrong" screen
- ✅ "Restart App" button is visible
- ✅ Error is logged to console (check Metro bundler logs)

### Step 4: Test Recovery

1. Tap "Restart App"
2. Navigate away from the error screen

**Expected Result:**
- ✅ App recovers and continues normally
- ✅ No lingering error state

### Step 5: Remove Test Component

**Important**: Remove `TestErrorButton` from your screen after testing!

---

## 3. Terms & Privacy Guard (Compliance Gate)

### Step 1: Run the Migration

Execute `scripts/026_terms_and_privacy_compliance.sql` in Supabase SQL Editor.

**Expected Result**: Migration completes, adds `terms_accepted_at` and `privacy_policy_version` columns.

### Step 2: Reset a Test User's Terms Acceptance

In Supabase SQL Editor:

```sql
-- Reset terms acceptance for testing (replace with test user ID)
UPDATE public.profiles 
SET terms_accepted_at = NULL, privacy_policy_version = NULL
WHERE id = 'test-user-id-here'::UUID;
```

### Step 3: Integrate TermsGuard

Add to `mobile/app/_layout.tsx` or `mobile/components/providers/AuthProvider.tsx`:

```typescript
import { TermsGuard } from '@/components/Auth/TermsGuard';
import { useAuth } from '@/components/providers/AuthProvider';

function RootNavigator() {
  const { user, profile } = useAuth();
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (user && profile && !profile.terms_accepted_at) {
      setShowTerms(true);
    }
  }, [user, profile]);

  return (
    <>
      {/* Your existing navigation */}
      <TermsGuard
        visible={showTerms}
        userId={user?.id || ''}
        onAccepted={() => setShowTerms(false)}
      />
    </>
  );
}
```

### Step 4: Test the Flow

1. Log in with a test account that has `terms_accepted_at = NULL`
2. App should load

**Expected Result:**
- ✅ TermsGuard modal appears immediately
- ✅ Blocks access to main app content
- ✅ Checkbox is unchecked initially
- ✅ "Accept & Enter" button is disabled until checkbox is checked
- ✅ Terms and Privacy links are clickable (open in browser)

### Step 5: Accept Terms

1. Check the "I agree..." checkbox
2. Tap "Accept & Enter"

**Expected Result:**
- ✅ Modal dismisses
- ✅ App content becomes accessible
- ✅ In Supabase: `terms_accepted_at` is set to current timestamp
- ✅ In Supabase: `privacy_policy_version` is set to `'1.0'`

### Step 6: Verify Database

In Supabase SQL Editor:

```sql
SELECT id, display_name, terms_accepted_at, privacy_policy_version
FROM public.profiles
WHERE id = 'test-user-id-here'::UUID;
```

**Expected Result:**
- ✅ `terms_accepted_at` is not NULL (timestamp)
- ✅ `privacy_policy_version` is `'1.0'`

### Step 7: Test Re-login

1. Log out
2. Log back in with the same test account

**Expected Result:**
- ✅ TermsGuard does **NOT** appear (user already accepted)
- ✅ App loads directly to main content

---

## 4. Delete User Data RPC (GDPR Compliance)

### Step 1: Run the Migration

Execute `scripts/028_delete_user_data_rpc.sql` in Supabase SQL Editor.

**Expected Result**: Migration completes, creates `delete_user_data` function.

### Step 2: Create a Test Account

Create a test user with:
- Profile data
- Some connections
- Meeting requests
- Other related data

### Step 3: Test the RPC

**Option A: Via Supabase SQL Editor**

```sql
-- Replace with test user ID
SELECT public.delete_user_data('test-user-id-here'::UUID);
```

**Option B: Via Application Code**

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.rpc('delete_user_data', {
  p_user_id: userId,
});

if (error) {
  console.error('Delete failed:', error);
} else {
  console.log('User data deleted successfully');
}
```

### Step 4: Verify Deletion

After running the RPC, check:

```sql
-- Profile should be deleted
SELECT * FROM public.profiles WHERE id = 'test-user-id-here'::UUID;
-- Expected: 0 rows

-- Connections should be deleted
SELECT * FROM public.connections 
WHERE requester_id = 'test-user-id-here'::UUID 
   OR receiver_id = 'test-user-id-here'::UUID;
-- Expected: 0 rows

-- Meeting requests should be deleted
SELECT * FROM public.meeting_requests 
WHERE sender_id = 'test-user-id-here'::UUID 
   OR receiver_id = 'test-user-id-here'::UUID;
-- Expected: 0 rows

-- Auth user should be deleted (if CASCADE is set)
SELECT * FROM auth.users WHERE id = 'test-user-id-here'::UUID;
-- Expected: 0 rows (if CASCADE is enabled)
```

**Expected Result:**
- ✅ All user data is deleted
- ✅ Related records are cleaned up
- ✅ No orphaned data remains

### Step 5: Test Security

Try to delete another user's data:

```sql
-- This should FAIL
SELECT public.delete_user_data('another-user-id-here'::UUID);
-- Expected: Error "Can only delete your own data"
```

**Expected Result:**
- ✅ RPC rejects the request
- ✅ Error message indicates permission denied

---

## 🎯 Success Criteria Summary

| Component | Test | Expected Result |
|-----------|------|----------------|
| **RLS Privacy** | Query profiles | Sensitive fields filtered based on connection |
| **RLS Privacy** | Check connection function | Returns correct boolean |
| **Error Boundary** | Trigger error | Custom error screen, no crash |
| **Error Boundary** | Restart app | App recovers normally |
| **Terms Guard** | Login without terms | Modal blocks access |
| **Terms Guard** | Accept terms | Database updated, access granted |
| **Terms Guard** | Re-login | No modal (already accepted) |
| **Delete RPC** | Delete own data | All data removed |
| **Delete RPC** | Delete other's data | Permission denied |

---

## 🚨 Troubleshooting

### RLS Not Working?
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';`
- Check policies: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`
- Ensure you're using authenticated Supabase client

### Error Boundary Not Catching?
- Verify `GlobalErrorBoundary` wraps your root layout
- Check that error is thrown in a React component (not in event handlers without try/catch)
- Ensure error is not caught by a parent error boundary

### TermsGuard Not Appearing?
- Check `terms_accepted_at` is NULL in database
- Verify `TermsGuard` is rendered in your component tree
- Check console for errors

### Delete RPC Failing?
- Verify user is authenticated
- Check user ID matches `auth.uid()`
- Ensure function exists: `SELECT proname FROM pg_proc WHERE proname = 'delete_user_data';`

---

## ✅ Next Steps After Testing

1. **Remove test components** (TestErrorButton, etc.)
2. **Set up Sentry** for production error tracking
3. **Add TermsGuard** to production auth flow
4. **Create user-facing delete account UI** using the RPC
5. **Document** privacy filtering usage for your team

---

## 📝 Notes

- **RLS Column Filtering**: Remember that PostgreSQL RLS works at row level. Column filtering happens in application code using `filterSensitiveProfileFields`.
- **Error Boundary**: Only catches errors in React component render/update lifecycle. Wrap async operations in try/catch.
- **TermsGuard**: Consider adding version checking for future privacy policy updates.
- **Delete RPC**: Consider adding a "soft delete" option (mark as deleted instead of hard delete) for compliance audits.
