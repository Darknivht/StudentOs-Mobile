# Architecture Patterns

**Domain:** React PWA → React Native (Expo) conversion
**Researched:** 2026-05-05
**Confidence:** HIGH

## Recommended Architecture

**Layered Architecture with Feature-Based Colocation** — the native app mirrors the web app's hook → component → page pattern but reorganizes into Expo Router's file-based routing structure, with shared business logic extracted into a monorepo package.

```
┌──────────────────────────────────────────────────────┐
│                   Expo Router (app/)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  (auth)      │  │  (tabs)      │  │  (modal)    │ │
│  │  _layout.tsx │  │  _layout.tsx │  │  _layout.tsx│ │
│  │  login.tsx   │  │  index.tsx   │  │  chat.tsx   │ │
│  │  register.tsx│  │  study.tsx   │  │             │ │
│  └─────────────┘  │  notes.tsx   │  └─────────────┘ │
│                    │  ...         │                   │
│                    └──────────────┘                   │
├──────────────────────────────────────────────────────┤
│              Feature Components (features/)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ study/   │ │ notes/   │ │ focus/   │ │ chat/   │ │
│  │ cards,   │ │ editor,  │ │ timer,   │ │ dm,     │ │
│  │ timer    │ │ list     │ │ overlay  │ │ group   │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
├──────────────────────────────────────────────────────┤
│          Shared UI Primitives (components/ui/)       │
│  NativeWind + NativeWindUI components (button, card, │
│  input, dialog/bottom-sheet, alert, badge, avatar)  │
├──────────────────────────────────────────────────────┤
│          Business Logic Layer (@studentos/shared)     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ hooks/   │ │ lib/     │ │ types/   │ │ supa-   │ │
│  │ useAuth, │ │ utils.ts │ │ database │ │ base/   │ │
│  │ useSub,  │ │ ai.ts    │ │ models   │ │ client  │ │
│  │ useFocus │ │ config   │ │          │ │         │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
├──────────────────────────────────────────────────────┤
│              Native Modules (modules/)                │
│  ┌──────────────────────────────────────────────────┐│
│  │  expo-focus-mode (Kotlin AccessibilityService)   ││
│  └──────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────┤
│              Platform Services (services/)            │
│  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐ │
│  │ Storage│ │ NetInfo  │ │ Notifs  │ │ Paystack   │ │
│  │ SQLite │ │ offline  │ │ push    │ │ WebView    │ │
│  └────────┘ └──────────┘ └─────────┘ └────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Monorepo Structure

**Use a monorepo** because the web app continues to exist alongside the native app, and they share 20+ hooks, Supabase types, business logic, and configuration. Expo has first-class monorepo support (SDK 52+ with automatic Metro configuration).

```
StudentOs-Mobile/
├── package.json                    # Root: { workspaces: ["apps/*", "packages/*"] }
├── pnpm-workspace.yaml             # Or npm/yarn workspaces
│
├── apps/
│   ├── web/                        # Existing React PWA (moved from studentoss/)
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json            # depends on @studentos/shared
│   │
│   └── native/                     # New React Native (Expo) app
│       ├── app/                    # Expo Router file-based routes
│       │   ├── _layout.tsx         # Root layout (providers, theme, splash)
│       │   ├── (auth)/             # Auth route group (no bottom nav)
│       │   │   ├── _layout.tsx     # Stack layout for auth
│       │   │   ├── login.tsx
│       │   │   └── reset-password.tsx
│       │   ├── (tabs)/             # Main tab navigation group
│       │   │   ├── _layout.tsx     # Tabs layout (BottomNav equivalent)
│       │   │   ├── index.tsx       # Dashboard (home tab)
│       │   │   ├── study.tsx       # Study tab
│       │   │   ├── notes.tsx       # Smart Notes tab
│       │   │   ├── tutor.tsx       # AI Tutor tab
│       │   │   └── profile.tsx     # Profile tab
│       │   ├── course/             # Dynamic routes
│       │   │   └── [courseId].tsx
│       │   ├── chat.tsx            # Modal/stack screens
│       │   ├── group/[groupId].tsx
│       │   ├── focus-session.tsx
│       │   ├── flashcards.tsx
│       │   ├── quizzes.tsx
│       │   ├── exams.tsx
│       │   ├── achievements.tsx
│       │   ├── plan.tsx
│       │   ├── social.tsx
│       │   ├── career.tsx
│       │   ├── safety.tsx
│       │   ├── upgrade.tsx
│       │   ├── store.tsx
│       │   ├── focus.tsx
│       │   ├── onboarding.tsx
│       │   ├── terms.tsx
│       │   ├── privacy.tsx
│       │   ├── admin-resources.tsx
│       │   ├── blocking-overlay.tsx
│       │   └── +not-found.tsx      # 404 catch-all
│       │
│       ├── features/               # Feature-specific components
│       │   ├── study/              # Study feature components
│       │   ├── notes/              # Note editor components
│       │   ├── focus/              # Focus mode components
│       │   ├── chat/               # Chat components
│       │   ├── exam-prep/          # Exam prep components
│       │   ├── career/             # Career components
│       │   ├── gamification/       # Achievements, XP, streaks
│       │   ├── store/              # Store components
│       │   ├── planning/           # Planning components
│       │   ├── safety/             # Safety components
│       │   ├── academic/           # Academic components
│       │   └── ads/                # Ad banner components
│       │
│       ├── components/             # Shared UI primitives
│       │   ├── ui/                 # NativeWindUI-based primitives
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── input.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── avatar.tsx
│       │   │   ├── alert.tsx
│       │   │   ├── progress.tsx
│       │   │   ├── skeleton.tsx
│       │   │   ├── switch.tsx
│       │   │   ├── checkbox.tsx
│       │   │   ├── slider.tsx
│       │   │   ├── separator.tsx
│       │   │   ├── label.tsx
│       │   │   ├── text.tsx        # NativeWindUI Text with variants
│       │   │   └── ...
│       │   ├── layout/             # Layout primitives
│       │   │   ├── Header.tsx      # Replaces AppLayout header
│       │   │   └── Container.tsx
│       │   └── themed/             # Cross-platform themed wrappers
│       │       ├── ThemedView.tsx
│       │       └── ThemedText.tsx
│       │
│       ├── services/               # Platform service abstractions
│       │   ├── storage.ts          # expo-sqlite/kv-store wrapper
│       │   ├── offline.ts          # NetInfo + offline detection
│       │   ├── notifications.ts    # expo-notifications wrapper
│       │   ├── haptics.ts          # expo-haptics wrapper
│       │   └── payments.ts         # Paystack WebView integration
│       │
│       ├── modules/                # Local Expo native modules
│       │   └── expo-focus-mode/    # Kotlin AccessibilityService
│       │       ├── android/
│       │       ├── ios/            # Placeholder for future
│       │       ├── src/
│       │       ├── expo-module.config.json
│       │       └── package.json
│       │
│       ├── constants/              # App constants
│       │   ├── colors.ts
│       │   ├── typography.ts
│       │   └── spacing.ts
│       │
│       ├── hooks/                  # Native-specific hooks
│       │   ├── useColorScheme.ts   # From NativeWindUI
│       │   ├── useOfflineStatus.ts # Replaces web PWA hook
│       │   └── useFocusMode.ts     # Bridges to native module
│       │
│       ├── global.css              # NativeWind/Tailwind v4 CSS
│       ├── tailwind.config.ts      # Shared design tokens
│       ├── app.json                # Expo config + plugins
│       ├── metro.config.js         # (auto-configured for monorepo)
│       ├── tsconfig.json
│       ├── babel.config.js
│       └── package.json            # depends on @studentos/shared
│
├── packages/
│   └── shared/                     # @studentos/shared
│       ├── src/
│       │   ├── hooks/              # Platform-agnostic hooks
│       │   │   ├── useAuth.ts      # Supabase auth (with RN adapter)
│       │   │   ├── useSubscription.ts
│       │   │   ├── useStudyTimeTracker.ts
│       │   │   ├── useCourseProgress.ts
│       │   │   ├── useAchievements.ts
│       │   │   ├── useActivityTracking.ts
│       │   │   ├── useWeeklyXP.ts
│       │   │   ├── useStreak.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── lib/                # Platform-agnostic utilities
│       │   │   ├── utils.ts        # cn() class merging
│       │   │   ├── ai.ts           # AI gateway config
│       │   │   ├── educationConfig.ts
│       │   │   ├── subscriptionConfig.ts
│       │   │   ├── formatters.ts
│       │   │   ├── parseAIResponse.ts
│       │   │   └── resilientFetch.ts
│       │   │
│       │   ├── types/              # Shared TypeScript types
│       │   │   ├── database.ts     # Supabase generated types
│       │   │   ├── models.ts       # Domain models
│       │   │   ├── subscription.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── supabase/           # Supabase client factory
│       │   │   ├── client.ts       # Platform-aware createClient
│       │   │   └── types.ts
│       │   │
│       │   └── index.ts            # Package entry point
│       │
│       ├── tsconfig.json
│       └── package.json
│
├── supabase/                       # Edge functions (unchanged)
│   └── functions/
│
└── .planning/                      # GSD planning docs
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Expo Router (app/)** | Navigation, screen rendering, deep linking | Features, Layout components |
| **Features (features/)** | Feature-specific UI composition | Shared hooks (via @studentos/shared), UI primitives, Services |
| **UI Primitives (components/ui/)** | Visual building blocks (buttons, cards, inputs) | Features, Layout — never talks to hooks directly |
| **@studentos/shared** | Business logic, types, Supabase client, platform-agnostic utilities | Features, Hooks — pure logic, no React Native or web DOM imports |
| **Services (services/)** | Platform capability wrappers (storage, offline, payments, haptics) | Features, Hooks — abstracts native APIs |
| **Native Modules (modules/)** | Kotlin/Java native code for Android-specific capabilities | JS bridge via Expo Modules API |
| **Supabase** | Backend (auth, DB, storage, realtime, functions) | @studentos/shared only — never imported directly from features |

### Data Flow

```
User Tap
    │
    ▼
┌─────────────┐     ┌─────────────────┐
│  Expo Router │────▶│  Route Screen   │
│  (navigate)  │     │  (app/*.tsx)    │
└─────────────┘     └────────┬────────┘
                             │
                    uses hooks from
                             │
                    ┌────────▼────────┐
                    │ @studentos/shared│
                    │  (business logic)│
                    └────────┬────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
          ┌──────▼──────┐ ┌──▼───┐ ┌────▼────┐
          │  Supabase   │ │React │ │ Services│
          │  Client     │ │Query │ │(storage,│
          │             │ │Cache │ │offline) │
          └─────────────┘ └──────┘ └─────────┘
                 │           │           │
                 ▼           ▼           ▼
          ┌──────────┐ ┌─────────┐ ┌──────────┐
          │ PostgREST │ │In-Memory│ │ expo-sqlite│
          │ Realtime  │ │ + Persist│ │ /kv-store │
          │ Auth      │ │ to disk │ │ (offline  │
          │ Storage   │ │         │ │  data)    │
          └──────────┘ └─────────┘ └──────────┘
```

**Key data flow patterns:**

1. **Server state** → TanStack React Query → hooks in `@studentos/shared` → UI components
   - Same pattern as web. QueryClient configured with `expo-sqlite/kv-store` persister for offline cache.
   - `gcTime: 24h` ensures cached data survives app restarts on low-end devices.

2. **Auth state** → `useAuth` hook in `@studentos/shared` → Context provider in root `_layout.tsx`
   - Supabase `auth.storage` set to `expo-sqlite/kv-store` (drop-in for `localStorage`).
   - Auth state change listener fires on session restore, sign in, sign out.

3. **Offline state** → `@react-native-community/netinfo` → `useOfflineStatus` hook → UI reacts
   - Replaces web's `navigator.onLine` + Service Worker approach.
   - When offline: React Query serves cached data; mutations queued in `expo-sqlite`.

4. **Focus Mode** → Native module (Kotlin AccessibilityService) → JS bridge → `useFocusMode` hook
   - Config plugin injects required Android permissions and service declaration.
   - JS interface matches existing `FocusModePluginInterface` for parity.

5. **AI state** → `useOfflineAI` context (simplified for native) → cloud API primary, native ML optional
   - WebLLM/browser inference replaced with API-only for MVP.
   - Future: ONNX Runtime Mobile via native module for on-device inference.

## Patterns to Follow

### Pattern 1: Platform-Aware Shared Hooks

**What:** Hooks in `@studentos/shared` that accept platform adapters via dependency injection, so the same hook logic works on both web and native.

**When:** Every hook that touches platform APIs (storage, auth persistence, network detection).

**Example:**

```typescript
// packages/shared/src/hooks/useAuth.ts
import type { StorageAdapter } from '../types/platform';

interface AuthDeps {
  storage: StorageAdapter;  // { getItem, setItem, removeItem }
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => { unsubscribe: () => void };
  getSession: () => Promise<{ data: { session: Session | null } }>;
}

export function createAuthHook(deps: AuthDeps) {
  return function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      deps.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { unsubscribe } = deps.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    // ... signUp, signIn, signOut use deps.storage for session persistence
    return { user, session, loading, signUp, signIn, signOut };
  };
}
```

```typescript
// apps/native/hooks/useAuth.native.ts
import { createAuthHook } from '@studentos/shared';
import { supabase } from '@studentos/shared/supabase';
import Storage from 'expo-sqlite/kv-store';

const storageAdapter = {
  getItem: (key: string) => Storage.getItem(key),
  setItem: (key: string, value: string) => Storage.setItem(key, value),
  removeItem: (key: string) => Storage.removeItem(key),
};

export const useAuth = createAuthHook({
  storage: storageAdapter,
  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
  getSession: () => supabase.auth.getSession(),
});
```

```typescript
// apps/web/hooks/useAuth.web.ts
import { createAuthHook } from '@studentos/shared';
import { supabase } from '@studentos/shared/supabase';

const storageAdapter = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};

export const useAuth = createAuthHook({
  storage: storageAdapter,
  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
  getSession: () => supabase.auth.getSession(),
});
```

### Pattern 2: Route Groups for Navigation Structure

**What:** Use Expo Router's parenthesized directories `(auth)`, `(tabs)`, `(modal)` to define navigation groups with different layouts, mirroring the web's `AppLayout` vs. bare-page patterns.

**When:** Defining the entire route tree. This is the core structural pattern.

**Example:**

```typescript
// app/(tabs)/_layout.tsx — Equivalent to AppLayout + BottomNav
import { Tabs } from 'expo-router';
import { Home, BookOpen, FileText, Bot, User } from '@roninoss/icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#6366f1', // primary color
    }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: Home, title: 'Home' }} />
      <Tabs.Screen name="study" options={{ tabBarIcon: BookOpen, title: 'Study' }} />
      <Tabs.Screen name="notes" options={{ tabBarIcon: FileText, title: 'Notes' }} />
      <Tabs.Screen name="tutor" options={{ tabBarIcon: Bot, title: 'AI Tutor' }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: User, title: 'Profile' }} />
    </Tabs>
  );
}
```

```typescript
// app/(auth)/_layout.tsx — Stack layout for unauthenticated screens
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```typescript
// app/_layout.tsx — Root layout: all providers
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/useColorScheme';
import Storage from 'expo-sqlite/kv-store';

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 } }
});

const persister = createAsyncStoragePersister({ storage: Storage });

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <ThemeProvider>
          <AuthProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              {/* All other stack screens */}
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

### Pattern 3: Per-Route Error Boundaries

**What:** Export `ErrorBoundary` from each route file to catch route-specific errors with retry capability. This replaces the web's single `ErrorBoundary` component with granular per-route boundaries.

**When:** Every route that fetches data or could fail.

**Example:**

```typescript
// app/(tabs)/study.tsx
import { type ErrorBoundaryProps } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-lg font-semibold text-destructive">Something went wrong</Text>
      <Text className="text-muted-foreground mt-2">{error.message}</Text>
      <Text onPress={retry} className="text-primary mt-4 font-medium">Try Again</Text>
    </View>
  );
}

export default function StudyScreen() {
  // ... normal screen
}
```

### Pattern 4: Feature Component Colocation

**What:** Group feature-specific components (not shared UI primitives) next to their consuming screens in `features/` directories, not in the global `components/` tree.

**When:** Components that are only used by one feature area (e.g., FocusTimer is only used by Focus).

**Example:**

```
features/
  focus/
    FocusTimer.tsx
    BlockingOverlay.tsx
    AppSelector.tsx
    FocusStats.tsx
  notes/
    NoteEditor.tsx
    NoteCard.tsx
    MarkdownRenderer.tsx
  exam-prep/
    ExamCard.tsx
    QuestionView.tsx
    ScoreSummary.tsx
```

### Pattern 5: Service Abstraction Layer

**What:** Wrap all platform APIs in a thin service layer in `services/`, so feature code never imports `expo-sqlite`, `@react-native-community/netinfo`, or `expo-notifications` directly.

**When:** Any platform API that might differ between web and native, or could change implementations.

**Example:**

```typescript
// services/storage.ts
import Storage from 'expo-sqlite/kv-store';

export const appStorage = {
  getItem: Storage.getItem,
  getItemSync: Storage.getItemSync,
  setItem: Storage.setItem,
  setItemSync: Storage.setItemSync,
  removeItem: Storage.removeItem,
};

// Usage in hook:
import { appStorage } from '@/services/storage';
appStorage.setItemSync('onboarding_seen', 'true');
```

### Pattern 6: NativeWind cssInterop for Third-Party Components

**What:** Use `cssInterop` from NativeWind to enable `className` on third-party components that only accept `style` props.

**When:** Integrating any component from `@gorhom/bottom-sheet`, `@shopify/flash-list`, `react-native-svg`, etc.

**Example:**

```typescript
// In component file or a central interop file
import { cssInterop } from 'nativewind';
import { FlashList } from '@shopify/flash-list';

cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

// Now use with className:
<FlashList
  className="bg-background"
  contentContainerClassName="p-4"
  data={items}
  renderItem={renderItem}
  estimatedItemSize={50}
/>
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct DOM/Web API Usage in Shared Code

**What:** Using `window`, `document`, `localStorage`, `navigator`, `indexedDB`, `caches`, or `ServiceWorker` APIs in `@studentos/shared`.

**Why bad:** These APIs don't exist in React Native. Importing them causes runtime crashes or silent failures.

**Instead:** Inject platform adapters (Pattern 1) or use the service abstraction layer (Pattern 5). The shared package must be a pure TypeScript/React package with zero web or native platform imports.

**Critical example from current codebase:** `OfflineAIContext.tsx` uses `navigator.userAgent`, `navigator.deviceMemory`, `localStorage`, `caches`, `indexedDB` — ALL of these must be abstracted behind platform adapters.

### Anti-Pattern 2: Monolithic Layout Component

**What:** A single `AppLayout` component that conditionally renders header, bottom nav, and content — the current web pattern.

**Why bad:** Expo Router handles layouts declaratively via `_layout.tsx` files per route group. A monolithic layout fights the framework and prevents native tab transitions.

**Instead:** Use route groups with separate `_layout.tsx` files. The `(tabs)/_layout.tsx` handles the bottom tab navigator. The `(auth)/_layout.tsx` handles the bare stack for login. The root `_layout.tsx` only handles providers.

### Anti-Pattern 3: Web-First Component Library in Native

**What:** Trying to use shadcn/ui components (which wrap Radix primitives) in React Native.

**Why bad:** Radix UI uses DOM APIs (`document.createElement`, `MutationObserver`, `IntersectionObserver`) that don't exist in React Native. shadcn/ui components will crash immediately.

**Instead:** Use NativeWindUI components (built for React Native with NativeWind) or build equivalent primitives from `View`, `Text`, `Pressable` with NativeWind `className` styling. The 40+ shadcn/ui components need a mapping strategy (see Component Mapping below).

### Anti-Pattern 4: Service Worker Thinking for Offline

**What:** Attempting to replicate the PWA's Service Worker + Cache API + IndexedDB offline strategy in React Native.

**Why bad:** React Native has no Service Worker, no Cache API, and IndexedDB is browser-only. These are fundamentally different offline architectures.

**Instead:** Use `expo-sqlite` for structured offline data, `expo-sqlite/kv-store` for key-value persistence, TanStack Query's `PersistQueryClientProvider` for server state cache persistence, and `@react-native-community/netinfo` for connectivity detection.

### Anti-Pattern 5: Mixing Navigation Paradigms

**What:** Using `useRouter().push()` for some navigation and `<Link href>` for others, or importing React Router's `useNavigate`.

**Why bad:** Creates inconsistent navigation patterns, breaks deep linking, and confuses the Expo Router state machine.

**Instead:** Use `<Link href="/path">` for declarative navigation (like `<a>` tags) and `useRouter().push('/path')` for imperative navigation (after mutations, auth redirects). Never import `react-router-dom`.

### Anti-Pattern 6: Capacitor Plugin Wrappers in Native

**What:** Importing `@capacitor/core` or using `Capacitor.isNativePlatform()` in the React Native app.

**Why bad:** Capacitor and React Native are mutually exclusive native runtimes. The Capacitor bridge doesn't exist in React Native.

**Instead:** Build a new Expo module (`expo-focus-mode`) using the Expo Modules API (Kotlin + Swift). The JS interface can mirror the existing `FocusModePluginInterface` for easy migration.

## Component Mapping: Web → Native

The existing 40+ shadcn/ui components map to React Native equivalents as follows:

| Web Component (shadcn/ui + Radix) | Native Replacement | Strategy |
|-----------------------------------|--------------------|----------|
| `button.tsx` | NativeWindUI Button + NativeWind | Direct replacement, same `className` API |
| `card.tsx` | NativeWindUI Card | Direct replacement |
| `input.tsx` | NativeWind TextInput + NativeWind | Rebuild with `className` |
| `textarea.tsx` | NativeWind TextInput (multiline) | Rebuild |
| `badge.tsx` | NativeWindUI Badge | Direct replacement |
| `avatar.tsx` | NativeWindUI Avatar + expo-image | Direct replacement |
| `alert.tsx` | NativeWindUI Alert | Direct replacement |
| `alert-dialog.tsx` | NativeWindUI Alert (modal) | Different pattern — use RN `Alert.alert()` or custom modal |
| `dialog.tsx` | `@gorhom/bottom-sheet` or Modal | Different paradigm — sheets are more native than centered modals |
| `sheet.tsx` | `@gorhom/bottom-sheet` (via NativeWindUI Sheet) | Near-equivalent |
| `select.tsx` | NativeWindUI Action Sheet | Different paradigm — action sheets are more native |
| `tabs.tsx` | Expo Router Tabs | Completely different — navigation-level, not component-level |
| `switch.tsx` | RN Switch + NativeWind | Rebuild wrapper |
| `checkbox.tsx` | RN Checkbox + NativeWind | Rebuild wrapper |
| `radio-group.tsx` | RN RadioGroup or custom | Rebuild |
| `slider.tsx` | `@react-native-community/slider` + NativeWind | Rebuild wrapper |
| `progress.tsx` | NativeWindUI ProgressIndicator or RN Animated | Rebuild |
| `skeleton.tsx` | RN Animated + NativeWind | Rebuild with shimmer animation |
| `tooltip.tsx` | `react-native-tooltip` or custom | Different paradigm — long press or popover |
| `toast.tsx` / `sonner.tsx` | `react-native-toast-message` or NativeWindUI | Rebuild — no DOM for toasts |
| `dropdown-menu.tsx` | NativeWindUI Action Sheet | Different paradigm |
| `popover.tsx` | RN Modal or `@gorhom/bottom-sheet` | Different paradigm |
| `calendar.tsx` | `react-native-calendars` | Different library |
| `carousel.tsx` | `react-native-reanimated-carousel` | Different library |
| `accordion.tsx` | RN Reanimated Collapsible | Rebuild with Reanimated |
| `collapsible.tsx` | RN Reanimated Collapsible | Rebuild |
| `separator.tsx` | RN View with NativeWind | Simple replacement |
| `scroll-area.tsx` | RN ScrollView / FlatList | Native scroll is default — no component needed |
| `table.tsx` | FlashList + NativeWind | Different paradigm — no HTML table |
| `chart.tsx` | `react-native-chart-kit` or victory-native | Different library |
| `form.tsx` | Custom hook form + NativeWind | Rebuild — no DOM form validation |
| `label.tsx` | RN Text + NativeWind | Simple replacement |
| `toggle.tsx` | RN Pressable + NativeWind | Rebuild |
| `command.tsx` | Custom search + FlashList | Different paradigm |
| `drawer.tsx` | `@gorhom/bottom-sheet` | Different paradigm |
| `sidebar.tsx` | NOT NEEDED (mobile has no sidebar) | Remove entirely |
| `breadcrumb.tsx` | NOT NEEDED (mobile navigation is stack-based) | Remove entirely |
| `pagination.tsx` | NOT NEEDED (infinite scroll via FlashList) | Remove entirely |
| `hover-card.tsx` | NOT NEEDED (no hover on mobile) | Remove entirely |
| `context-menu.tsx` | NOT NEEDED (no right-click on mobile) | Remove entirely |
| `menubar.tsx` | NOT NEEDED (mobile uses different patterns) | Remove entirely |
| `navigation-menu.tsx` | NOT NEEDED (replaced by Expo Router) | Remove entirely |
| `resizable.tsx` | NOT NEEDED (no resizable panels on mobile) | Remove entirely |

**Summary:** ~15 components have direct NativeWindUI replacements, ~15 need rebuilds with different patterns, ~10 are web-only and should be removed.

## Routing Mapping: React Router → Expo Router

| Current Web Route | Expo Router File | Notes |
|-------------------|------------------|-------|
| `/` (HomeRoute logic) | `app/(tabs)/index.tsx` | Auth redirect handled by `_layout.tsx` |
| `/auth` | `app/(auth)/login.tsx` | In `(auth)` group (no bottom nav) |
| `/reset-password` | `app/(auth)/reset-password.tsx` | In `(auth)` group |
| `/onboarding` | `app/onboarding.tsx` | Root stack (before auth) |
| `/course/:courseId` | `app/course/[courseId].tsx` | Dynamic route syntax |
| `/group/:groupId` | `app/group/[groupId].tsx` | Dynamic route syntax |
| `/study` | `app/(tabs)/study.tsx` | Tab screen |
| `/notes` | `app/(tabs)/notes.tsx` | Tab screen |
| `/tutor` | `app/(tabs)/tutor.tsx` | Tab screen |
| `/profile` | `app/(tabs)/profile.tsx` | Tab screen |
| `/dashboard` | `app/(tabs)/index.tsx` | Same as `/` — the home tab |
| All other `/path` | `app/path.tsx` | Stack screens in root |
| `*` (404) | `app/+not-found.tsx` | Expo Router convention |
| `/docs/*` | `app/docs/*.tsx` | Nested stack |

**Key differences:**
- React Router's `<Navigate to="/auth" replace />` becomes `useRouter().replace('/(auth)/login')`
- `localStorage.getItem('onboarding_seen')` becomes `appStorage.getItemSync('onboarding_seen')`
- The `HomeRoute` auth/loading logic moves to `_layout.tsx` with `useAuth()` + redirect hooks

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Bundle size | Single bundle, code-split by Expo Router lazy loading | Monitor with `expo-updates` OTA; tree-shake unused NativeWindUI components | Dynamic feature loading with Expo Router groups |
| Offline data | `expo-sqlite` for cached notes, flashcards, courses | Add background sync with `expo-background-fetch` | Intelligent sync — only cache user's enrolled courses |
| Navigation performance | Stack screens mount on demand | Preload tab screens with `tabs.lazy = false` for core tabs | Mix of lazy/eager tabs based on usage analytics |
| React Query cache | 24h persistence, no max size | Add `cacheTime` + eviction strategy per query | Partition cache by feature; evict stale data aggressively |
| Focus Mode plugin | Single AccessibilityService | Handle edge cases (service killed, permission revoked) | Full kiosk mode with device admin API |

## Build Order (Dependencies Between Components)

The build order is determined by dependency chains. Each layer depends on the layer below it.

```
Phase 1: Foundation (no dependencies)
├── 1a. Monorepo setup (workspaces, package.json, metro.config.js)
├── 1b. Expo project scaffolding (app.json, babel, metro, TypeScript)
├── 1c. @studentos/shared package (types, utils, config only — no hooks yet)
└── 1d. NativeWind + global.css + tailwind.config.ts

Phase 2: Platform Services (depends on 1)
├── 2a. Supabase client factory (expo-sqlite/kv-store for auth storage)
├── 2b. appStorage service (expo-sqlite/kv-store wrapper)
├── 2c. Offline detection service (@react-native-community/netinfo)
└── 2d. Theme service (NativeWind dark mode)

Phase 3: Core Hooks (depends on 2)
├── 3a. useAuth (platform-aware, with expo-sqlite storage adapter)
├── 3b. React Query + PersistQueryClientProvider setup
└── 3c. useOfflineStatus (netinfo-based)

Phase 4: Navigation Shell (depends on 3)
├── 4a. Root _layout.tsx (providers: Query, Auth, Theme, Gesture)
├── 4b. (auth) group layout + login screen
├── 4c. (tabs) group layout + BottomNav
└── 4d. Onboarding flow

Phase 5: UI Primitives (depends on 1d)
├── 5a. Core NativeWindUI components (button, card, input, text, badge)
├── 5b. Form components (switch, checkbox, slider, label)
├── 5c. Feedback components (alert, toast, skeleton, progress)
└── 5d. Complex components (sheet/bottom-sheet, action-sheet, carousel)

Phase 6: Feature Screens (depends on 4 + 5)
├── 6a. Dashboard (home tab) — first visible screen
├── 6b. Study + Smart Notes tabs — core value
├── 6c. AI Tutor tab — AI integration
├── 6d. Flashcards + Quizzes screens
├── 6e. Exam Prep screen
├── 6f. Profile + Upgrade + Store screens
├── 6g. Chat + Group Chat screens (Supabase Realtime)
├── 6h. Focus + Focus Session screens
├── 6i. Achievements + Plan + Social screens
├── 6j. Career + Safety screens
└── 6k. Remaining: Terms, Privacy, Admin Resources

Phase 7: Native Modules (depends on 6h for UI)
├── 7a. expo-focus-mode Kotlin module (AccessibilityService)
├── 7b. Config plugin for Android permissions + service declaration
└── 7c. useFocusMode bridge hook

Phase 8: Payments + Offline (depends on 6f + 2)
├── 8a. Paystack WebView integration
├── 8b. Offline sync for notes + flashcards (expo-sqlite structured storage)
└── 8c. Background notifications (expo-notifications)

Phase 9: Polish + Testing (depends on all above)
├── 9a. Reanimated 3 animations (replace Framer Motion)
├── 9b. Haptic feedback on key interactions
├── 9c. Per-route ErrorBoundaries
├── 9d. Test suite (Jest + React Native Testing Library)
└── 9e. Performance optimization (FlashList, memo, bundle analysis)
```

**Build order rationale:**
- **Phase 1 must come first** because the monorepo structure determines how all code is organized and shared.
- **Phase 2 before 3** because hooks depend on storage and Supabase services.
- **Phase 3 before 4** because the navigation shell needs auth and query providers.
- **Phase 5 can overlap with 4** since UI primitives don't depend on navigation.
- **Phase 6 is the bulk** and can be parallelized across features once 4+5 are done.
- **Phase 7 (Focus Mode)** is independent of most features and can be built in parallel with 6.
- **Phase 8 (Payments + Offline)** depends on feature screens existing.
- **Phase 9 (Polish)** is last because animations and tests iterate on existing screens.

## Code Sharing Strategy

### What Goes in @studentos/shared

**SHARE these** (platform-agnostic, pure TypeScript/React):
- Supabase generated types (`database.ts`)
- Domain model types (`models.ts`, `subscription.ts`)
- Business logic utilities (`formatters.ts`, `parseAIResponse.ts`, `educationConfig.ts`, `subscriptionConfig.ts`, `streak.ts`)
- `utils.ts` (`cn()` function — works with both NativeWind and TailwindCSS web)
- AI gateway configuration (`ai.ts` — the API endpoint configs, not the inference code)
- `resilientFetch.ts` (with platform fetch adapter injection)
- Supabase client factory (with storage adapter injection)
- Hook logic extracted into pure functions (e.g., subscription tier calculation, XP calculation, streak logic)

**DO NOT share these** (platform-specific):
- `useAuth.tsx` Context/Provider (different storage, different session handling) — share the LOGIC, not the Provider
- `useOfflineStatus.tsx` / `useOfflineData.tsx` (completely different APIs: netinfo vs navigator.onLine)
- `useOfflineAI.tsx` / `OfflineAIContext.tsx` (browser-only: WebLLM, indexedDB, caches, navigator)
- `useFocusMode.ts` (Capacitor plugin vs Expo native module)
- `usePWAUpdate.ts` (web-only concept)
- `useMobileBackNavigation.ts` (Capacitor-specific; RN has built-in back handling)
- `useNotifications.ts` (different notification APIs)
- `useBackgroundDownload.ts` (Service Worker background sync vs expo-background-fetch)
- Any component using shadcn/ui, Radix, or DOM APIs

### Dependency Injection Pattern for Shared Hooks

```
@studentos/shared exports:
  - createAuthHook(deps) → useAuth (each app provides its own deps)
  - createSubscriptionHook(deps) → useSubscription
  - Pure functions: formatXP(), calculateStreak(), getSubscriptionTier(), etc.
  - Types: Database, User, Subscription, Course, etc.
  - Constants: SUBSCRIPTION_TIERS, EXAM_BOARDS, SUBJECTS, etc.
  - Supabase client factory: createSupabaseClient(storageAdapter)

Each app provides:
  - Storage adapter (localStorage vs expo-sqlite/kv-store)
  - Platform detection (Capacitor vs React Native Platform)
  - Network status adapter (navigator.onLine vs @react-native-community/netinfo)
```

### Package Dependency Graph

```
apps/native/ ─── depends on ───► @studentos/shared
apps/web/    ─── depends on ───► @studentos/shared

@studentos/shared ─── depends on ───► @supabase/supabase-js
@studentos/shared ─── depends on ───► @tanstack/react-query (peer dep)
@studentos/shared ─── depends on ───► react (peer dep)

apps/native/ ─── depends on ───► expo, expo-router, nativewind, reanimated, etc.
apps/web/    ─── depends on ───► vite, react-router-dom, tailwindcss, etc.
```

**Critical rule:** `@studentos/shared` must NEVER depend on `react-native`, `expo`, `react-router-dom`, `vite`, or any platform-specific package. Only `react`, `@supabase/supabase-js`, and `@tanstack/react-query` as peer dependencies.

## Sources

- **Expo Router Core Concepts** — https://docs.expo.dev/router/basics/core-concepts/ (HIGH confidence, official docs)
- **Expo Monorepo Guide** — https://docs.expo.dev/guides/monorepos/ (HIGH confidence, official docs, updated April 2026)
- **Expo Native Module Tutorial** — https://docs.expo.dev/modules/config-plugin-and-native-module-tutorial/ (HIGH confidence, official docs)
- **NativeWind v5 Documentation** — https://nativewind.dev/v5/ (HIGH confidence, official docs, v5 with Tailwind CSS v4)
- **NativeWindUI Components** — https://nativewindui.com/ (MEDIUM confidence, third-party component library, well-maintained)
- **React Native Reanimated 3** — https://docs.swmansion.com/react-native-reanimated/ (HIGH confidence, official docs)
- **TanStack Query Persistence** — https://tanstack.com/query/latest/docs/framework/react/plugins/createAsyncStoragePersister (HIGH confidence, official docs)
- **Supabase JS Client (React Native)** — https://github.com/supabase/supabase-js (HIGH confidence, official repo, RN support documented)
- **expo-sqlite/kv-store** — https://docs.expo.dev/versions/latest/sdk/sqlite/ (HIGH confidence, official Expo SDK docs, SDK 54)
- **Expo Router Error Handling** — https://docs.expo.dev/router/error-handling/ (HIGH confidence, official docs)
