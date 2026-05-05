# Pitfalls Research

**Domain:** React PWA → React Native (Expo) conversion for a student OS app with real-time chat, AI streaming, on-device ML, custom Android native plugin (AccessibilityService), Paystack payments, KaTeX math rendering, PDF generation, and offline sync.
**Researched:** 2026-05-05
**Confidence:** HIGH (codebase grep analysis + official Expo/React Native docs + project-specific evidence)

## Critical Pitfalls

### Pitfall 1: Assuming Web Browser APIs Exist in React Native

**What goes wrong:**
The codebase has 255+ references to web-only APIs (`localStorage`, `sessionStorage`, `window.`, `navigator.`, `document.`). These will cause **immediate runtime crashes** in React Native because the global `window`, `document`, and `navigator` objects don't exist. Specific crash points include:
- `localStorage` in `offlineSync.ts`, `useStudyTimeTracker.ts`, `useOfflineData.ts`, `useFocusLock.ts`, `useBackgroundDownload.ts`, `OfflineAIContext.tsx`, `Onboarding.tsx`
- `sessionStorage` in `DocsLayout.tsx`, `AdminResources.tsx`, `useMobileBackNavigation.ts`
- `window.PaystackPop?.setup()`, `window.location.href`, `window.speechSynthesis`, `window.confirm`, `window.onbeforeunload`, `window.matchMedia`
- `navigator.onLine`, `navigator.clipboard`, `navigator.share`, `navigator.serviceWorker`, `navigator.userAgent`
- `document.createElement`, `document.getElementById`

**Why it happens:**
Developers treat React Native as "React but mobile" and assume the same browser globals exist. The React component model is shared, but the runtime environment is fundamentally different — no DOM, no Window, no Navigator. IDE autocomplete and TypeScript may not flag these if `@types/web` is in scope.

**How to avoid:**
1. **Use `expo-sqlite/localStorage/install`** as a bridge — it provides `globalThis.localStorage` backed by SQLite. This handles the bulk of `localStorage` calls with zero code changes.
2. For `sessionStorage`, implement a thin in-memory shim or extend the expo-sqlite localStorage polyfill.
3. Replace `window.location` → `router.push()` / `Linking.openURL()`
4. Replace `navigator.onLine` → `NetInfo.getState()` from `@react-native-community/netinfo`
5. Replace `navigator.clipboard` → `expo-clipboard`
6. Replace `navigator.share` → `expo-sharing`
7. Replace `window.confirm` → `Alert.alert()`
8. Replace `window.matchMedia` → `useWindowDimensions()` or `Dimensions.get()`
9. Add an ESLint rule (`no-restricted-globals`) banning `window`, `document`, `navigator`, `localStorage`, `sessionStorage` to catch new usage.

**Warning signs:**
- App crashes on launch with "window is not defined" or "localStorage is not defined"
- Features work in web preview (`expo start --web`) but crash on device
- TypeScript compiles cleanly but runtime errors appear on native
- `typeof window !== 'undefined'` guard patterns appearing everywhere (sign of incomplete migration)

**Phase to address:** Phase 1 (Foundation) — must be resolved before any feature work begins. The `expo-sqlite/localStorage` polyfill should be installed on day 1.

---

### Pitfall 2: Not Replacing Supabase Auth Storage from localStorage to Secure Store

**What goes wrong:**
The Supabase client in `client.ts` explicitly configures `storage: localStorage` for auth token persistence. In React Native, `localStorage` doesn't exist natively, and even with a polyfill, storing auth tokens in SQLite is **insecure** — tokens become readable by any app with root access or via backup extraction. Auth sessions silently break or become compromised.

**Why it happens:**
The `expo-sqlite/localStorage` polyfill makes the Supabase config "work" without changes, so developers think they've handled it. But the polyfill stores values in a plain SQLite database with no encryption, while auth tokens (access tokens, refresh tokens) require OS-level encrypted storage.

**How to avoid:**
1. Install `expo-secure-store`
2. Create a custom Supabase storage adapter that implements `getItem`/`setItem`/`removeItem` using `SecureStore.getItemAsync/setItemAsync/deleteItemAsync`
3. Replace `storage: localStorage` with `storage: new SecureStoreAdapter()`
4. Do this **before** any auth flow testing — switching storage later invalidates existing sessions.

**Warning signs:**
- Auth works in development but users get logged out randomly on real devices
- Tokens stored in plaintext SQLite database visible via debugging tools
- "Session expired" errors on app cold start
- Code review shows `storage: localStorage` in Supabase client config

**Phase to address:** Phase 1 (Foundation) — auth must be secure from day 1. No feature work should proceed without secure auth storage.

---

### Pitfall 3: Underestimating Framer Motion → React Native Reanimated Migration

**What goes wrong:**
The codebase has **725+ Framer Motion usage sites** across virtually every page: `motion.div`, `motion.button`, `motion.header`, `motion.img`, `AnimatePresence`, `PanInfo`, and complex animation orchestrations. Framer Motion does not work on React Native. The migration to `react-native-reanimated` is not a find-and-replace — it's a **fundamental paradigm shift** because:
- `motion.div` → `Animated.View` (different component names)
- `animate` prop → `useAnimatedStyle` + `withTiming/withSpring` (imperative vs declarative)
- `AnimatePresence` → `Reanimated` has no direct equivalent (need `ExitingAnimation` or custom `LayoutAnimation`)
- `PanInfo` → `useGestureHandler` from `react-native-gesture-handler`
- `variants` and `whileHover`/`whileTap` have different RN patterns
- Layout animations (enter/exit) use different APIs entirely

**Why it happens:**
Developers see "React Native Reanimated supports the same animations" and assume 1:1 API mapping. In reality, the animation models differ fundamentally — Framer Motion is declarative/prop-driven, Reanimated is hook-driven with worklets that run on the UI thread. Every animation must be manually rewritten.

**How to avoid:**
1. **Do NOT attempt a bulk migration** of all 725+ instances at once.
2. Start with a shared animation utility layer: create a `lib/animations/` folder with wrapper hooks (`useFadeIn`, `useSlideIn`, `useScalePress`, etc.) that abstract Reanimated behind simple APIs.
3. Migrate page-by-page, starting with simple pages (Onboarding, Profile) before complex ones (Dashboard, AITutor).
4. Use `moti` library as a bridge — it provides Framer Motion-like declarative API on top of Reanimated, reducing migration friction significantly.
5. Accept that some animations will be simplified in v1 (e.g., complex spring orchestrations → simple `withTiming`).

**Warning signs:**
- Animation migration PR has 200+ file changes (too large to review)
- Animations look janky or stutter on low-end devices (Reanimated worklet not used)
- `useAnimatedStyle` returning undefined on mount (race condition)
- Touch interactions feel unresponsive (gesture handler not configured)
- More time spent on animations than core features

**Phase to address:** Phase 2 (Core UI) for basic animations, Phase 3-5 for page-specific animations. The shared animation utility layer MUST be established in Phase 2 before any page work begins.

---

### Pitfall 4: Treating React Router → Expo Router as a Simple API Swap

**What goes wrong:**
The codebase uses React Router DOM with `BrowserRouter`, `Routes`, `Route`, `useNavigate` (15+ components), `useParams` (3+), `useSearchParams` (2), `useLocation` (5+), `Link` (10+), and `NavLink` (BottomNav). Developers try to map these 1:1 to Expo Router equivalents (`router.push()`, `useLocalSearchParams()`, etc.) without understanding that Expo Router is a **file-system-based routing paradigm** — the route structure is defined by the `app/` directory layout, not by `<Route>` components. This leads to:
- Incorrect deep linking (routes defined in JSX don't match file system)
- Navigation state lost on screen transitions (stack vs tab confusion)
- Modal and sheet navigation not working (requires specific file naming conventions)
- Type-safe routing not working (requires generated types from file structure)

**Why it happens:**
React Router is component-based (routes defined in JSX tree). Expo Router is file-system-based (routes defined by `app/` directory structure). The mental model is completely different. Developers can't just rename API calls — they must restructure the entire navigation architecture.

**How to avoid:**
1. Design the `app/` directory structure first, mapping every current route to a file.
2. Group routes into layouts: `(tabs)/` for bottom nav, `(stack)/` for nested screens, `_layout.tsx` for shared layout wrappers.
3. Replace `useNavigate()` → `router.push()` / `router.back()`
4. Replace `useParams()` → `useLocalSearchParams()` with typed params from file names
5. Replace `Link` → `<Link href="/path">` from `expo-router`
6. Replace `NavLink` active state → `usePathname()` comparison
7. Replace `useSearchParams()` → `useLocalSearchParams()`
8. Handle modal routes with `+not-found.tsx` and `(modal)/` groups
9. Set up deep linking configuration in `app.json`

**Warning signs:**
- Routes defined in `_layout.tsx` instead of file structure (fighting the framework)
- `useNavigate` calls that don't correspond to any file in `app/`
- Back button behavior inconsistent across screens
- Deep links open wrong screens or crash
- Tab bar disappears on nested navigation
- TypeScript errors on route params

**Phase to address:** Phase 1 (Foundation) — routing is the skeleton of the app. Every feature depends on correct routing. Must be established before any page work.

---

### Pitfall 5: Using NativeWind v5 Prematurely

**What goes wrong:**
The existing app uses TailwindCSS, so developers may reach for NativeWind v5 (which supports TailwindCSS v4) thinking "latest is best." But NativeWind v5 is still in **preview/beta** with unresolved issues — major blockers are still being reported in GitHub issues. Using it in production leads to broken styles, missing class support, and time wasted debugging framework bugs instead of app bugs.

**Why it happens:**
Developers check the NativeWind GitHub, see v5 as the latest version, and assume it's stable. The "preview" label is easy to miss, and the temptation to use TailwindCSS v4 compatibility is strong.

**How to avoid:**
1. **Use NativeWind v4** — it's the current stable release, works with TailwindCSS v3 (compatible with the existing config), and has proven production usage.
2. Accept TailwindCSS v3 syntax for now (the existing app uses v3 classes, so this is zero-cost).
3. Plan a v4→v5 upgrade as a **separate future task** after v5 stabilizes.
4. Note key differences from web: no `container-type` queries, `rem` units handled differently, pseudo-classes limited (hover/focus/active only), `group` syntax different behavior.

**Warning signs:**
- `nativewind` v5 in `package.json`
- TailwindCSS v4 syntax in code (`@theme`, CSS-first config) that NativeWind v4 doesn't understand
- Styles that work in web but render differently on native
- `className` props silently ignored on some components
- GitHub issues referencing NativeWind v5 bugs

**Phase to address:** Phase 1 (Foundation) — the styling system must be locked down before UI work begins.

---

### Pitfall 6: No React Native Equivalent for html2canvas/jsPDF Pipeline

**What goes wrong:**
The `ExportUtils.tsx` uses a two-mode PDF generation pipeline:
- **Fast mode:** HTML string → hidden iframe → `jsPDF` HTML-to-PDF
- **HQ mode:** `html2canvas` captures rendered DOM → slices into A4 pages → `jsPDF` assembles

Both modes are **100% DOM-dependent** — `html2canvas` literally screenshots the DOM, and `jsPDF`'s HTML mode renders via the DOM. Neither has any React Native equivalent. If a developer tries to "port" this code, it will crash immediately with "document is not defined."

**Why it happens:**
Developers search for "jsPDF react native" and find blog posts suggesting it works. These guides only cover the raw PDF generation (creating blank PDFs and adding text), not the HTML-to-PDF pipeline this app uses. The entire approach of "render HTML → capture → PDF" is fundamentally a web pattern.

**How to avoid:**
1. **Use `react-native-view-shot`** to capture any React Native view as an image.
2. **Use `expo-print`** to generate PDFs from HTML strings (it renders HTML natively on iOS/Android).
3. **Rebuild the pipeline:** For study notes/resources, render the content in a React Native view → `view-shot` captures it → assemble pages into PDF via `expo-print` or a native PDF library.
4. For KaTeX content in PDFs, render math with a native math renderer first (see Pitfall 7), then capture.
5. **Accept that PDF quality may differ** from the web version initially — focus on functional parity, not pixel-perfect reproduction.

**Warning signs:**
- `import html2canvas` or `import jsPDF` in React Native code
- `document.createElement('iframe')` in export code
- PDF export works on web preview but crashes on device
- Empty or corrupt PDF files generated on native
- "Cannot find module html2canvas" errors

**Phase to address:** Phase 4 (Study & AI Tools) — PDF export is specific to study features, but the `react-native-view-shot` + `expo-print` architecture should be validated in Phase 2 (Core UI) as a spike.

---

### Pitfall 7: KaTeX renderToString Produces HTML — Not Native Views

**What goes wrong:**
The codebase has **65+ KaTeX references** using `katex.renderToString()` in `lib/formatters.ts`, which produces an HTML string. This HTML string is then embedded in markdown via `rehype-katex` and rendered with `dangerouslySetInnerHTML` or markdown renderers. In React Native, there is no DOM to render HTML into, and `dangerouslySetInnerHTML` doesn't exist. The KaTeX CSS import (`katex/dist/katex.min.css`) also won't work natively.

**Why it happens:**
KaTeX is the de facto math rendering library on web. Developers assume there's a React Native version, but there isn't one that produces native views from `renderToString()` output. The HTML string is meaningless without a DOM renderer.

**How to avoid:**
1. **Use `react-native-math-view`** or `react-native-katex` (WebView-based) for rendering math natively.
2. For markdown containing math, use `react-native-markdown-display` with a custom math renderer that delegates to `react-native-math-view`.
3. **Do NOT use `react-native-webview` to render KaTeX HTML** for every math expression — it's too heavy for inline math in chat/messages. Reserve WebView approach for complex documents only.
4. For PDF export with math, render using native math renderer → `view-shot` capture → include in PDF.
5. Replace the `rehype-katex` plugin with a custom markdown plugin that outputs native math component markers instead of HTML.

**Warning signs:**
- Math expressions render as raw HTML strings (e.g., `<span class="katex">...`)
- Math expressions render as blank spaces
- App crashes when navigating to any AI tool page (all use KaTeX)
- WebView created per math expression (memory explosion)
- Fonts for math symbols missing (square boxes instead of symbols)

**Phase to address:** Phase 3 (Social & Communication) for chat math rendering, Phase 4 (Study & AI Tools) for full KaTeX migration in AI tools. The math renderer component should be built as a shared utility in Phase 2.

---

### Pitfall 8: Web Speech API Absence in React Native

**What goes wrong:**
`VoiceMode.tsx` and `AudioNotes.tsx` use `window.speechSynthesis` (text-to-speech) and `window.SpeechRecognition || window.webkitSpeechRecognition` (speech-to-text). These Web Speech APIs don't exist in React Native. Voice mode and audio notes will crash on launch.

**Why it happens:**
The Web Speech API feels like a "standard browser feature" that developers assume React Native implements. It doesn't — React Native's JS runtime is JavaScriptCore/Hermes, not a browser engine. There's no `speechSynthesis` global.

**How to avoid:**
1. **Text-to-speech:** Replace with `expo-speech` (`Speech.speak()`, `Speech.stop()`, `Speech.isSpeakingAsync()`). API is similar but async.
2. **Speech-to-text:** Replace with `expo-voice` (`Voice.startEventListener()`, `Voice.start()`, `Voice.stop()`). Requires microphone permission.
3. **Add platform permission handling:** Android requires `RECORD_AUDIO` permission — add to `app.json` plugins and handle runtime permission request.
4. Test on real devices — speech recognition behavior differs significantly between Android versions and requires Google Play Services.

**Warning signs:**
- Voice mode crashes with "speechSynthesis is not defined"
- Audio notes button does nothing
- Microphone permission dialog never appears
- Speech recognition works on emulator but not real device (Google Play Services missing)

**Phase to address:** Phase 5 (Advanced Features) — voice features are nice-to-have differentiators, not launch blockers. But the `expo-speech` + `expo-voice` integration must be validated as a spike earlier (Phase 2).

---

### Pitfall 9: Paystack Has No Official React Native SDK

**What goes wrong:**
The app uses `window.PaystackPop?.setup()` — the Paystack Inline JS SDK loaded via `window` object. This is a browser-only payment flow that opens a popup. In React Native, this simply doesn't exist. There is no official Paystack React Native SDK. Developers who try to use `react-native-paystack` (community package) find it outdated, unmaintained, and incompatible with current React Native versions.

**Why it happens:**
Paystack's documentation focuses on web and native mobile (Kotlin/Swift), not React Native. The community packages exist but are poorly maintained. Developers waste time trying to make the JS SDK work in a WebView or find a native wrapper.

**How to avoid:**
1. **Use Paystack's mobile SDK directly via an Expo Module** — create a thin native module wrapping Paystack's Android SDK (Kotlin) and iOS SDK (Swift).
2. **Alternative (faster for MVP):** Use a WebView-based payment flow — open Paystack's checkout URL in `react-native-webview`, listen for callback URLs to detect payment completion.
3. **Critical:** Move the hardcoded test key `pk_test_58f4b0b6d69b01ee0e2b3a78b5de225b1ebd0ed8` to `expo-constants` or environment variables immediately.
4. Test payment flows on **real devices with real Nigerian payment methods** (USSD, bank transfer) — not just card payments in simulator.

**Warning signs:**
- `window.PaystackPop` reference in React Native code
- `react-native-paystack` package with last publish date > 2 years ago
- Payment popup doesn't appear on device
- Payment completes in test but fails in production (USSD flow different)
- Paystack test key hardcoded in source code

**Phase to address:** Phase 6 (Payments & Monetization) — payments come last, but the WebView-based payment approach should be validated in Phase 2 as a spike. The hardcoded key must be moved immediately in Phase 1.

---

### Pitfall 10: FocusMode AccessibilityService Requires Deep Native Module Work

**What goes wrong:**
The FocusMode plugin currently uses `@capacitor/core`'s `registerPlugin` pattern with an interface including: `checkPermissions`, `requestPermissions`, `getInstalledApps`, `startBlocking`, `stopBlocking`, `isBlocking`, `enterKioskMode`, `exitKioskMode`, and `addListener('blockedAppDetected')`. This is an **Android AccessibilityService** — one of the most privileged and restricted Android APIs. Developers try to:
1. Wrap it as a simple Expo Module — but AccessibilityService requires `AndroidManifest.xml` declarations, a `Service` subclass, and XML accessibility service config.
2. Use React Native's `AccessibilityInfo` API — but this is for **consuming** accessibility services (TalkBack), not **creating** them.
3. Skip the native module work and use a simpler approach — but there is no simpler approach for app blocking on Android.

**Why it happens:**
AccessibilityService is a specialized Android API that most React Native developers have never used. It requires deep Android knowledge (Service lifecycle, Manifest declarations, AccessibilityNodeInfo traversal, `onAccessibilityEvent` handling). The Capacitor plugin already handles this, but converting it to an Expo Module requires re-implementing the entire native layer.

**How to avoid:**
1. **Use `npx create-expo-module@latest --local`** to scaffold a local Expo Module for FocusMode.
2. Re-implement the AccessibilityService in Kotlin within the module's `android/` directory.
3. Register the service in the module's `android/src/main/AndroidManifest.xml`.
4. Use the Expo Modules `Events("blockedAppDetected")` API for the event listener — this maps directly to the existing `addListener` pattern.
5. Expose all plugin methods via Expo Module `Function()` definitions.
6. **Test on physical Android devices only** — AccessibilityService behavior differs across Android versions, and some manufacturers (Xiaomi, Huawei) restrict background services aggressively.

**Warning signs:**
- FocusMode plugin compiles but blocking doesn't actually work
- AccessibilityService not appearing in Android Settings → Accessibility
- `blockedAppDetected` events never firing
- Kiosk mode works in development but killed by battery optimization in production
- App crashes when entering Focus Mode on certain Android versions

**Phase to address:** Phase 5 (Advanced Features) — FocusMode is a premium feature. The Expo Module scaffolding should be done in Phase 1 (Foundation) to validate the pattern, but the full implementation can wait.

---

### Pitfall 11: WebLLM/transformers.js WASM Pipeline Is Browser-Only

**What goes wrong:**
`OfflineAIContext.tsx` uses `@huggingface/transformers` (transformers.js) with `env.useBrowserCache = true`, WASM-based inference, and IndexedDB for model caching. This entire pipeline is **browser-only**:
- WASM execution requires a browser's WebAssembly runtime (React Native's Hermes/JSC doesn't support WASM modules the same way)
- `env.useBrowserCache` uses the Cache API — not available in React Native
- Model caching via IndexedDB — not available in React Native
- The inference pipeline relies on Web Workers for off-main-thread computation — React Native has a different threading model

**Why it happens:**
Developers see "transformers.js runs in the browser" and assume React Native's JavaScriptCore can do the same. But WASM support in React Native is limited and not production-ready for ML workloads. The entire caching and inference architecture is built for browser APIs.

**How to avoid:**
1. **For MVP: Make on-device AI cloud-only** — route all AI requests through Supabase Edge Functions or a dedicated API. Remove on-device inference entirely for v1.
2. **For v2: Evaluate ONNX Runtime React Native** (`onnxruntime-react-native`) as a replacement for transformers.js — it supports native ONNX model execution on mobile.
3. Replace IndexedDB model cache → `expo-sqlite` or `expo-file-system` for model storage.
4. Accept that on-device AI will have **significantly reduced model sizes** compared to web (mobile RAM constraints).
5. Design the `OfflineAIContext` to have a **cloud fallback** — when on-device model isn't available, fall back to API inference.

**Warning signs:**
- `@huggingface/transformers` import crashes the app on launch
- "WebAssembly is not defined" error
- Model download starts but fails with Cache API errors
- App OOM (out of memory) crashes when loading even small models on 2GB RAM devices
- Inference works on high-end device but crashes on target 2GB devices

**Phase to address:** Phase 4 (Study & AI Tools) — AI features need the cloud-first architecture designed in Phase 1. On-device inference should be deferred to a future phase and marked as a research spike.

---

### Pitfall 12: IndexedDB and Service Worker Absence Breaks Offline Architecture

**What goes wrong:**
The app's offline architecture relies on:
- **IndexedDB** (`OfflineAIContext.tsx` for model cache, database creation/deletion)
- **Service Worker** (`usePWAUpdate.ts`, `Profile.tsx`, `AdminResources.tsx`, `ErrorBoundary.tsx` for registration/unregistration)
- **localStorage** for pending actions queue and sync status

None of these exist in React Native. The offline sync system (`offlineSync.ts`) that queues actions in `localStorage` and replays them won't work. The service worker-based update mechanism is meaningless. IndexedDB model cache doesn't exist.

**Why it happens:**
The offline architecture was built for web PWA patterns. Service Workers are the web's answer to background sync and caching. React Native has completely different offline primitives — there's no Service Worker, no IndexedDB, no `Cache` API.

**How to avoid:**
1. **Replace IndexedDB → `expo-sqlite`** — use SQLite for all structured offline storage (model cache, pending actions, cached data).
2. **Replace Service Worker updates → EAS Update** — Expo's OTA update system replaces the PWA update flow.
3. **Replace localStorage pending queue → `expo-sqlite/kv-store`** — use SQLite-backed key-value store for the sync queue.
4. **Use `@react-native-community/netinfo`** for connectivity detection (replaces `navigator.onLine`).
5. **Design background sync differently** — React Native doesn't have Service Worker's background sync API. Use `expo-background-fetch` or `expo-task-manager` for periodic sync, and immediate sync on app foreground via `AppState` listener.
6. **Use `expo-network`** to detect connectivity before sync attempts.

**Warning signs:**
- Offline mode doesn't persist data across app restarts
- Sync queue lost on app kill (not persisted to SQLite)
- PWA update check code still present in React Native build
- "serviceWorker is not defined" runtime errors
- App shows "update available" banner that doesn't work

**Phase to address:** Phase 1 (Foundation) for core storage (expo-sqlite setup), Phase 3 (Social & Communication) for real-time sync architecture, Phase 4 (Study & AI Tools) for offline AI cache.

---

### Pitfall 13: Supabase Realtime WebSocket Disconnects on App Background

**What goes wrong:**
Supabase Realtime uses WebSocket connections for chat, presence, and live updates. On React Native, when the app goes to background, the OS may **kill the WebSocket connection** to save resources. When the user returns, the connection doesn't automatically reconnect, leading to:
- Chat messages not appearing in real-time
- Presence indicators showing users offline when they're active
- Subscription-updated events (`window.dispatchEvent` in current code) not received
- Stale data shown until manual refresh

**Why it happens:**
React Native apps don't have the same lifecycle as web pages. Mobile OSes aggressively manage background processes. WebSocket connections are frequently terminated when apps background, and the Supabase JS client doesn't handle React Native's `AppState` changes by default.

**How to avoid:**
1. **Listen to `AppState` changes** — on `active` state, reconnect all Supabase Realtime channels.
2. **Use Supabase's `onClose` and `onError` callbacks** to detect disconnections and trigger reconnects.
3. **Implement exponential backoff reconnection** — don't hammer the server on reconnect.
4. **Cache latest state locally** — when reconnecting, fetch the latest state to ensure nothing was missed during disconnection.
5. **Replace `window.dispatchEvent('subscription-updated')`** → use Supabase Realtime channel for cross-client events, or use `expo-notifications` for push-based updates when backgrounded.

**Warning signs:**
- Chat messages appear with 30+ second delay
- User appears "offline" to others when app is in foreground
- Real-time features work when app is first opened but stop working after backgrounding
- Channel subscription errors in console after app resume
- "Presence" shows stale state after foreground

**Phase to address:** Phase 3 (Social & Communication) — real-time features are core to chat. The `AppState` → reconnect pattern should be built into the Supabase service layer from the start.

---

### Pitfall 14: Not Testing on Low-End Android Devices (2GB RAM Target)

**What goes wrong:**
The PROJECT.md specifies 2GB RAM devices as the target. On-device AI inference, complex animations, large chat histories, and PDF generation can all cause **OOM (Out of Memory) crashes** on these devices. The app works fine on development devices (typically 6-12GB RAM) but crashes in production on the target hardware.

**Why it happens:**
Developers test on emulators (which use host machine RAM) or their personal high-end devices. Low-end Android devices also have aggressive battery optimization, limited background processing, and slower CPUs that make animation frame drops and operation timeouts more likely.

**How to avoid:**
1. **Set up an Android Emulator with 2GB RAM** — create a specific AVD profile matching target device specs.
2. **Profile memory usage early** — use React Native Debugger and `expo-dev-client` memory profiling.
3. **Implement memory-aware features:** lazy load images, paginate chat history (don't load all messages), limit concurrent AI inference, compress assets.
4. **Use `react-native-performance`** to monitor frame rates — target 30fps minimum on 2GB devices (60fps is unrealistic).
5. **Test with real network conditions** — use Android emulator throttling for 2G/3G simulation.
6. **Avoid on-device ML on 2GB devices** — detect device capability and fall back to cloud inference.

**Warning signs:**
- App crashes after extended use (memory leak)
- Animations drop below 15fps (jank)
- Chat with 100+ messages causes scroll lag
- PDF generation OOM crash
- On-device AI model loading crashes the app
- App takes 10+ seconds to cold start

**Phase to address:** Phase 1 (Foundation) — set up the low-end AVD profile. Every subsequent phase must verify against it.

---

### Pitfall 15: Capacitor Plugin Pattern Doesn't Translate to Expo Modules

**What goes wrong:**
The FocusMode plugin uses `@capacitor/core`'s `registerPlugin` pattern with TypeScript interface definitions. Developers try to "port" this by creating a similar TypeScript interface in Expo, but Expo Modules use a **completely different definition pattern** (`Name()`, `Function()`, `Events()` in the module provider). The plugin's event system (`addListener('blockedAppDetected')`) works differently in Expo Modules.

**Why it happens:**
Both systems use TypeScript interfaces and native module bridging, so they look similar at first glance. But the implementation patterns are fundamentally different:
- Capacitor: TypeScript interface → auto-generated bridge → native implementation
- Expo Modules: Kotlin/Swift module definition → auto-generated TypeScript → consumer code

**How to avoid:**
1. **Don't try to adapt the Capacitor plugin** — rewrite it from scratch as an Expo Module.
2. Use `npx create-expo-module@latest --local` to scaffold the correct structure.
3. Define the module in Kotlin using `Name("FocusMode")`, `Function("checkPermissions")`, `Events("blockedAppDetected")`, etc.
4. Re-implement the Android AccessibilityService natively within the module's `android/` source.
5. The generated TypeScript API will automatically match what the React Native code needs.

**Warning signs:**
- `@capacitor/core` still in `package.json` for React Native build
- `registerPlugin` pattern used in Expo code
- Native module methods return undefined (bridge not connected)
- Event listeners never receive events (event name mismatch)
- Build succeeds but runtime can't find the native module

**Phase to address:** Phase 1 (Foundation) for module scaffolding, Phase 5 (Advanced Features) for full implementation.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `expo-sqlite/localStorage` polyfill without migrating to SecureStore for auth | Auth works on day 1 | Auth tokens stored in plaintext SQLite; users can be impersonated | **Never** — security shortcut |
| Using `moti` for all animations instead of learning Reanimated | Faster Framer Motion migration | Moti abstraction layer adds overhead; complex animations impossible without dropping to Reanimated | MVP only — migrate critical animations to Reanimated directly |
| WebView for every KaTeX expression | Math renders immediately | One WebView per expression = massive memory/CPU overhead; scroll jank; 2GB devices crash | **Never** for inline math — only for standalone math documents |
| WebView for Paystack checkout | Payment works quickly | Poor UX (feels like a website inside app); no native payment flow; callback URL parsing fragile | MVP only — build native Expo Module for production |
| Skipping offline sync for v1 | Faster launch | Core feature missing; students without stable internet can't use app | **Never** — offline is table stakes for Nigerian student market |
| Hardcoding env vars instead of setting up `expo-constants` | App works immediately | Secrets exposed in bundle; can't change config without rebuild | **Never** — set up env system in Phase 1 |
| Using `expo-sqlite/localStorage` as permanent storage strategy | Zero code changes needed | API is web-centric; doesn't leverage SQLite's querying power; perpetuates web patterns in native app | Phase 1 only — plan migration to proper `expo-sqlite` usage |
| Copying web component markup into React Native | Screens "look done" fast | DOM elements (`div`, `span`, `button`) don't exist in RN; crashes on native while working on web preview | **Never** — always use RN components (`View`, `Text`, `Pressable`) |
| Keeping Framer Motion in web preview only | Web preview works | Dual codebases silently diverge; features tested only in web don't work on native | **Never** — if it doesn't work on native, it doesn't work |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Supabase Auth** | Using `localStorage` polyfill for token storage | Use `expo-secure-store` with custom Supabase storage adapter |
| **Supabase Realtime** | Assuming WebSocket stays connected during app backgrounding | Listen to `AppState`, reconnect channels on `active` state with exponential backoff |
| **Supabase Storage** | Using web upload patterns with `File` API | Use `expo-file-system` + `uploadAsync` or `FormData` with `Blob` polyfill |
| **Paystack** | Using `window.PaystackPop` JS SDK or unmaintained `react-native-paystack` | WebView-based checkout for MVP; native Expo Module wrapping Paystack Android/iOS SDKs for production |
| **WebLLM / transformers.js** | Trying to run WASM-based inference in React Native's JS runtime | Make AI cloud-only for v1; evaluate `onnxruntime-react-native` for v2 on-device inference |
| **Capacitor → Expo Module** | Trying to adapt Capacitor plugin interface directly | Rewrite as Expo Module from scratch using `create-expo-module`; different definition pattern |
| **KaTeX** | Using `renderToString()` HTML output or WebView per expression | Use `react-native-math-view` for native rendering; WebView only for full documents |
| **Vite env vars** (`VITE_*`) | Using `import.meta.env.VITE_*` in React Native | Use `expo-constants` or `@env` Babel plugin for environment variables |
| **Service Worker** | Porting PWA update/registration logic | Replace with EAS Update for OTA updates; remove all `navigator.serviceWorker` code |
| **html2canvas + jsPDF** | Looking for direct RN equivalents of DOM-based PDF pipeline | Use `react-native-view-shot` + `expo-print` for view capture → PDF generation |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| On-device AI model loading on 2GB RAM | App OOM crash when model loads; device becomes unresponsive | Detect device RAM; fall back to cloud inference on low-end devices; use `expo-device` for capability detection | 2GB Android devices immediately |
| Unpaginated chat message list | Scroll jank after 100+ messages; memory grows linearly | Implement `FlatList` with pagination; use `getItemType` for message type differentiation; virtualize everything | 50+ messages on 2GB device; 200+ on any device |
| WebView-per-math-expression rendering | CPU pegged at 100%; battery drain; scroll lag | Use native math renderer (`react-native-math-view`); reserve WebView for full documents only | 3+ visible expressions on any device |
| Reanimated animations without worklets | JS thread blocked during animations; 10fps on low-end | Use `useAnimatedStyle` with `worklet` directive; run animations on UI thread | Any device when 2+ animations run concurrently |
| Loading full Supabase Realtime channel state on reconnect | Spike of 50+ messages on reconnect; UI freezes 2-3 seconds | Fetch only delta since last connected timestamp; use cursor-based pagination | 500+ messages in channel |
| PDF generation of large documents | OOM crash during view-shot capture of long scrollable content | Generate PDF page-by-page (capture view sections individually); stream to file instead of holding all pages in memory | 10+ page PDF on 2GB device; 30+ pages on any device |
| Eager loading all app screens in Expo Router | Cold start takes 5+ seconds; blank splash screen | Use Expo Router's lazy loading (default); code-split with dynamic `import()` for heavy features | 30+ screens with heavy dependencies |
| Storing images in SQLite base64 | Database grows to 100MB+; queries slow to seconds | Use `expo-file-system` for file storage; store only paths in SQLite | 50+ images in offline cache |
| No memoization on render-heavy AI tool outputs | AI streaming re-renders entire page per token | Memoize markdown renderer; use `React.memo` on message components; virtualize AI output | Any AI tool generating 500+ token responses |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Hardcoded Paystack test key in source (`pk_test_58f4b0b6d69b01ee0e2b3a78b5de225b1ebd0ed8`) | Key exposed in app bundle; anyone can create test charges; production key rotation blocked | Move to `expo-constants` or `@env`; use `.env.local` for development; never commit keys |
| Storing Supabase auth tokens in `localStorage` polyfill (SQLite) | Tokens extractable from device backup; root access exposes plaintext tokens | Use `expo-secure-store` (Android Keystore / iOS Keychain encryption) |
| Using `VITE_` env vars pattern in Expo bundle | Vite env vars inlined at build time and readable from bundle; no runtime protection | Use `expo-constants` for public config; use EAS Secrets for sensitive values; never bundle secrets |
| No certificate pinning for Supabase API calls | MITM attacks on public WiFi can intercept auth tokens and data | Implement SSL pinning via `expo-network` or custom native module for Supabase endpoints |
| FocusMode AccessibilityService with overly broad permissions | AccessibilityService can read all screen content; privacy violation if permissions too broad | Request minimum necessary accessibility event types; clearly document what data is collected; add privacy policy disclosure |
| Paystack WebView without URL validation | Malicious URLs could inject payment pages; phishing attacks | Validate callback URLs against Paystack domain whitelist; verify transaction server-side |
| No request signing for Supabase Edge Functions | Unauthorized API calls if auth tokens compromised | Implement request signing with short-lived tokens; validate server-side |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Web-style navigation (no back gesture support) | Users try to swipe back and nothing happens; feels "broken" vs other apps | Implement native back gesture with `react-native-gesture-handler`; respect Android hardware back button |
| `window.confirm()` dialogs for destructive actions | Jarring browser-style dialogs that feel out of place; no customization | Use `Alert.alert()` with native styling; consider bottom sheet confirmations for better UX |
| Hover states from web (Framer Motion `whileHover`) | Hover effects meaningless on touch devices; tap targets may be too small for touch | Remove all hover states; increase tap target to 44x44 minimum; use `whileTap` for press feedback |
| Web-style scrolling (no momentum, no bounce) | Scrolling feels wrong — no iOS bounce, no Android overscroll glow | Use `ScrollView`/`FlatList` with platform-appropriate scroll configs; let RN handle momentum |
| PDF export workflow same as web (button → new tab) | No "new tab" in mobile; users don't know where PDF went | Save to device Downloads folder; show share sheet after generation; add in-app PDF viewer |
| No offline indicator for students with unstable internet | Features silently fail; users think app is broken | Show persistent offline banner; queue actions with visible pending count; auto-sync on reconnect |
| Web-style text selection and copy | Text selection doesn't work natively; copy/paste broken in chat | Use `TextInput` with `selectable` prop; implement `expo-clipboard` for copy actions |
| Bottom navigation without native feel | Tabs feel laggy; no haptic feedback; incorrect active state | Use Expo Router tab layout with native `BottomTabNavigator`; add haptics on tab switch |
| Onboarding flow identical to web | Tutorial assumes mouse/keyboard; references browser features | Redesign onboarding for touch-first; reference mobile-specific features; test with first-time users |
| Notifications via web `Notification` API | Push notifications don't work; students miss deadlines | Use `expo-notifications` with FCM/APNS; implement notification channels for Android |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Auth:** Often missing secure token storage — verify `expo-secure-store` is used (not localStorage polyfill) for Supabase auth tokens
- [ ] **Chat:** Often missing WebSocket reconnection on app resume — verify `AppState` listener reconnects Supabase Realtime channels
- [ ] **KaTeX rendering:** Often renders but with missing fonts — verify math symbols display correctly (not □ boxes) on real device without web fonts
- [ ] **PDF export:** Often generates PDF but KaTeX content is missing/garbled — verify math renders in native view before capture; test with actual KaTeX-heavy content
- [ ] **Payments:** Often works with test cards but fails with USSD/bank transfer — verify Paystack flow works with real Nigerian payment methods on production keys
- [ ] **FocusMode:** Often blocks apps but doesn't persist across device restarts — verify AccessibilityService auto-starts on boot; verify battery optimization doesn't kill it
- [ ] **Offline sync:** Often queues actions but loses them on app kill — verify pending queue persists to SQLite (not in-memory); verify sync resumes on app reopen
- [ ] **AI streaming:** Often renders markdown but KaTeX within markdown is broken — verify complete markdown→math rendering pipeline works end-to-end
- [ ] **Animations:** Often works on high-end device but jank on 2GB target — verify 30fps+ on 2GB Android emulator; test with multiple concurrent animations
- [ ] **Deep linking:** Often works for top-level routes but breaks on nested routes with params — verify all routes with `useLocalSearchParams()` resolve correctly from cold start
- [ ] **Back navigation:** Often works for simple screens but breaks on modal/sheet dismiss — verify Android hardware back button + gesture back work on all screens
- [ ] **Environment variables:** Often `VITE_` vars work in dev (via Metro) but missing in production build — verify `expo-constants` includes all env vars in EAS Build
- [ ] **Service Worker removal:** Often SW code is removed but `navigator.serviceWorker` references remain — grep for all `serviceWorker` references; verify no registration logic in RN build
- [ ] **Voice mode:** Often `expo-speech` TTS works but `expo-voice` STT fails silently — verify microphone permission is requested; test on real device with Google Play Services
- [ ] **Notification permissions:** Often permissions requested on first launch (too early) — verify permission request is contextual (ask when user enables a feature, not on app open)
- [ ] **PWA update mechanism:** Often `usePWAUpdate.ts` code still present but never triggers — replace with EAS Update; verify OTA updates work via `expo-updates`

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| localStorage polyfill used for auth tokens | HIGH | 1. Build SecureStore adapter 2. Add migration: read from localStorage polyfill → write to SecureStore 3. Clear polyfill data 4. Force re-auth for users with stale sessions |
| Framer Motion left in codebase (725+ files) | HIGH | 1. Build shared animation utility layer with `moti` 2. Create codemod for simple patterns (`motion.div` → `Animated.View` + `moti`) 3. Manually migrate complex animations 4. Accept simplified animations for v1 |
| React Router used instead of Expo Router | HIGH | 1. Map all routes to `app/` directory structure 2. Create `_layout.tsx` files for each route group 3. Replace navigation hooks one-by-one 4. Test deep linking for every route |
| On-device AI (WASM) doesn't work on RN | MEDIUM | 1. Add cloud inference fallback to all AI features 2. Route AI requests through Supabase Edge Functions 3. Remove on-device model download UI 4. Plan ONNX Runtime migration for v2 |
| Paystack JS SDK in WebView breaks in production | MEDIUM | 1. Switch to WebView-based checkout (same day fix) 2. Validate callback URL parsing 3. Add server-side transaction verification 4. Build native Expo Module for production |
| FocusMode AccessibilityService killed by OS | MEDIUM | 1. Add battery optimization exemption request flow 2. Implement foreground service notification 3. Add accessibility service re-enable prompt on app open 4. Test on Xiaomi/Huawei/Samsung devices |
| IndexedDB data lost (no migration to SQLite) | LOW | 1. Add SQLite schema migration on first launch 2. If web users have data, build export → import flow 3. This is a new install anyway (different platform) — no migration needed |
| Supabase Realtime not reconnecting | LOW | 1. Add `AppState` listener in Supabase service layer 2. Reconnect channels on `active` state 3. Fetch latest state on reconnect to catch missed events 4. Add reconnection indicator in chat UI |
| NativeWind v5 used in beta (broken styles) | LOW | 1. Downgrade to NativeWind v4 + TailwindCSS v3 2. Revert v4-incompatible Tailwind syntax 3. Pin versions in `package.json` |
| KaTeX renders as HTML string | MEDIUM | 1. Build `MathView` component using `react-native-math-view` 2. Create custom rehype plugin that outputs component markers instead of HTML 3. Update markdown renderer to use `MathView` for math blocks |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Web Browser APIs in RN (localStorage, window, navigator) | Phase 1: Foundation | Run app on real device; grep for `window.`, `document.`, `navigator.` in production bundle |
| Supabase Auth insecure storage | Phase 1: Foundation | Verify `SecureStore` adapter in Supabase client config; confirm tokens not in SQLite |
| Framer Motion → Reanimated migration | Phase 2: Core UI | Zero `framer-motion` imports in bundle; all pages use `moti`/Reanimated; 30fps on 2GB device |
| React Router → Expo Router paradigm shift | Phase 1: Foundation | All routes defined by `app/` directory structure; deep linking works for every route with params |
| NativeWind v5 premature usage | Phase 1: Foundation | `package.json` pins `nativewind@4`; no TailwindCSS v4 syntax in code |
| html2canvas/jsPDF no RN equivalent | Phase 4: Study & AI Tools | PDF generates on device from RN views; KaTeX content visible in PDF; works on 2GB device |
| KaTeX renderToString HTML output | Phase 2: Core UI (math component), Phase 4 (full migration) | Math expressions render as native views (not HTML); symbols display correctly; no WebView per expression |
| Web Speech API absence | Phase 2: Core UI (spike), Phase 5: Advanced Features | TTS speaks via `expo-speech`; STT receives speech via `expo-voice`; permission flow works |
| Paystack no official RN SDK | Phase 6: Payments & Monetization | Payment completes via WebView checkout; callback URL parsed correctly; works with USSD |
| FocusMode AccessibilityService native module | Phase 5: Advanced Features | Service appears in Android Settings → Accessibility; blocking works across device restart; events fire correctly |
| WebLLM/transformers.js WASM browser-only | Phase 4: Study & AI Tools (cloud fallback) | AI features work without on-device model; cloud inference latency acceptable; graceful fallback |
| IndexedDB/Service Worker absence | Phase 1: Foundation (SQLite), Phase 3 (sync) | No `indexedDB` or `serviceWorker` references in code; offline data persists to SQLite; sync works across app restarts |
| Supabase Realtime WebSocket background disconnect | Phase 3: Social & Communication | Chat reconnects within 2s of app foreground; no message loss during background period |
| Low-end Android device testing (2GB RAM) | Phase 1: Foundation (AVD setup), every phase after | App runs without OOM on 2GB AVD; 30fps minimum; cold start < 5s |
| Capacitor → Expo Module pattern mismatch | Phase 5: Advanced Features | No `@capacitor/core` in dependencies; FocusMode module scaffolded with `create-expo-module` |
| Hardcoded Paystack key | Phase 1: Foundation | No `pk_test_` or `pk_live_` strings in source code; all keys via `expo-constants` |

## Sources

- **Expo Router documentation** — file-based routing, typed routes, deep linking, layout patterns (https://docs.expo.dev/router/introduction/)
- **Expo Modules API tutorial** — module scaffolding, Kotlin definitions, Events API (https://docs.expo.dev/modules/native-module-tutorial/)
- **expo-sqlite documentation** — localStorage polyfill, KV store, session extension for sync (https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Supabase Realtime documentation** — WebSocket behavior, channel management, reconnection patterns (https://supabase.com/docs/guides/realtime)
- **NativeWind v4 installation and discussions** — stable version, TailwindCSS v3 compatibility, v5 beta status (https://www.nativewind.dev/)
- **EAS Build documentation** — build duration limits, local builds, development builds requirement (https://docs.expo.dev/build/introduction/)
- **React Native AccessibilityInfo API docs** — `isAccessibilityServiceEnabled` for consumers, not creators (https://reactnative.dev/docs/accessibilityinfo)
- **Codebase analysis: localStorage/sessionStorage/window/navigator usage** — 255+ matches across offline sync, auth, study time, focus lock, AI context, onboarding, payments, speech, navigation
- **Codebase analysis: Framer Motion usage** — 725+ instances across all pages
- **Codebase analysis: React Router DOM usage** — 77 matches across all pages (useNavigate, useParams, useSearchParams, useLocation, Link, NavLink)
- **Codebase analysis: KaTeX usage** — 65 matches in formatters, markdown renderer, AI tool pages
- **Codebase analysis: Service Worker/IndexedDB usage** — 19 matches in PWA update, profile, admin, error boundary, offline AI context
- **Codebase analysis: html2canvas/jsPDF usage** — ExportUtils.tsx two-mode pipeline (fast HTML→iframe→jsPDF, HQ html2canvas→slice→jsPDF)
- **Codebase analysis: Web Speech API usage** — 13 matches in VoiceMode.tsx, AudioNotes.tsx, LectureRecorder.tsx
- **Codebase analysis: Paystack integration** — `window.PaystackPop?.setup()` with hardcoded test key
- **Codebase analysis: Supabase client config** — `storage: localStorage` in auth configuration
- **Codebase analysis: FocusMode plugin** — `@capacitor/core` registerPlugin pattern with AccessibilityService interface
- **Codebase analysis: OfflineAIContext.tsx** — `@huggingface/transformers` with WASM/browser-only pipeline, IndexedDB model cache
- **Project context: PROJECT.md** — 2GB RAM target, Nigerian student market, offline-first requirement
- **Codebase concerns: CONCERNS.md** — no tests, hardcoded keys, bundle size, offline complexity, AI memory
- **Integration analysis: INTEGRATIONS.md** — Supabase, Paystack, WebLLM, Capacitor, env vars details

---
*Pitfalls research for: StudentOS React PWA → React Native (Expo) conversion*
*Researched: 2026-05-05*
