# 🔄 Syncing Profile Changes to Vercel

## 📊 Current Situation

### Your Project Structure
```
DANA Native/              (Root - where Vercel deploys from)
├── app/                 ✅ Next.js web app (Vercel deploys this)
├── mobile/              ✅ React Native app (Expo)
└── shared/              ✅ Shared TypeScript (used by both)
```

**Key Point**: Vercel deploys from the **root** (`app/` folder), NOT from `apps/web/`.

---

## 🔍 The Problem: Profile Logic is Split

### Mobile (`mobile/app/profile-building.tsx`)
- ✅ Has **comprehensive** profile fields:
  - `display_name`, `bio_social`, `headline`, `bio_professional`
  - `industry`, `years_in_role`, `seniority_level`
  - `professional_intents`, `calendar_link_business`, `calendar_link_social`
- ❌ Uses **direct Supabase calls** (not shared function)
- ❌ Changes **don't sync** to Vercel automatically

### Web (`app/app/profile/page.tsx`)
- ⚠️ Only has **basic** fields:
  - `display_name`, `username`, `bio`, `age`, `location`
- ❌ Missing all **professional fields** (headline, industry, etc.)
- ❌ Uses **direct Supabase calls** (not shared function)

### Shared (`shared/src/api/profiles.ts`)
- ⚠️ `updateProfile` function is **limited**:
  - Only handles: `firstName`, `lastName`, `bio_social`, `location`, `interests`
  - Missing: `display_name`, `headline`, `bio_professional`, `industry`, `years_in_role`, `seniority_level`, `professional_intents`, `calendar_link_business`, `calendar_link_social`

---

## ✅ The Solution: Move Logic to Shared

### ✅ Step 1: Enhanced Shared Profile Function (DONE!)

**Updated**: `shared/src/api/profiles.ts` now handles **ALL** profile fields:
- ✅ Social: `display_name`, `bio_social`, `calendar_link_social`
- ✅ Professional: `headline`, `bio_professional`, `industry`, `years_in_role`, `seniority_level`, `professional_intents`, `calendar_link_business`
- ✅ Basic: `firstName`, `lastName`, `location`, `interests`
- ✅ Completion: `is_profile_complete`, `profile_mode`

### ✅ Step 2: Enhanced Shared Validation Schema (DONE!)

**Updated**: `shared/src/validation/schemas.ts` now validates all fields with proper types and constraints.

### ⏳ Step 3: Refactor Mobile to Use Shared Function (TODO)

Update `mobile/app/profile-building.tsx`:

**Current**: Uses direct Supabase call
```typescript
const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
```

**Change to**: Use shared function
```typescript
import { updateProfile } from "shared";

const updateProfileData = async (updates: Record<string, unknown>) => {
  if (!userId) return;
  setSaving(true);
  try {
    await updateProfile(supabase, userId, updates);
    await refreshProfile();
  } catch (error) {
    Alert.alert("Save failed", error.message);
  } finally {
    setSaving(false);
  }
};
```

### ⏳ Step 4: Refactor Web to Use Shared Function (TODO)

Update `app/app/profile/page.tsx`:

**Current**: Uses direct Supabase call
```typescript
const { error } = await supabase.from("profiles").update({...}).eq("id", user.id);
```

**Change to**: Use shared function
```typescript
import { updateProfile } from "shared";
import { createClient } from "@/lib/supabase/client";

const handleSave = async () => {
  if (!user) return;
  setIsSaving(true);
  try {
    const supabase = createClient();
    await updateProfile(supabase, user.id, formData);
    await refreshProfile();
    setIsEditing(false);
  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
};
```

### ⏳ Step 5: Add Professional Fields to Web UI (TODO)

The web profile page (`app/app/profile/page.tsx`) currently only shows basic fields. Add:
- Headline input
- Bio Professional textarea
- Industry select
- Years in Role input
- Seniority Level select
- Professional Intents multi-select
- Calendar links (business & social)

---

## 🎯 Why This Works

### Before (Current State)
```
Mobile → Direct Supabase Call → Database
Web → Direct Supabase Call → Database
❌ Changes don't sync between platforms
```

### After (With Shared Function)
```
Mobile → Shared Function → Database
Web → Shared Function → Database
✅ Both use same logic, changes sync automatically
```

### When You Deploy to Vercel
1. **Push to GitHub**: `git push`
2. **Vercel auto-deploys**: Builds `app/` folder
3. **Web uses shared function**: Same logic as mobile
4. **Changes appear**: Profile updates work identically on both platforms

---

## 📋 Implementation Checklist

- [ ] Enhance `shared/src/api/profiles.ts` with all profile fields
- [ ] Update `shared/src/validation/schemas.ts` with complete schema
- [ ] Refactor `mobile/app/profile-building.tsx` to use shared function
- [ ] Refactor `app/app/profile/page.tsx` to use shared function
- [ ] Add professional fields to web profile page UI
- [ ] Test on mobile (Expo)
- [ ] Test on web (local)
- [ ] Deploy to Vercel
- [ ] Verify changes appear on Vercel URL

---

## 🚀 Quick Test After Implementation

1. **Update profile on mobile** (add headline, industry, etc.)
2. **Check database** (verify fields saved)
3. **View profile on Vercel** (should show same data)
4. **Update profile on web** (should work with all fields)
5. **Check mobile** (should reflect web changes)

---

## 📝 Key Files to Update

1. `shared/src/api/profiles.ts` - Enhance `updateProfile` function
2. `shared/src/validation/schemas.ts` - Complete `profileUpdateSchema`
3. `mobile/app/profile-building.tsx` - Use shared function
4. `app/app/profile/page.tsx` - Use shared function + add professional fields UI

---

## ✅ Expected Result

After implementation:
- ✅ Mobile and Web use **same shared logic**
- ✅ Profile changes **sync automatically**
- ✅ Vercel deployment shows **all profile fields**
- ✅ Single source of truth in `shared/` folder

---

**Once you move the logic to `shared/`, both platforms will automatically use the same code, and Vercel will show your profile changes!**
