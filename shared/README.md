# DANA Shared

Types, validation (Zod), and utilities shared by the **web** (Next.js) and **mobile** (Expo) apps.

## Contents

- **types/** – Domain types (e.g. `Profile`, `ProfileMode`)
- **validation/schemas.ts** – Zod schemas for auth, bookings, profile, etc.
- **utils/** – Pure helpers (`sanitizeInput`, `RateLimiter`)
- **api/config.ts** – Env key constants (each app reads env in its own way)

## Build

From repo root:

```bash
pnpm --filter shared build
```

Output is in `dist/`. The web app can use path aliases to source; the mobile app uses the built `dist/` via the workspace dependency.

## Usage

- **Web**: Add `"shared": "workspace:*"` to root `package.json` and alias `shared` in `tsconfig.json` to `./shared` (or use the built `shared/dist`).
- **Mobile**: Already depends on `shared` via `workspace:*` and imports e.g. `import { loginSchema } from "shared"`.

Before running the mobile app, build shared once: `pnpm shared:build` (from root).
