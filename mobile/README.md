# DANA Mobile (Expo + React Native)

iOS and Android app for DANA, sharing logic with the Next.js web app via the `shared` package.

## Prerequisites

- Node 18+
- pnpm (from repo root: `pnpm install`)
- Expo Go on your device, or iOS Simulator / Android Emulator

## Setup

1. **Install dependencies** (from repo root):

   ```bash
   pnpm install
   ```

2. **Environment** – create `mobile/.env` (or use `app.config.js` with `extra`) with:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Use the same Supabase project as the web app (`NEXT_PUBLIC_SUPABASE_*`).

3. **Assets** – add app icons and splash under `assets/images/` (see `assets/images/README.md`). You can copy and resize from the web app’s `public/` folder. For a quick run, any small PNG as `icon.png`, `splash-icon.png`, `adaptive-icon.png`, and `favicon.png` is enough.

## Run

From repo root:

```bash
pnpm mobile
```

Or from `mobile/`:

```bash
pnpm start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Structure

- `app/` – Expo Router screens and layouts
  - `(auth)/` – login
  - `(tabs)/` – Home, Discover, Profile, Connections, Bookings, Community, Pricing, Wallet, Spots, Search, Notifications, Settings
  - `onboarding/` – mode, profile, verify, walkthrough (gated when profile has no profile_mode)
- `components/` – reusable UI and providers (e.g. `AuthProvider`)
- `config/theme.ts` – design tokens aligned with the web app
- `lib/supabase.ts` – Supabase client (expo-secure-store for auth tokens)

Shared types, validation (Zod), and utilities live in the workspace package `shared/`.

## EAS Build

- **eas.json** – development, preview, and production profiles.
- **Install EAS CLI globally** with pnpm, then run `eas` directly:
  ```bash
  pnpm add -g eas-cli
  eas login
  eas build:configure
  ```
- From repo root: `pnpm shared:build`. Then from `mobile/` (or repo root): `eas build:configure` (hooks app to Expo, may add `extra.eas.projectId` to app.json).
- Build: `eas build --profile development --platform ios|android`, `eas build --profile preview`, or `eas build --profile production`. Let EAS manage credentials when prompted.

## App Store / Play Store

- **Bundle IDs**: `app.json` → `expo.ios.bundleIdentifier` and `expo.android.package` (e.g. `app.dana.native`). Change to your own (e.g. `com.yourcompany.dana`) before submitting.
- **Icons & splash**: Replace `assets/images/icon.png`, `splash-icon.png`, `adaptive-icon.png` with your DANA branding; splash `backgroundColor` is set to theme `#0f172a`.
- **EAS**: Run `eas build:configure` and set `expo.extra.eas.projectId` in app.json. Then `eas build --profile production --platform all` to produce `.ipa` (iOS) and `.aab` (Android).
- **Signing**: EAS can manage credentials; or add `credentials.json` / service account for Android and Apple credentials for iOS in EAS dashboard.
- **Submit**: `eas submit --platform ios` / `eas submit --platform android` (configure `eas.json` submit.production with your Apple ID and Android service account path).
- **Store listing:** Screenshots, descriptions, privacy policy, and terms in App Store Connect and Google Play Console (outside the repo).
