---
phase: 00-foundation
plan: 02
subsystem: foundation
tags: [zustand, state-management, theme, mmkv, design-tokens]
requires:
  - FOUND-03
  - FOUND-08
provides:
  - Global auth state (useAuthStore)
  - App settings state (useAppStore)
  - Theme system with design tokens
  - TypeScript types for AuthUser and SubscriptionTier
  - Utility functions (cn, formatDate, formatTime, getGreeting)
affects:
  - All subsequent phases
tech_stack:
  added:
    - zustand ^5.0.0
    - react-native-mmkv ^4.0.0
    - react-native-nitro-modules latest
    - clsx ^2.1.1
    - tailwind-merge ^2.6.0
    - date-fns ^3.6.0
  patterns:
    - Zustand v5 with MMKV persist middleware
    - createMMKV factory for encrypted storage
    - Design tokens pattern (colors, spacing, typography)
key_files:
  created:
    - src/stores/authStore.ts
    - src/stores/appStore.ts
    - src/stores/index.ts
    - src/types/auth.ts
    - src/types/index.ts
    - src/lib/theme.ts
    - src/lib/constants.ts
    - src/lib/utils.ts
  modified: []
key_decisions:
  - "MMKV v4 for secure storage (NOT AsyncStorage — per PITFALLS-01)"
  - "Dark theme by default (#0f0f23 background, #7c3aed primary)"
  - "Subscription tiers: free (5 AI calls), plus (30), pro (100/unlimited)"
  - "Zustand persist middleware with MMKV adapter for synchronous hydration"
requirements-completed:
  - FOUND-03
  - FOUND-08
duration: 5min
completed: 2026-04-25T21:00:46Z
---

# Phase 00 Plan 02: Foundation - State & Theme Summary

**Zustand stores with MMKV v4 encrypted persistence and design tokens matching web app palette (#0f0f23, #7c3aed)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-25T20:58:00Z
- **Completed:** 2026-04-25T21:00:46Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- useAuthStore with MMKV persistent storage for auth state (user, session, isAuthenticated, subscription)
- useAppStore with MMKV persistent storage for app preferences (theme, onboarding, daily study target)
- Theme system with design tokens matching web app (background #0f0f23, primary #7c3aed)
- TypeScript types for AuthUser, SubscriptionTier
- Utility functions: cn(), formatDate(), formatTime(), getGreeting()

## Task Commits

1. **Task 1: Create Zustand stores** - `238d331` (feat)
2. **Task 2: Create theme system with design tokens** - `238d331` (feat)

## Files Created/Modified

- `src/stores/authStore.ts` - Auth state with MMKV persist (user, session, isAuthenticated, subscription)
- `src/stores/appStore.ts` - App preferences with MMKV persist (theme, onboardingSeen, dailyStudyTarget)
- `src/stores/index.ts` - Barrel exports for useAuthStore, useAppStore
- `src/types/auth.ts` - AuthUser interface, SubscriptionTier type
- `src/types/index.ts` - Master type re-exports
- `src/lib/theme.ts` - Design tokens (colors, spacing, typography) + useTheme() hook
- `src/lib/constants.ts` - SUBSCRIPTION_TIERS, NAVIGATION_TABS, AI_PERSONAS
- `src/lib/utils.ts` - cn(), formatDate(), formatTime(), getGreeting() utilities

## Decisions Made

- Used react-native-mmkv v4 for encrypted storage — per PITFALLS-01, NEVER AsyncStorage for tokens
- createMMKV factory with separate storage IDs: 'auth-storage', 'app-settings'
- Dark theme by default: background #0f0f23, primary #7c3aed (matches PWA theme)
- useTheme() hook returns dark theme constants for now — light mode support added in Phase 18
- Subscription tiers: free (5 AI calls/day), plus (30), pro (100/unlimited quotas)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- `useTheme()` always returns isDark: true — light mode expansion planned for Phase 18 (Profile & Settings)
- `clsx`/`tailwind-merge` imported in utils.ts but React Native uses StyleSheet — these utilities are for potential NativeWind adoption or className-based styling

## Notes

- Plan dependencies: FOUND-03, FOUND-08
- useAuthStore will replace local useState in RootNavigator (requires Plan 01 to integrate)
- Theme hook ready for light mode expansion via useAppStore.theme value

---

_Phase: 00-foundation_
_Completed: 2026-04-25_
