# Roadmap: StudentOS Mobile

**Project:** StudentOS Mobile (React Native + Expo)
**Phases:** 25
**Requirements:** 210 v1
**Mode:** Sequential (YOLO)
**Created:** 2026-04-25

## Phase Overview

| #   | Phase                      | Goal                                                               | Reqs | Success Criteria                                              |
| --- | -------------------------- | ------------------------------------------------------------------ | ---- | ------------------------------------------------------------- |
| 0   | Foundation                 | Project setup, WatermelonDB, Zustand, Navigation, API layer, Theme | 8    | Project builds, navigation works, offline DB operational      |
| 1   | Auth & Security            | Supabase Auth, Biometric, PIN, Session, Subscription               | 11   | User can sign up/sign in, biometric works, PIN protected      |
| 2   | Onboarding & Dashboard     | 7-step onboarding, Dashboard, Courses grid                         | 12   | User completes onboarding, dashboard shows streak/XP/progress |
| 3   | Smart Notes                | Note CRUD, PDF/DOCX upload, OCR, AI summary, Socratic mode         | 14   | User can create, upload, summarize, and manage notes          |
| 4   | AI Tutor                   | Chat, personas, streaming, math, voice, configurable provider      | 14   | User can chat with AI, streaming works, math renders          |
| 5   | Flashcards & SM-2          | Create, SM-2 review, list, filters, AI generation                  | 11   | User can create cards, review with SM-2 algorithm             |
| 6   | Quizzes                    | AI generation, timer, feedback, history, challenges                | 10   | User can take AI-generated quizzes with scoring               |
| 7   | ExamPrep CBT Engine        | Exam selector, 8 practice modes, analytics, weakness report        | 27   | User can practice WAEC/NECO/JAMB/IELTS/TOEFL/SAT/GRE exams    |
| 8   | Study Suite                | Pomodoro, AI tools (cheat sheet, mnemonic, cram, etc.)             | 12   | User has complete study toolkit                               |
| 9   | AI Tools Lab               | Math solver, code debugger, translator, OCR, lecture recorder      | 12   | User has specialized AI utilities                             |
| 10  | Career Module              | Resume builder, job search, internship matcher                     | 14   | User can build resume, search jobs                            |
| 11  | Plan & Focus               | Timetable, smart scheduler, weakness detector, lo-fi radio         | 11   | User can plan and track study schedule                        |
| 12  | Focus Mode & App Blocker   | Native app blocker, overlay, emergency exit, boot persistence      | 10   | App blocker works on Android, overlay enforced                |
| 13  | Social Hub                 | Leaderboard, challenges, friends, groups                           | 12   | User can compete, connect, collaborate                        |
| 14  | Chat System                | DMs, group chats, real-time, media                                 | 10   | User can message friends and groups                           |
| 15  | Store                      | Resource marketplace, search, filter, tier gating                  | 8    | User can browse and download resources                        |
| 16  | Gamification               | XP, streaks, achievements, daily challenges                        | 13   | User earns XP, streaks, and achievements                      |
| 17  | Safety & Parental Controls | PIN protection, time limits, parent dashboard                      | 9    | Parents can control and monitor usage                         |
| 18  | Profile & Settings         | Avatar, stats, preferences, account actions                        | 12   | User can manage profile and settings                          |
| 19  | Payments & Subscriptions   | Upgrade page, payment checkout, tier management                    | 14   | User can upgrade, pay, manage subscription                    |
| 20  | Offline Mode               | Background sync, queue, offline viewing                            | 10   | App works offline with sync on reconnect                      |
| 21  | PDF Export & Documents     | PDF generation, document viewer                                    | 5    | User can export and view documents                            |
| 22  | Notifications & Background | Push, local notifications, background fetch                        | 5    | User receives notifications                                   |
| 23  | Admin Panel                | Admin dashboard, resource upload, question bank                    | 4    | Admins can manage content                                     |
| 24  | Advanced Features & Polish | Voice input, TTS, animations, haptics, deep linking                | 7    | Premium polish features                                       |
| 25  | Continuous Improvement     | Performance, accessibility, tablet layouts                         | 7    | Optimization and enhancement                                  |

**Total:** 25 phases, 210 requirements, 100% coverage ✓

---

## Phase Details

### Phase 0: Foundation

**Goal:** Establish the technical foundation that all subsequent phases depend on.

**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08

**Success Criteria:**

1. Expo SDK 54 + Dev Client project initializes and builds successfully on Android and iOS
2. React Navigation v7 with bottom tabs + stack navigator renders all placeholder screens
3. Zustand stores for auth, subscription, and UI state are initialized and functional
4. WatermelonDB models created for: courses, notes, flashcards, quizzes, exam_attempts, users, sync_state
5. API service layer with factory pattern for AI providers (env vars: AI_PROVIDER, AI_BASE_URL, AI_API_KEY, AI_MODEL)
6. API service layer with factory pattern for payment providers (env vars: PAYMENT_PROVIDER, PAYMENT_PUBLIC_KEY)
7. Supabase client configured with auth, database, storage, and realtime
8. Theme system with dark/light mode, design tokens, and consistent spacing/typography

**Key Dependencies:** None (this is the first phase)
**Avoids:** AsyncStorage for tokens (PITFALL-01), concurrent sync race (PITFALL-02), API keys in client (PITFALL-03)
**Research Flag:** WatermelonDB expo plugin compatibility with SDK 54 — verify before native build

**UI hint:** no

---

### Phase 1: Auth & Security

**Goal:** Secure authentication with mobile-native biometrics and PIN protection.

**Requirements:** AUTH-01 through AUTH-11

**Success Criteria:**

1. User can sign up with email/password and is immediately signed in
2. User can sign in with email/password and session persists across app restarts
3. Biometric authentication (Face ID / fingerprint) unlocks the app on subsequent opens
4. 4-digit PIN protects app lock access (stored via expo-secure-store in Keychain/Keystore)
5. Blocked users (is_blocked=true) are immediately signed out
6. Subscription tier (Free/Plus/Pro) is enforced on feature access
7. onAuthStateChange subscription updates auth state in real-time
8. Tokens are stored in expo-secure-store (hardware-backed), never AsyncStorage

**Key Dependencies:** Phase 0 (foundation, theme, navigation)
**Avoids:** Credentials in AsyncStorage (PITFALL-01), biometric bypass (PITFALL-06)
**Research Flag:** None — standard Supabase + expo-local-authentication pattern

**UI hint:** yes

---

### Phase 2: Onboarding & Dashboard

**Goal:** First-time user experience and home screen with study progress.

**Requirements:** ONBOARD-01 through ONBOARD-03, DASH-01 through DASH-09

**Success Criteria:**

1. 7-step onboarding flow displays with gradient backgrounds and animations per step
2. Onboarding state persists (returning users skip to auth)
3. Dashboard shows time-aware greeting with display name
4. Streak card displays current streak, longest streak, and flame animation
5. Daily Brain Boost challenge (5 questions, 10 XP each, once per day)
6. Study time widget shows today's minutes, daily target progress bar, weekly trend
7. Announcement banner shows active announcements from database
8. Offline status banner appears when device is offline
9. Courses grid displays course cards with color accent, emoji, and progress percentage

**Key Dependencies:** Phase 1 (auth, session), Phase 0 (theme, navigation)
**Avoids:** None specific — presentation layer only
**Research Flag:** None

**UI hint:** yes

**Plans:** 3 plans

Plans:

- [ ] 02-01-PLAN.md — Onboarding flow with 7 animated steps + RootNavigator wiring
- [ ] 02-02-PLAN.md — Dashboard screen with greeting, streak, study widgets, banners
- [ ] 02-03-PLAN.md — Daily Brain Boost + Courses grid with progress cards

---

### Phase 3: Smart Notes

**Goal:** Content ingestion layer — create, upload, summarize, and manage study notes.

**Requirements:** NOTES-01 through NOTES-14

**Success Criteria:**

1. Rich text note creation with markdown support and auto-save (3-second debounce)
2. PDF upload with text extraction via extract-pdf-text edge function
3. DOCX upload with text extraction
4. Image upload with camera and OCR via extract-pdf-text-ocr edge function
5. Note cards display title, preview (150 chars), source badge, course tag, date
6. Note viewer dialog with full text display
7. AI summary generation (short/medium/long) with streaming response
8. Socratic tutor mode (AI asks leading questions about the note)
9. "Ask AI Tutor about this note" pre-populates tutor with note context
10. Daily note quotas enforced by tier (Free: 3, Plus: 10, Pro: unlimited)
11. Quick actions: view, generate summary, generate flashcards, generate quiz, delete

**Key Dependencies:** Phase 4 (AI provider for summaries), Phase 2 (dashboard, courses)
**Avoids:** None specific
**Research Flag:** PDF text extraction edge function needs mobile-friendly API (may need new endpoint)

**UI hint:** yes

---

### Phase 4: AI Tutor

**Goal:** Conversational AI tutor with streaming, personas, and math rendering.

**Requirements:** AI-01 through AI-14

**Success Criteria:**

1. Chat interface with message history (user/assistant roles)
2. 4 persona selection (Chill/Strict/Fun/Motivator) persisted to profile
3. Course-aware context — when opened from course, full course notes injected as system context
4. Streaming responses via SSE — text appears word-by-word progressively
5. Math rendering with KaTeX — inline ($E = mc^2$) and block ($$\int_0^1 x^2 dx$$) LaTeX
6. Voice mode with Web Speech API (speech-to-text input, text-to-speech output)
7. Conversation history saved to chat_messages table with course_id FK
8. Clear history and scroll-back to old conversations
9. Daily AI call quotas by tier (Free: 5, Plus: 30, Pro: 100) with midnight UTC reset
10. Configurable AI provider via env vars (AI_PROVIDER, AI_BASE_URL, AI_API_KEY, AI_MODEL)
11. AI calls count against quota per message sent

**Key Dependencies:** Phase 3 (notes for context), Phase 0 (AI provider factory)
**Avoids:** API keys exposed in client (PITFALL-03) — route through backend proxy
**Research Flag:** Verify SSE streaming works reliably on React Native with expo-dev-client

**UI hint:** yes

---

### Phase 5: Flashcards & SM-2

**Goal:** Spaced repetition flashcards using the SM-2 algorithm.

**Requirements:** FLASHC-01 through FLASHC-11

**Success Criteria:**

1. Manual flashcard creation (front + back text fields)
2. AI flashcard generation from notes (10-20 cards, JSON format, user reviews before save)
3. SM-2 review session — cards due (next_review <= NOW()) shown one at a time
4. Flashcard flip animation (front → back)
5. Difficulty rating after flip: Again (1), Hard (2), Good (3), Easy (4)
6. SM-2 algorithm updates: ease_factor, interval_days, repetitions, next_review
7. Flashcards list with search, course filter, "due today", and "mastered" filters
8. Edit and delete individual flashcards
9. Course assignment for flashcards
10. Flashcard generation quotas by tier (Free: 3, Plus: 20, Pro: unlimited)
11. Reviewing existing cards is always unlimited

**Key Dependencies:** Phase 0 (WatermelonDB for persistence), Phase 3 (notes for AI generation)
**Avoids:** WatermelonDB sync conflicts (PITFALL-02) — implement sync lock before this phase
**Research Flag:** None — SM-2 algorithm is well-documented

**UI hint:** yes

---

### Phase 6: Quizzes

**Goal:** AI-generated multiple-choice quizzes from notes and courses.

**Requirements:** QUIZ-01 through QUIZ-10

**Success Criteria:**

1. AI quiz generation from notes or course content (configurable: 5/10/20 questions, easy/medium/hard)
2. One question at a time with 4 multiple-choice options
3. Optional timer (per-question or total)
4. Instant feedback after answer — correct/incorrect + explanation
5. Final score screen (percentage, time taken, missed questions review)
6. Quiz history with sortable attempts (date, score, course)
7. Re-view individual quiz attempts
8. Challenge a friend — send quiz via peer_challenges table, winner gets bonus XP
9. Quiz challenges expire after 48 hours
10. Quiz generation quotas by tier (Free: 3, Plus: 10, Pro: unlimited)

**Key Dependencies:** Phase 4 (AI for generation), Phase 5 (flashcards context)
**Avoids:** Answer not saved on network fail (PITFALL-05) — save to WatermelonDB immediately
**Research Flag:** None

**UI hint:** yes

---

### Phase 7: ExamPrep CBT Engine

**Goal:** Complete Computer-Based Test simulator for Nigerian and international exams.

**Requirements:** EXAM-01 through EXAM-27

**Success Criteria:**

1. Exam selector: WAEC, NECO, JAMB, IELTS, TOEFL, SAT, GRE
2. Subject selector per exam type
3. Practice mode selector with 8 modes:
   - Quick Practice Untimed (20 random questions, instant feedback)
   - Quick Practice Timed (20 questions, strict timer)
   - Topic-Based Practice (filter by topic)
   - Year-Based Practice (past papers from specific years)
   - Study Material-Based Practice (from uploaded PDF past papers)
   - Mock Exam Mode (real exam format, single subject)
   - Multi-Subject Full CBT (JAMB: 4 subjects × 120 min)
   - Guided Learning (AI lesson + 5 practice questions)
   - Bookmarked Questions (review saved questions)
4. Practice session UI with KaTeX math, 4-5 options, timer, bookmark, report
5. Session review with per-question review + explanations + add-to-flashcard
6. Exam performance analytics (radar chart by subject/topic, difficulty breakdown)
7. Session history timeline
8. Improvement trend line chart
9. Weakness report (3 weakest topics + personalized AI study plan)
10. Study plan view (AI-generated based on exam date, weaknesses, available hours)
11. Per-exam subscriptions (single-exam access beyond global tiers)
12. CBT timer integrity: store start time, recalculate on foreground (PITFALL-04)

**Key Dependencies:** Phase 6 (quiz foundation), Phase 0 (WatermelonDB for offline question bank)
**Avoids:** CBT timer desync (PITFALL-04), answer not saved (PITFALL-05)
**Research Flag:** Question bank sourcing strategy, WatermelonDB sync conflict resolution for exam answers

**UI hint:** yes

---

### Phase 8: Study Suite

**Goal:** Complete study toolkit with Pomodoro, AI helpers, and analytics.

**Requirements:** STUDY-01 through STUDY-12

**Success Criteria:**

1. Pomodoro timer with 25/5 default cycle and configurable durations
2. Pomodoro session logging to pomodoro_sessions table
3. Cheat sheet creator (AI generates one-page summary from notes, PDF export)
4. Mnemonic generator (AI generates rhymes, acronyms, memory palaces)
5. Cram mode (AI rapid-fire: key concepts → flashcards → mini-quiz)
6. Concept linking (AI generates knowledge graph showing how concepts connect)
7. Fill in the blanks (AI converts notes to cloze-deletion exercises)
8. Audio notes (text-to-speech with speed control: 0.5×, 1×, 1.5×, 2×)
9. Debate partner (AI takes opposing position on any topic)
10. Study statistics (total hours, avg session length, best subject, peak hour)
11. Streak calendar (GitHub-style heatmap of daily activity, click for detail)
12. Mock exam generator (customizable: questions, time limit, topic)

**Key Dependencies:** Phase 4 (AI for generators), Phase 5 (flashcards), Phase 6 (quizzes)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 9: AI Tools Lab

**Goal:** Specialized AI utility collection beyond the core tutor.

**Requirements:** AITOOLS-01 through AITOOLS-12

**Success Criteria:**

1. Math solver (step-by-step working, KaTeX rendering, "Explain like I'm 5" mode)
2. Code debugger (paste code, identify bugs, explain fix, corrected code output)
3. Language translator (50+ languages with grammar explanations)
4. Book scanner / OCR (camera capture, Tesseract.js/vision AI)
5. Diagram interpreter (upload biology/physics/chemistry diagram, AI describes and explains)
6. OCR to LaTeX (camera capture math equations, convert to LaTeX code)
7. Live lecture recorder (microphone recording + real-time transcription)
8. Post-lecture: AI generates summary + key points + flashcards
9. Consistent AIToolLayout (back button, title, input area, generate, output, download)
10. Download dropdown (Fast PDF + HD PDF)
11. Copy-to-clipboard for all AI outputs
12. Save-as-note for all AI tool outputs

**Key Dependencies:** Phase 4 (AI provider), Phase 3 (notes)
**Avoids:** None specific
**Research Flag:** Camera/OCR performance on low-end Android devices

**UI hint:** yes

---

### Phase 10: Career Module

**Goal:** Career tools bridging education and employment.

**Requirements:** CAREER-01 through CAREER-14

**Success Criteria:**

1. Resume builder with 10 templates (Free: 3, Plus: 7, Pro: 10)
2. Live preview (real-time as user types)
3. All sections: contact, summary, education, experience, skills, projects, certifications
4. AI summary generator (3-sentence professional summary)
5. AI bullet improver (action-verb-led achievements)
6. PDF export (Fast: instant, HD: pixel-perfect)
7. HTML and plain text export
8. Job search integration (real listings via API)
9. Job search filters (location, role, experience level)
10. Save jobs for later
11. Internship matcher (AI matching based on skills, location, availability)
12. Real World Why (connecting school topics to careers and salary ranges)
13. Job search quotas by tier (Free: 5/month, Plus: 20/month, Pro: unlimited)
14. InputRow component outside render loop to prevent input-focus-loss bug

**Key Dependencies:** Phase 4 (AI), Phase 19 (payments for Pro features)
**Avoids:** None specific
**Research Flag:** Job search API availability for Nigerian market

**UI hint:** yes

---

### Phase 11: Plan & Focus

**Goal:** Study planning, scheduling, and focus tools.

**Requirements:** PLAN-01 through PLAN-11

**Success Criteria:**

1. Study timetable (weekly calendar, Mon-Sun, hourly slots)
2. Smart scheduler (AI-powered: subjects + exam date + hours/day → optimal schedule)
3. Weakness detector (AI analyzes quiz/exam history, identifies topics below 60% accuracy)
4. Lo-fi radio (streaming audio, 5+ stations, background playback)
5. Sleep calculator (wake-up time → ideal bedtime based on 90-min sleep cycles)
6. Progress tracker (month-over-month XP growth, course completion, weekly XP target)
7. Recharts line chart (4-week XP trend)
8. Focus mode toggle integrated with Pomodoro timer
9. Focus mode with app selector (which apps to block)
10. Full-screen focus overlay during active sessions
11. Emergency exit with PIN

**Key Dependencies:** Phase 4 (AI for scheduler/weakness detector), Phase 8 (Pomodoro)
**Avoids:** None specific
**Research Flag:** Lo-fi radio streaming — CDN or self-hosted?

**UI hint:** yes

---

### Phase 12: Focus Mode & App Blocker

**Goal:** Native app blocking for Android with background enforcement.

**Requirements:** FOCUS-01 through FOCUS-10

**Success Criteria:**

1. Native Android app blocker via AccessibilityService (Expo Dev Client)
2. BootReceiver to restore blocking state after device restart
3. App selector (list all installed apps, user checks which to block)
4. Full-screen lock overlay during focus sessions
5. Countdown timer display during focus
6. Motivational quote display
7. Emergency exit with PIN (required if parental controls enabled)
8. Blocked app list stored per user in WatermelonDB + synced
9. Background sync during focus sessions
10. Push notification reminders for focus sessions

**Key Dependencies:** Phase 0 (native modules via Dev Client), Phase 11 (focus UI)
**Avoids:** None specific
**Research Flag:** iOS Screen Time API approval process (iOS app blocker not technically possible without user-initiated setup)

**UI hint:** yes

---

### Phase 13: Social Hub

**Goal:** Social learning — competition, collaboration, and community.

**Requirements:** SOCIAL-01 through SOCIAL-12

**Success Criteria:**

1. Leaderboard (global XP, all-time and weekly, top 100 with avatars)
2. School filter for leaderboard (if school name set in profile)
3. Study challenges (community time-limited challenges with progress bars)
4. Challenge a friend (quiz challenges with bonus XP for winner)
5. Friends list (friend requests, pending, accepted, blocked)
6. Friend profile view (XP, streak, achievements)
7. Study groups (create, join, invite code, max 10/25 members)
8. Group chat with Supabase Realtime
9. Group shared resources (notes, quizzes shared by members)
10. Peer finder (discover by school, grade, interests)
11. Study group roles (admin/member)
12. Leave/delete group (admin only)

**Key Dependencies:** Phase 1 (auth), Phase 6 (quiz challenges), Phase 14 (chat)
**Avoids:** Public social discovery privacy issues
**Research Flag:** None

**UI hint:** yes

---

### Phase 14: Chat System

**Goal:** Real-time messaging for DMs and study groups.

**Requirements:** CHAT-01 through CHAT-10

**Success Criteria:**

1. Direct messages with friends (1-on-1 chat, Free tier included)
2. Group chats for study groups (Plus/Pro only for creation and access)
3. Real-time updates via Supabase Realtime WebSocket subscription
4. Media upload (images) to Supabase Storage
5. Image previews inline in chat
6. Message replies with quoted preview
7. Clickable quoted preview (scrolls to original via scrollIntoView)
8. Read receipts (is_read boolean)
9. Unified ChatRoom component for DMs and group chats
10. Typing indicators (Phase 14.1 — stretch goal)

**Key Dependencies:** Phase 13 (friends, groups), Phase 0 (Supabase Realtime)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 15: Store

**Goal:** Educational resource marketplace.

**Requirements:** STORE-01 through STORE-08

**Success Criteria:**

1. Resource marketplace (textbooks, past papers, notes, videos)
2. Resource cards (thumbnail, title, author, subject, grade, download count, tier badge)
3. Download button or "Upgrade to access" CTA for locked resources
4. Search by title
5. Filter by category (textbook/past paper/notes/video), subject, grade level
6. Tier gating (Free/Plus/Pro visibility)
7. Download tracking (increment download_count)
8. YouTube section with embedded player

**Key Dependencies:** Phase 19 (tier gating), Phase 0 (Supabase Storage)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 16: Gamification

**Goal:** XP, streaks, levels, and achievements system.

**Requirements:** GAM-01 through GAM-13

**Success Criteria:**

1. XP system (quiz: 5 XP/correct, flashcards: 1 XP/card, Pomodoro: 10 XP/session)
2. Streak tracking (consecutive days with study activity, reset if day missed)
3. Streak milestones (50 XP at 7 days, 200 XP at 30 days, 1000 XP at 100 days)
4. Daily challenges (3 rotating tasks, 25 XP per challenge)
5. Levels (every 1000 XP = 1 level)
6. 50+ achievements across 5 categories (Study Time, Streak, Social, Academic Mastery, Exam Prep)
7. Achievement unlock computed from real-time database queries
8. Achievement celebration toast with XP reward
9. XP persisted to profiles.total_xp and weekly_xp table
10. Profile level display and leaderboard badges
11. Gamification UI in dashboard (daily challenges, streak, XP progress)

**Key Dependencies:** Phase 5 (flashcards), Phase 6 (quizzes), Phase 8 (Pomodoro)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 17: Safety & Parental Controls

**Goal:** K-12 market segment with parent management.

**Requirements:** SAFETY-01 through SAFETY-09

**Success Criteria:**

1. 4-digit parental PIN (hashed, stored in profiles.parental_pin)
2. Daily time limit (block app after X minutes, full-screen blocking overlay)
3. Override requires parental PIN
4. Content filter toggle (profiles.content_filter_enabled)
5. Safe search toggle (profiles.safe_search_enabled)
6. Under 14 mode (profiles.is_under_14)
7. Parent email for weekly progress reports
8. Parent dashboard (today's study time, activities, focus sessions, subjects, streak)
9. Parental controls require PIN — settings are read-only without PIN

**Key Dependencies:** Phase 1 (auth, PIN), Phase 0 (WatermelonDB)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 18: Profile & Settings

**Goal:** User profile management and app settings.

**Requirements:** PROFILE-01 through PROFILE-12

**Success Criteria:**

1. Avatar upload to Supabase Storage
2. Display name, username (unique, for friend requests), full name
3. School name, grade level (JSS1-SS3 / Year 1-4 / Postgrad)
4. Stats display (XP, level, streak, achievements count, member since date)
5. Study preferences (persona, daily study target, notifications)
6. Subscription status (tier badge, expiration date)
7. Notification preferences per feature
8. Sign out action
9. Delete account (with confirmation dialog)
10. Privacy policy and Terms of Service links
11. Email (read-only)
12. Profile data persisted to profiles table

**Key Dependencies:** Phase 1 (auth), Phase 16 (gamification stats)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 19: Payments & Subscriptions

**Goal:** Revenue generation via subscription tiers and per-exam purchases.

**Requirements:** PAY-01 through PAY-14

**Success Criteria:**

1. Upgrade page with plan comparison (Free/Plus ₦2,000/mo/Pro ₦5,000/mo)
2. Yearly plans (Plus ₦20,000, Pro ₦50,000 — save 17%)
3. Configurable payment provider via env vars (PAYMENT_PROVIDER, PAYMENT_PUBLIC_KEY, etc.)
4. Payment checkout (cards, bank transfer, USSD — via configurable provider)
5. Server-side payment verification (verify-payment edge function)
6. Subscription tier update on successful payment
7. Subscription expiration tracking (subscription_expires_at)
8. useSubscription hook (auto-refresh every 5 min, subscription-updated event listener)
9. Feature gating (FeatureGateDialog, UpgradePrompt components shown when blocked)
10. Kill switch (ENABLED flag in subscriptionConfig — unlocks all features)
11. Per-exam subscriptions (exam_subscriptions table)
12. Ad banner hidden for Plus/Pro subscribers
13. Handle expired subscriptions, downgrades, admin overrides
14. Handle payment failures gracefully

**Key Dependencies:** Phase 1 (tier enforcement), Phase 0 (payment factory)
**Avoids:** Payment verification client-side (PITFALL-03) — always verify server-side
**Research Flag:** Flutterwave USSD implementation for Nigerian market

**UI hint:** yes

---

### Phase 20: Offline Mode

**Goal:** Full offline-first architecture with background sync.

**Requirements:** OFFLINE-01 through OFFLINE-10

**Success Criteria:**

1. WatermelonDB offline-first local storage operational
2. Background sync to Supabase when online (two-phase: pull then push)
3. Sync queue for queued mutations
4. Sync lock (prevent concurrent synchronize() calls — PITFALL-02)
5. Offline status banner (yellow indicator)
6. Offline sync indicator (spinner when syncing)
7. View notes offline (cached from WatermelonDB)
8. Review flashcards offline (existing decks)
9. View course list offline
10. Read AI summaries offline (cached responses)

**Key Dependencies:** Phase 0 (WatermelonDB setup), Phase 3 (notes), Phase 5 (flashcards)
**Avoids:** Concurrent sync race (PITFALL-02), answer not saved on network fail (PITFALL-05)
**Research Flag:** Sync conflict resolution strategy (last-write-wins vs. client-wins for exam answers)

**UI hint:** yes

---

### Phase 21: PDF Export & Documents

**Goal:** Export and view documents across the app.

**Requirements:** PDF-01 through PDF-05

**Success Criteria:**

1. PDF export for notes (Fast: instant, HD: pixel-perfect)
2. PDF export for flashcards
3. PDF export for cheat sheets
4. Resume PDF export (Fast + HD)
5. Document viewer for PDF and DOCX files

**Key Dependencies:** Phase 3 (notes), Phase 5 (flashcards), Phase 8 (cheat sheets), Phase 10 (resume)
**Avoids:** react-native-pdf Google Play block (use react-native-pdf-jsi instead)
**Research Flag:** None

**UI hint:** yes

---

### Phase 22: Notifications & Background

**Goal:** Push and local notifications with background sync.

**Requirements:** NOTIF-01 through NOTIF-05

**Success Criteria:**

1. Push notifications (focus reminders, streak alerts, daily challenge)
2. Local notifications (Pomodoro timer complete, daily challenge available)
3. Notification preferences per feature
4. Background fetch for data sync
5. Notification permission request flow with rationale

**Key Dependencies:** Phase 8 (Pomodoro), Phase 16 (gamification), Phase 20 (background sync)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 23: Admin Panel (Mobile Admin)

**Goal:** Admin functionality for mobile device management.

**Requirements:** ADMIN-01 through ADMIN-04

**Success Criteria:**

1. Admin dashboard (announcements, resources, user activity stats)
2. Upload educational resources (textbooks, past papers) to store
3. Manage exam question bank (add/edit/disable questions)
4. View user activity statistics (aggregated)

**Key Dependencies:** Phase 15 (store), Phase 7 (exam questions), Phase 0 (Supabase Storage)
**Avoids:** None specific
**Research Flag:** None

**UI hint:** yes

---

### Phase 24: Advanced Features & Polish

**Goal:** Premium polish and advanced capabilities.

**Requirements:** V2-01 through V2-07

**Success Criteria:**

1. Voice input for AI tutor (hands-free Q&A)
2. Text-to-speech for notes and flashcards (listen while commuting)
3. Advanced animations with react-native-reanimated v4
4. Haptic feedback throughout the app
5. Deep linking (expo-linking + React Navigation v7)
6. Share extension (share content to other apps)
7. Widget support (study streak widget, daily challenge widget)

**Key Dependencies:** Phase 4 (AI tutor), Phase 3 (notes), Phase 5 (flashcards), Phase 0 (navigation)
**Avoids:** New Architecture incompatibility (PITFALL-07) — test on real devices
**Research Flag:** Widget support implementation for Android/iOS

**UI hint:** yes

---

### Phase 25: Continuous Improvement

**Goal:** Optimization, accessibility, and enhancement.

**Requirements:** V2-08 through V2-15

**Success Criteria:**

1. Performance optimization (FlatList with getItemLayout for 10k+ items, PITFALL-08)
2. Accessibility audit (ARIA labels, screen reader support, color contrast)
3. Battery optimization (reduce background processes, optimize sync intervals)
4. Memory leak fixes (use React Native DevTools profiler)
5. Cross-device sync improvements
6. Tablet-specific layouts (responsive for portrait and landscape)
7. Foldable device support (if Android 7+ device market is significant)

**Key Dependencies:** All previous phases
**Avoids:** FlatList at scale (PITFALL-08), device clock dependence (PITFALL-09)
**Research Flag:** Foldable device market share in target regions (Nigeria/Africa)

**UI hint:** yes

---

## Phase Dependencies Map

```
Phase 0 (Foundation)
    ├── Phase 1 (Auth) → Phase 0
    ├── Phase 2 (Onboarding + Dashboard) → Phase 1
    ├── Phase 3 (Notes) → Phase 2, Phase 0
    ├── Phase 4 (AI Tutor) → Phase 0, Phase 3
    ├── Phase 5 (Flashcards) → Phase 0, Phase 3
    ├── Phase 6 (Quizzes) → Phase 4, Phase 5
    ├── Phase 7 (ExamPrep CBT) → Phase 0, Phase 6
    ├── Phase 8 (Study Suite) → Phase 4, Phase 5, Phase 6
    ├── Phase 9 (AI Tools Lab) → Phase 4, Phase 3
    ├── Phase 10 (Career) → Phase 4, Phase 19
    ├── Phase 11 (Plan & Focus) → Phase 4, Phase 8
    ├── Phase 12 (Focus Mode) → Phase 0, Phase 11
    ├── Phase 13 (Social Hub) → Phase 1, Phase 6, Phase 14
    ├── Phase 14 (Chat) → Phase 13, Phase 0
    ├── Phase 15 (Store) → Phase 19, Phase 0
    ├── Phase 16 (Gamification) → Phase 5, Phase 6, Phase 8
    ├── Phase 17 (Safety) → Phase 1, Phase 0
    ├── Phase 18 (Profile) → Phase 1, Phase 16
    ├── Phase 19 (Payments) → Phase 1, Phase 0
    ├── Phase 20 (Offline) → Phase 0, Phase 3, Phase 5
    ├── Phase 21 (PDF Export) → Phase 3, Phase 5, Phase 8, Phase 10
    ├── Phase 22 (Notifications) → Phase 8, Phase 16, Phase 20
    ├── Phase 23 (Admin) → Phase 15, Phase 7, Phase 0
    ├── Phase 24 (Advanced Features) → Phase 4, Phase 3, Phase 5, Phase 0
    └── Phase 25 (Optimization) → All previous phases
```

---

## Research Flags by Phase

| Phase    | Flag                                             | Status                     |
| -------- | ------------------------------------------------ | -------------------------- |
| Phase 0  | WatermelonDB expo plugin SDK 54 compatibility    | Verify during native build |
| Phase 4  | SSE streaming reliability on React Native        | Test with expo-dev-client  |
| Phase 7  | Question bank sourcing strategy                  | Plan during planning       |
| Phase 7  | WatermelonDB sync for exam answers (client-wins) | Configure during Phase 20  |
| Phase 12 | iOS Screen Time API approval process             | Research before Phase 12   |
| Phase 19 | Flutterwave USSD implementation                  | Research before Phase 19   |
| Phase 24 | Widget support (Android/iOS)                     | Research before Phase 24   |

---

## Roadmap Statistics

- **Total Phases:** 25
- **Total Requirements:** 210 v1
- **v2 Requirements:** 20
- **Out of Scope:** 6 items
- **Research Flags:** 7
- **Phases with UI:** 24 (all except Phase 0)
- **Phases requiring native modules:** 1 (Phase 12)
- **Phases requiring AI:** 8 (4, 5, 6, 8, 9, 10, 11, 16)
- **Estimated sequence:** Sequential, ~25 sessions

---

_Roadmap created: 2026-04-25_
_All 210 v1 requirements mapped to 25 phases ✓_
