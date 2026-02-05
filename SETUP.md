# DANA – Run order (Windows)

Run these in **Cursor terminal** from the **repo root** (folder with `package.json` and `pnpm-lock.yaml`).

**Use `pnpm`, not `npm`.** This repo uses pnpm (workspace + `.npmrc`). If you run `npm run dev` you may see "next is not recognized" — use `pnpm run dev` (or `pnpm dev`) after `pnpm install`.

**If Node/npm/pnpm are not in PATH:** Use Docker to get a Node environment; see [DOCKER.md](DOCKER.md).

If `pnpm` is not recognized (but Node is), run once:

```bash
npm i -g pnpm
```

## Step A – Root

```bash
pnpm install
pnpm shared:build
```

Or in one go:

```bash
pnpm run setup
```

This builds the shared package so both web and mobile can use it.

## Step B – Web (optional)

```bash
pnpm dev
```

Open the URL shown (e.g. http://localhost:3000).

## Step C – Mobile

```bash
cd mobile
pnpm install
pnpm start
```

Use the QR code with **Expo Go** on your phone.

Or from root:

```bash
pnpm mobile
```

## EAS (after app runs in Expo Go)

Install **EAS CLI globally** with pnpm, then run `eas` directly:

```bash
pnpm add -g eas-cli
eas login
eas build:configure
```

From the **mobile** folder, run EAS commands directly:

```bash
cd mobile
eas build:configure
eas build -p android --profile preview
```

Or from repo root (EAS will use the `mobile/` project when run from there or from `mobile/`):

```bash
eas build -p android --profile preview
```

## Metro / Expo crash fix (pnpm hoisting)

If Expo crashes with **Cannot find module** (e.g. Metro or React Native), the repo root already has a **`.npmrc`** that hoists those packages:

```ini
public-hoist-pattern[]=metro*
public-hoist-pattern[]=@react-native*
public-hoist-pattern[]=react-native
```

Do a **clean reinstall** (from repo root):

```powershell
# Install deps first so rimraf is available, then clean and reinstall
pnpm install
pnpm run clean
pnpm install
```

(`clean` uses the `rimraf` dev dependency to remove `node_modules` and `mobile/node_modules`; it works around Windows long-path issues. If you don't have deps installed yet, run `pnpm install` once, then `pnpm run clean`, then `pnpm install` again.)

Then start Expo with a clear cache:

```powershell
cd mobile
npx expo start --clear
```

You should get the QR code. If it **still** fails, install Metro explicitly from repo root, then try again:

```powershell
pnpm --filter mobile add metro metro-config metro-core metro-runtime
pnpm install
cd mobile
npx expo start --clear
```

If you still see an error, paste the line that starts with **`Error: Cannot find module ...`** so we can fix the exact missing package.

---

## If a command fails with exit code 1 (ELIFECYCLE)

- **`pnpm run clean`** – Close Cursor/IDE and any terminals using the repo, then run `pnpm run clean` again (files may be locked). If it still fails, delete `node_modules` and `mobile\node_modules` manually in File Explorer, then run `pnpm install`.
- **`pnpm run setup`** – Run the steps separately: `pnpm install`, then `pnpm shared:build`, then `pnpm --filter mobile install`. If `shared:build` fails, run `cd shared && pnpm run build` and check for TypeScript errors.
- **`pnpm run build`** (Next.js) – Ensure `.env.local` has any required keys (e.g. `STRIPE_SECRET_KEY` is optional; the app builds without it). If you see "Cannot find module", run `pnpm install` at the root and try again.
- **`pnpm install`** – If you see network or resolution errors, try `pnpm install --no-frozen-lockfile` or check your Node version (use Node 18+).

---

## PowerShell scripts

From repo root in PowerShell:

- **Full setup:** `.\scripts\setup.ps1`
- **Web only:** `.\scripts\run-web.ps1`
- **Mobile only:** `.\scripts\run-mobile.ps1`
