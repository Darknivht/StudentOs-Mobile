# Phase 1 Pattern Mapping: Foundation & Platform Services

**Phase:** 1 — Foundation & Platform Services
**Created:** 2026-05-05

---

## Mapping Strategy

Each new file in the native app is mapped to its closest existing analog in the web codebase (`studentoss/src/`). This ensures we follow established patterns and don't reinvent solutions.

---

## Plan 01-01: Monorepo Scaffold & NativeWind Config

| New File | Closest Analog | Pattern to Follow | Key Differences |
|----------|---------------|-------------------|-----------------|
| `package.json` (root) | `studentoss/package.json` | Workspaces config + scripts | Add `"workspaces": ["apps/*", "packages/*"]` |
| `packages/shared/package.json` | `studentoss/package.json` (subset) | Same deps structure, but only shared deps | No platform deps (no vite, no react-router-dom) |
| `packages/shared/src/index.ts` | `studentoss/src/main.tsx` | Entry point exporting public API | Export types, utils, config — not components |
| `packages/shared/src/lib/utils.ts` | `studentoss/src/lib/utils.ts` | Copy `cn()` function verbatim | Same code, different import path |
| `packages/shared/src/types/database.ts` | `studentoss/src/integrations/supabase/types.ts` | Copy generated Supabase types | Same content, package-scoped |
| `apps/native/app.json` | `studentoss/index.html` | App entry config | Expo config (name, slug, scheme, plugins) |
| `apps/native/babel.config.js` | `studentoss/vite.config.ts` (babel equivalent) | Plugin configuration | NativeWind babel plugin, not Vite plugins |
| `apps/native/metro.config.js` | `studentoss/vite.config.ts` (metro equivalent) | Bundler configuration | `@expo/metro-config` with NativeWind |
| `apps/native/tailwind.config.ts` | `studentoss/tailwind.config.ts` | **Direct copy** — same design tokens | Add `app/`, `components/`, `features/` content paths |
| `apps/native/global.css` | `studentoss/src/index.css` | Tailwind directives + CSS vars | `@tailwind base/components/utilities` only |

---

## Plan 01-02: Expo Router Routing

| New File | Closest Analog | Pattern to Follow | Key Differences |
|----------|---------------|-------------------|-----------------|
| `apps/native/app/_layout.tsx` | `studentoss/src/App.tsx` | Root layout with providers | Expo Router `<Stack>` instead of `<BrowserRouter>`, providers same |
| `apps/native/app/(auth)/_layout.tsx` | `studentoss/src/App.tsx` auth route section | Stack layout for unauthenticated | `<Stack>` with `headerShown: false` |
| `apps/native/app/(auth)/login.tsx` | `studentoss/src/pages/Auth.tsx` | Auth form UI + Supabase auth calls | Same logic, RN components instead of HTML |
| `apps/native/app/(auth)/reset-password.tsx` | `studentoss/src/pages/ResetPassword.tsx` | Password reset form | Uses `useLocalSearchParams()` for token |
| `apps/native/app/(tabs)/_layout.tsx` | `studentoss/src/components/layout/AppLayout.tsx` + `BottomNav.tsx` | Tab layout with 5 tabs | `<Tabs>` navigator instead of custom BottomNav |
| `apps/native/app/(tabs)/index.tsx` | `studentoss/src/pages/Dashboard.tsx` | Dashboard screen placeholder | Stub screen in Phase 1, full implementation in Phase 3 |
| `apps/native/app/(tabs)/study.tsx` | `studentoss/src/pages/Study.tsx` | Study screen placeholder | Stub screen in Phase 1 |
| `apps/native/app/(tabs)/exams.tsx` | `studentoss/src/pages/ExamPrep.tsx` | Exam tab placeholder | New tab not in web bottom nav (web uses sidebar) |
| `apps/native/app/(tabs)/social.tsx` | `studentoss/src/pages/Social.tsx` | Social tab placeholder | New tab grouping |
| `apps/native/app/(tabs)/profile.tsx` | `studentoss/src/pages/Profile.tsx` | Profile tab placeholder | Stub screen |
| `apps/native/app/onboarding.tsx` | `studentoss/src/pages/Onboarding.tsx` | Onboarding screen | Full implementation in Phase 2 |
| `apps/native/app/+not-found.tsx` | `studentoss/src/pages/NotFound.tsx` | 404 page | Same pattern, Expo Router file naming |
| `apps/native/app/course/[courseId].tsx` | `studentoss/src/pages/CoursePage.tsx` | Dynamic route with params | `[courseId]` file naming, `useLocalSearchParams()` |

---

## Plan 01-03: Supabase Auth & SecureStore

| New File | Closest Analog | Pattern to Follow | Key Differences |
|----------|---------------|-------------------|-----------------|
| `packages/shared/src/supabase/client.ts` | `studentoss/src/integrations/supabase/client.ts` | **Same structure** — factory function | Accepts `StorageAdapter` parameter instead of hardcoding `localStorage` |
| `apps/native/services/secure-storage.ts` | (NEW — no analog) | SecureStore adapter implementing Supabase `SupportedStorage` | Uses `expo-secure-store` async API |
| `apps/native/services/app-storage.ts` | `studentoss/src/lib/offlineSync.ts` (localStorage usage) | KV store wrapper | Uses `expo-sqlite/kv-store` instead of `localStorage` |
| `apps/native/hooks/useAuth.ts` | `studentoss/src/hooks/useAuth.tsx` | **Same hook shape** — user, session, loading, signUp, signIn, signOut | Uses SecureStore adapter, no `localStorage` |
| `apps/native/hooks/useAuthContext.tsx` | `studentoss/src/hooks/useAuth.tsx` (AuthProvider section) | Context provider wrapping auth state | Same pattern, different storage backend |
| `apps/native/lib/env.ts` | `studentoss/.env` + `import.meta.env.VITE_*` | Env validation with zod | `EXPO_PUBLIC_*` prefix, `process.env` instead of `import.meta.env` |

---

## Plan 01-04: Cross-Cutting Services

| New File | Closest Analog | Pattern to Follow | Key Differences |
|----------|---------------|-------------------|-----------------|
| `apps/native/services/sse-client.ts` | `studentoss/src/lib/resilientFetch.ts` | HTTP client with retry logic | Adds SSE streaming via `ReadableStream`, no `EventSource` |
| `apps/native/components/MathView.tsx` | `studentoss/src/lib/formatters.ts` (KaTeX sections) | Math rendering component | `react-native-math-view` instead of `katex.renderToString()` |
| `apps/native/components/ErrorBoundary.tsx` | `studentoss/src/components/ErrorBoundary.tsx` | **Same pattern** — error fallback UI | Per-route export instead of single wrapper |
| `apps/native/hooks/useColorScheme.ts` | `studentoss/src/context/ThemeContext.tsx` (next-themes) | Theme toggle + persistence | NativeWind `useColorScheme()` instead of `next-themes` |
| `apps/native/constants/colors.ts` | `studentoss/tailwind.config.ts` (theme.colors) | Color token constants | Same values, programmatic access for non-className usage |

---

## Pattern Rules

1. **Never copy web imports** — replace `react-router-dom` with `expo-router`, `localStorage` with `expo-sqlite/kv-store`, `next-themes` with NativeWind, etc.
2. **Maintain hook shape** — `useAuth()` returns the same `{ user, session, loading, signUp, signIn, signOut }` on both platforms.
3. **Shared package stays pure** — `@studentos/shared` never imports `react-native`, `expo`, `react-router-dom`, or any DOM API.
4. **Stub screens in Phase 1** — tab screens are placeholders (just `<View><Text>Study</Text></View>`) to validate routing. Full implementation comes in Phase 3.
5. **Design tokens are 1:1** — the `tailwind.config.ts` theme colors, spacing, and typography are ported directly from web to native.
