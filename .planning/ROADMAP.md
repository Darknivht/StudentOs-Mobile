# Roadmap: StudentOS Mobile — Native Android Conversion

## Overview

Convert the StudentOS React PWA + Capacitor wrapper into a true native React Native (Expo) Android app. The journey starts with foundation and platform services that unblock all feature work, then builds core study/AI features, exam prep and advanced tools, social and communication features, native integrations (Focus Mode + payments), and finally offline sync, polish, and quality assurance. Every phase delivers a coherent, verifiable capability — the native app must be indistinguishable from the web app.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Platform Services** - Monorepo, Expo scaffold, routing, storage, auth, SSE streaming, KaTeX, env validation, error boundaries
- [ ] **Phase 2: UI Primitives & Navigation Shell** - Component library, layouts/providers, animation utilities, dark mode, bottom tabs
- [ ] **Phase 3: Core Study & AI Features** - Dashboard, notes, AI tutor, flashcards, quizzes, onboarding, profile, gamification base
- [ ] **Phase 4: Exam Prep & Advanced Tools** - ExamPrep CBT, study suite, AI tools lab, career module
- [ ] **Phase 5: Social & Communication** - Chat, social hub, achievements, store
- [ ] **Phase 6: Native Integration & Payments** - Focus Mode native module, Paystack, parental controls, subscriptions
- [ ] **Phase 7: Offline Sync, Polish & Quality** - Offline sync, performance optimization, testing, rate limiting

## Phase Details

### Phase 1: Foundation & Platform Services
**Goal**: The app runs as a native React Native (Expo) Android app with all cross-cutting platform services operational — routing, storage, auth, streaming, and rendering all work natively (no WebView fallbacks)
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, NAVL-01, NAVL-02, NAVL-03, NAVL-04
**Success Criteria** (what must be TRUE):
1. User can launch the app on an Android device and see the Expo Router navigation shell with (auth) and (tabs) route groups
2. User can sign up, sign in, stay logged in across app restarts, reset password via magic link deep linking, and sign out — all via Supabase Auth with SecureStore token persistence
3. Blocked users are immediately signed out when the is_blocked flag is detected
4. SSE streaming client delivers real-time AI responses; KaTeX math renders in a test component; environment variables are validated at startup with no hardcoded keys
5. Per-route error boundaries prevent one route crash from taking down the entire app
**Plans**: TBD

Plans:
- [ ] 01-01: Monorepo scaffold, Expo project setup, NativeWind v4 config
- [ ] 01-02: Expo Router file-based routing with (auth)/(tabs) groups and deep linking
- [ ] 01-03: Supabase Auth with SecureStore adapter, session persistence, blocked user detection
- [ ] 01-04: Cross-cutting platform services (SSE client, KaTeX renderer, env validation, error boundaries, 2GB AVD profiling)

### Phase 2: UI Primitives & Navigation Shell
**Goal**: All feature screens have the UI building blocks, layout providers, animation utilities, and navigation shell they need — developers can compose any feature screen without building primitive components from scratch
**Depends on**: Phase 1
**Requirements**: ONBD-01, ONBD-02, ONBD-03, DASH-09, OFFL-02, OFFL-03
**Success Criteria** (what must be TRUE):
1. 15+ NativeWindUI components (button, card, input, badge, alert, sheet, action-sheet, toast, skeleton, progress, carousel, avatar, checkbox, radio, select) render with existing design system tokens and dark mode
2. App renders with root layout, auth layout, and tab layout with providers (QueryClient, Auth, Theme, GestureHandler) — navigation between auth and tab screens works
3. Reanimated 3 animation utility layer (useFadeIn, useSlideIn, useScalePress) produces spring animations; onboarding flow plays 7-step animation sequence with particle effects and gradient backgrounds, returning users skip it
4. Offline status banner displays when device is offline; sync indicator shows spinner when reconnecting
5. Ad banner renders for free-tier users, hidden for Plus/Pro
**Plans**: TBD

Plans:
- [ ] 02-01: NativeWindUI component library (15+ primitives) with design system tokens and dark mode
- [ ] 02-02: Root/Auth/Tab layouts with providers (Query, Auth, Theme, Gesture), bottom navigation with 5 tabs
- [ ] 02-03: Reanimated 3 animation utility layer and onboarding flow (7 steps, spring animations, particle effects)
- [ ] 02-04: Offline banner, sync indicator, ad banner for free-tier users

**UI hint**: yes

### Phase 3: Core Study & AI Features
**Goal**: Students can use the core study workflow — take notes, chat with AI tutor, review flashcards with spaced repetition, take quizzes, track daily progress on the dashboard, and manage their profile and courses
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, NOTE-01, NOTE-02, NOTE-03, NOTE-04, NOTE-05, NOTE-06, NOTE-07, NOTE-08, NOTE-09, AITR-01, AITR-02, AITR-03, AITR-04, AITR-05, AITR-06, AITR-07, FLSH-01, FLSH-02, FLSH-03, FLSH-04, FLSH-05, FLSH-06, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, GAMF-01, GAMF-02, GAMF-03, GAMF-04, GAMF-05, PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06, PDFX-01, PDFX-02, PDFX-03
**Success Criteria** (what must be TRUE):
1. Student sees dashboard with time-aware greeting, streak card with animated flame, daily quiz challenge, study time widget, study progress widget, announcement banner, and courses grid — all matching web app UI
2. Student can create notes with rich text editor, upload files (PDF/DOCX/TXT/image), view extracted/OCR text, get AI summaries (short/medium/long), and use Socratic Tutor mode — with daily quotas enforced per tier
3. Student chats with AI Tutor with streaming responses, selects teaching persona, sees KaTeX-rendered math, accesses course-aware context, and uses voice mode (speech-to-text + text-to-speech) — with daily AI call quotas
4. Student creates AI-generated or manual flashcards, reviews with SM-2 spaced repetition (Again/Hard/Good/Easy), sees card flip animation, and filters by course/due-today/mastered — with generation quotas per tier
5. Student takes AI-generated quizzes (5/10/20 questions, 3 difficulties), sees instant feedback and final score with missed question review, challenges friends, and reviews quiz history — with daily quotas per tier
**Plans**: TBD

**UI hint**: yes

### Phase 4: Exam Prep & Advanced Tools
**Goal**: Students preparing for major exams (WAEC/NECO/JAMB/IELTS/TOEFL/SAT/GRE) can practice via 8 CBT modes with KaTeX questions, and all users can access 12 study suite tools, 8 AI tools, and the career module
**Depends on**: Phase 3
**Requirements**: EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05, EXAM-06, EXAM-07, EXAM-08, EXAM-09, EXAM-10, EXAM-11, STUD-01, STUD-02, STUD-03, STUD-04, STUD-05, STUD-06, STUD-07, STUD-08, STUD-09, STUD-10, STUD-11, STUD-12, AITL-01, AITL-02, AITL-03, AITL-04, AITL-05, AITL-06, AITL-07, AITL-08, AITL-09, CARE-01, CARE-02, CARE-03, CARE-04, CARE-05, CARE-06, PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06
**Success Criteria** (what must be TRUE):
1. Student selects an exam (WAEC/NECO/JAMB/etc.), picks subjects, and practices in all 8 modes including multi-subject CBT with single timer and free navigation between subjects — KaTeX renders correctly in all questions
2. Student sees session review with total score, time taken, per-question review, performance analytics with radar chart, weakness report with AI study plan, and bookmarked questions — ExamPrep requires Plus/Pro or per-exam subscription
3. Student uses all 12 Study Suite tools (cheat sheets, mnemonics, cram mode, mock exam, concept linking, fill-in-blanks, audio notes, debate partner, Pomodoro timer, statistics, streak calendar, voice mode) and 8 AI Tools (math solver, code debugger, translator, YouTube summarizer, book scanner, diagram interpreter, OCR-to-LaTeX, lecture recorder)
4. Student builds a resume with templates, exports as Fast/HD PDF, searches for jobs/internships, and views career explanations for school topics — with job search quotas per tier
5. Student uses Plan & Focus tools — study timetable with drag-and-drop blocks, smart scheduler, weakness detector, lo-fi radio streaming, sleep calculator, and progress tracker with month-over-month charts
**Plans**: TBD

**UI hint**: yes

### Phase 5: Social & Communication
**Goal**: Students connect with peers through real-time chat, leaderboards, study groups, friend challenges, and can browse/download tier-gated educational resources from the store
**Depends on**: Phase 3
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, SOCL-01, SOCL-02, SOCL-03, SOCL-04, SOCL-05, SOCL-06, SOCL-07, STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, ACHV-01, ACHV-02, ACHV-03, ACHV-04
**Success Criteria** (what must be TRUE):
1. Student sends direct messages and group chat messages via Supabase Realtime, uploads media with inline preview, replies with quoted preview, sees read receipts, and subscriptions reconnect when app returns to foreground — group chat requires Plus/Pro
2. Student views global leaderboard (all-time and weekly) with their rank highlighted, sends/receives friend requests, creates/joins study groups with invite codes, and discovers peers by school/grade/interests
3. Student browses store with search/filter by category/subject/grade, watches YouTube playlists with embedded player, downloads tier-gated resources with download tracking — Free/Plus/Pro access enforced
4. Student earns 50+ achievements across 5 categories, sees celebration toasts with XP rewards when unlocking new achievements, and views achievement history
5. Student participates in study challenges with progress bars and XP rewards, and challenges friends to quiz competitions for bonus XP
**Plans**: TBD

**UI hint**: yes

### Phase 6: Native Integration & Payments
**Goal**: The app's killer native feature — Focus Mode app blocker — works via a custom Kotlin AccessibilityService module, and students can subscribe via Paystack with Nigerian payment methods (bank transfer + USSD), while parents can set safety controls
**Depends on**: Phase 2
**Requirements**: FOCS-01, FOCS-02, FOCS-03, FOCS-04, FOCS-05, FOCS-06, FOCS-07, FOCS-08, PAYM-01, PAYM-02, PAYM-03, PAYM-04, PAYM-05, PAYM-06, SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05, SAFE-06, SAFE-07, SAFE-08
**Success Criteria** (what must be TRUE):
1. Student starts a focus session via Pomodoro timer, selects apps to block (TikTok, Instagram, etc.), and blocked apps are prevented from opening during the session via native AccessibilityService — blocking state restores after device reboot
2. Student sees a full-screen focus overlay with countdown timer and motivational quote during active sessions; emergency exit requires parental PIN if parental controls are enabled; focus sessions log XP awards
3. Student completes Paystack checkout in WebView with card, bank transfer, or USSD; payment verification updates subscription tier; bank transfer + USSD work for Nigerian market
4. Subscription state syncs every 5 minutes and on events; feature gating shows upgrade prompts when free users hit paywalls; kill switch unlocks all features when disabled
5. Parent sets 4-digit PIN, configures daily time limits with blocking overlay, enables content filter and safe search, sets under-14 mode, receives weekly progress reports, configures app blocker schedules, and views parent dashboard with study time, activities, focus sessions, and weekly trends
**Plans**: TBD

**UI hint**: yes

### Phase 7: Offline Sync, Polish & Quality
**Goal**: Core features work reliably offline with structured local storage and sync-on-reconnect, the app runs smoothly on 2GB Android devices, and critical user journeys have automated test coverage
**Depends on**: Phase 3, Phase 4, Phase 5, Phase 6
**Requirements**: OFFL-01, OFFL-04, OFFL-05, TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
1. Student can view cached notes, review flashcard decks, view course list, and read AI summaries while offline — all stored in expo-sqlite local database
2. When device goes offline, online-required features (AI generation, sending messages, payments, new exam questions) clearly indicate that a connection is needed; when reconnected, queued mutations sync automatically
3. Unit tests cover business logic hooks (useAuth, useSubscription, SM-2 algorithm, XP calculation, streak logic); integration tests cover Supabase Auth flow; E2E tests cover critical user journeys
4. Frontend API rate limiting prevents users from spamming AI and edge function calls
5. App runs smoothly on 2GB RAM Android 8+ devices with optimized bundle size, code splitting, and lazy loading
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7
(Phases 4 and 5 can run in parallel after Phase 3; Phase 6 can start after Phase 2)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Platform Services | 0/4 | Not started | - |
| 2. UI Primitives & Navigation Shell | 0/4 | Not started | - |
| 3. Core Study & AI Features | 0/TBD | Not started | - |
| 4. Exam Prep & Advanced Tools | 0/TBD | Not started | - |
| 5. Social & Communication | 0/TBD | Not started | - |
| 6. Native Integration & Payments | 0/TBD | Not started | - |
| 7. Offline Sync, Polish & Quality | 0/TBD | Not started | - |
