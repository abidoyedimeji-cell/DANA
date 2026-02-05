# 🔧 Fix: Mobile Supabase Environment Variables

## 🚨 Error

```
Metro error: supabaseUrl is required.
Call Stack
  factory (lib\supabase.ts)
  factory (components\providers\AuthProvider.tsx)
```

## ✅ Solution Applied

Created `mobile/.env` file with required Expo environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://lwdguwrifwsfxtoohjrh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔄 Next Steps

### 1. Restart Metro Bundler

**IMPORTANT**: You MUST restart the Metro bundler for environment variables to load!

**Option A: Stop and Restart**
1. Press `Ctrl+C` in the terminal running Metro
2. Run: `pnpm mobile:start` or `cd mobile && pnpm exec expo start --clear`

**Option B: Clear Cache**
```powershell
cd mobile
pnpm exec expo start --clear
```

### 2. Verify Environment Variables Load

After restart, check the console. You should see:
- ✅ No "supabaseUrl is required" error
- ✅ App loads successfully
- ✅ AuthProvider initializes without errors

## 📋 Environment Variable Setup

### Root `.env.local` (Web - Next.js)
```env
NEXT_PUBLIC_SUPABASE_URL=https://lwdguwrifwsfxtoohjrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### `mobile/.env` (Mobile - Expo)
```env
EXPO_PUBLIC_SUPABASE_URL=https://lwdguwrifwsfxtoohjrh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

**Note**: Same values, different prefixes:
- Web uses `NEXT_PUBLIC_` prefix
- Mobile uses `EXPO_PUBLIC_` prefix

## ✅ Git Safety

The `.env` file is automatically ignored by `.gitignore`:
- Root `.gitignore` has `.env*` pattern
- Mobile `.gitignore` inherits from root
- Your secrets are safe! ✅

## 🎯 Verification

After restarting Metro, the error should be gone. If you still see the error:

1. **Check file exists**: `Test-Path mobile\.env`
2. **Check file contents**: `Get-Content mobile\.env`
3. **Verify Metro restarted**: Look for "Starting Metro Bundler" message
4. **Check console**: No "supabaseUrl is required" error

---

**Status**: `.env` file created. Restart Metro bundler to apply changes!
