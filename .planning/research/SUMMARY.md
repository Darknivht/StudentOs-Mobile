# Project Research Summary

**Project:** StudentOS Mobile — Native Android Conversion
**Domain:** React PWA → React Native (Expo) conversion for an AI-powered educational platform
**Researched:** 2026-05-05
**Confidence:** HIGH

## Executive Summary

StudentOS is a comprehensive AI-powered learning platform for Nigerian students, currently a React 18 + TypeScript + Vite PWA wrapped with Capacitor 8 for Android. This project converts it into a true native Android app using React Native (Expo), maintaining pixel-perfect UI parity with the existing web app across all 30+ pages. The conversion is not a rewrite — it's a platform migration where every feature must work identically to the web version, with the native app's primary justification being Focus Mode's AccessibilityService app blocker (which is impossible in a WebView) and improved performance on low-end Android devices.

The recommended approach is a **monorepo with shared business logic** (`@studentos/shared` package) and a new Expo app (`apps/native/`) that mirrors the web app's hook → component → page pattern but uses Expo Router's file-based routing, NativeWind v4 for TailwindCSS styling, Reanimated 3 for animations, and expo-sqlite for offline storage. The critical path runs through five cross-cutting platform replacements: (1) `localStorage`/`window`/`navigator` → expo-sqlite/RN APIs, (2) React Router → Expo Router, (3) Framer Motion → Reanimated 3, (4) shadcn/ui → NativeWindUI, and (5) IndexedDB/Service Worker → expo-sqlite/NetInfo. Each replacement touches 50-700+ code sites and must be completed before dependent features can function.

Key risks center on **five critical conversion blockers**: Focus Mode's AccessibilityService (requires custom Kotlin Expo module with no community equivalent), Paystack payments (no official RN SDK), offline storage (IndexedDB → expo-sqlite schema migration + sync rewrite), SSE streaming (no `EventSource` in RN), and KaTeX rendering (HTML output from `renderToString()` is meaningless without DOM). These are not incremental tasks — each requires a fundamentally different architecture from the web version. The mitigation strategy is to build all five as foundational platform services before feature work begins, validating each with a spike in the first phase.

## Key Findings

### Recommended Stack

The stack strategy is **maximum code reuse via monorepo, minimum platform divergence via abstraction layers**. The `@studentos/shared` package holds all business logic, types, and platform-agnostic hooks (using dependency injection for storage/auth/network adapters). The native app consumes shared code and provides RN-specific implementations through service wrappers and native modules.

**Core technologies:**
- **Expo SDK 54+**: Managed workflow with `expo-dev-client` for custom native modules — chosen over bare RN for OTA updates, simplified builds, and first-class monorepo support
- **NativeWind v4** (NOT v5): TailwindCSS v3 for React Native — v5 is beta/preview; v4 is stable and compatible with existing TW v3 class usage
- **Expo Router v4+**: File-based routing replacing React Router — enables typed routes, deep linking, and route-group-based layouts
- **React Native Reanimated 3 + Moti**: Animation layer replacing 725+ Framer Motion instances — Moti provides declarative bridge API
- **expo-sqlite + KV store**: Replaces both IndexedDB (structured storage) and localStorage (key-value persistence) — single storage primitive for offline data, React Query cache, and auth tokens (via SecureStore adapter)
- **NativeWindUI**: Component library replacing 40+ shadcn/ui/Radix components — provides RN-native equivalents with same `className` API
- **TanStack React Query + PersistQueryClientProvider**: Same server state pattern as web, with `expo-sqlite/kv-store` persister for offline cache
- **Custom Expo Module (Kotlin)**: FocusMode AccessibilityService — `expo-focus-mode` local module using Expo Modules API

### Expected Features

This is a **feature parity conversion**, not a new product. Every feature must exist in the native app exactly as it does in the web app. The categorization reflects conversion priority, not user value.

**Must have (table stakes — P1/P2 priority):**
- Authentication (Supabase Auth + deep linking for password reset) — blocks everything
- Offline Storage Layer (expo-sqlite + NetInfo) — cross-cutting, unblocks 5+ features
- SSE Streaming Client — cross-cutting, unblocks all AI features
- KaTeX Rendering Component — cross-cutting, unblocks AI Tutor + ExamPrep + Math Solver
- Paystack WebView Integration — blocks revenue
- Focus Mode AccessibilityService — longest lead time, killer native feature
- Dashboard, Smart Notes, AI Tutor, Flashcards, Quizzes, ExamPrep CBT, Chat, Study Suite, Career Module, Social Hub, Gamification, Subscriptions, Profile, PDF Export, Onboarding, Dark Mode, Parental Controls, Store, Bottom Navigation, Course Management, Announcement Banner

**Should have (competitive differentiators):**
- Focus Mode App Blocker — **no competitor does this natively**; Forest only gamifies focus
- ExamPrep CBT Simulator (WAEC/NECO/JAMB) — replaces ₦5,000-₦8,000 standalone apps
- AI Integration (4 personas + 8 tools) — ChatGPT-equivalent for ₦5,000/mo
- Parental Controls (PIN + dashboard + time limits) — unique in category

**Defer (v2+):**
- Push notifications (FCM) — new feature, not in web app
- iOS build — Android-first constraint
- Biometric auth — native enhancement, not conversion
- On-device AI (ONNX Runtime) — WASM/browser-only pipeline doesn't translate
- Android home screen widget — new feature
- Multi-language UI — massive scope expansion
- School admin accounts — new product vertical

### Architecture Approach

**Layered architecture with feature-based colocation** — the native app mirrors the web's hook → component → page pattern but reorganizes into Expo Router's file-based routing structure, with shared business logic extracted into the `@studentos/shared` monorepo package. Platform-specific code is isolated behind service abstraction layers and dependency-injected adapters, ensuring `@studentos/shared` has zero web or native platform imports.

**Major components:**
1. **Expo Router (app/)** — Navigation, screen rendering, deep linking. Route groups `(auth)`, `(tabs)`, `(modal)` replace React Router's component-based routing. `_layout.tsx` files replace AppLayout.
2. **Feature Components (features/)** — Feature-specific UI composition (study/, notes/, focus/, chat/, exam-prep/, etc.). Colocated with their consuming screens, not in a global component tree.
3. **@studentos/shared** — Pure TypeScript business logic, types, Supabase client factory, platform-agnostic hooks via dependency injection. The critical rule: no `react-native`, `expo`, `react-router-dom`, or DOM imports.
4. **Platform Services (services/)** — Wrappers for expo-sqlite, NetInfo, Paystack WebView, haptics, notifications. Feature code never imports platform APIs directly.
5. **Native Modules (modules/)** — `expo-focus-mode` Kotlin AccessibilityService module with Expo Modules API (Function, Events, ConfigPlugin definitions).
6. **UI Primitives (components/ui/)** — NativeWindUI-based visual building blocks replacing 40+ shadcn/ui components. ~15 direct replacements, ~15 rebuilds with different patterns, ~10 web-only removals (sidebar, breadcrumb, pagination, hover-card, context-menu).

### Critical Pitfalls

1. **255+ Web API references will crash on native** — `localStorage`, `window.`, `navigator.`, `document.` don't exist in RN. Install `expo-sqlite/localStorage` polyfill on day 1, add ESLint `no-restricted-globals` rule. Supabase auth must use `expo-secure-store` (NOT polyfill) for encrypted token storage.

2. **725+ Framer Motion instances require manual migration** — Not a find-and-replace; `motion.div` → `Animated.View`, `animate` prop → `useAnimatedStyle` + worklets, `AnimatePresence` has no direct equivalent. Build shared animation utility layer first; use `moti` as bridge; accept simplified animations for v1.

3. **React Router → Expo Router is a paradigm shift, not an API swap** — Routes are defined by `app/` directory structure, not JSX `<Route>` components. The entire navigation architecture must be restructured into route groups with `_layout.tsx` files before any page work begins.

4. **Five cross-cutting platform replacements block all feature work** — Offline storage, SSE streaming, KaTeX rendering, Paystack payments, and Focus Mode native module each have no 1:1 RN equivalent and must be architected from scratch. Build all five as foundational services before feature screens.

5. **2GB RAM target devices demand aggressive optimization** — No on-device AI models, paginated chat via FlatList, page-by-page PDF generation, 30fps minimum target (not 60fps), memory profiling from day 1 on 2GB AVD.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Platform Services
**Rationale:** All feature work depends on five cross-cutting platform replacements (storage, routing, styling, auth, streaming). These have zero feature visibility but block everything. Must be built and validated before any screens can render.
**Delivers:** Monorepo setup, Expo project scaffold, NativeWind v4 config, expo-sqlite storage layer, Supabase client with SecureStore adapter, Expo Router shell with (auth)/(tabs) route groups, SSE streaming client, KaTeX rendering component, ESLint rules banning web APIs, 2GB AVD profile, env vars via expo-constants
**Addresses:** Authentication, Offline Storage Layer, SSE Streaming, KaTeX Rendering, Bottom Navigation shell
**Avoids:** Pitfall 1 (web APIs), Pitfall 2 (insecure auth), Pitfall 4 (React Router), Pitfall 5 (NativeWind v5), Pitfall 12 (IndexedDB/Service Worker), Pitfall 14 (2GB RAM testing)

### Phase 2: Core UI & Navigation
**Rationale:** With platform services in place, build the UI primitive layer and navigation shell that all feature screens will compose from. This phase also establishes the animation utility layer (critical for 725+ Framer Motion migrations) and validates PDF export + Paystack WebView as spikes.
**Delivers:** NativeWindUI component library (button, card, input, badge, alert, sheet, action-sheet, toast, skeleton, progress, carousel), Root/Auth/Tab layouts with providers (Query, Auth, Theme, Gesture), shared animation utility layer (useFadeIn, useSlideIn, useScalePress wrappers), PDF export spike (expo-print + view-shot), Paystack WebView spike, react-native-math-view integration
**Uses:** NativeWind v4, NativeWindUI, Reanimated 3, Moti, expo-print, react-native-view-shot, react-native-webview
**Implements:** Architecture components: UI Primitives layer, Navigation layer, Service abstraction layer
**Avoids:** Pitfall 3 (Framer Motion migration chaos), Pitfall 6 (PDF pipeline), Pitfall 7 (KaTeX HTML output), Pitfall 9 (Paystack RN SDK)

### Phase 3: Core Feature Screens (Study & AI)
**Rationale:** The study/AI features are the primary engagement drivers and have the densest dependency chains (SSE streaming, KaTeX, offline storage, PDF export). Building them first validates all five cross-cutting services end-to-end.
**Delivers:** Dashboard (home tab), Smart Notes (create/upload/view/AI summary), AI Tutor (4 personas, streaming, KaTeX), Flashcards (SM-2 review, card flip animation), Quizzes (AI-generated MCQs, friend challenges), Course Management, Profile & Settings, Onboarding flow, Dark Mode, Announcement Banner
**Implements:** Feature screens: study/, notes/, gamification/ components
**Avoids:** Pitfall 13 (Realtime WebSocket disconnects — addressed in auth/session layer)

### Phase 4: Exam Prep & Advanced Study
**Rationale:** ExamPrep CBT is the flagship premium feature with the most complex navigation (8 practice modes, multi-subject, KaTeX questions). It depends on KaTeX rendering, subscription tier system, and analytics charts — all established in prior phases.
**Delivers:** ExamPrep CBT (all 8 modes), Study Suite (12 tools — Pomodoro, cheat sheets, cram mode, mnemonics, concept linking, fill-in-blanks, audio notes, debate partner, statistics, streak calendar, voice mode, lo-fi radio), AI Tools Lab (8 tools — Math Solver, Code Debugger, Translator, YouTube Summarizer, Book Scanner, Diagram Interpreter, OCR-to-LaTeX, Lecture Recorder), Career Module (Resume builder + job search)
**Implements:** Feature screens: exam-prep/, career/, academic/ components; camera/microphone permissions (expo-camera + expo-audio)
**Avoids:** Pitfall 8 (Web Speech API — replaced with expo-speech/expo-voice), Pitfall 11 (WebLLM WASM — cloud-only AI)

### Phase 5: Social & Communication
**Rationale:** Chat and social features depend on Supabase Realtime, which requires WebSocket reconnection handling (AppState listener). Subscription tier gating must be working for group chat access.
**Delivers:** Chat (DMs + Groups via Supabase Realtime), Social Hub (Leaderboard, friends, study groups, peer finder), Gamification (XP, streaks, daily challenges, 50+ achievements), Subscription Tier System with feature gating
**Implements:** Feature screens: chat/ components; Supabase Realtime reconnection via AppState listener
**Avoids:** Pitfall 13 (WebSocket background disconnects)

### Phase 6: Native Integration & Payments
**Rationale:** Focus Mode AccessibilityService is the hardest feature (custom Kotlin module, Android permissions, BootReceiver) and the killer reason to go native. Paystack WebView integration blocks revenue. Both can be built in parallel with earlier phases but are validated here.
**Delivers:** Focus Mode (Kotlin AccessibilityService native module, app blocking, blocking overlay, permission flows, BootReceiver), Paystack WebView payment flow (checkout, callback URL intercept, bank transfer + USSD support), Parental Controls (PIN, time limits, content filter, parent dashboard), Store (tier-gated resource downloads)
**Implements:** Native module: modules/expo-focus-mode/; Service: services/payments.ts
**Avoids:** Pitfall 10 (FocusMode native module), Pitfall 9 (Paystack), Pitfall 15 (Capacitor → Expo Module pattern mismatch)

### Phase 7: Offline Sync & Polish
**Rationale:** Offline sync is the last cross-cutting concern because it requires all feature screens to exist before sync logic can be validated end-to-end. Polish (animations, haptics, error boundaries, performance) iterates on existing screens.
**Delivers:** Full offline sync (expo-sqlite structured storage, mutation queue, background sync via AppState, offline banner), Per-route ErrorBoundaries, Reanimated 3 animation polish (replacing remaining Framer Motion), Haptic feedback on key interactions, Performance optimization (FlashList, memo, bundle analysis), Test suite (Jest + RN Testing Library), EAS Update (replaces Service Worker PWA updates)
**Avoids:** Pitfall 12 (offline sync architecture), Pitfall 3 (remaining Framer Motion instances), Pitfall 14 (2GB RAM performance)

### Phase Ordering Rationale

- **Phase 1 before everything** because the five cross-cutting platform replacements (storage, routing, styling, auth, streaming) block all feature screens. Any feature work attempted before these foundations will either crash (web APIs) or require rework (wrong routing paradigm).
- **Phase 2 before 3** because feature screens compose from UI primitives and navigation layouts. The animation utility layer prevents chaotic per-page Framer Motion migrations.
- **Phase 3 first among features** because study/AI features have the densest dependency chains and validate all five cross-cutting services end-to-end. If SSE + KaTeX + offline + auth work here, they work everywhere.
- **Phase 4 before 5** because ExamPrep validates KaTeX rendering at scale (hundreds of math questions) and subscription tier gating before social features need it.
- **Phase 6 (Focus Mode + Paystack)** is independent of most features and can overlap with Phases 3-5, but it's validated as a separate phase because of its unique native module complexity.
- **Phase 7 last** because offline sync requires all features to exist for validation, and polish iterates on completed screens.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Focus Mode module scaffolding — validate Expo Modules API pattern with AccessibilityService (complex, no community examples). Also validate SSE streaming client (`react-native-sse` vs custom `fetch` + `ReadableStream`).
- **Phase 4:** KaTeX rendering at scale — `react-native-math-view` for inline math in chat vs exam questions with 50+ expressions; WebView approach only for full documents. Need performance validation on 2GB device.
- **Phase 6:** Focus Mode AccessibilityService — deepest native integration; must test on Xiaomi/Huawei/Samsung (manufacturer-specific battery optimization kills services). Paystack WebView — must validate with real USSD/bank transfer on production keys, not just test cards.

Phases with standard patterns (skip research-phase):
- **Phase 2:** UI primitives and animation utilities — NativeWindUI docs are thorough, Reanimated 3 patterns well-established
- **Phase 3:** Core feature screens — standard RN screen patterns, Supabase RN integration well-documented
- **Phase 5:** Chat/Social — Supabase Realtime in RN is well-documented; FlatList pagination is standard
- **Phase 7:** Offline sync + polish — expo-sqlite patterns established, React Query persistence well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All target technologies are stable, officially documented, and production-proven. NativeWind v4 vs v5 decision validated by official docs. Expo SDK 54 monorepo support confirmed. |
| Features | HIGH | Comprehensive feature inventory from existing codebase (30+ pages, 40+ components, 20+ hooks). Feature parity constraint eliminates ambiguity. Dependency mapping is codebase-verified. |
| Architecture | HIGH | Monorepo structure follows official Expo monorepo guide. Component mapping verified against actual shadcn/ui usage. Code sharing strategy validated by dependency injection patterns in existing hooks. |
| Pitfalls | HIGH | All 15 pitfalls verified by codebase grep analysis (255+ localStorage, 725+ Framer Motion, 77 React Router, 65 KaTeX references). Recovery strategies sourced from official Expo/RN docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **SSE Streaming in React Native:** `react-native-sse` is a community package with limited maintenance. Need to validate it handles reconnection, error recovery, and backpressure correctly. Alternative: custom `fetch` + `ReadableStream` implementation. This should be a Phase 1 spike.
- **KaTeX rendering performance:** `react-native-math-view` is the recommended library but needs validation with 50+ inline expressions on 2GB devices. WebView-per-expression approach will OOM on target devices. Must test early.
- **Focus Mode AccessibilityService on manufacturer-specific Android:** Xiaomi (MIUI), Huawei (EMUI), and Samsung (OneUI) all have aggressive battery optimization that kills AccessibilityServices. No community Expo Module example exists for this. Needs real-device testing across 3+ manufacturers.
- **Paystack USSD + bank transfer in WebView:** The WebView checkout flow works for card payments but USSD flows may have different callback patterns. Must test with Nigerian bank accounts in production environment.
- **Animation parity with web app:** 725+ Framer Motion instances cannot all be migrated with identical behavior. Need explicit decision on which animations require pixel-perfect parity vs acceptable simplification for v1.

## Sources

### Primary (HIGH confidence)
- **Expo Router documentation** — file-based routing, typed routes, deep linking, layout patterns, error handling
- **Expo Modules API tutorial** — module scaffolding, Kotlin definitions, Events API, ConfigPlugin
- **Expo SDK 54 documentation** — expo-sqlite, expo-camera, expo-audio, expo-print, expo-auth-session, expo-linking, expo-dev-client, expo-secure-store, expo-speech
- **NativeWind v4 documentation** — stable release, TailwindCSS v3 compatibility, cssInterop, dark mode
- **React Native Reanimated 3** — official docs, worklet architecture, shared transitions
- **TanStack Query persistence** — PersistQueryClientProvider, createAsyncStoragePersister
- **Supabase JS Client** — React Native support, storage adapter pattern, Realtime WebSocket behavior
- **StudentOS.md** — Full product documentation (1934 lines), all feature specifications
- **Codebase analysis** — STACK.md, STRUCTURE.md, INTEGRATIONS.md, CONCERNS.md

### Secondary (MEDIUM confidence)
- **NativeWindUI Components** — third-party component library, well-maintained but not official Expo
- **react-native-math-view** — community KaTeX renderer; fewer production examples than web KaTeX
- **react-native-sse** — community SSE client; limited maintenance history
- **Moti** — declarative animation library on Reanimated; reduces Framer Motion migration friction
- **Paystack documentation** — no official RN SDK; WebView-based checkout is community approach
- **@gorhom/bottom-sheet** — widely used but third-party; replaces Radix Dialog/Sheet

### Tertiary (LOW confidence)
- **ONNX Runtime React Native** — for future on-device AI inference; experimental, not production-ready
- **react-native-google-mobile-ads** — replacement for web AdSense; not yet validated in this codebase
- **expo-voice (speech-to-text)** — requires Google Play Services on device; behavior varies across Android versions
- **Focus Mode AccessibilityService across Android manufacturers** — no community examples of Expo Module with AccessibilityService; manufacturer-specific behavior needs real-device validation

---
*Research completed: 2026-05-05*
*Ready for roadmap: yes*
