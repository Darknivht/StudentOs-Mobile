---
phase: 1
plan: 01
slug: monorepo-scaffold-expo-nativewind
status: complete
completed: 2026-05-06
---

# Plan 01-01 Summary: Monorepo Scaffold, Expo Project Setup, NativeWind v4 Config

## Objective
Establish the monorepo structure with `apps/native/` (Expo) and `packages/shared/` (@studentos/shared), configure NativeWind v4 with the web app's design tokens, and verify the app launches on Android.

## Key Files Created

| File | Purpose |
|------|---------|
| `package.json` | Root monorepo with npm workspaces |
| `tsconfig.json` | Root TypeScript config with project references |
| `.gitignore` | Root gitignore |
| `packages/shared/package.json` | @studentos/shared package |
| `packages/shared/src/index.ts` | Package entry point |
| `packages/shared/src/lib/utils.ts` | cn() utility from web app |
| `packages/shared/src/types/database.ts` | Supabase Database types from web app |
| `packages/shared/src/supabase/client.ts` | createSupabaseClient factory with storageAdapter injection |
| `apps/native/` | Expo SDK 54 project |
| `apps/native/app/_layout.tsx` | Root layout with global.css import |
| `apps/native/babel.config.js` | Babel with nativewind/babel plugin |
| `apps/native/global.css` | Tailwind directives |
| `apps/native/tailwind.config.ts` | Design tokens ported from web app |
| `apps/native/metro.config.js` | Metro config for monorepo |
| `apps/native/jest.config.js` | Jest configuration |
| `apps/native/jest/setup.js` | Jest setup file |

## Deviations

1. **NativeWind metro wrapper removed** — `nativewind/metro` uses ESM imports that break on Windows (ERR_UNSUPPORTED_ESM_URL_SCHEME). The babel plugin `nativewind/babel` handles CSS transformation instead. This works for development but may need the metro wrapper re-added for production builds on non-Windows CI.
2. **Expo Router v6** — `npx expo install` resolved `expo-router@~6.0.23` (not v5 as originally planned). This is the correct SDK 54 compatible version.
3. **react-test-renderer version conflict** — Required `--legacy-peer-deps` for `@testing-library/react-native` due to React 19.1.0 vs react-test-renderer@19.2.5 mismatch.
4. **Android emulator verification deferred** — Task 01-01-07 (verify Android launch) requires an Android emulator which must be verified manually. Metro dev server was confirmed running.

## Requirements Met

- **FND-01**: Expo SDK 54 project scaffolded with Hermes engine ✅
- **FND-02**: Monorepo with npm workspaces, @studentos/shared package ✅
- **FND-05**: NativeWind v4 with design tokens from web app ✅
