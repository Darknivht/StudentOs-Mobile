# Feature Research

**Domain:** React PWA → React Native (Expo) Android conversion — StudentOS educational platform
**Researched:** 2026-05-05
**Confidence:** HIGH

## Feature Landscape

This is a **conversion project, not a greenfield product**. Every feature listed below already exists in the web app. The categorization reflects what users of the *native Android app* will expect — features where any degradation vs. the web app is unacceptable (Table Stakes), features that are the primary reason users choose StudentOS over competitors (Differentiators), and features that seem tempting to add but would violate the conversion's core principle of feature parity only (Anti-Features).

Complexity ratings reflect the **native conversion effort** — how hard it is to replicate the web feature in React Native/Expo — not the original implementation complexity.

### Table Stakes (Users Expect These)

Features the web app already has. Any missing or degraded feature = the native app feels broken. Users will not switch from the PWA to a native app that does less.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Authentication (Sign up / Sign in / Password reset) | Every app needs auth; web app has Supabase email+password with JWT session restore | LOW | Supabase Auth works in RN; needs `expo-auth-session` + `expo-linking` for deep linking on password reset magic links. Session restore via `supabase.auth.getSession()`. |
| Dashboard (Home hub) | First screen after login; streak card, daily quiz, widgets, courses grid | MEDIUM | Layout recreation with NativeWind. Streak card animations with Reanimated 3. Ad banner needs `react-native-google-mobile-ads` (replaces AdSense). |
| Smart Notes (Create / Upload / View) | Core content layer — every AI feature feeds from notes | HIGH | PDF upload → `extract-pdf-text` edge function (unchanged). File picker via `expo-document-picker`. Rich text editor needs RN replacement (e.g., `react-native-pell-rich-text` or 10Tap Editor). OCR via same edge function. |
| AI Tutor (4 personas, course-aware, streaming) | Primary user engagement feature; daily AI quota usage | HIGH | Streaming SSE requires `react-native-sse` or custom `fetch` with `ReadableStream`. KaTeX rendering requires WebView with KaTeX CDN or `react-native-math-view`. Persona selection + course context: pure state management (portable). |
| Flashcards (SM-2 review sessions) | Retention tool — Anki-equivalent feature users depend on daily | MEDIUM | Card flip animation: Reanimated 3. SM-2 algorithm: pure TypeScript (portable as-is). Difficulty rating UI: NativeWind + RN Pressable. |
| Quizzes (AI-generated MCQs + history) | Assessment tool integrated with notes | MEDIUM | Quiz UI is straightforward RN layout. Timer: `setInterval` (portable). Friend challenges require `peer_challenges` table (unchanged backend). |
| ExamPrep CBT (8 practice modes) | **Flagship premium feature** — WAEC/NECO/JAMB/IELTS/TOEFL/SAT/GRE simulators | HIGH | Multi-subject CBT with timer is complex RN navigation. KaTeX in questions (same WebView challenge). Question bookmark + report: standard RN forms. Analytics charts: `react-native-svg` + `victory-native` (replaces Recharts). |
| Focus Mode (Pomodoro + App blocker) | Killer native feature — the reason to go native in the first place | HIGH | Android AccessibilityService must be rebuilt as Expo native module (Kotlin). Requires `expo-dev-client` (not Expo Go). BootReceiver for persist-after-restart. App selector lists installed apps via native API. Overlay during sessions. |
| Chat (DMs + Groups) | Real-time communication built into the social fabric | MEDIUM | Supabase Realtime subscriptions work in RN. Media upload: `expo-image-picker` → Supabase Storage. Message replies with scroll-to-quote: `FlatList` + `scrollToIndex`. Group chat gated by subscription tier. |
| Subscription & Payments (Paystack) | Revenue engine — Free/Plus/Pro tiers + per-exam subs | HIGH | No official Paystack RN SDK. Must use **WebView-based checkout** — open Paystack popup in `react-native-webview`, intercept redirect URL with reference, call `verify-payment` edge function. Bank transfer + USSD support critical for Nigerian market. |
| Profile & Settings | Basic account management | LOW | Avatar upload via `expo-image-picker` → Supabase Storage `avatars` bucket. Study preferences, persona selection: standard RN forms. |
| Onboarding (7-step flow) | First-time user experience — sets expectations | MEDIUM | Framer Motion spring transitions → Reanimated 3 `withSpring`. Particle animations → Reanimated 3 shared transitions. `localStorage` flag → `expo-sqlite/kv-store` or `AsyncStorage`. |
| Dark Mode | Web app has full dark/light toggle | LOW | NativeWind supports dark mode via `useColorScheme()`. Design tokens map directly. System preference detection built-in. |
| Gamification (XP + Streaks + Daily challenges) | Engagement driver — visible on dashboard, profile, social | MEDIUM | XP computation: pure TypeScript (portable). Streak calendar: custom RN component (GitHub-style heatmap). Daily challenges: same backend logic. |
| Offline Mode | **Critical** for Nigerian connectivity — users expect cached content to work without signal | HIGH | IndexedDB → `expo-sqlite` with `SQLiteProvider`. Service worker → `@react-native-community/netinfo` + custom sync layer. Background sync → app foreground event + queue processing. Offline banner: NetInfo hook. |
| PDF Export (Fast + HD modes) | Used by 10+ features — notes, resumes, cheat sheets, AI tool outputs | HIGH | Browser `print()` doesn't exist on native. **Fast PDF**: `expo-print` (HTML→PDF via native print controller). **HD PDF**: `react-native-view-shot` (screenshot→image) + `expo-print`. KaTeX font injection: bundle fonts with app instead of CDN. |
| Course Management (Create / View / Progress) | Organizational unit tying notes, flashcards, quizzes together | LOW | CRUD forms + color/emoji picker. Progress calculation: pure TypeScript (portable). Course page navigation: Expo Router dynamic routes. |
| Bottom Navigation (5 tabs) | Primary navigation pattern — Home, Study, Exams, Social, Profile | LOW | Expo Router tabs layout. Native `BottomTabs` or custom component with Reanimated 3 tab animations. |
| Announcement Banner | Admin communication channel | LOW | Simple banner component. Pulls from `announcements` table (unchanged). |
| Store (Educational resources) | Content marketplace — tier-gated downloads | MEDIUM | Resource cards: standard RN layout. PDF download: `expo-file-system` + `expo-sharing`. YouTube embeds → `react-native-youtube-iframe`. Tier gating: `useSubscription` hook (portable). |

### Differentiators (Competitive Advantage)

Features that make StudentOS worth choosing over separate single-purpose apps (Anki, Quizlet, Forest, ChatGPT). These are the features users will specifically come to the native app for.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Focus Mode App Blocker (AccessibilityService) | **No competitor does this natively** — Forest only gamifies focus; StudentOS physically blocks apps. This IS the reason to install the native app over using the PWA. | HIGH | Requires custom Kotlin Expo module. `AccessibilityService` detects when blocked apps launch, shows overlay. `BootReceiver` restores state after restart. Permissions guided flow (Accessibility + Display Over Other Apps + Notifications). This is the hardest feature to convert and the most valuable. |
| ExamPrep CBT Simulator (WAEC/NECO/JAMB) | Nigerian exam simulators are standalone paid apps (₦5,000–₦8,000 each). StudentOS includes all of them in one subscription. Multi-subject JAMB CBT is unique. | HIGH | 8 practice modes. Multi-subject CBT with per-subject navigation. Weakness reports + AI study plans. Per-exam subscriptions. Analytics with radar charts. |
| AI Integration (Tutor + 8 AI Tools) | ChatGPT costs ₦30,000/mo; StudentOS Pro gives AI tutoring for ₦5,000/mo with course-aware context. | HIGH | 4 tutor personas + 8 AI tools (Math Solver, Code Debugger, Translator, YouTube Summarizer, Book Scanner, Diagram Interpreter, OCR-to-LaTeX, Lecture Recorder). All stream via SSE. KaTeX rendering in outputs. Voice mode. |
| Study Suite (12 specialized tools) | Replaces 5+ standalone apps — cheat sheets, mnemonics, cram mode, concept linking, fill-in-blanks, audio notes, debate partner, Pomodoro, statistics, streak calendar, voice mode | MEDIUM | Most are AI-call + result-display patterns. Audio notes TTS: `expo-speech`. Lecture recorder: `expo-audio`. Lo-fi radio: `expo-av` streaming. |
| Career Module (Resume Builder + Job Search) | Professional resume builder with 10 templates + AI bullet improver. No free competitor for Nigerian students. | MEDIUM | Live preview: WebView rendering of HTML template. PDF export (same challenge). AI summary + bullet improver: AI edge function calls. Job search: `job-search` edge function (unchanged). |
| Social Hub (Leaderboard + Challenges + Groups) | Turns solo studying into community — friend challenges, study groups, peer finder. | MEDIUM | Leaderboard: `FlatList` with pagination. Study groups: CRUD + invite codes. Peer finder: search + filter. All gated by subscription tier (Plus/Pro for groups). |
| Parental Controls (PIN + Dashboard + Time limits) | Parents get visibility + control. No other study app offers this. | MEDIUM | PIN hashing: portable. Time limit enforcement: native `AlarmManager` or RN timer. Parent dashboard: read-only aggregated stats. Content filter: server-side (unchanged). |
| Achievements (50+ across 5 categories) | Gamification depth — computed in real-time, not pre-stored. | LOW | `useAchievements` hook logic is pure TypeScript (portable). Achievement definitions in DB (unchanged). Celebration toast: RN equivalent. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good to add during a native conversion but would violate the project's core constraint: **feature parity only, no new features**.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| iOS build | "Expo supports both platforms, why not ship iOS too?" | Doubles testing surface, requires Apple Developer account, TestFlight setup, iOS-specific debugging (focus mode, push notifications). Violates "Android-first" constraint. | Defer to v1.1 per roadmap. Expo architecture makes it achievable later without rework. |
| Push notifications (FCM) | "Native apps should send push notifications" | Web app has no push notification system. Adding it means new edge function, new UI for notification preferences, new permission flows, new testing. This is a NEW feature, not a conversion. | Defer to v1.1. The web app doesn't have this. Feature parity = don't add it now. |
| Biometric auth (fingerprint/face) | "Native apps use biometrics, not just passwords" | Web app doesn't support biometrics. Adding `expo-local-authentication` means new auth flow, new UI, new testing. New feature, not conversion. | Defer. Can be added as enhancement later without breaking existing auth. |
| On-device AI (WebLLM → ONNX Runtime) | "The web app mentions WebLLM on-device inference" | WebLLM doesn't work on RN. ONNX Runtime RN is experimental. Device fragmentation on low-end Android makes on-device inference unreliable (2GB RAM constraint). This was aspirational in the web app, not a shipped feature. | Use cloud AI (Lovable Gateway) exclusively for v1. On-device inference was never production-ready in the web app either. |
| Widget (Android home screen) | "Native apps have widgets" | Web app has no widget. Building an Android widget requires native Kotlin code, `Glance` or `RemoteViews`, separate data pipeline. This is a significant new feature. | Defer. Can add Android widget in v1.1+ using Expo Modules API. |
| Redesign for Material Design | "Native Android apps should follow Material Design" | Core value is pixel-perfect parity with web app. Redesigning means 30+ pages of new UI decisions, breaking the "indistinguishable from web app" promise. | Use NativeWind to replicate the existing Tailwind design system. The app should look like the web app, not like a Material Design template. |
| Real-time sync overhaul | "Improve offline sync while we're at it" | Scope creep. The offline sync layer (IndexedDB → expo-sqlite) is already a major conversion effort. Rewriting the sync logic "better" means new bugs, new testing, new edge cases. | Port the existing sync logic faithfully. Improve sync reliability as a separate v1.1 effort after the conversion stabilizes. |
| Typing indicators in chat | "Web app roadmap mentions this for v1.1" | Not in the current web app. Adding it means new Supabase Realtime subscription, new UI state, new edge cases (user leaves mid-type). This is a v1.1 feature per the web app's own roadmap. | Don't add. Chat should match current web app exactly. |
| Multi-language UI | "Nigerian students speak Yoruba/Igbo/Hausa" | Web app doesn't have i18n. Adding it means 30+ pages × multiple languages of translation work. Massive scope expansion. | Defer to v1.3 per roadmap. i18n framework setup can happen in v1.1 without blocking the conversion. |
| School admin/teacher accounts | "Schools could manage students" | Entirely new feature area. New DB tables, new edge functions, new UI. This is a v1.1 product expansion, not a conversion task. | Defer to v1.1 per roadmap. Architecture should not block this later. |

## Feature Dependencies

```
Authentication
└──requires──> Supabase Client + Deep Linking (expo-linking for password reset)
└──enables──> All authenticated features

Offline Storage Layer (expo-sqlite + NetInfo)
└──required by──> Smart Notes (cached notes)
└──required by──> Flashcards (cached decks for offline review)
└──required by──> Dashboard (cached streaks, widgets)
└──required by──> Course Management (cached course list)
└──required by──> Gamification (cached XP/streaks)

PDF Export System
└──required by──> Smart Notes (export summaries)
└──required by──> Study Suite (export cheat sheets, bibliographies)
└──required by──> Career Module (export resumes)
└──required by──> AI Tools Lab (export all tool outputs)
└──required by──> ExamPrep (export study plans)
└──blocks on──> expo-print + react-native-view-shot

KaTeX Rendering
└──required by──> AI Tutor (math in responses)
└──required by──> ExamPrep (math in questions/explanations)
└──required by──> Math Solver (step-by-step solutions)
└──required by──> OCR-to-LaTeX (rendered output)
└──implementation──> WebView with KaTeX CDN or react-native-math-view

SSE Streaming Client
└──required by──> AI Tutor (streaming responses)
└──required by──> AI Tools Lab (all 8 tools stream output)
└──required by──> Smart Notes AI Summary (streaming summary)
└──implementation──> react-native-sse or custom fetch + ReadableStream

Focus Mode AccessibilityService (Native Module)
└──required by──> Focus Mode (app blocking)
└──required by──> Parental Controls (time limit enforcement)
└──required by──> Pomodoro Timer (integrated blocking)
└──requires──> expo-dev-client (cannot use Expo Go)
└──requires──> Kotlin native module development

Paystack WebView Integration
└──required by──> Subscription flow (upgrade to Plus/Pro)
└──required by──> Per-exam subscriptions (ExamPrep premium)
└──requires──> react-native-webview + URL intercept
└──requires──> verify-payment edge function (unchanged)

Subscription Tier System
└──enables──> Feature gating across all features (AI quotas, note limits, exam access, group chat, resume templates)
└──requires──> Paystack WebView + useSubscription hook

Supabase Realtime
└──required by──> Chat (real-time messages)
└──required by──> Leaderboard (live XP updates)
└──portable──> Works in React Native with same API

Camera + Microphone
└──required by──> Book Scanner (camera for OCR)
└──required by──> OCR-to-LaTeX (camera for equations)
└──required by──> Diagram Interpreter (camera for diagrams)
└──required by──> Lecture Recorder (microphone + transcription)
└──implementation──> expo-camera + expo-audio

Chat Media Upload
└──requires──> expo-image-picker (camera/gallery)
└──requires──> Supabase Storage (chat-media bucket)
```

### Dependency Notes

- **Authentication requires Deep Linking:** Password reset sends a magic link via email. On native, this link must open the app (not the browser). Requires `expo-linking` + `expo-auth-session` with `makeRedirectUri()`. Without this, password reset is broken on native.

- **Offline Storage Layer is a cross-cutting concern:** expo-sqlite replaces IndexedDB as the local database. This is NOT a per-feature concern — it's a **foundational layer** that must be built before any offline-capable feature can work. Building it first unblocks Notes, Flashcards, Dashboard, and Courses.

- **PDF Export blocks 5+ features:** The web app's two export modes (browser print + html2canvas) are both web-only. Every feature that offers "Download as PDF" depends on a working native alternative. `expo-print` + `react-native-view-shot` must be validated early.

- **KaTeX rendering blocks AI Tutor + ExamPrep:** Math rendering appears in the two most-used premium features. A WebView-based KaTeX solution must be built as a reusable component early, as it's used by 4+ features.

- **Focus Mode AccessibilityService is the hardest dependency:** It requires Kotlin development (not TypeScript), expo-dev-client, Android permissions flow, and BootReceiver. It's also the killer feature. Must start early because it has the longest lead time and the most unknowns.

- **Paystack WebView blocks revenue:** Without a working Paystack checkout flow, no one can subscribe. The web app uses Paystack's popup.redirect.js which opens a new browser window. On native, this must be a WebView that intercepts the redirect callback URL.

- **SSE Streaming blocks all AI features:** The web app uses `EventSource` for streaming AI responses. This doesn't exist in React Native. A streaming client replacement (`react-native-sse` or custom implementation) is required before any AI feature (Tutor, Tools, Summaries) can work.

- **Subscription Tier System is a cross-cutting concern:** Feature gating (AI quotas, note limits, exam access, group chat, resume templates) is implemented via the `useSubscription` hook. This must be ported and working before any tier-gated feature can function correctly.

- **Camera + Microphone are permission-dependent:** Book Scanner, OCR-to-LaTeX, Diagram Interpreter, and Lecture Recorder all need hardware access. `expo-camera` + `expo-audio` must be configured with proper permission requests. These are used by AI Tools Lab features only.

## MVP Definition

For this project, "MVP" means the **minimum set of features that must be working for the native app to be indistinguishable from the web app**. Since the core value is feature parity, the MVP is effectively everything. However, the build order matters for incremental testing.

### Launch With (v1)

Everything the web app has — feature parity is the constraint, not a goal.

- [ ] Authentication — entry point for every user
- [ ] Dashboard — first screen after login, shows streak + daily quiz + widgets
- [ ] Smart Notes — content ingestion layer (create, upload PDF, view, AI summary)
- [ ] AI Tutor — primary engagement driver (4 personas, course-aware, streaming)
- [ ] Flashcards — SM-2 review sessions (AI-generated + manual)
- [ ] Quizzes — AI-generated MCQs + history + friend challenges
- [ ] ExamPrep CBT — flagship premium feature (all 8 modes)
- [ ] Focus Mode + App Blocker — killer native feature (AccessibilityService)
- [ ] Chat (DMs + Groups) — real-time messaging via Supabase Realtime
- [ ] Study Suite — 12 specialized tools (Pomodoro, cheat sheets, cram mode, etc.)
- [ ] AI Tools Lab — 8 specialized AI utilities (Math Solver, Code Debugger, etc.)
- [ ] Career Module — Resume builder + job search + internship matcher
- [ ] Social Hub — Leaderboard + friends + groups + peer finder
- [ ] Gamification — XP + streaks + daily challenges + achievements
- [ ] Subscriptions & Payments — Paystack WebView checkout + tier gating
- [ ] Profile & Settings — avatar, preferences, subscription status
- [ ] Offline Mode — expo-sqlite local storage + sync on reconnect
- [ ] PDF Export — Fast (expo-print) + HD (view-shot + expo-print)
- [ ] Onboarding — 7-step flow with Reanimated 3 animations
- [ ] Dark Mode — NativeWind dark/light toggle
- [ ] Parental Controls — PIN + time limits + content filter + parent dashboard
- [ ] Store — tier-gated educational resource downloads
- [ ] Announcement Banner — admin broadcast display
- [ ] Bottom Navigation — 5-tab Expo Router layout

### Add After Validation (v1.x)

Features from the web app's own roadmap, deferred because they don't exist in the current web app.

- [ ] Push notifications — new feature, not a conversion
- [ ] Typing indicators in chat — v1.1 feature per web roadmap
- [ ] Biometric auth — native enhancement, not in web app
- [ ] Improved offline sync reliability — optimization, not conversion
- [ ] FSRS algorithm (replace SM-2) — planned for web v1.2

### Future Consideration (v2+)

Features that would be native-only enhancements, not conversion tasks.

- [ ] iOS build — Expo makes it achievable, but Android-first is the constraint
- [ ] Android home screen widget — requires native Kotlin development
- [ ] Multi-language UI (Yoruba/Igbo/Hausa) — massive scope expansion
- [ ] On-device AI inference — ONNX Runtime RN needs maturity
- [ ] School admin/teacher accounts — new product vertical
- [ ] AR diagram exploration — v2.0 per roadmap
- [ ] Multiplayer real-time quiz battles — v1.2 per roadmap

## Feature Prioritization Matrix

Priority reflects **build order within the conversion**, not user value. P1 features are foundational layers that unblock other features. P2 features depend on P1 layers. P3 features are standalone or have fewer dependents.

| Feature | User Value | Conversion Cost | Priority | Build Rationale |
|---------|------------|-----------------|----------|-----------------|
| Authentication | HIGH | LOW | P1 | Every feature depends on auth working |
| Offline Storage Layer (expo-sqlite) | HIGH | HIGH | P1 | Cross-cutting — unblocks 5+ features |
| SSE Streaming Client | HIGH | MEDIUM | P1 | Cross-cutting — unblocks all AI features |
| KaTeX Rendering Component | MEDIUM | MEDIUM | P1 | Cross-cutting — unblocks AI Tutor + ExamPrep + Math Solver |
| Paystack WebView Integration | HIGH | HIGH | P1 | Blocks revenue; validate early |
| Focus Mode AccessibilityService | HIGH | HIGH | P1 | Longest lead time; Kotlin module + permissions |
| Dashboard | HIGH | MEDIUM | P2 | Depends on auth, offline layer, gamification |
| Smart Notes | HIGH | HIGH | P2 | Depends on auth, offline, PDF export, SSE |
| AI Tutor | HIGH | HIGH | P2 | Depends on auth, SSE streaming, KaTeX |
| Flashcards | HIGH | MEDIUM | P2 | Depends on auth, offline layer |
| Quizzes | HIGH | MEDIUM | P2 | Depends on auth, SSE |
| ExamPrep CBT | HIGH | HIGH | P2 | Depends on auth, KaTeX, subscription tier |
| Chat (DMs + Groups) | MEDIUM | MEDIUM | P2 | Depends on auth, Realtime, image picker |
| Subscription Tier System | HIGH | MEDIUM | P2 | Depends on auth, Paystack WebView |
| PDF Export | MEDIUM | HIGH | P2 | Depends on expo-print + view-shot validation |
| Onboarding | MEDIUM | MEDIUM | P2 | Depends on Reanimated 3 |
| Course Management | MEDIUM | LOW | P2 | Simple CRUD, depends on auth |
| Bottom Navigation + AppLayout | HIGH | LOW | P2 | Shell — build early for navigation |
| Gamification (XP/Streaks) | MEDIUM | MEDIUM | P3 | Depends on offline layer; no upstream dependents |
| Study Suite | MEDIUM | MEDIUM | P3 | Most tools are AI-call patterns; depends on SSE |
| AI Tools Lab | MEDIUM | HIGH | P3 | Camera/microphone features; depends on SSE + KaTeX |
| Career Module | LOW | MEDIUM | P3 | Resume builder is complex but isolated |
| Social Hub | MEDIUM | MEDIUM | P3 | Depends on auth + Realtime |
| Parental Controls | MEDIUM | MEDIUM | P3 | Depends on Focus Mode + PIN |
| Profile & Settings | MEDIUM | LOW | P3 | Simple CRUD forms |
| Store | LOW | MEDIUM | P3 | Depends on subscription tier + file download |
| Achievements | LOW | LOW | P3 | Pure TypeScript hook; portable last |
| Dark Mode | LOW | LOW | P3 | NativeWind supports it natively |
| Announcement Banner | LOW | LOW | P3 | Simple component |
| Admin Panel | LOW | HIGH | P3 | Admin-only; least user-facing impact if late |

**Priority key:**
- **P1:** Foundational layers — build first because they unblock everything else. Any failure here blocks the entire project.
- **P2:** Core features — depend on P1 layers but are themselves required for feature parity. Build in parallel where possible.
- **P3:** Features with fewer dependents — can be built later without blocking other work. Some are simple ports (achievements, dark mode), others are complex but isolated (admin panel, AI tools lab).

## Competitor Feature Analysis

How StudentOS compares to the fragmented stack of apps it replaces, and what the native app must match.

| Feature | Single-purpose Competitor | StudentOS Web App | Native App Approach |
|---------|--------------------------|-------------------|---------------------|
| Flashcards (SM-2) | Anki (₦10,000+ desktop; AnkiDroid free but ugly) | ✅ AI-generated from notes + manual | Must match: SM-2 algorithm, AI generation, difficulty rating |
| AI Tutor | ChatGPT (₦30,000/mo) | ✅ 4 personas, course-aware, streaming | Must match: streaming, KaTeX, personas. Voice mode: `expo-speech` + `expo-speech-recognition` |
| Exam Prep (JAMB CBT) | JAMB CBT apps (₦5,000–₦8,000 each, per-exam) | ✅ 8 modes, multi-subject, weakness reports | Must match: all 8 modes, analytics, per-exam subs |
| Focus / App Blocker | Forest (gamified, no actual blocking) | ✅ Native AccessibilityService (Capacitor) | Must match: real app blocking via AccessibilityService. This is our competitive moat. |
| Resume Builder | Canva (₦4,000/mo), Novoresume (free tier limited) | ✅ 10 templates, AI bullet improver, PDF export | Must match: live preview, PDF export, AI features |
| Chat / Study Groups | WhatsApp (no study integration) | ✅ DMs + groups, Supabase Realtime | Must match: real-time, media upload, replies |
| Quiz Generation | Quizlet (limited free, no AI from notes) | ✅ AI from notes, friend challenges | Must match: AI generation, challenges, history |
| Offline Access | Most competitors require internet | ✅ IndexedDB + service worker | Must match: expo-sqlite + NetInfo sync. Critical differentiator in Nigeria. |
| Parental Controls | No competitor offers this | ✅ PIN + dashboard + time limits + content filter | Must match: all controls. Unique value prop for parents. |
| Notes | Google Docs, Notion (no AI, no flashcard integration) | ✅ PDF upload, OCR, AI summaries, Socratic mode | Must match: all input methods, AI summaries, Socratic tutor |

## Feature Conversion Risk Matrix

Features ranked by conversion difficulty × impact if broken. This identifies where to focus testing effort.

| Feature | Conversion Risk | Impact if Broken | Risk Score | Key Challenge |
|---------|----------------|-------------------|------------|---------------|
| Focus Mode App Blocker | CRITICAL | HIGH — killer feature, reason to go native | 🔴 Critical | Kotlin AccessibilityService module; no Expo Go; BootReceiver; permissions flow |
| Paystack Payments | HIGH | HIGH — blocks all revenue | 🔴 Critical | No official RN SDK; WebView intercept; bank transfer + USSD |
| Offline Storage (expo-sqlite) | HIGH | HIGH — core value in Nigeria | 🔴 Critical | IndexedDB → SQLite schema migration; background sync replacement |
| SSE Streaming | HIGH | HIGH — all AI features broken without it | 🔴 Critical | No `EventSource` in RN; custom implementation needed |
| PDF Export | HIGH | MEDIUM — 5+ features offer download | 🟡 High | Browser print() doesn't exist; two replacement modes needed |
| KaTeX Rendering | MEDIUM | HIGH — AI Tutor + ExamPrep broken | 🟡 High | No native KaTeX; WebView + CDN is fragile; font bundling needed |
| Chat Realtime | MEDIUM | MEDIUM — social engagement driver | 🟡 Medium | Supabase Realtime works in RN; scroll-to-quote needs FlatList work |
| ExamPrep CBT | MEDIUM | HIGH — flagship premium feature | 🟡 Medium | Complex navigation + state management; KaTeX dependency |
| AI Tutor | MEDIUM | HIGH — primary engagement driver | 🟡 Medium | SSE + KaTeX dependencies; otherwise standard chat UI |
| Camera/Microphone (AI Tools) | MEDIUM | LOW — secondary features | 🟢 Low | expo-camera + expo-audio are well-documented |
| Resume Live Preview | MEDIUM | LOW — career is secondary | 🟢 Low | WebView rendering; PDF export dependency |
| Auth | LOW | HIGH — blocks everything | 🟢 Low | Supabase Auth works in RN; deep linking well-documented |
| Flashcards | LOW | MEDIUM — daily usage feature | 🟢 Low | SM-2 is pure TypeScript; card flip is standard animation |
| Gamification | LOW | LOW — engagement layer | 🟢 Low | Pure TypeScript computation |
| Profile/Settings | LOW | LOW — standard CRUD | 🟢 Low | Straightforward RN forms |

## Sources

- StudentOS.md — Full product documentation (1934 lines), all feature specifications, quota tables, UI descriptions
- PROJECT.md — Core value ("indistinguishable from web app"), constraints (Android-first, 2GB RAM, offline critical), out-of-scope items (iOS, redesign, new features)
- STRUCTURE.md — Codebase directory structure, 30+ pages, 40+ components, 20+ hooks, 8 edge functions
- Expo documentation — expo-sqlite, expo-camera, expo-audio, expo-notifications, expo-print, expo-auth-session, expo-linking, expo-dev-client
- Supabase React Native documentation — deep linking for auth, `makeRedirectUri()`, `WebBrowser.openAuthSessionAsync()`
- NativeWind documentation — TailwindCSS for React Native, dark mode support
- Paystack documentation — no official React Native SDK; WebView-based checkout is the community approach
- react-native-sse — community SSE client for React Native
- react-native-math-view — potential KaTeX alternative
- react-native-google-mobile-ads — replacement for web AdSense

---
*Feature research for: StudentOS Mobile — React PWA to React Native (Expo) conversion*
*Researched: 2026-05-05*
