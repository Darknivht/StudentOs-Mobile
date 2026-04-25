# Technology Stack — StudentOS Mobile

**Project:** StudentOS Mobile (React Native + Expo learning app)
**Researched:** April 2026
**Confidence:** MEDIUM-HIGH (primary sources verified with web search; some edge cases need local testing)

---

## Recommended Stack at a Glance

| Layer | Recommended | Version | Not Viable |
|-------|-------------|---------|------------|
| **Framework** | Expo + Dev Client | SDK 54 (stable) or SDK 55 (latest) | Bare React Native |
| **Language** | TypeScript | 5.x | JavaScript |
| **Navigation** | React Navigation | v7 | React Navigation < v7 |
| **State** | Zustand | v5 | Redux Toolkit, MobX |
| **Offline DB** | WatermelonDB | v0.27+ | Realm, raw SQLite |
| **Secure Storage** | react-native-mmkv | v4 | AsyncStorage |
| **Animations** | react-native-reanimated | v4 | RN Animated API |
| **PDF** | react-native-pdf-jsi | v4+ | react-native-pdf (Play blocked) |
| **Math/LaTeX** | katex + WebView | Latest | None (no native library) |
| **Charts** | react-native-gifted-charts | Latest | Victory Native (Skia unstable) |
| **Biometrics** | expo-local-authentication | SDK version | react-native-biometrics |
| **Notifications** | expo-notifications | SDK version | Notifee (overkill) |
| **Deep Links** | expo-linking | SDK version | Manual Linking |
| **AI Streaming** | OpenAI SDK + configurable env | Latest | Hardcoded provider |

---

## Core Technologies

### Framework: Expo + Dev Client

**Recommendation:** Expo SDK 54 (React Native 0.81, React 19.1) — stable. Upgrade to SDK 55 (RN 0.83) when proven in production.

**Why Expo SDK 54 over SDK 55:** SDK 54 (Sep 2025) is the last version with Old Architecture support, making it the safest starting point for a complex project like this. SDK 55 (Feb 2026) dropped Old Architecture entirely and requires RN 0.83. SDK 55 has known build time issues with Hermes v1 on Android (must build from source, significantly slower). If you start on SDK 54, you can upgrade to SDK 55 after verifying New Architecture stability with your full feature set.

**Why Expo + Dev Client over Bare React Native:**
- Faster iteration with EAS Update (over-the-air JS bundle updates without rebuilding native)
- Pre-built Expo modules cover 80% of native needs (biometrics, notifications, linking, file system)
- WatermelonDB expo plugin eliminates manual native setup (no manual Gradle/Kotlin edits)
- Config plugin system means you never touch native code for standard features
- Dev Client gives you a "custom Expo Go" — same workflow, real native code

**Why NOT Bare React Native:** You lose EAS Update, config plugins, and the expo ecosystem. For a project with this many native features (biometrics, PDF, offline DB, notifications), you'd be maintaining native setup yourself.

**Version compatibility matrix for SDK 54:**
| Package | Min Version | Notes |
|---------|------------|-------|
| Expo | 54.0.0 | React Native 0.81 |
| React | 19.1.0 | Required |
| React Native | 0.81 | New Architecture default |
| Node.js | 20.19.x | Minimum |
| Xcode | 26 | For iOS builds |
| Android API | 36 | Min SDK 24 |

**Installation:**
```bash
npx create-expo-app@latest StudentOsMobile --template blank-typescript
cd StudentOsMobile
npx expo install expo@^54.0.0 --fix
```

---

### Language: TypeScript

**Recommendation:** TypeScript 5.x throughout.

**Why:** Mandatory for this codebase. TypeScript provides runtime safety for complex data structures (quiz models, SM-2 algorithm state, AI streaming responses). React Navigation v7 has first-class TypeScript support via static configuration — you get automatic type inference for navigation params without manual type definitions.

**Configuration:** Already handled by `babel-preset-expo` in `tsconfig.json`. No additional setup needed.

---

### Navigation: React Navigation v7

**Recommendation:** React Navigation v7 with static configuration API.

**Why v7 over earlier versions:** v7 (released Nov 2024) introduces a static API that solves two major pain points: automatic TypeScript inference for navigation params and simplified deep linking config. Performance-wise, v7 uses `useSyncExternalStore` instead of React.Context for navigation state, meaning screen re-renders are isolated — navigation state changes no longer cascade re-renders through the whole component tree. v7 also has lazy screen mounting (screens mount on-demand) and UI-thread gesture handling via Reanimated v2 integration.

**Static configuration vs dynamic API:**
```typescript
// Static API (v7 recommended) — better DX, auto-types, auto-deep-links
const Tab = createBottomTabNavigator({
  screen: {
    Screen: HomeScreen,
    options: { title: 'Home' },
  },
});

// Dynamic API — still works but manual types needed
const Stack = createNativeStackNavigator();
```
**Recommendation:** Use static API for all navigators. It generates deep linking paths automatically, making the linking configuration section of `NavigationContainer` dramatically simpler.

**Required peer dependencies (auto-installed by expo):**
```bash
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

**Expo Go compatibility:** Full. All packages support Expo Go.

---

### State Management: Zustand v5

**Recommendation:** Zustand v5 with domain-separated stores.

**Why Zustand over Redux Toolkit or MobX:** Zustand is 1.2KB (vs Redux Toolkit's ~15KB). It has zero boilerplate — no actions, reducers, or providers. The hook-based API (`useStore`) works from any component without wrapping. Zustand v5 supports middleware chaining (`devtools` + `persist` + custom middleware) and has an ecosystem of storage adapters (MMKV, AsyncStorage, etc.). React Navigation v7 also uses Zustand internally for navigation state, so sharing the same mental model across the app is valuable.

**Architecture pattern — one store per domain:**
```typescript
// Separate stores for separation of concerns
export const useAuthStore = create<AuthState>()(persist(...));
export const useStudyStore = create<StudyState>()(...); // non-persisted, server-synced
export const useAppStore = create<AppState>()(persist(...)); // settings, preferences
export const useFocusStore = create<FocusState>()(...);
```

**Why NOT Redux Toolkit:** Redux Toolkit adds ~15KB bundle, requires action creators and reducers, and needs `<Provider>` wrapping. For a mobile app with complex features, this overhead isn't justified when Zustand handles the same use cases with less code.

**Why NOT Jotai:** Jotai is atomic and composable, but for this project's complexity, Zustand's flat store model with middleware is simpler to maintain. Jotai shines for fine-grained reactivity in web apps with many independent derived values — not the primary pattern here.

---

### Offline Database: WatermelonDB

**Recommendation:** WatermelonDB with the community expo plugin (`@morrowdigital/watermelondb-expo-plugin`).

**Why WatermelonDB for this app:** The core value proposition is reactive UI — components re-render automatically when local data changes, without manual state management or prop drilling. This is critical for the SM-2 flashcard system (card state changes must instantly reflect in UI), quiz progress tracking, and study session data. WatermelonDB's lazy loading means only queried records load into memory — for a student who downloads 50+ WAEC exam prep sets, this prevents the app from loading thousands of records at startup.

**Key features for this project:**
- **Lazy loading** — only fetches queried records, not entire tables
- **Reactive queries** — `withObservables` HOC or hooks re-render components on data changes
- **Offline-first** — every write goes to local SQLite first, no network dependency
- **Sync protocol** — `synchronize()` method with pull/push functions for Supabase integration
- **Migrations** — schema versioning with automatic migration application on app launch
- **JSI mode** — 3-5x faster queries when `jsi: true` in adapter config

**Expo SDK 54 compatibility:** Use the Morrow Digital expo plugin:
```bash
npm install @nozbe/watermelondb @morrowdigital/watermelondb-expo-plugin
npx expo install expo-dev-client
# Then in app.json plugins:
# ["@morrowdigital/watermelondb-expo-plugin"]
```
**Note:** WatermelonDB requires a development build (not Expo Go) due to native SQLite bindings. This is expected — you're already committed to Dev Client per project decisions.

**Sync strategy:** Implement a `SyncEngine` using WatermelonDB's `synchronize()` with Supabase as the backend. The sync engine handles pull (server → local) and push (local → server) with conflict resolution. Use `@loonylabs/react-native-offline-sync` for production-ready sync infrastructure (retry logic, exponential backoff, batch operations, network detection).

**Why NOT expo-sqlite with Drizzle ORM:** expo-sqlite (SDK built-in) is excellent for simple relational queries, but Drizzle ORM sync patterns are manual. WatermelonDB's built-in reactive queries and observable records are purpose-built for this use case. expo-sqlite + Drizzle is the right choice for apps with simple CRUD and no reactive UI requirements.

**Why NOT TinyBase:** TinyBase is 5KB (impressive) and works in Expo Go, but its sync story (Yjs CRDTs) is complex for Supabase-based sync. TinyBase shines for real-time collaboration apps. WatermelonDB's Supabase sync adapter (`@nozbe/watermelondb-sync`) is more aligned with your existing backend.

**Why NOT Realm:** Realm requires MongoDB Atlas Device Sync (paid) for the cloud sync layer. Without Atlas Sync, it's just an offline object database. WatermelonDB gives you the same offline-first model with custom sync to Supabase at no extra cost.

---

### Secure Storage: react-native-mmkv v4

**Recommendation:** react-native-mmkv v4 for Zustand persist middleware, Zustand auth store, and encrypted app secrets.

**Why MMKV over AsyncStorage:** Benchmarks show MMKV is 30-100x faster than AsyncStorage for read/write operations. MMKV is fully synchronous (no `await` needed for get operations), uses mmap for memory-file sync, and supports AES encryption for sensitive data. For a Zustand `persist` middleware, MMKV eliminates the async hydration delay that causes "flash of initial state" on app startup — MMKV hydrates synchronously so the store is ready before the first render.

**v4 specifically:** react-native-mmkv v4 is a Nitro Module (C++ via JSI). It requires React Native 0.74+, New Architecture enabled, and `react-native-nitro-modules` as a peer dependency. These align with your SDK 54 setup (RN 0.81, New Architecture default).

**For encrypted auth tokens:**
```typescript
import { createMMKV } from 'react-native-mmkv';
import { createJSONStorage } from 'zustand/middleware';

const secureStorage = createMMKV({ id: 'secure-vault', encryptionKey: 'student-os-2025' });

export const useAuthStore = create(persist(
  (set) => ({ token: null, setToken: (token) => set({ token }) }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => secureStorage), // sync, encrypted
  }
));
```

**Installation:**
```bash
npx expo install react-native-mmkv react-native-nitro-modules
npx expo prebuild  # required after installing native modules
```

**Why NOT @react-native-async-storage/async-storage:** AsyncStorage is async-only (every read requires `await`), adds startup latency via async hydration, and stores everything unencrypted. It's fine for toy apps. For a production learning app handling exam results, AI conversation history, and auth tokens, MMKV's performance and encryption are non-negotiable.

**Why NOT expo-secure-store for all storage:** expo-secure-store is backed by iOS Keychain and Android Keystore — appropriate for tokens and credentials but has a 4KB size limit and is rate-limited on iOS. Use it for auth tokens, not for general app state. MMKV fills the gap for everything else with optional encryption.

---

## Supporting Libraries

### AI Client: OpenAI SDK (Configurable Provider)

**Recommendation:** `openai` npm package with environment-variable-based provider configuration.

**Architecture:** Don't hardcode OpenAI. Design an `AIProvider` interface that reads `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL_NAME` from environment variables. This lets you swap between OpenAI, Azure OpenAI, local Ollama, Groq, or any OpenAI-compatible API without code changes.

```typescript
// lib/ai/client.ts
const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL, // defaults to OpenAI if unset
  defaultHeaders: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
});

// Streaming support for AI tutor
const stream = await client.chat.completions.create({
  model: process.env.AI_MODEL_NAME || 'gpt-4o-mini',
  messages: [...],
  stream: true,
});
```

**Why this approach:** Nigerian/African students have diverse needs — some use free-tier OpenAI, some have Azure accounts, some run local models on school computers. The configurable approach future-proofs against API changes and pricing shifts.

**Streaming:** Use the SDK's native streaming API. For the AI tutor feature, stream tokens to a UI component using React state. Do NOT use polling or chunk-based fetching — streaming provides real-time response that feels like ChatGPT.

---

### PDF Viewer

**Recommendation:** `react-native-pdf-jsi` v4+ with `@kishannareshpal/expo-pdf` as fallback.

**Why react-native-pdf-jsi:** Standard `react-native-pdf` (v7.0+) is **blocked by Google Play** starting November 2025 due to 16KB page size requirements. `react-native-pdf-jsi` uses JSI (JavaScript Interface) for 80x faster rendering, is fully Google Play 16KB compliant, and has a drop-in replacement API. It also has an Expo config plugin for dev build compatibility.

**Why NOT Nutrient (PSPDFKit):** Nutrient (formerly PSPDFKit) is production-grade but expensive (commercial license) and primarily designed for annotation-heavy workflows. For a learning app where you need to display exam prep PDFs, it's overkill.

**Fallback: @kishannareshpal/expo-pdf:** A newer, actively maintained native PDF viewer for Expo with pinch-to-zoom, password-protected PDF support, and color inversion (dark mode). Uses PDFKit on iOS and PDFium on Android. Good alternative if `react-native-pdf-jsi` has issues.

**Installation:**
```bash
npm install react-native-pdf-jsi
# Add expo plugin in app.json: ["react-native-pdf-jsi"]
npx expo prebuild
```

**Note:** Neither library works in Expo Go. Both require a development build. Since WatermelonDB already forces you into a Dev Client workflow, this is not a new constraint.

---

### Math / LaTeX Rendering

**Recommendation:** `react-native-render-html` for general rich text + KaTeX via WebView for math equations.

**Why KaTeX via WebView:** There is no production-ready native LaTeX renderer for React Native that handles all math notation (fractions, matrices, integrals, Greek letters) reliably. All native solutions are partial implementations. KaTeX (the math rendering engine used by Khan Academy, React Flux, etc.) rendered in a WebView is the reliable approach.

**Implementation pattern:**
```typescript
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

// For math content: wrap KaTeX HTML in a WebView
const mathContent = `
  <!DOCTYPE html>
  <html><head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  </head><body>
    <div id="math"></div>
    <script>
      katex.render("\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", document.getElementById("math"), { displayMode: true });
    </script>
  </body></html>
`;
```

**For inline math within regular text:** Use `react-native-render-html`'s custom renderers to parse `$...$` and `$$...$$` delimiters and inject KaTeX WebViews inline.

**Why NOT react-native-math:** This library handles only basic math (fractions, basic notation) and has compatibility issues with newer RN versions. It cannot handle WAEC-level math notation (matrices, calculus, summations).

---

### Charts

**Recommendation:** `react-native-gifted-charts` — SVG-based, fully Expo Go compatible, extensive chart types.

**Why react-native-gifted-charts:** It's the pragmatic choice for a learning app. It supports bar, line, pie, donut, area, and progress charts (all you need for gamification, study analytics, and quiz score tracking). It has no native dependencies, so it works in Expo Go. It has a simpler installation path than Victory Native (which depends on Skia + Reanimated and has New Architecture stability issues — see PITFALLS).

**Why NOT Victory Native XL:** Victory Native XL (the Skia-based rewrite) is the most performant option for data-heavy charts, but as of April 2026, there are ongoing performance regressions with Skia on the New Architecture. Large numbers of animated chart components cause FPS drops on Android. Until Skia + New Architecture is stable (expected late 2026), `react-native-gifted-charts` is the safer production choice.

**Why NOT Apache ECharts (react-native-echarts):** ECharts in a WebView is powerful but has memory overhead for complex charts and feels sluggish on low-end devices. It's also harder to style to match your design system. Reserved for specialized charts (maps, candlestick) if needed later.

**Installation:**
```bash
npx expo install react-native-gifted-charts react-native-svg react-native-linear-gradient
```

---

### Biometrics

**Recommendation:** `expo-local-authentication` (SDK built-in) + `expo-secure-store` for token retrieval after biometric verification.

**Why expo-local-authentication:** It's built into the Expo SDK, requires zero native setup (auto-configured via expo-dev-client), and provides a unified API for Face ID (iOS), Touch ID (iOS), and BiometricPrompt (Android). Use `hasHardwareAsync()` and `isEnrolledAsync()` to check device support before prompting. For strong security (auth tokens), use `biometricsSecurityLevel: 'strong'` to require Class 3 biometrics (fingerprint or 3D face scan).

**Why NOT react-native-keychain:** `react-native-keychain` is powerful (stores credentials in iOS Keychain / Android Keystore) but requires bare React Native setup. expo-local-authentication covers the biometric UI layer, and expo-secure-store covers the token storage — both are SDK-native with zero additional native config.

**Pattern — biometric unlock:**
```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

async function biometricUnlock() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock StudentOS',
    biometricsSecurityLevel: 'strong',
    disableDeviceFallback: true, // No passcode fallback — require biometrics
  });

  if (result.success) {
    const token = await SecureStore.getItemAsync('auth_token');
    return token;
  }
  return null;
}
```

**Installation:** Already included in Expo SDK. Just configure `NSFaceIDUsageDescription` in `app.json`.

---

### Notifications

**Recommendation:** `expo-notifications` (SDK built-in).

**Why expo-notifications:** Handles both local notifications (study reminders, streak notifications, pomodoro alerts) and push notifications via Firebase Cloud Messaging (FCM) / Apple Push Notification Service (APNs). Expo's notification system is deeply integrated — notifications can be handled even when the app is backgrounded.

**Setup:**
```bash
# Already part of expo SDK, just configure:
npx expo install expo-notifications
```

**For study reminders:** Schedule local notifications using `Notifications.scheduleNotificationAsync()` with trigger conditions (daily reminder at specific time, repeating). This works offline — no server needed for study reminders.

**For push notifications:** Configure FCM credentials for Android and APNs certificates for iOS via EAS Build. Use `Notifications.addNotificationReceivedListener()` and `Notifications.setNotificationChannelAsync()` for Android foreground handling.

**Why NOT Notifee:** Notifee is powerful but commercial and overkill. `expo-notifications` covers all local + push notification needs for a learning app. Notifee is warranted for complex notification workflows (SMS, critical alerts, complex notification actions) — not needed here.

---

### Deep Linking & Universal Links

**Recommendation:** `expo-linking` (SDK built-in) + React Navigation v7 static linking config.

**Why expo-linking:** Provides `createURL()` for constructing deep links and `parseInitialURLAsync()` for reading incoming links. Combined with React Navigation v7's static linking config (where screens automatically generate path configs), you get full deep linking with minimal code.

**Configuration:**
```typescript
// App.tsx
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';

const linking = {
  prefixes: [Linking.createURL('/'), 'https://studentos.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: '',
          Notes: 'notes',
          Flashcards: 'flashcards/:deckId',
          Quiz: 'quiz/:quizId',
        },
      },
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      {/* navigators */}
    </NavigationContainer>
  );
}
```

**For Universal Links (https://studentos.app/flashcards/123):** Configure associated domains in `app.json` — `applinks:studentos.app` for iOS and `app links` for Android. Place the `apple-app-site-association` file on your Supabase-hosted domain.

**Note:** Firebase Dynamic Links was shut down in August 2025. If you previously relied on it for deferred deep linking, migrate to `expo-linking` with your own backend tracking.

---

### Animations

**Recommendation:** `react-native-reanimated` v4 + CSS transitions for simple animations.

**Why react-native-reanimated v4:** v4 (released mid-2025) is the first version that requires New Architecture. It runs animations entirely on the UI thread (JS thread can be blocked and animations still run at full FPS). v4 introduces CSS transitions (a simpler API for state-driven animations) alongside worklets-based `useSharedValue` and `useAnimatedStyle` for complex interactions.

**Performance notes for v4 on New Architecture:** There are known FPS regressions with Reanimated v4 on the New Architecture, especially on Android with scroll-linked animations and transforms. These are actively being fixed by the Software Mansion team. Mitigation: enable `DISABLE_COMMIT_PAUSING_MECHANISM` and `USE_COMMIT_HOOK_ONLY_FOR_REACT_COMMITS` feature flags if you encounter scroll jank. In release builds, performance is significantly better than dev builds — always test animations in release mode.

**Pattern — CSS transitions (preferred, simpler):**
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { transition, transitionDuration, transitionProperty } from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

// For simple fade-in/slide-up
<AnimatedView style={[styles.card, {
  opacity: entered.value ? 1 : 0,
  transform: [{ translateY: entered.value ? 0 : 20 }],
}]} />
```

**Pattern — worklets for complex interactions:**
```typescript
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// On press
scale.value = withSpring(0.95, { damping: 15 });
```

**Installation:**
```bash
npx expo install react-native-reanimated react-native-worklets
# babel.config.js is auto-configured by babel-preset-expo
```

---

### Encryption / Security Utilities

**Recommendation:** `expo-crypto` for hashing, `expo-secure-store` for token storage, `react-native-mmkv` with encryption for structured data.

**Why three tools:** Each serves a different threat model:
- `expo-crypto` — hash sensitive data (device IDs, offline session keys) with SHA-256
- `expo-secure-store` — store auth tokens in iOS Keychain / Android Keystore (4KB limit, rate-limited)
- `react-native-mmkv` with `encryptionKey` — store larger encrypted data (cached AI conversations, study session data) with AES encryption

**Installation:** All are part of the Expo SDK or auto-installed. No additional setup beyond importing.

---

## Dev Tools

### Testing
| Tool | Purpose | Why |
|------|---------|-----|
| Jest | Unit testing | Pre-installed with Expo, good React Native support |
| @testing-library/react-native | Component testing | Query-based, prefers user behavior over implementation |
| Detox | E2E testing | Best for React Native; simulates real user interactions |
| Playwright | Web testing | If you add web support later |

**Recommendation:** Start with Jest + Testing Library. Add Detox when you have stable critical flows (auth, quiz submission, study session). Don't start with Detox on day one — it requires device/emulator setup and maintenance overhead.

### Code Quality
| Tool | Purpose |
|------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| eslint-config-universe | RN/Expo linting preset |
| Husky + lint-staged | Pre-commit hooks |

### Build / CI
| Tool | Purpose |
|------|---------|
| EAS Build | Native builds (iOS/Android) |
| EAS Update | OTA JS bundle updates |
| EAS Submit | Store submission |
| GitHub Actions | CI pipeline |

**EAS Update note:** Critical for this app. Since your users are on low-end devices with intermittent connectivity, EAS Update lets you push bug fixes and content updates without asking users to download a new APK from the Play Store. Push hotfixes to the JS bundle instantly.

### Logging / Error Tracking
| Tool | Purpose |
|------|---------|
| expo-dev-client | Local development builds |
| console.error / console.warn | Development logging |
| Sentry | Production error tracking (expo-sentry) |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Offline DB** | WatermelonDB | expo-sqlite + Drizzle | Drizzle sync is manual; reactive queries require extra work |
| **Offline DB** | WatermelonDB | TinyBase | Sync story (Yjs) complex; better for collaboration apps |
| **Offline DB** | WatermelonDB | Realm | Requires Atlas Sync (paid); overkill for this use case |
| **State + Persistence** | Zustand + MMKV | Zustand + AsyncStorage | AsyncStorage is 30-100x slower, async-only, unencrypted |
| **Charts** | react-native-gifted-charts | Victory Native XL | Skia + New Architecture has ongoing FPS regressions |
| **PDF** | react-native-pdf-jsi | Nutrient (PSPDFKit) | Commercial license; overkill for display-only use case |
| **Animations** | Reanimated v4 + CSS | pure Skia canvas | Skia deprecated on RN; replaced by reanimated CSS |
| **Navigation** | React Navigation v7 | Expo Router | App uses custom tab + stack structure; Expo Router adds file-based routing overhead |
| **Notifications** | expo-notifications | Notifee | Notifee is commercial; expo-notifications covers all needs |
| **Biometrics** | expo-local-authentication | react-native-biometrics | expo-local-authentication is SDK-native, zero extra setup |
| **Secure Storage** | expo-secure-store + MMKV | Keychain-only | expo-secure-store has 4KB limit + rate limits; MMKV fills the gap |

---

## What NOT to Use

| Library | Why Not | Use Instead |
|---------|---------|-------------|
| **react-native-pdf** (v7.0+) | Blocked by Google Play (Nov 2025) due to 16KB page size non-compliance | `react-native-pdf-jsi` |
| **react-native-skia** (@shopify) | Deprecated on React Native (replaced by reanimated worklets) | react-native-reanimated CSS transitions |
| **AsyncStorage** (@react-native-async-storage) | Slow (30-100x slower than MMKV), async-only, no encryption | `react-native-mmkv` |
| **React Query v4** | Deprecated; v5 is current | TanStack Query v5 |
| **Redux Toolkit** | 15KB bundle, requires actions/reducers/providers | Zustand |
| **MobX** | Requires decorators, complex setup, over-engineered for this scale | Zustand |
| **Firebase Dynamic Links** | Shutdown August 2025 | `expo-linking` with custom backend |
| **Realm** (without Atlas) | Object database mental model mismatch with SQL-based app; Atlas is paid | WatermelonDB |
| **expo-av for audio** (standalone) | Good for playback, but for AI voice responses consider WebView-based approach | See AI streaming docs |
| **React Navigation v6** | Missing static API, isolated re-render fixes, lazy mounting | React Navigation v7 |

---

## Version Compatibility Notes

### Critical Version Constraints

**Expo SDK 54 (recommended starting point):**
- React Native 0.81, React 19.1.0, Node.js 20.19.x+
- Xcode 26+ for iOS, Android API 36+
- New Architecture enabled by default
- iOS: React Native ships as precompiled XCFrameworks (faster builds)

**react-native-reanimated v4:**
- Requires New Architecture (RN 0.76+)
- Requires `react-native-worklets` as separate dependency
- Auto-configured by `babel-preset-expo` — no manual Babel plugin needed
- Known issue: Scroll-linked animations may have FPS drops on Android dev builds; resolved in release builds and with feature flags

**react-native-mmkv v4:**
- Requires `react-native-nitro-modules`
- Requires New Architecture
- `createMMKV()` replaces `new MMKV()` constructor

**WatermelonDB:**
- Requires `@nozbe/watermelondb` + expo plugin
- Use `@morrowdigital/watermelondb-expo-plugin` for SDK 52-53+
- For SDK 54: verify plugin compatibility or use manual prebuild
- Does NOT work in Expo Go — requires development build

**react-native-pdf-jsi:**
- Native module — requires dev client
- Google Play 16KB compliant (ship with NDK r28.2+)
- Drop-in API replacement for `react-native-pdf`

### Version Upgrade Path

```
Current (Apr 2026):
  Expo SDK 54 → RN 0.81 → React 19.1 → New Arch ✓

Safe upgrade (Q3 2026):
  Expo SDK 56 → RN 0.85 → React 19.3 → New Arch ✓

Before upgrading:
1. Verify WatermelonDB expo plugin updated for target SDK
2. Verify react-native-reanimated v4 is stable on target RN version
3. Run EAS Build --profile preview to test production build
4. Test animations in release mode, not dev mode
```

---

## Sources

| Source | Confidence | What It Informed |
|--------|------------|-----------------|
| [Expo SDK Changelog](https://expo.dev/changelog/sdk-55) (Feb 2026) | HIGH | SDK 55 vs 54, RN compatibility, New Architecture |
| [Expo SDK 54 Release Notes](https://expo.dev/changelog/sdk-54) (Sep 2025) | HIGH | Old Architecture last-support, precompiled iOS |
| [Expo SDK 53 Release Notes](https://expo.dev/changelog/sdk-53) (Apr 2025) | HIGH | New Architecture default, fingerprint system |
| [React Navigation v7 Blog](https://reactnavigation.org/blog/2024/11/06/react-navigation-7.0/) (Nov 2024) | HIGH | Static API, performance improvements, lazy mounting |
| [React Navigation v7 Upgrading Guide](https://reactnavigation.org/docs/upgrading-from-6.x) | HIGH | Breaking changes, type improvements |
| [React Navigation v7 Performance Fixes](https://medium.com/@nomanakram1999/react-navigation-7-the-performance-updates-nobodys-talking-about-c9e36d7cbd4a) (Feb 2026) | MEDIUM | Isolated re-renders, lazy mounting, gesture handler integration |
| [WatermelonDB Reddit Discussion](https://www.reddit.com/r/reactnative/comments/1ka272z/) (Apr 2025) | MEDIUM | Expo SDK 52-53 compatibility, alternatives (TinyBase, Expo SQLite) |
| [WatermelonDB Offline Sync Guide](https://www.wellally.tech/blog/react-native-watermelondb-offline-sleep-tracker) (Dec 2025) | MEDIUM | Sync patterns, expo plugin usage |
| [TinyBase vs WatermelonDB vs RxDB](https://www.pkgpulse.com/blog/tinybase-vs-watermelondb-vs-rxdb-offline-first-databases-2026) (Mar 2026) | MEDIUM | DB comparison, sync strategies |
| [Expo SQLite vs WatermelonDB vs Realm](https://www.pkgpulse.com/blog/expo-sqlite-vs-watermelondb-vs-realm-react-native-local-2026) (Mar 2026) | MEDIUM | Feature comparison, when to use each |
| [react-native-mmkv GitHub](https://github.com/mrousavy/react-native-mmkv/) | HIGH | v4 API, Nitro Modules, encryption, JSI |
| [Zustand MMKV Persistence Guide](https://dev.to/mehdifaraji/zustand-mmkv-storage-blazing-fast-persistence-for-zustand-in-react-native-3ef1) (Dec 2025) | MEDIUM | Zustand + MMKV pattern, encryption, hydration |
| [Reanimated v4 Tutorial](https://reactnativerelay.com/article/mastering-react-native-reanimated-4-css-animations-transitions-worklets) (Feb 2026) | MEDIUM | CSS transitions, New Architecture handling |
| [Reanimated Performance Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/) | HIGH | New Architecture regressions, feature flags, worklets |
| [Reanimated GitHub Issues](https://github.com/software-mansion/react-native-reanimated/issues/7464) (May 2025) | MEDIUM | Android scroll performance on New Architecture |
| [Reanimated GitHub Issues #8250](https://github.com/software-mansion/react-native-reanimated/issues/8250) (Sep 2025) | MEDIUM | New Architecture performance loss with animated components |
| [react-native-pdf-jsi](https://github.com/126punith/react-native-enhanced-pdf) (Oct 2025) | MEDIUM | JSI performance, Google Play compliance, Expo config plugin |
| [@kishannareshpal/expo-pdf](https://github.com/kishannareshpal/expo-pdf) (Jan 2026) | MEDIUM | Expo PDF viewer with PDFKit/PDFium |
| [Biometric Auth in Expo](https://sasandasaumya.medium.com/biometric-authentication-in-react-native-expo-a-complete-guide-face-id-fingerprint-732d80e5e423) (Jan 2026) | MEDIUM | expo-local-authentication patterns, security best practices |
| [Expo Linking Documentation](https://docs.expo.dev/linking/overview/) (Mar 2026) | HIGH | Deep linking, Universal Links, App Links |
| [Victory Native vs Chart Kit vs ECharts](https://www.pkgpulse.com/blog/victory-native-vs-react-native-chart-kit-vs-echarts-rn-charts-2026) (Mar 2026) | MEDIUM | Chart library comparison, Skia rendering |
| [React Native Charts Guide](https://reactnativerelay.com/article/react-native-charts-victory-native-interactive-data-visualizations-expo) (Apr 2026) | MEDIUM | Victory Native XL, Skia dependency, Expo support |
| [Zustand React Native Guide](https://reactnativerelay.com/article/modern-state-management-react-native-zustand-tanstack-query) (Feb 2026) | MEDIUM | Zustand + TanStack Query pattern for server state |
| [Expo SDK Reference](https://docs.expo.dev/versions/latest/) | HIGH | SDK version table, RN compatibility matrix |