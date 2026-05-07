# Plan 02-02: Root/Auth/Tab Layouts with Providers + Bottom Navigation

## Goal
Restructure the app layout hierarchy to match the web app's provider pattern, add proper theme context, enhance the bottom tab navigation with NativeWind styling and dark mode, and wire the onboarding gate.

## Requirements
- ONBD-01 (onboarding gate: first-time users → onboarding, returning users → auth/tabs)
- DASH-09 (tab navigation with 5 tabs)
- OFFL-02 (offline banner at root level)

## Current State
- Root layout has GestureHandlerRootView + QueryClientProvider + AuthProvider + Stack
- Tab layout uses basic Tabs with hardcoded colors
- Auth layout is a bare Stack
- Onboarding is a stub with no animation

## Changes

### 1. Theme Provider
- Create `hooks/useThemeContext.tsx` — wraps `useColorScheme()` from Phase 1
- Exposes `isDark`, `toggleDarkMode`, `colorScheme` via context
- Root layout wraps with ThemeProvider
- Applies `dark` class to root View when dark mode is active

### 2. Root Layout Enhancement
- Add ThemeProvider wrapping AuthProvider
- Add SafeAreaProvider (required by bottom-sheet + screens)
- Add StatusBar theming (light/dark content based on color scheme)
- Add OfflineStatusBanner at the top (from Plan 02-04, but provider wiring here)

### 3. Auth Layout Enhancement
- Add gradient background matching web app's auth page
- Add scroll support for small screens

### 4. Tab Layout Enhancement
- Style with NativeWind: `className` on Tabs
- Dynamic `tabBarActiveTintColor` from design tokens (primary color)
- `tabBarStyle` with `bg-card`, `border-t border-border`
- Dark mode support: `tabBarInactiveTintColor` from muted-foreground

### 5. Onboarding Gate
- Check `onboarding_seen` from kv-store on app start
- If not seen → redirect to `/onboarding`
- After onboarding completes → set `onboarding_seen=true` → redirect to `/(auth)/login`

### 6. Navigation Flow
- Unauthenticated + onboarding not seen → `/onboarding`
- Unauthenticated + onboarding seen → `/(auth)/login`
- Authenticated → `/(tabs)`
- Update RootLayoutNav effect to handle onboarding check

## Files to Create/Modify
- `apps/native/hooks/useThemeContext.tsx` — NEW
- `apps/native/app/_layout.tsx` — MODIFY (add ThemeProvider, SafeAreaProvider, StatusBar)
- `apps/native/app/(auth)/_layout.tsx` — MODIFY (gradient bg, scroll)
- `apps/native/app/(tabs)/_layout.tsx` — MODIFY (NativeWind styling, dark mode)
- `apps/native/app/_layout.tsx` — MODIFY (onboarding gate logic)

## Dependencies
- `expo-status-bar` (already installed — for StatusBar theming)
- `react-native-safe-area-context` (already installed)

## Verification
- Dark mode toggle changes all tabs, status bar, and backgrounds
- First launch → onboarding → auth → tabs flow works
- Returning users skip onboarding
- All 5 tabs render with proper icons and colors
