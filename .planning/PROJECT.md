# StudentOS Mobile

## What This Is

A production-grade mobile learning OS for students, rebuilt from scratch with React Native + Expo. This is the mobile counterpart to the existing StudentOS web app (studentoss/), bringing all 32+ features to native iOS/Android with improved security, offline capability, mobile-native integrations, and polished touch-first UX. The mobile version is not a wrapper — it's a first-class native application that can optionally operate independently from the web backend.

## Core Value

A student's complete learning operating system that works everywhere — on the go, offline, with focus enforcement, biometric security, and every feature the web app has — built to production grade.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Phase 0 — Foundation**
- [ ] Project setup: Expo + Dev Client, TypeScript, folder structure
- [ ] Navigation: Bottom tabs + Stack with React Navigation
- [ ] State management: Zustand stores
- [ ] API service layer: configurable AI provider + Supabase client
- [ ] Auth: Supabase Auth + biometric/PIN app lock
- [ ] Secure storage: encrypted credentials, env-configurable secrets
- [ ] Offline database: WatermelonDB setup
- [ ] Theme system: dark/light mode, consistent design tokens

**Phase 1 — Core Auth & Security**
- [ ] Sign up / Sign in with Supabase Auth
- [ ] Biometric authentication (Face ID / fingerprint)
- [ ] App lock PIN with secure storage
- [ ] Session management with secure token storage
- [ ] Subscription tier enforcement (Free/Plus/Pro)
- [ ] Environment-configurable providers (AI + Payments)

**Phase 2 — Onboarding & Dashboard**
- [ ] 7-step onboarding flow with animations
- [ ] Dashboard home screen with streak, daily challenge, study time
- [ ] Offline status indicator
- [ ] Announcement banner
- [ ] Course grid with progress cards

**Phase 3 — Smart Notes**
- [ ] Rich text note creation with markdown
- [ ] PDF/DOCX upload with text extraction
- [ ] Image upload with OCR (camera)
- [ ] Note viewer with AI summary
- [ ] Auto-save every 3 seconds
- [ ] Course assignment for notes
- [ ] Daily note creation quotas by tier

**Phase 4 — AI Tutor**
- [ ] Chat interface with AI tutor
- [ ] 4 persona selection (Chill/Strict/Fun/Motivator)
- [ ] Course-aware context injection
- [ ] Streaming responses (SSE)
- [ ] Math rendering with KaTeX
- [ ] Voice mode (speech-to-text, text-to-speech)
- [ ] Daily AI call quotas by tier
- [ ] Configurable AI provider (base URL, API key, model name)

**Phase 5 — Flashcards & SM-2**
- [ ] Flashcard creation (manual + AI-generated from notes)
- [ ] SM-2 spaced repetition review session
- [ ] Flashcards list with search and filters
- [ ] Course assignment for flashcards
- [ ] Flashcard generation quotas by tier

**Phase 6 — Quizzes**
- [ ] AI quiz generation from notes/course
- [ ] Quiz taking flow with timer and feedback
- [ ] Quiz history and review
- [ ] Friend quiz challenges
- [ ] Quiz generation quotas by tier

**Phase 7 — ExamPrep CBT Engine**
- [ ] Exam selector (WAEC, NECO, JAMB, IELTS, TOEFL, SAT, GRE)
- [ ] Subject selector per exam
- [ ] 8 practice modes (quick, timed, topic, year, mock, multi-subject, guided, bookmarked)
- [ ] Session review with explanations
- [ ] Exam performance analytics (radar chart, difficulty breakdown)
- [ ] Weakness report and study plan
- [ ] Per-exam subscriptions

**Phase 8 — Study Suite**
- [ ] Pomodoro timer with configurable durations
- [ ] Cheat sheet creator (AI)
- [ ] Mnemonic generator (AI)
- [ ] Cram mode (AI)
- [ ] Concept linking (AI)
- [ ] Fill in the blanks (AI)
- [ ] Audio notes (text-to-speech)
- [ ] Debate partner (AI)
- [ ] Study statistics and streak calendar

**Phase 9 — AI Tools Lab**
- [ ] Math solver with step-by-step working
- [ ] Code debugger
- [ ] Language translator (50+ languages)
- [ ] Book scanner / OCR (camera)
- [ ] Diagram interpreter (camera)
- [ ] OCR to LaTeX (camera)
- [ ] Live lecture recorder (microphone + transcription)
- [ ] Download as PDF (Fast + HD)

**Phase 10 — Career Module**
- [ ] Resume builder with 10 templates
- [ ] Live preview
- [ ] AI summary generator, AI bullet improver
- [ ] PDF export (Fast + HD)
- [ ] Job search integration
- [ ] Internship matcher (AI)
- [ ] Real world "Why" (connecting school to careers)

**Phase 11 — Plan & Focus**
- [ ] Study timetable (weekly calendar)
- [ ] Smart scheduler (AI-powered)
- [ ] Weakness detector (AI)
- [ ] Lo-fi radio (background audio)
- [ ] Sleep calculator
- [ ] Progress tracker with charts
- [ ] Focus Mode with app blocker

**Phase 12 — Focus Mode & App Blocker**
- [ ] Pomodoro timer integrated with focus mode
- [ ] App selector (which apps to block)
- [ ] Full-screen focus overlay during sessions
- [ ] Emergency exit with PIN
- [ ] Android native app blocker via native module
- [ ] Background sync during focus sessions
- [ ] Boot persistence (restore blocking after restart)
- [ ] Push notification reminders

**Phase 13 — Social Hub**
- [ ] Leaderboard (global + weekly + school)
- [ ] Study challenges (community time-limited challenges)
- [ ] Challenge a friend (quiz challenges with XP)
- [ ] Friends list (friend requests, pending, accepted)
- [ ] Study groups (create, join, invite code)
- [ ] Group chat with Supabase Realtime
- [ ] Group shared resources
- [ ] Peer finder (discover by school/grade/interests)

**Phase 14 — Chat System**
- [ ] Direct messages with friends
- [ ] Group chats for study groups
- [ ] Real-time updates via Supabase Realtime
- [ ] Media upload (images)
- [ ] Message replies with quoted preview
- [ ] Read receipts

**Phase 15 — Store (Educational Resources)**
- [ ] Resource marketplace (textbooks, past papers, notes, videos)
- [ ] Resource cards with download counts
- [ ] Search and filter by category, subject, grade
- [ ] Tier gating (Free/Plus/Pro)
- [ ] YouTube section with embedded player
- [ ] Download tracking

**Phase 16 — Gamification**
- [ ] XP system across all activities
- [ ] Streak tracking (consecutive study days)
- [ ] Daily challenges (3 rotating tasks)
- [ ] Daily Brain Boost (5-question quiz challenge)
- [ ] Levels (1000 XP = 1 level)
- [ ] Achievement system (50+ achievements across 5 categories)

**Phase 17 — Safety & Parental Controls**
- [ ] Parental PIN protection
- [ ] Daily time limits with enforcement overlay
- [ ] Content filter toggle
- [ ] Safe search toggle
- [ ] Under 14 mode
- [ ] Parent email for weekly reports
- [ ] Parent dashboard (study time, activities, progress)

**Phase 18 — Profile & Settings**
- [ ] Profile info (avatar, name, username, school, grade)
- [ ] Stats display (XP, streak, achievements)
- [ ] Study preferences (persona, daily target, notifications)
- [ ] Subscription status
- [ ] Account actions (sign out, delete account)
- [ ] Privacy policy + Terms of Service

**Phase 19 — Payments & Subscriptions**
- [ ] Paystack payment integration (configurable via env vars)
- [ ] Upgrade page with plan comparison
- [ ] Payment verification (server-side)
- [ ] Subscription tier management
- [ ] Per-exam subscriptions
- [ ] Kill switch for payments
- [ ] Configurable payment provider (provider name, keys, etc.)

**Phase 20 — Offline Mode & PWA-equivalent**
- [ ] WatermelonDB offline-first architecture
- [ ] Background sync when online
- [ ] Queue mutations for sync
- [ ] Offline status banner
- [ ] Offline AI (cached responses)
- [ ] Note, flashcard, course viewing offline

**Phase 21 — PDF Export & Documents**
- [ ] PDF export for notes, flashcards, cheat sheets
- [ ] Fast PDF (instant) + HD PDF (pixel-perfect)
- [ ] Resume PDF export
- [ ] Document viewer for PDF, DOCX
- [ ] Share functionality

**Phase 22 — Notifications & Background**
- [ ] Push notifications (focus reminders, streak, daily challenge)
- [ ] Background fetch for sync
- [ ] Local notifications (Pomodoro, daily challenge)
- [ ] Notification preferences per feature

**Phase 23 — Admin Panel (Mobile Admin)**
- [ ] Admin dashboard (announcements, resources)
- [ ] Upload educational resources
- [ ] Manage exam question bank
- [ ] View user activity stats

**Phase 24 — Advanced Features & Polish**
- [ ] Voice input for AI tutor
- [ ] Text-to-speech for notes and flashcards
- [ ] Advanced animations (Framer Motion equivalents with Reanimated)
- [ ] Haptic feedback throughout
- [ ] Deep linking
- [ ] Share extension
- [ ] Widget support (study streak, daily challenge)

**Phase 25+ — Continuous Improvement**
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Battery optimization
- [ ] Memory leak fixes
- [ ] Cross-device sync improvements
- [ ] Tablet-specific layouts
- [ ] Foldable device support

### Out of Scope

- Web app features not in the mobile scope (explicitly defer to web)
- iOS App Clip / Android Instant Apps (future consideration)
- Custom AI model training (use existing providers)
- Video calling / live study sessions (high complexity, defer)
- Desktop app (separate project)

## Context

### Existing Codebase
The web app (studentoss/) is a 230+ TypeScript file React application with:
- React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion
- Supabase (Auth, Database, Storage, Realtime, Edge Functions)
- Capacitor for Android wrapping
- 32 pages, 90+ components, extensive feature set
- Lovable AI Gateway for AI (Gemini 2.5 + GPT-5)

The mobile version is NOT a Capacitor wrapper. It's a separate React Native + Expo project that:
- Mirrors the feature set with mobile-native implementations
- Uses WatermelonDB for offline-first local storage
- Has configurable AI provider (base URL, API key, model name via env vars)
- Has configurable payment provider (Paystack or others via env vars)
- Uses native modules for Android app blocker via Expo Dev Client

### Key Constraints
- **No Capacitor**: Pure React Native + Expo with dev client
- **Configurable providers**: AI and payment providers must be configurable via environment variables
- **Offline-first**: WatermelonDB with background sync to Supabase
- **Security-first**: Biometric auth, encrypted storage, app lock
- **Native features**: App blocker requires native module (Expo Dev Client)

## Constraints

- **Tech Stack**: React Native + Expo SDK + Expo Dev Client — TypeScript throughout
- **State**: Zustand for global state, WatermelonDB for persistent offline data
- **Navigation**: React Navigation v7 (Bottom tabs + Stack)
- **Backend**: Existing Supabase backend (reused), new mobile-specific edge functions as needed
- **AI Provider**: Configurable via env vars (provider name, base URL, API key, model name)
- **Payment Provider**: Configurable via env vars (provider name, public key, etc.)
- **Offline**: WatermelonDB as primary local store, sync to Supabase
- **Native Modules**: Allowed via Expo Dev Client (for app blocker, background services)
- **Form Factors**: Full responsive — phone (small/large) + tablet (portrait/landscape)
- **Sequential Phases**: Low parallelization (1 feature at a time for maximum quality)
- **Quality Gate**: Every phase verified before proceeding

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expo + Dev Client over bare RN | Faster iteration, Expo ecosystem, dev client for native modules | — Pending |
| Zustand over Redux | Minimal, fast, TypeScript-native, less boilerplate | — Pending |
| WatermelonDB for offline | Best offline-first SQLite solution for RN, battle-tested | — Pending |
| Bottom tabs + Stack navigation | Familiar mobile pattern, matches web app's sidebar structure | — Pending |
| Configurable AI provider via env vars | User may want to use different AI providers, not locked to Lovable | — Pending |
| Configurable payment provider via env vars | User may want different payment providers (Paystack, Flutterwave, etc.) | — Pending |
| Low parallelization | Quality over speed — mobile native requires careful implementation | — Pending |
| Biometric + PIN security | Mobile-native security (Face ID, fingerprint, app lock) | — Pending |
| Native app blocker via Dev Client | App blocker needs native Android code, Expo Dev Client allows this | — Pending |
| Supabase backend reuse | Don't rebuild the backend — call existing edge functions from mobile | — Pending |
| Sequential phases (30+) | Each feature gets full attention before moving to next | — Pending |

---

*Last updated: 2026-04-25 after initialization*