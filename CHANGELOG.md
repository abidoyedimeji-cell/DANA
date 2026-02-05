# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **feat: native mobile app with shared core, auth, onboarding, and design system**
  - Add Expo React Native app in `mobile/` (Expo Router, TypeScript, iOS + Android)
  - Introduce `shared/` package for types, Zod validation, utils, and API config
  - Wire web app to shared core (validation, auth types, utils re-exports)
  - Implement mobile auth with Supabase + expo-secure-store
  - Add onboarding flow (mode, profile, verify, walkthrough) with gating
  - Introduce mobile design system (theme, ScreenContainer, Button, Input, Card)
  - Configure Expo app + EAS builds for dev, preview, and production
