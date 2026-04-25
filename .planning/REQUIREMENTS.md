# Requirements: StudentOS Mobile

**Defined:** 2026-04-25
**Core Value:** A student's complete learning operating system that works everywhere — on the go, offline, with focus enforcement, biometric security, and every feature the web app has — built to production grade.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation (FOUND-01 to FOUND-08)

- [ ] **FOUND-01**: Expo + Dev Client project setup with TypeScript, folder structure, and linting
- [ ] **FOUND-02**: React Navigation v7 setup with Bottom tabs + Stack navigator
- [ ] **FOUND-03**: Zustand stores for global state management (auth, subscription, UI)
- [ ] **FOUND-04**: API service layer with configurable AI provider (base URL, API key, model name via env vars)
- [ ] **FOUND-05**: API service layer with configurable payment provider (provider name, keys via env vars)
- [ ] **FOUND-06**: WatermelonDB setup with models for offline-first data
- [ ] **FOUND-07**: Supabase client integration for backend (Auth, Database, Storage, Realtime)
- [ ] **FOUND-08**: Theme system (dark/light mode, consistent design tokens)

### Authentication & Security (AUTH-01 to AUTH-11)

- [ ] **AUTH-01**: User can sign up with email and password via Supabase Auth
- [ ] **AUTH-02**: User can sign in with email and password via Supabase Auth
- [ ] **AUTH-03**: User session persists across app restarts (secure token storage)
- [ ] **AUTH-04**: User can sign out from any screen
- [ ] **AUTH-05**: User can reset password via email link
- [ ] **AUTH-06**: App lock with biometric authentication (Face ID / fingerprint)
- [ ] **AUTH-07**: App lock with 4-digit PIN (stored securely via expo-secure-store)
- [ ] **AUTH-08**: Blocked user enforcement (is_blocked flag check on app open)
- [ ] **AUTH-09**: Subscription tier enforcement (Free/Plus/Pro feature gating)
- [ ] **AUTH-10**: Secure credential storage (encrypted, hardware-backed Keychain/Keystore)
- [ ] **AUTH-11**: Auto session refresh with onAuthStateChange subscription

### Onboarding (ONBOARD-01 to ONBOARD-03)

- [ ] **ONBOARD-01**: 7-step onboarding flow with animations (welcome, AI learning, spaced repetition, focus tools, growth tracking, social, ready)
- [ ] **ONBOARD-02**: Onboarding state persisted in local storage (skip on return)
- [ ] **ONBOARD-03**: Unique gradient backgrounds and floating particle animations per step

### Dashboard (DASH-01 to DASH-09)

- [ ] **DASH-01**: Time-aware greeting (Good morning/afternoon/evening)
- [ ] **DASH-02**: Display name from profile
- [ ] **DASH-03**: Offline status indicator (yellow banner when offline)
- [ ] **DASH-04**: Streak card with current streak, longest streak, flame animation
- [ ] **DASH-05**: Daily Brain Boost challenge (5 questions, 10 XP each, tracked per day)
- [ ] **DASH-06**: Study time widget (today's minutes, daily target progress, weekly trend)
- [ ] **DASH-07**: Study progress widget (notes created, quizzes completed, flashcards reviewed, focus minutes)
- [ ] **DASH-08**: Announcement banner (info/warning/success types, RLS-filtered)
- [ ] **DASH-09**: Courses grid with progress cards (weighted: Notes 30%, Quizzes 30%, Flashcards 40%)

### Smart Notes (NOTES-01 to NOTES-14)

- [ ] **NOTES-01**: Rich text note creation with markdown support
- [ ] **NOTES-02**: Note title + body with auto-save every 3 seconds
- [ ] **NOTES-03**: Course assignment for notes
- [ ] **NOTES-04**: PDF upload with text extraction (extract-pdf-text edge function)
- [ ] **NOTES-05**: DOCX upload with text extraction
- [ ] **NOTES-06**: Image upload with camera + OCR (extract-pdf-text-ocr edge function)
- [ ] **NOTES-07**: Note card with title, preview, source badge, course tag, created date
- [ ] **NOTES-08**: Note viewer dialog with full text display
- [ ] **NOTES-09**: AI summary generation (short/medium/long) with streaming
- [ ] **NOTES-10**: Socratic tutor mode for notes (AI asks leading questions)
- [ ] **NOTES-11**: "Ask AI Tutor about this note" button with note context
- [ ] **NOTES-12**: Quick actions: view, generate summary, generate flashcards, generate quiz, delete
- [ ] **NOTES-13**: Daily note creation quotas enforced by tier (Free: 3, Plus: 10, Pro: unlimited)
- [ ] **NOTES-14**: Note deletion with confirmation

### AI Tutor (AI-01 to AI-14)

- [ ] **AI-01**: Chat interface with AI tutor conversation
- [ ] **AI-02**: 4 persona selection (Chill/Strict/Fun/Motivator) persisted to profile
- [ ] **AI-03**: Course-aware context injection (full course notes as system context)
- [ ] **AI-04**: Streaming responses via SSE (real-time word-by-word output)
- [ ] **AI-05**: Math rendering with KaTeX (LaTeX inline and block)
- [ ] **AI-06**: Voice mode (Web Speech API speech-to-text for input)
- [ ] **AI-07**: Voice mode (text-to-speech for output)
- [ ] **AI-08**: Conversation history with role-tagged messages (user/assistant)
- [ ] **AI-09**: Clear history and scroll-back to old conversations
- [ ] **AI-10**: Daily AI call quotas by tier (Free: 5, Plus: 30, Pro: 100)
- [ ] **AI-11**: Configurable AI provider via environment variables (provider name, base URL, API key, model name)
- [ ] **AI-12**: AI calls reset at midnight UTC (ai_calls_reset_at comparison)
- [ ] **AI-13**: Conversation history saved to chat_messages table with course_id FK
- [ ] **AI-14**: Math LaTeX input handling ($E = mc^2$, $$\int_0^1 x^2 dx$$)

### Flashcards (FLASHC-01 to FLASHC-11)

- [ ] **FLASHC-01**: Flashcard creation (manual: front + back text)
- [ ] **FLASHC-02**: AI flashcard generation from notes (10-20 cards, JSON format)
- [ ] **FLASHC-03**: AI flashcard generation approval flow (user reviews before save)
- [ ] **FLASHC-04**: SM-2 spaced repetition review session (Again/Hard/Good/Easy ratings)
- [ ] **FLASHC-05**: Cards due for review (next_review <= NOW()) shown one at a time
- [ ] **FLASHC-06**: Flashcard flip animation (front to back)
- [ ] **FLASHC-07**: SM-2 algorithm: ease_factor, interval_days, repetitions, next_review updates
- [ ] **FLASHC-08**: Flashcards list with search and filters (course, due today, mastered)
- [ ] **FLASHC-09**: Edit and delete individual flashcards
- [ ] **FLASHC-10**: Course assignment for flashcards
- [ ] **FLASHC-11**: Flashcard generation quotas by tier (Free: 3, Plus: 20, Pro: unlimited); reviewing existing cards is unlimited

### Quizzes (QUIZ-01 to QUIZ-10)

- [ ] **QUIZ-01**: AI quiz generation from notes or course content
- [ ] **QUIZ-02**: Quiz configuration (number: 5/10/20, difficulty: easy/medium/hard)
- [ ] **QUIZ-03**: Quiz taking flow (one question at a time, 4 multiple-choice options)
- [ ] **QUIZ-04**: Optional per-question or total timer
- [ ] **QUIZ-05**: Instant feedback after answer (correct/incorrect + explanation)
- [ ] **QUIZ-06**: Final score screen (percentage, time taken, missed questions review)
- [ ] **QUIZ-07**: Quiz history with sortable attempts (date, score, course)
- [ ] **QUIZ-08**: Re-view individual quiz attempts
- [ ] **QUIZ-09**: Challenge a friend (peer quiz challenges with XP rewards)
- [ ] **QUIZ-10**: Quiz generation quotas by tier (Free: 3, Plus: 10, Pro: unlimited)

### ExamPrep CBT Engine (EXAM-01 to EXAM-27)

- [ ] **EXAM-01**: Exam selector (WAEC, NECO, JAMB, IELTS, TOEFL, SAT, GRE)
- [ ] **EXAM-02**: Subject selector per exam type
- [ ] **EXAM-03**: Practice mode selector (8 modes)
- [ ] **EXAM-04**: Quick Practice (Untimed): 20 random questions, instant feedback
- [ ] **EXAM-05**: Quick Practice (Timed): 20 questions with strict timer
- [ ] **EXAM-06**: Topic-Based Practice: filter by specific topic
- [ ] **EXAM-07**: Year-Based Practice: past papers from specific years
- [ ] **EXAM-08**: Study Material-Based Practice: generate from uploaded PDF past papers
- [ ] **EXAM-09**: Mock Exam Mode: single-subject simulation with real exam format
- [ ] **EXAM-10**: Multi-Subject Full CBT: JAMB-style 4-subject × 120-minute timer
- [ ] **EXAM-11**: Guided Learning: AI lesson + 5 practice questions
- [ ] **EXAM-12**: Bookmarked Questions: review saved questions
- [ ] **EXAM-13**: Practice session UI with question display, KaTeX math, 4-5 options
- [ ] **EXAM-14**: Session timer in header
- [ ] **EXAM-15**: Bookmark button to save questions for later
- [ ] **EXAM-16**: Report button to flag bad questions
- [ ] **EXAM-17**: Skip / Previous / Next navigation
- [ ] **EXAM-18**: Submit exam button when finished
- [ ] **EXAM-19**: Session review (total score, time taken, per-question review with explanations)
- [ ] **EXAM-20**: Add missed questions to flashcard deck
- [ ] **EXAM-21**: Exam performance analytics (radar chart by subject/topic, difficulty breakdown)
- [ ] **EXAM-22**: Session history timeline
- [ ] **EXAM-23**: Improvement trend line chart over time
- [ ] **EXAM-24**: Weakness report (3 weakest topics + personalized study plan)
- [ ] **EXAM-25**: Study plan view (AI-generated schedule based on exam date, weaknesses, available hours)
- [ ] **EXAM-26**: Per-exam subscriptions (single-exam access beyond global tiers)
- [ ] **EXAM-27**: CBT timer integrity (local-first answer persistence, recalculate on foreground)

### Study Suite (STUDY-01 to STUDY-12)

- [ ] **STUDY-01**: Pomodoro timer (25/5 cycle, configurable durations)
- [ ] **STUDY-02**: Pomodoro session logging to pomodoro_sessions table
- [ ] **STUDY-03**: Cheat sheet creator (AI generates one-page summary from notes)
- [ ] **STUDY-04**: Mnemonic generator (AI generates rhymes, acronyms, memory palaces)
- [ ] **STUDY-05**: Cram mode (AI rapid-fire study sequence)
- [ ] **STUDY-06**: Concept linking (AI generates knowledge graph)
- [ ] **STUDY-07**: Fill in the blanks (AI cloze-deletion exercises)
- [ ] **STUDY-08**: Audio notes (text-to-speech with speed control)
- [ ] **STUDY-09**: Debate partner (AI takes opposing position)
- [ ] **STUDY-10**: Study statistics (total hours, avg session length, best subject, peak hour)
- [ ] **STUDY-11**: Streak calendar (GitHub-style heatmap of daily activity)
- [ ] **STUDY-12**: Mock exam generator (customizable questions, time limit, topic)

### AI Tools Lab (AITOOLS-01 to AITOOLS-12)

- [ ] **AITOOLS-01**: Math solver (step-by-step working, KaTeX rendering, "Explain like I'm 5" mode)
- [ ] **AITOOLS-02**: Code debugger (paste code, identify bugs, corrected code output)
- [ ] **AITOOLS-03**: Language translator (50+ languages, educational mode with grammar explanations)
- [ ] **AITOOLS-04**: Book scanner / OCR (camera capture, Tesseract.js / vision AI)
- [ ] **AITOOLS-05**: Diagram interpreter (upload diagram, AI describes and explains)
- [ ] **AITOOLS-06**: OCR to LaTeX (camera capture math equations, convert to LaTeX)
- [ ] **AITOOLS-07**: Live lecture recorder (microphone recording + real-time transcription)
- [ ] **AITOOLS-08**: Post-lecture AI summary + key points + flashcards
- [ ] **AITOOLS-09**: Consistent AI tool layout (AIToolLayout: back button, input, generate, output)
- [ ] **AITOOLS-10**: Download dropdown (Fast PDF + HD PDF)
- [ ] **AITOOLS-11**: Copy-to-clipboard for AI outputs
- [ ] **AITOOLS-12**: Save-as-note for AI tool outputs

### Career Module (CAREER-01 to CAREER-14)

- [ ] **CAREER-01**: Resume builder with 10 templates (3 Free, 7 Plus, 10 Pro)
- [ ] **CAREER-02**: Live resume preview (updates in real-time as user types)
- [ ] **CAREER-03**: Resume sections: contact, summary, education, experience, skills, projects, certifications
- [ ] **CAREER-04**: AI summary generator (3-sentence professional summary from experience)
- [ ] **CAREER-05**: AI bullet improver (rewrite weak bullets into strong action-verb-led achievements)
- [ ] **CAREER-06**: PDF export (Fast: instant, HD: pixel-perfect via html2canvas + jsPDF)
- [ ] **CAREER-07**: HTML export and plain text export
- [ ] **CAREER-08**: Job search integration (real listings via external API)
- [ ] **CAREER-09**: Job search filters (location, role, experience level)
- [ ] **CAREER-10**: Save jobs for later
- [ ] **CAREER-11**: Internship matcher (AI matching based on skills, location, availability)
- [ ] **CAREER-12**: Real World Why (connecting school topics to real-world careers, salary ranges)
- [ ] **CAREER-13**: Job search quotas by tier (Free: 5/month, Plus: 20/month, Pro: unlimited)
- [ ] **CAREER-14**: InputRow component outside render loop to prevent input-focus-loss bug

### Plan & Focus (PLAN-01 to PLAN-11)

- [ ] **PLAN-01**: Study timetable (weekly calendar view, Mon-Sun, hourly slots)
- [ ] **PLAN-02**: Smart scheduler (AI-powered: subjects + exam date + available hours → optimal schedule)
- [ ] **PLAN-03**: Weakness detector (AI analyzes quiz/exam history, identifies topics below 60% accuracy)
- [ ] **PLAN-04**: Lo-fi radio (streaming audio, 5+ stations, background playback)
- [ ] **PLAN-05**: Sleep calculator (input wake-up time, calculates ideal bedtime based on 90-min cycles)
- [ ] **PLAN-06**: Progress tracker (month-over-month XP growth, course completion, goal-setting)
- [ ] **PLAN-07**: Recharts line chart (4-week XP trend)
- [ ] **PLAN-08**: Focus mode toggle integrated with Pomodoro timer
- [ ] **PLAN-09**: Focus mode with app selector (which apps to block)
- [ ] **PLAN-10**: Full-screen focus overlay during active sessions
- [ ] **PLAN-11**: Emergency exit with PIN

### Focus Mode & App Blocker (FOCUS-01 to FOCUS-10)

- [ ] **FOCUS-01**: Native Android app blocker via AccessibilityService (Expo Dev Client)
- [ ] **FOCUS-02**: BootReceiver to restore blocking state after device restart
- [ ] **FOCUS-03**: App selector (list all installed apps, user checks which to block)
- [ ] **FOCUS-04**: Full-screen lock overlay during focus sessions
- [ ] **FOCUS-05**: Countdown timer display during focus
- [ ] **FOCUS-06**: Motivational quote display
- [ ] **FOCUS-07**: Emergency exit with PIN (required if parental controls enabled)
- [ ] **FOCUS-08**: Blocked app list storage (per user)
- [ ] **FOCUS-09**: Background sync during focus sessions
- [ ] **FOCUS-10**: Push notification reminders for focus sessions

### Social Hub (SOCIAL-01 to SOCIAL-12)

- [ ] **SOCIAL-01**: Leaderboard (global XP ranking, all-time and weekly)
- [ ] **SOCIAL-02**: Top 100 displayed with avatars and stats
- [ ] **SOCIAL-03**: School filter for leaderboard (if school name set)
- [ ] **SOCIAL-04**: Study challenges (community time-limited challenges with progress bars)
- [ ] **SOCIAL-05**: Challenge a friend (quiz challenges with bonus XP for winner)
- [ ] **SOCIAL-06**: Friends list (friend requests, pending, accepted, blocked)
- [ ] **SOCIAL-07**: Friend profile view (XP, streak, achievements)
- [ ] **SOCIAL-08**: Study groups (create, join, max 10 members Plus, 25 Pro)
- [ ] **SOCIAL-09**: Group invite code (6 characters)
- [ ] **SOCIAL-10**: Group chat with Supabase Realtime
- [ ] **SOCIAL-11**: Group shared resources (notes, quizzes shared by members)
- [ ] **SOCIAL-12**: Peer finder (discover by school, grade, interests)

### Chat System (CHAT-01 to CHAT-10)

- [ ] **CHAT-01**: Direct messages with friends (1-on-1 chat)
- [ ] **CHAT-02**: Group chats for study groups (Plus/Pro only)
- [ ] **CHAT-03**: Real-time updates via Supabase Realtime
- [ ] **CHAT-04**: Media upload (images) to Supabase Storage
- [ ] **CHAT-05**: Image previews inline in chat
- [ ] **CHAT-06**: Message replies with quoted preview
- [ ] **CHAT-07**: Clickable quoted preview (scrolls to original message)
- [ ] **CHAT-08**: Read receipts (is_read boolean)
- [ ] **CHAT-09**: Unified ChatRoom component for DMs and group chats
- [ ] **CHAT-10**: Supabase Realtime WebSocket subscription for messages table

### Store (STORE-01 to STORE-08)

- [ ] **STORE-01**: Resource marketplace (textbooks, past papers, notes, videos)
- [ ] **STORE-02**: Resource card (thumbnail, title, author, subject, grade, download count, tier badge)
- [ ] **STORE-03**: Download button or "Upgrade to access" CTA for locked resources
- [ ] **STORE-04**: Search by title
- [ ] **STORE-05**: Filter by category (textbook/past paper/notes/video)
- [ ] **STORE-06**: Filter by subject and grade level
- [ ] **STORE-07**: Tier gating (Free/Plus/Pro visibility)
- [ ] **STORE-08**: Download tracking (increment download_count)

### Gamification (GAM-01 to GAM-13)

- [ ] **GAM-01**: XP system (quiz: 5 XP/correct, flashcards: 1 XP/card, Pomodoro: 10 XP/session)
- [ ] **GAM-02**: Streak tracking (consecutive days with study activity)
- [ ] **GAM-03**: Streak milestones (50 XP at 7 days, 200 XP at 30 days, 1000 XP at 100 days)
- [ ] **GAM-04**: Daily challenges (3 rotating tasks, 25 XP per challenge)
- [ ] **GAM-05**: Levels (every 1000 XP = 1 level)
- [ ] **GAM-06**: 50+ achievements across 5 categories (Study Time, Streak, Social, Academic Mastery, Exam Prep)
- [ ] **GAM-07**: Achievement unlock computed from real-time database queries
- [ ] **GAM-08**: Achievement celebration toast with XP reward
- [ ] **GAM-09**: XP persisted to profiles.total_xp and weekly_xp table
- [ ] **GAM-10**: Streak card animations (flame grows brighter as streak increases)
- [ ] **GAM-11**: Profile level display
- [ ] **GAM-12**: Leaderboard badges display
- [ ] **GAM-13**: Gamification UI in dashboard (daily challenges, streak, XP progress)

### Safety & Parental Controls (SAFETY-01 to SAFETY-09)

- [ ] **SAFETY-01**: 4-digit parental PIN (hashed, stored in profiles.parental_pin)
- [ ] **SAFETY-02**: Daily time limit (block app after X minutes)
- [ ] **SAFETY-03**: Time limit enforcement (full-screen blocking overlay)
- [ ] **SAFETY-04**: Content filter toggle (profiles.content_filter_enabled)
- [ ] **SAFETY-05**: Safe search toggle (profiles.safe_search_enabled)
- [ ] **SAFETY-06**: Under 14 mode (profiles.is_under_14)
- [ ] **SAFETY-07**: Parent email for weekly progress reports
- [ ] **SAFETY-08**: Parent dashboard (today's study time, activities, focus sessions, subjects, streak)
- [ ] **SAFETY-09**: Parental controls require PIN to access (settings are read-only without PIN)

### Profile & Settings (PROFILE-01 to PROFILE-12)

- [ ] **PROFILE-01**: Avatar upload to Supabase Storage
- [ ] **PROFILE-02**: Display name (editable)
- [ ] **PROFILE-03**: Username (unique, for friend requests)
- [ ] **PROFILE-04**: Full name, school name, grade level (JSS1-SS3 / Year 1-4 / Postgrad)
- [ ] **PROFILE-05**: Stats display (XP, level, streak, achievements, member since)
- [ ] **PROFILE-06**: Study preferences (persona, daily study target, notifications)
- [ ] **PROFILE-07**: Subscription status (tier badge, expiration date)
- [ ] **PROFILE-08**: Sign out action
- [ ] **PROFILE-09**: Delete account (with confirmation)
- [ ] **PROFILE-10**: Privacy policy and Terms of Service links
- [ ] **PROFILE-11**: Email (read-only)
- [ ] **PROFILE-12**: Notification preferences per feature

### Payments & Subscriptions (PAY-01 to PAY-14)

- [ ] **PAY-01**: Upgrade page with plan comparison (Free/Plus ₦2,000/mo/Pro ₦5,000/mo)
- [ ] **PAY-02**: Yearly plans (Plus ₦20,000, Pro ₦50,000 — save 17%)
- [ ] **PAY-03**: Configurable payment provider via environment variables (provider name, public key, etc.)
- [ ] **PAY-04**: Payment checkout (cards, bank transfer, USSD via configurable provider)
- [ ] **PAY-05**: Server-side payment verification (verify-payment edge function)
- [ ] **PAY-06**: Subscription tier update on successful payment
- [ ] **PAY-07**: Subscription expiration (subscription_expires_at tracking)
- [ ] **PAY-08**: useSubscription hook (auto-refresh every 5 minutes, event listener)
- [ ] **PAY-09**: Feature gating (FeatureGateDialog, UpgradePrompt components)
- [ ] **PAY-10**: Kill switch for payments (ENABLED flag in subscriptionConfig)
- [ ] **PAY-11**: Per-exam subscriptions (single-exam access table)
- [ ] **PAY-12**: Ad banner hidden for Plus/Pro subscribers
- [ ] **PAY-13**: Subscription event dispatch (subscription-updated window event)
- [ ] **PAY-14**: Handle expired subscriptions, downgrades, admin overrides

### Offline Mode (OFFLINE-01 to OFFLINE-10)

- [ ] **OFFLINE-01**: WatermelonDB offline-first local storage
- [ ] **OFFLINE-02**: Background sync to Supabase when online
- [ ] **OFFLINE-03**: Sync queue for queued mutations
- [ ] **OFFLINE-04**: Offline status banner (yellow indicator)
- [ ] **OFFLINE-05**: Offline sync indicator (spinner when syncing)
- [ ] **OFFLINE-06**: View notes offline (cached content)
- [ ] **OFFLINE-07**: Review flashcards offline (existing decks from WatermelonDB)
- [ ] **OFFLINE-08**: View course list offline
- [ ] **OFFLINE-09**: Read summaries offline
- [ ] **OFFLINE-10**: Offline AI (cached responses for previously-asked questions)

### PDF Export & Documents (PDF-01 to PDF-05)

- [ ] **PDF-01**: PDF export for notes (Fast + HD modes)
- [ ] **PDF-02**: PDF export for flashcards
- [ ] **PDF-03**: PDF export for cheat sheets
- [ ] **PDF-04**: Resume PDF export (Fast + HD)
- [ ] **PDF-05**: Document viewer (PDF, DOCX)

### Notifications (NOTIF-01 to NOTIF-05)

- [ ] **NOTIF-01**: Push notifications (focus reminders, streak reminders, daily challenge)
- [ ] **NOTIF-02**: Local notifications (Pomodoro timer, daily challenge)
- [ ] **NOTIF-03**: Notification preferences per feature
- [ ] **NOTIF-04**: Background fetch for sync
- [ ] **NOTIF-05**: Notification permission request flow

### Admin Panel (ADMIN-01 to ADMIN-04)

- [ ] **ADMIN-01**: Admin dashboard (announcements, resources, user activity)
- [ ] **ADMIN-02**: Upload educational resources (textbooks, past papers)
- [ ] **ADMIN-03**: Manage exam question bank (add/edit/disable questions)
- [ ] **ADMIN-04**: View user activity statistics

## v2 Requirements

### Advanced Features (v2)

- **V2-01**: Voice input for AI tutor (hands-free Q&A)
- **V2-02**: Text-to-speech for notes (listen while walking/commuting)
- **V2-03**: Advanced animations with Reanimated
- **V2-04**: Haptic feedback throughout the app
- **V2-05**: Deep linking
- **V2-06**: Share extension
- **V2-07**: Widget support (study streak, daily challenge)
- **V2-08**: Tablet-specific layouts
- **V2-09**: Foldable device support
- **V2-10**: Video calling / live study sessions
- **V2-11**: FSRS spaced repetition algorithm (alternative to SM-2)
- **V2-12**: Cross-device sync improvements
- **V2-13**: Battery optimization
- **V2-14**: Accessibility audit
- **V2-15**: Performance optimization pass

### Enhanced Social (v2)

- **V2-16**: Typing indicators in chat
- **V2-17**: Voice messages in chat
- **V2-18**: Study streaks with friends
- **V2-19**: Video study sessions
- **V2-20**: Custom study groups with roles (admin/moderator/member)

## Out of Scope

| Feature | Reason |
|---------|--------|
| iOS app blocker | Not technically possible on iOS without Screen Time API (user-initiated only) |
| Video calling / live study sessions | High complexity, defer to v2 |
| Custom AI model training | Use existing providers only |
| Standalone web dashboard | Use existing studentoss/ web app |
| iOS App Clip / Android Instant Apps | Future consideration |
| Web app wrapper | This is a native rebuild, not a Capacitor wrapper |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 to FOUND-08 | Phase 0 | Pending |
| AUTH-01 to AUTH-11 | Phase 1 | Pending |
| ONBOARD-01 to ONBOARD-03 | Phase 2 | Pending |
| DASH-01 to DASH-09 | Phase 2 | Pending |
| NOTES-01 to NOTES-14 | Phase 3 | Pending |
| AI-01 to AI-14 | Phase 4 | Pending |
| FLASHC-01 to FLASHC-11 | Phase 5 | Pending |
| QUIZ-01 to QUIZ-10 | Phase 6 | Pending |
| EXAM-01 to EXAM-27 | Phase 7 | Pending |
| STUDY-01 to STUDY-12 | Phase 8 | Pending |
| AITOOLS-01 to AITOOLS-12 | Phase 9 | Pending |
| CAREER-01 to CAREER-14 | Phase 10 | Pending |
| PLAN-01 to PLAN-11 | Phase 11 | Pending |
| FOCUS-01 to FOCUS-10 | Phase 12 | Pending |
| SOCIAL-01 to SOCIAL-12 | Phase 13 | Pending |
| CHAT-01 to CHAT-10 | Phase 14 | Pending |
| STORE-01 to STORE-08 | Phase 15 | Pending |
| GAM-01 to GAM-13 | Phase 16 | Pending |
| SAFETY-01 to SAFETY-09 | Phase 17 | Pending |
| PROFILE-01 to PROFILE-12 | Phase 18 | Pending |
| PAY-01 to PAY-14 | Phase 19 | Pending |
| OFFLINE-01 to OFFLINE-10 | Phase 20 | Pending |
| PDF-01 to PDF-05 | Phase 21 | Pending |
| NOTIF-01 to NOTIF-05 | Phase 22 | Pending |
| ADMIN-01 to ADMIN-04 | Phase 23 | Pending |

**Coverage:**
- v1 requirements: 210 total
- Mapped to phases: 210
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 after initial definition*