# Phase 1 Research: Foundation & Platform Services

**Phase:** 1 — Foundation & Platform Services
**Researched:** 2026-05-05
**Confidence:** HIGH (synthesized from project-level STACK.md, ARCHITECTURE.md, PITFALLS.md, FEATURES.md + codebase analysis)

---

## Research Question

> What do I need to know to PLAN this phase well?

This document covers the 17 Phase 1 requirements (FND-01–08, AUTH-01–05, NAVL-01–04) and answers the critical implementation questions for each plan area.

---

## 1. Monorepo Setup (FND-01, FND-02)

### What to know

- **Expo SDK 54+ has first-class monorepo support** — Metro auto-configures for workspaces via `expo-router/metro-config`. No manual `watchFolders` needed.
- **npm workspaces** are simplest: root `package.json` with `"workspaces": ["apps/*", "packages/*"]`. Yarn and pnpm also work but npm requires no extra tooling.
- **`@studentos/shared`** must be a pure TypeScript package — zero React Native or web imports. Only `react`, `@supabase/supabase-js`, and `@tanstack/react-query` as peer dependencies.
- **Metro config** needs `@expo/metro-config` with monorepo support. The `metro.config.js` in `apps/native/` must reference the shared package.
- **TypeScript project references** are recommended for fast builds: root `tsconfig.json` with `references` to each workspace package.
- **Moving `studentoss/`** to `apps/web/` requires updating all import paths, but since the web app already uses `@/` path aliases, the move is mostly a `vite.config.ts` and `tsconfig.json` change.
- **The existing `android/` Capacitor wrapper** must be DELETED — it will be replaced by Expo's auto-generated `android/` folder after `npx expo prebuild`.

### Key decisions

1. npm workspaces vs pnpm — npm is simpler, pnpm is stricter. **Recommend npm** for consistency with existing `studentoss/package.json`.
2. Shared package scope — `@studentos/shared` is the agreed name.
3. What goes in shared in Phase 1 — only types, utils, config, and Supabase client factory. Hooks come later.

### Risks

- **Metro resolution conflicts** when two versions of the same package exist in different workspaces. Mitigate with `nohoist` or dedicated Metro resolver config.
- **TypeScript path aliases** (`@/`) in the web app need updating after moving to `apps/web/`. This is a known, bounded change.

---

## 2. Expo Project Setup & NativeWind v4 (FND-01, FND-05)

### What to know

- **Expo SDK 54+** is required (not 52 or 53) because: `expo-sqlite/kv-store`, improved monorepo support, and Expo Router v4+.
- **NativeWind v4** (NOT v5) is the stable release. v5 is beta/preview with unresolved issues. v4 works with TailwindCSS v3 syntax, which matches the existing web app's `tailwind.config.ts`.
- **NativeWind v4 setup** requires:
  1. `nativewind@4.x` + `tailwindcss@3.x` as dependencies
  2. `babel.config.js` with `nativewind/babel` plugin
  3. `tailwind.config.ts` with `content` paths pointing to `app/`, `components/`, `features/`
  4. `global.css` with `@tailwind base; @tailwind components; @tailwind utilities;` imported in `_layout.tsx`
  5. `metro.config.js` with `nativewind/metro` integration
  6. `app.json` with `"plugins": ["nativewind/babel"]` — actually this goes in babel config
- **Design tokens** must be ported from the web `tailwind.config.ts` — the theme colors, spacing, typography scales. The web app uses custom colors like `primary`, `secondary`, `destructive`, `muted`, `background`, `foreground`, etc. These map directly to NativeWind's theme system.
- **`cssInterop`** is needed for third-party components that only accept `style` props (FlashList, BottomSheet, etc.) — but this is Phase 2+ concern.
- **Dark mode** with NativeWind uses `useColorScheme()` — replaces `next-themes`. The `ThemeProvider` must be in root `_layout.tsx`. Class-based dark mode (`attribute="class"`) works in NativeWind v4.

### Key decisions

1. NativeWind v4 (confirmed) — NOT v5.
2. TailwindCSS v3 syntax (confirmed) — matches existing web app.
3. Design tokens ported from web `tailwind.config.ts` — same names, same values.

### Risks

- **NativeWind v4 vs v5 confusion** — pin `nativewind@4` in `package.json` to prevent accidental upgrade.
- **`rem` unit differences** — RN uses different base font size. Use `px` or RN's pixel ratio for precise sizing.
- **Missing pseudo-class support** — no `:hover` on native (use `:active`/press states instead).

---

## 3. Expo Router File-Based Routing (FND-04, NAVL-01, NAVL-02, NAVL-03)

### What to know

- **Expo Router v4+** uses file-based routing — the `app/` directory structure defines the entire route tree. This is a fundamental paradigm shift from React Router's component-based routing.
- **Route groups** (parenthesized directories) define navigation layouts:
  - `(auth)/` — Stack layout for unauthenticated screens (login, register, reset-password). No bottom tabs.
  - `(tabs)/` — Tabs layout for authenticated screens. 5 tabs: Home, Study, Exams, Social, Profile.
  - Root stack screens — modal/stack screens not in any group.
- **`_layout.tsx`** files define the layout for each group:
  - `app/_layout.tsx` — Root layout with all providers (QueryClient, Auth, Theme, GestureHandler).
  - `app/(auth)/_layout.tsx` — Stack layout with `headerShown: false`.
  - `app/(tabs)/_layout.tsx` — Tabs layout with `BottomTabNavigator` and 5 tab screens.
- **Auth redirect** — The web's `HomeRoute` component (which checks `useAuth()` + `localStorage.getItem('onboarding_seen')`) becomes:
  - `app/(tabs)/index.tsx` — Dashboard (authenticated)
  - `app/(auth)/login.tsx` — Login (unauthenticated)
  - `app/onboarding.tsx` — Onboarding (before auth)
  - Root `_layout.tsx` uses `useAuth()` to redirect: no session → `(auth)/login` or `onboarding` based on `appStorage.getItemSync('onboarding_seen')`.
- **Deep linking** (NAVL-03) — Critical for password reset magic links:
  1. Configure `app.json` `scheme` (e.g., `studentos`)
  2. Add `expo-linking` configuration for `studentos://reset-password?token=XXX`
  3. `app/(auth)/reset-password.tsx` reads `useLocalSearchParams()['token']` and calls `supabase.auth.verifyOTP()` or `supabase.auth.updateUser()`.
  4. For Supabase magic links: configure Supabase Auth redirect URL to `studentos://reset-password` in the Supabase dashboard.
- **Dynamic routes** — `app/course/[courseId].tsx` replaces `/course/:courseId`. `app/group/[groupId].tsx` replaces `/group/:groupId`.
- **Navigation API mapping:**
  - `useNavigate()` → `useRouter().push()` / `router.back()`
  - `useParams()` → `useLocalSearchParams()`
  - `useSearchParams()` → `useLocalSearchParams()`
  - `<Link to="/path">` → `<Link href="/path">`
  - `useLocation()` → `usePathname()` + `useGlobalSearchParams()`
  - `<Navigate to="/auth" replace />` → `router.replace('/(auth)/login')`

### Key decisions

1. Tab names: Home, Study, Exams, Social, Profile (5 tabs per NAVL-01).
2. Auth redirect strategy: Root layout checks auth → redirects to `(auth)` or `(tabs)` or `onboarding`.
3. Deep link scheme: `studentos://` — configure in `app.json` and Supabase dashboard.

### Risks

- **Deep linking with authentication** — when a user clicks a magic link while not logged in, the app must: open the reset-password screen → complete password reset → redirect to login. This requires the `(auth)` route group to handle deep-linked params.
- **Tab bar disappearing** on nested stack navigation — use proper route group nesting. Stack screens inside `(tabs)/` preserve the tab bar.
- **Type-safe routes** — Expo Router generates types from file structure. Must run `npx expo customize tsconfig.json` to enable typed routes.

---

## 4. Supabase Auth with SecureStore (AUTH-01–05)

### What to know

- **Current web Supabase client** (`studentoss/src/integrations/supabase/client.ts`):
  ```typescript
  export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { storage: localStorage, persistSession: true, autoRefreshToken: true }
  });
  ```
  The `storage: localStorage` MUST be replaced with `expo-secure-store` for token persistence. The `localStorage` polyfill is insecure for auth tokens (Pitfall 2).

- **SecureStore adapter** must implement Supabase's `SupportedStorage` interface:
  ```typescript
  import * as SecureStore from 'expo-secure-store';

  const ExpoSecureStoreAdapter = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
  ```
  **Note:** Supabase's `SupportedStorage` expects sync methods by default. The `expo-secure-store` API is async (`getItemAsync`). Need to check if Supabase JS client supports async storage adapters (it does as of `@supabase/supabase-js@2.x` — async storage is supported).

- **Auth flow mapping:**
  - AUTH-01 (sign up): `supabase.auth.signUp({ email, password })` — same API, works cross-platform.
  - AUTH-02 (sign in + session persist): `supabase.auth.signInWithPassword({ email, password })` + SecureStore for token persistence. Session restore on app restart via `supabase.auth.getSession()`.
  - AUTH-03 (password reset + deep linking): `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'studentos://reset-password' })` → email with magic link → deep link opens app → `supabase.auth.verifyOTP()` or session exchange.
  - AUTH-04 (sign out): `supabase.auth.signOut()` + clear SecureStore + redirect to `(auth)/login`.
  - AUTH-05 (blocked user detection): Listen to `supabase.auth.onAuthStateChange()` → check `user.user_metadata.is_blocked` or query `profiles.is_blocked` → if blocked, `signOut()` + show blocked message.

- **Blocked user detection** (AUTH-05) — The current web app likely checks `is_blocked` on the profile. The native app must:
  1. Check `is_blocked` on every auth state change (sign in, session restore).
  2. Also check on a timer or Realtime subscription (in case admin blocks user during active session).
  3. If blocked: immediately sign out, clear SecureStore, redirect to login with a "Your account has been blocked" message.

- **Environment variables** for Supabase: Replace `import.meta.env.VITE_SUPABASE_URL` → use `expo-constants` or `@env` Babel plugin. The `VITE_` prefix pattern doesn't work in React Native.

### Key decisions

1. Async SecureStore adapter — confirmed Supabase JS v2+ supports async storage.
2. Blocked user check — on auth state change + periodic poll (every 5 min) + Supabase Realtime if available.
3. Environment variables — `expo-constants` for public keys, `.env` + Babel plugin for development.

### Risks

- **SecureStore value size limit** — Android Keystore has a ~2KB per-value limit. Supabase auth sessions can exceed this if the session contains large JWTs. Mitigation: split the session across multiple SecureStore keys, or use `expo-sqlite/kv-store` for the full session but encrypt the refresh token in SecureStore.
- **Race condition on cold start** — `getSession()` is async; the app must show a loading state while resolving auth before redirecting.
- **Magic link redirect** — Supabase magic links use `#access_token=...` fragment in the URL. React Native deep linking must parse this correctly. Test thoroughly on real Android devices.

---

## 5. Cross-Cutting Platform Services (FND-03, FND-06, FND-07, FND-08, NAVL-04)

### SSE Streaming Client

- **No `EventSource` in React Native** — the web `EventSource` API doesn't exist in RN's JS runtime.
- **Options:**
  1. `react-native-sse` — community package, uses `fetch` + `ReadableStream`. Lightweight but not widely used.
  2. Custom `fetch` + `ReadableStream` implementation — more control, no dependency.
  3. `react-native-event-source` — another community option.
- **Recommendation:** Custom `fetch` + `ReadableStream` implementation (Option 2). It's minimal code, no external dependency, and gives full control over reconnection, error handling, and parsing. The pattern:
  ```typescript
  async function* streamSSE(url: string, body: object): AsyncGenerator<string> {
    const response = await fetch(url, { method: 'POST', headers: {...}, body: JSON.stringify(body) });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE format: "data: ..." lines
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          yield line.slice(6);
        }
      }
    }
  }
  ```
- **Hermes engine** (used by Expo SDK 54+) supports `ReadableStream` as of recent versions. Verify this works on the target SDK version.

### KaTeX Rendering

- **No native KaTeX in React Native** — `katex.renderToString()` produces HTML, which can't be rendered as native views.
- **Options:**
  1. `react-native-math-view` — renders math as native views. Best for inline math in chat/AI responses.
  2. WebView-based rendering — render KaTeX HTML in a WebView component. Works but heavy per-expression.
  3. `react-native-katex` — WebView wrapper specifically for KaTeX.
- **Recommendation for Phase 1:** Build a `MathView` component using `react-native-math-view` for inline math. Create a `MathWebView` component for complex/full-document rendering. The Phase 1 deliverable is a **test component** that renders KaTeX — not the full migration (that's Phase 3-4).
- **Phase 1 scope:** Create a `components/MathView.tsx` that takes a LaTeX string and renders it. Verify it works with common AI tutor math expressions.

### Environment Variable Validation (FND-03)

- **zod** for runtime validation of environment variables at app startup.
- **Pattern:** Create `src/lib/env.ts` that validates all required env vars on import. If validation fails, show an error screen (not crash).
  ```typescript
  import { z } from 'zod';

  const envSchema = z.object({
    EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    EXPO_PUBLIC_PAYSTACK_KEY: z.string().min(1),
  });

  export const env = envSchema.parse({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_PAYSTACK_KEY: process.env.EXPO_PUBLIC_PAYSTACK_KEY,
  });
  ```
- **Expo public env vars** use the `EXPO_PUBLIC_` prefix (not `VITE_`). These are inlined at build time by Metro.
- **Hardcoded keys** — The Paystack test key `pk_test_58f4b0b6d69b01ee0e2b3a78b5de225b1ebd0ed8` in `paystackConfig.ts` must be moved to `.env` and referenced via `env.EXPO_PUBLIC_PAYSTACK_KEY`.

### Per-Route Error Boundaries (FND-06)

- **Expo Router supports `ErrorBoundary` exports** from route files. This is the native approach:
  ```typescript
  // app/(tabs)/study.tsx
  import { type ErrorBoundaryProps } from 'expo-router';

  export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg font-semibold text-destructive">Something went wrong</Text>
        <Text className="text-muted-foreground mt-2">{error.message}</Text>
        <Text onPress={retry} className="text-primary mt-4 font-medium">Try Again</Text>
      </View>
    );
  }
  ```
- **Root error boundary** — `app/_layout.tsx` can export a root `ErrorBoundary` that catches unhandled errors in any nested route. Per-route boundaries take precedence.
- **Phase 1 deliverable:** Root error boundary + per-route error boundary on at least one screen as a template.

### 2GB RAM / Low-End Device Testing (FND-07)

- **Create an Android AVD profile** matching the target: 2GB RAM, Android 8+ (API 26+), low CPU.
- **AVD settings:** Device: `pixel_2`, RAM: `2048`, VM heap: `256`, API level: `28` (Android 9 — good coverage of 8+ target).
- **React Native memory profiling:** Use Flipper (deprecated) or React DevTools + `expo-dev-client` memory profiler.
- **Phase 1 deliverable:** Create the AVD profile. Verify the app launches and doesn't OOM on the 2GB emulator. Document the profiling setup for subsequent phases.

### Bundle Optimization (FND-08)

- **Expo Router lazy loads screens by default** — no manual code splitting needed initially.
- **Tree shaking** — Metro bundler tree-shakes unused exports. Ensure `@studentos/shared` only exports what's needed.
- **Hermes engine** (default in Expo SDK 54+) compiles JS to bytecode, reducing parse time and memory usage. Already enabled by default.
- **Phase 1 scope:** Verify Hermes is enabled. Measure initial bundle size. Set a baseline for future optimization.

### Dark Mode (NAVL-04)

- **NativeWind v4** provides `useColorScheme()` and class-based dark mode (`className="dark:bg-gray-900"`).
- **Implementation:**
  1. Root `_layout.tsx` wraps with `<ThemeProvider>` that uses `useColorScheme()` from NativeWind.
  2. All components use `className` with `dark:` variants (same as web TailwindCSS).
  3. Toggle: `useColorScheme().setColorScheme('dark'|'light'|'system')`.
  4. Persistence: `appStorage.setItemSync('theme', 'dark')` via `expo-sqlite/kv-store`.
- **Matches web behavior:** The web app uses `next-themes` with `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`, `storageKey="studentos-theme"`. The native version mirrors this with NativeWind's class-based dark mode and `appStorage` persistence.

---

## 6. Security Threat Model (Phase 1 Specific)

### Threats

| ID | Threat | Impact | Mitigation | Requirement |
|----|--------|--------|------------|-------------|
| T-1-01 | Auth tokens stored in plaintext (localStorage polyfill) | Token theft, session hijacking | SecureStore adapter for Supabase auth storage | AUTH-02 |
| T-1-02 | Hardcoded API keys in source code | Key extraction from bundle, unauthorized use | Zod-validated env vars, `.env` files, `EXPO_PUBLIC_` prefix | FND-03 |
| T-1-03 | Deep link hijacking | Malicious app intercepts password reset links | Validate deep link origin, use unique scheme | AUTH-03 |
| T-1-04 | No env validation at startup | Missing config causes silent failures or data leaks | Zod schema validation on app launch | FND-03 |
| T-1-05 | Error boundary information leakage | Stack traces expose internal paths | Sanitize error messages in production | FND-06 |

---

## 7. Dependencies & Build Order

Phase 1 has internal build order dependencies:

```
1a. Monorepo scaffold (workspaces, package.json, tsconfig, metro.config.js)
 ↓
1b. Expo project init (app.json, babel.config.js, NativeWind config, global.css)
 ↓
1c. @studentos/shared package (types, utils, config — no hooks yet)
 ↓
1d. Expo Router setup (app/ directory structure, _layout.tsx files, deep linking)
 ↓ (can parallel after 1d)
1e. Supabase Auth (SecureStore adapter, auth hook, blocked user detection)
1f. Cross-cutting services (SSE client, KaTeX test, env validation, error boundaries, AVD setup)
```

Plans 01-01 and 01-02 can partially overlap (NativeWind config is part of 01-01 but routing is 01-02). Plans 01-03 and 01-04 can run in parallel after 01-02 completes.

---

## 8. Open Questions / Research Gaps

1. **SSE streaming in Hermes** — Does `fetch` + `ReadableStream` work in Hermes engine (Expo SDK 54)? Need to verify on actual device. The research says Hermes has added `ReadableStream` support, but SSE parsing with `TextDecoder` + chunked reading needs real-device testing.
2. **SecureStore size limit** — Android Keystore limits individual values to ~2KB. A Supabase session JWT can be larger. Need to verify actual session size and potentially split storage.
3. **`react-native-math-view` maintenance** — Check if the package is actively maintained and works with Expo SDK 54+. If not, fallback to WebView-based KaTeX rendering for Phase 1 test component.
4. **Expo Router typed routes** — The `npx expo customize tsconfig.json` command for generating typed route paths needs verification with the exact Expo SDK version used.

---

## RESEARCH COMPLETE
