# Requirements: StudentOS Mobile — Native Android Conversion

**Defined:** 2026-05-05
**Core Value:** The native app must be indistinguishable from the web app — same UI, same features, same architecture, same UX.

## v1 Requirements

### Foundation & Platform

- [ ] **FND-01**: App runs as native React Native (Expo) Android app (not WebView/Capacitor wrapper)
- [ ] **FND-02**: Monorepo structure with @studentos/shared package for portable business logic (hooks, types, utils)
- [ ] **FND-03**: Environment variables validated at startup (zod schema) with no hardcoded keys in source
- [ ] **FND-04**: Expo Router file-based routing replaces React Router with (auth)/, (tabs)/, and root stack groups
- [ ] **FND-05**: NativeWind (TailwindCSS for RN) replicates the existing design system tokens and dark mode
- [ ] **FND-06**: Per-route error boundaries prevent one route crash from taking down the entire app
- [ ] **FND-07**: App performs smoothly on low-end Android devices (2GB RAM, Android 8+)
- [ ] **FND-08**: Bundle size optimized with code splitting, lazy loading, and tree shaking

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password via Supabase Auth
- [ ] **AUTH-02**: User can sign in with email and password and stay logged in across app restarts (expo-secure-store for tokens)
- [ ] **AUTH-03**: User can reset password via magic link email with deep linking back to the app (expo-linking)
- [ ] **AUTH-04**: User can sign out from any page, clearing secure storage and redirecting to auth screen
- [ ] **AUTH-05**: Blocked users are immediately signed out when is_blocked flag is detected

### Onboarding

- [ ] **ONBD-01**: New users see a 7-step onboarding flow with Reanimated 3 spring animations and particle effects
- [ ] **ONBD-02**: Returning users skip onboarding (flag stored in expo-sqlite/kv-store, not localStorage)
- [ ] **ONBD-03**: Each onboarding step has unique gradient background, emoji icon, headline, and progress dots

### Dashboard

- [ ] **DASH-01**: Dashboard shows time-aware greeting, display name, and offline status indicator
- [ ] **DASH-02**: Streak card shows current streak, longest streak, with animated flame and calendar detail
- [ ] **DASH-03**: Daily Quiz Challenge widget shows 5-question challenge with XP tracking
- [ ] **DASH-04**: Study time widget shows today's total minutes with progress bar toward daily target
- [ ] **DASH-05**: Study progress widget shows weekly aggregate stats (notes, quizzes, flashcards, focus minutes)
- [ ] **DASH-06**: Announcement banner displays active announcements from admin (info/warning/success types)
- [ ] **DASH-07**: Courses grid shows each course with name, color, emoji, and progress percentage
- [ ] **DASH-08**: Add Course dialog with name, color picker (8 presets), and emoji picker (50+ emojis)
- [ ] **DASH-09**: Ad banner for free-tier users (react-native-google-mobile-ads), hidden for Plus/Pro

### Smart Notes

- [ ] **NOTE-01**: User can create notes with rich text editor, auto-save every 3 seconds, title + body + course assignment
- [ ] **NOTE-02**: User can upload PDF, DOCX, TXT, and image files via expo-document-picker to Supabase Storage
- [ ] **NOTE-03**: PDF text extraction via extract-pdf-text edge function works identically to web app
- [ ] **NOTE-04**: OCR for scanned PDFs and images via extract-pdf-text-ocr edge function
- [ ] **NOTE-05**: Note cards display title, preview, source type badge, course tag, and quick actions
- [ ] **NOTE-06**: Note viewer shows full content, original file preview, AI summary, and link to AI Tutor
- [ ] **NOTE-07**: AI Summary dialog streams summary from ai-study edge function (short/medium/long lengths)
- [ ] **NOTE-08**: Socratic Tutor mode asks leading questions instead of explaining directly (Pro tier)
- [ ] **NOTE-09**: Daily note quotas enforced per tier (Free: 3, Plus: 10, Pro: unlimited)

### AI Tutor

- [ ] **AITR-01**: Chat-based AI Tutor with streaming SSE responses (react-native-sse or custom implementation)
- [ ] **AITR-02**: Four teaching personas (Chill, Strict, Fun, Motivator) selectable and persisted in profile
- [ ] **AITR-03**: Course-aware context — tutor receives course notes as system context when opened from a course
- [ ] **AITR-04**: KaTeX math rendering in AI responses (WebView component or react-native-math-view)
- [ ] **AITR-05**: Conversation history saved to chat_messages table with user/assistant roles and course_id
- [ ] **AITR-06**: Daily AI call quotas enforced per tier (Free: 5, Plus: 30, Pro: 100)
- [ ] **AITR-07**: Voice mode with speech-to-text input and text-to-speech output (expo-speech + expo-speech-recognition)

### Flashcards

- [ ] **FLSH-01**: AI-generated flashcards from notes (10-20 cards per note via ai-study edge function)
- [ ] **FLSH-02**: Manual flashcard creation with front + back text and optional course assignment
- [ ] **FLSH-03**: SM-2 spaced repetition review sessions with Again/Hard/Good/Easy difficulty rating
- [ ] **FLSH-04**: Card flip animation with Reanimated 3
- [ ] **FLSH-05**: Flashcards list with search, filter by course, due-today, and mastered
- [ ] **FLSH-06**: Daily flashcard generation quotas (Free: 3, Plus: 20, Pro: unlimited); reviewing always unlimited

### Quizzes

- [ ] **QUIZ-01**: AI-generated multiple-choice quizzes from notes or course content (5/10/20 questions, 3 difficulties)
- [ ] **QUIZ-02**: Quiz-taking UI with one question at a time, 4 options, optional timer, instant feedback
- [ ] **QUIZ-03**: Final score screen with percentage, time taken, and missed question review
- [ ] **QUIZ-04**: Quiz history stored in quiz_attempts table, sortable by date/score/course
- [ ] **QUIZ-05**: Friend challenges via peer_challenges table — both users take same quiz, winner gets bonus XP
- [ ] **QUIZ-06**: Daily quiz quotas (Free: 3, Plus: 10, Pro: unlimited)

### ExamPrep CBT

- [ ] **EXAM-01**: Exam selector for WAEC, NECO, JAMB, IELTS, TOEFL, SAT, GRE
- [ ] **EXAM-02**: Subject selector with per-exam subject lists
- [ ] **EXAM-03**: 8 practice modes: Quick (untimed), Quick (timed), Topic-based, Year-based, Study material-based, Mock exam, Multi-subject CBT (JAMB), Guided learning
- [ ] **EXAM-04**: Practice session UI with KaTeX-rendered questions, 4-5 options, timer, bookmark, report, navigation
- [ ] **EXAM-05**: Multi-subject CBT with 4 subjects, single timer, free navigation between subjects (JAMB mode)
- [ ] **EXAM-06**: Session review with total score, time taken, per-question review with correct answer and explanation
- [ ] **EXAM-07**: Exam performance analytics with radar chart, difficulty breakdown, session history, improvement trend
- [ ] **EXAM-08**: Weakness report identifying 3 weakest topics with AI-generated study plan
- [ ] **EXAM-09**: Bookmarked questions for later review
- [ ] **EXAM-10**: Per-exam subscriptions in addition to global Plus/Pro tiers
- [ ] **EXAM-11**: ExamPrep access requires Plus/Pro tier or per-exam subscription (Plus/Pro: full, Free: limited)

### Study Suite

- [ ] **STUD-01**: Cheat Sheet Creator — AI generates one-page cheat sheet, export as PDF
- [ ] **STUD-02**: Mnemonic Generator — AI creates rhymes, acronyms, memory palaces
- [ ] **STUD-03**: Cram Mode — rapid-fire study sequence (key concepts → flashcards → mini-quiz)
- [ ] **STUD-04**: Mock Exam — quick mock exam generator with customizable question count and time limit
- [ ] **STUD-05**: Concept Linking — AI generates knowledge graph showing concept connections
- [ ] **STUD-06**: Fill in the Blanks — AI converts notes to cloze-deletion exercises
- [ ] **STUD-07**: Audio Notes — convert notes to spoken audio via expo-speech with speed control
- [ ] **STUD-08**: Debate Partner — AI takes opposing position for critical thinking training
- [ ] **STUD-09**: Pomodoro Timer — 25-min focus / 5-min break cycle, configurable, logs to pomodoro_sessions
- [ ] **STUD-10**: Study Statistics — total hours, average session length, best subject, peak hour
- [ ] **STUD-11**: Streak Calendar — GitHub-style heatmap of daily study activity
- [ ] **STUD-12**: Voice Mode — hands-free Q&A with AI Tutor (speech-to-text + text-to-speech)

### AI Tools Lab

- [ ] **AITL-01**: Math Solver — type or photograph math problem, AI solves step-by-step with KaTeX rendering
- [ ] **AITL-02**: Code Debugger — paste broken code, AI identifies bugs and provides corrected code
- [ ] **AITL-03**: Language Translator — translate between 50+ languages with educational grammar mode
- [ ] **AITL-04**: YouTube Summarizer — paste URL or transcript, AI generates summary and study materials
- [ ] **AITL-05**: Book Scanner / OCR — take photo of textbook page (expo-camera), OCR extracts text
- [ ] **AITL-06**: Diagram Interpreter — upload photo of diagram, AI describes and explains
- [ ] **AITL-07**: OCR to LaTeX — photograph handwritten/printed math, AI converts to LaTeX
- [ ] **AITL-08**: Live Lecture Recorder — record audio (expo-audio), transcribe, AI generates summary + flashcards
- [ ] **AITL-09**: Common AIToolLayout — consistent layout with input area, generate button, output with markdown + math, PDF download dropdown, copy-to-clipboard, save-as-note

### Career Module

- [ ] **CARE-01**: Resume Builder with 10 templates (3 Free, 7 Plus, 10 Pro), live preview, AI summary generator, AI bullet improver
- [ ] **CARE-02**: Resume PDF export (Fast via expo-print, HD via react-native-view-shot + expo-print)
- [ ] **CARE-03**: Job Search via job-search edge function with location/role/experience filters
- [ ] **CARE-04**: Internship Matcher — AI matches user skills/availability to internships
- [ ] **CARE-05**: Real World Why — AI explains real-world careers and salaries for school topics
- [ ] **CARE-06**: Monthly job search quotas (Free: 5, Plus: 20, Pro: unlimited)

### Plan & Focus

- [ ] **PLAN-01**: Study Timetable — weekly calendar view with drag-and-drop study blocks, color-coded by course
- [ ] **PLAN-02**: Smart Scheduler — AI generates optimal study schedule based on subjects, exam date, available hours
- [ ] **PLAN-03**: Weakness Detector — analyzes quiz/exam history, identifies topics below 60% accuracy
- [ ] **PLAN-04**: Lo-Fi Radio — streaming lo-fi beats with 5+ stations via expo-av (free for all tiers)
- [ ] **PLAN-05**: Sleep Calculator — input wake-up time, calculates ideal bedtime based on 90-min sleep cycles
- [ ] **PLAN-06**: Progress Tracker — month-over-month XP growth, course completion, weekly XP target with chart

### Focus Mode & App Blocker

- [ ] **FOCS-01**: Pomodoro timer with start/pause/reset, integrated with Focus Mode app blocking
- [ ] **FOCS-02**: Native Android AccessibilityService module blocks selected apps during focus sessions
- [ ] **FOCS-03**: BootReceiver restores blocking state after device restart
- [ ] **FOCS-04**: Permissions setup flow guides user through granting Accessibility, Display Over Other Apps, and Notification permissions
- [ ] **FOCS-05**: App Selector lists installed apps on device, user checks apps to block (TikTok, Instagram, etc.)
- [ ] **FOCS-06**: Focus Mode Overlay — full-screen lock during active sessions with countdown timer and motivational quote
- [ ] **FOCS-07**: Emergency exit requires parental PIN if parental controls are enabled
- [ ] **FOCS-08**: Focus sessions logged to focus_sessions table with XP awards

### Chat

- [ ] **CHAT-01**: Direct messages with any friend via Supabase Realtime subscriptions
- [ ] **CHAT-02**: Group chats for study groups (Plus/Pro only for creation and access)
- [ ] **CHAT-03**: Media upload via expo-image-picker to Supabase Storage chat-media bucket with inline image preview
- [ ] **CHAT-04**: Message replies with clickable quoted preview that scrolls to original message
- [ ] **CHAT-05**: Real-time new message updates via Supabase Realtime without manual refresh
- [ ] **CHAT-06**: Read receipts via is_read boolean
- [ ] **CHAT-07**: AppState-aware reconnection — Realtime subscriptions reconnect when app returns to foreground

### Social Hub

- [ ] **SOCL-01**: Leaderboard — global ranking by total XP (all-time and weekly), top 100, user's rank highlighted, school filter
- [ ] **SOCL-02**: Study Challenges — time-limited community challenges with progress bars and XP rewards
- [ ] **SOCL-03**: Challenge a Friend — send quiz challenge, both take same quiz, winner gets bonus XP
- [ ] **SOCL-04**: Friends List — send requests by username, pending/accepted/blocked, view friend profile
- [ ] **SOCL-05**: Study Groups — create/join groups (max 10 Plus, 25 Pro), unique 6-char invite code, public/private
- [ ] **SOCL-06**: Group Detail — group chat, shared resources tab, members tab with roles
- [ ] **SOCL-07**: Peer Finder — discover students by school, grade, interests

### Store

- [ ] **STOR-01**: Educational resource cards with thumbnail, title, author, subject, grade, download count, tier badge
- [ ] **STOR-02**: Resource filters — search by title, filter by category/subject/grade level
- [ ] **STOR-03**: YouTube section with curated playlists and embedded video player (react-native-youtube-iframe)
- [ ] **STOR-04**: Tier-gated access — Free resources for all, Plus for Plus+Pro, Pro for Pro only
- [ ] **STOR-05**: Download tracking increments download_count, files saved via expo-file-system + expo-sharing

### Gamification

- [ ] **GAMF-01**: XP system — quiz answers, flashcard reviews, pomodoro sessions, daily challenge, streak milestones, achievements, friend challenges
- [ ] **GAMF-02**: Streak tracking — consecutive days with study activity, current and longest streak in profiles
- [ ] **GAMF-03**: Daily Challenges — 3 rotating tasks (quiz, flashcards, study time), 25 XP per challenge
- [ ] **GAMF-04**: Daily Quiz Challenge (Brain Boost) — 5 questions/day, 10 XP each, max 50 XP/day
- [ ] **GAMF-05**: Level calculation — every 1000 XP = 1 level, displayed on profile and leaderboard

### Achievements

- [ ] **ACHV-01**: 50+ achievements across 5 categories (Study Time, Streak, Social, Academic Mastery, Exam Prep)
- [ ] **ACHV-02**: Achievements computed from real-time database queries via useAchievements hook
- [ ] **ACHV-03**: New unlocks trigger celebration toast with XP reward
- [ ] **ACHV-04**: user_achievements table tracks which user unlocked which achievement and when

### Safety & Parental Controls

- [ ] **SAFE-01**: 4-digit PIN protection for parental control settings (hashed in profiles.parental_pin)
- [ ] **SAFE-02**: Daily time limit enforcement — full-screen blocking overlay when limit reached, override requires PIN
- [ ] **SAFE-03**: Content filter sanitizes AI prompts (profiles.content_filter_enabled)
- [ ] **SAFE-04**: Safe search filters store resources (profiles.safe_search_enabled)
- [ ] **SAFE-05**: Under-14 mode with extra restrictions (profiles.is_under_14)
- [ ] **SAFE-06**: Parent email for weekly progress reports (profiles.parent_email)
- [ ] **SAFE-07**: App blocker settings — configure blocked apps and schedule blocking times
- [ ] **SAFE-08**: Parent dashboard showing today's study time, activities, focus sessions, subjects, weekly trend chart, streaks, and achievements

### Subscription & Payments

- [ ] **PAYM-01**: Paystack WebView checkout opens in react-native-webview, intercepts redirect callback URL with reference
- [ ] **PAYM-02**: Payment verification via verify-payment edge function, updates subscription_tier and subscription_expires_at
- [ ] **PAYM-03**: Bank transfer + USSD support within Paystack WebView (critical for Nigerian market)
- [ ] **PAYM-04**: Subscription state sync — useSubscription hook auto-refreshes every 5 min, listens to subscription-updated events
- [ ] **PAYM-05**: Feature gating — FeatureGateDialog and UpgradePrompt shown when free user hits paywall
- [ ] **PAYM-06**: Kill switch — subscriptionConfig.ts ENABLED flag unlocks all features when false

### Profile & Settings

- [ ] **PROF-01**: Avatar upload via expo-image-picker to Supabase Storage avatars bucket
- [ ] **PROF-02**: Editable display name and unique username
- [ ] **PROF-03**: Stats display — total XP, level, current/longest streak, achievements count, member since
- [ ] **PROF-04**: Study preferences — persona selection, daily study target, notification preferences
- [ ] **PROF-05**: Subscription status badge with expiration date and manage subscription link
- [ ] **PROF-06**: Account actions — sign out, delete account with confirmation, privacy policy + terms links

### Offline Mode

- [ ] **OFFL-01**: expo-sqlite local database stores notes, flashcards, courses, and cached data for offline access
- [ ] **OFFL-02**: OfflineStatusBanner displays yellow banner when device is offline (via @react-native-community/netinfo)
- [ ] **OFFL-03**: OfflineSyncIndicator shows spinner when syncing queued mutations on reconnect
- [ ] **OFFL-04**: Offline-capable features: view cached notes, review flashcard decks, view course list, read summaries
- [ ] **OFFL-05**: Online-required features clearly indicate need for connection: AI generation, sending messages, payments, new exam questions

### PDF Export

- [ ] **PDFX-01**: Fast PDF export via expo-print (HTML → native PDF)
- [ ] **PDFX-02**: HD PDF export via react-native-view-shot (screenshot → image) + expo-print
- [ ] **PDFX-03**: KaTeX font bundling for math rendering in exported PDFs

### Navigation & Layout

- [ ] **NAVL-01**: Bottom navigation with 5 tabs (Home, Study, Exams, Social, Profile) via Expo Router tabs layout
- [ ] **NAVL-02**: AppLayout wraps authenticated routes with auth check and redirect
- [ ] **NAVL-03**: Deep linking for password reset magic links and shareable content URLs
- [ ] **NAVL-04**: Dark mode toggle (NativeWind + useColorScheme) matching web app behavior

### Testing & Quality

- [ ] **TEST-01**: Unit tests for business logic hooks (useAuth, useSubscription, SM-2 algorithm, XP calculation, streak logic)
- [ ] **TEST-02**: Integration tests for Supabase Auth flow (signup, login, logout, password reset)
- [ ] **TEST-03**: E2E tests for critical user journeys (onboarding → auth → dashboard → notes → AI tutor)
- [ ] **TEST-04**: Frontend API rate limiting prevents users from spamming AI and edge function calls

## v2 Requirements

### Native Enhancements

- **NHNC-01**: Push notifications via expo-notifications with FCM
- **NHNC-02**: Biometric authentication via expo-local-authentication
- **NHNC-03**: Android home screen widget via Expo Modules API
- **NHNC-04**: Typing indicators in chat via Supabase Realtime

### Platform Expansion

- **PLTF-01**: iOS build and TestFlight distribution
- **PLTF-02**: Multi-language UI (Yoruba, Igbo, Hausa, French)

### AI Improvements

- **AIMP-01**: On-device AI inference via ONNX Runtime React Native
- **AIMP-02**: FSRS algorithm replaces SM-2 for flashcard scheduling

## Out of Scope

| Feature | Reason |
|---------|--------|
| iOS build | Android-first constraint; defer to v1.1. Expo architecture makes it achievable without rework |
| Push notifications | New feature not in web app; violates "feature parity only" constraint |
| Biometric auth | New feature not in web app; can be added later without breaking existing auth |
| On-device AI (WebLLM → ONNX Runtime) | WebLLM is browser-only; ONNX Runtime RN is experimental; cloud AI is sufficient for v1 |
| Material Design redesign | Core value is pixel-perfect parity; redesigning 30+ pages breaks the "indistinguishable from web app" promise |
| Real-time sync overhaul | Scope creep; port existing sync logic faithfully, improve in v1.1 |
| Typing indicators in chat | v1.1 feature per web app roadmap; not in current web app |
| Multi-language UI | Massive scope expansion (30+ pages × multiple languages); defer to v1.3 |
| School admin/teacher accounts | New product vertical, not a conversion task |
| Android home screen widget | New feature; requires native Kotlin development beyond the conversion scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Pending |
| FND-07 | Phase 1 | Pending |
| FND-08 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| NAVL-01 | Phase 1 | Pending |
| NAVL-02 | Phase 1 | Pending |
| NAVL-03 | Phase 1 | Pending |
| NAVL-04 | Phase 1 | Pending |
| ONBD-01 | Phase 2 | Pending |
| ONBD-02 | Phase 2 | Pending |
| ONBD-03 | Phase 2 | Pending |
| DASH-09 | Phase 2 | Pending |
| OFFL-02 | Phase 2 | Pending |
| OFFL-03 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| DASH-06 | Phase 3 | Pending |
| DASH-07 | Phase 3 | Pending |
| DASH-08 | Phase 3 | Pending |
| NOTE-01 | Phase 3 | Pending |
| NOTE-02 | Phase 3 | Pending |
| NOTE-03 | Phase 3 | Pending |
| NOTE-04 | Phase 3 | Pending |
| NOTE-05 | Phase 3 | Pending |
| NOTE-06 | Phase 3 | Pending |
| NOTE-07 | Phase 3 | Pending |
| NOTE-08 | Phase 3 | Pending |
| NOTE-09 | Phase 3 | Pending |
| AITR-01 | Phase 3 | Pending |
| AITR-02 | Phase 3 | Pending |
| AITR-03 | Phase 3 | Pending |
| AITR-04 | Phase 3 | Pending |
| AITR-05 | Phase 3 | Pending |
| AITR-06 | Phase 3 | Pending |
| AITR-07 | Phase 3 | Pending |
| FLSH-01 | Phase 3 | Pending |
| FLSH-02 | Phase 3 | Pending |
| FLSH-03 | Phase 3 | Pending |
| FLSH-04 | Phase 3 | Pending |
| FLSH-05 | Phase 3 | Pending |
| FLSH-06 | Phase 3 | Pending |
| QUIZ-01 | Phase 3 | Pending |
| QUIZ-02 | Phase 3 | Pending |
| QUIZ-03 | Phase 3 | Pending |
| QUIZ-04 | Phase 3 | Pending |
| QUIZ-05 | Phase 3 | Pending |
| QUIZ-06 | Phase 3 | Pending |
| GAMF-01 | Phase 3 | Pending |
| GAMF-02 | Phase 3 | Pending |
| GAMF-03 | Phase 3 | Pending |
| GAMF-04 | Phase 3 | Pending |
| GAMF-05 | Phase 3 | Pending |
| PROF-01 | Phase 3 | Pending |
| PROF-02 | Phase 3 | Pending |
| PROF-03 | Phase 3 | Pending |
| PROF-04 | Phase 3 | Pending |
| PROF-05 | Phase 3 | Pending |
| PROF-06 | Phase 3 | Pending |
| PDFX-01 | Phase 3 | Pending |
| PDFX-02 | Phase 3 | Pending |
| PDFX-03 | Phase 3 | Pending |
| EXAM-01 | Phase 4 | Pending |
| EXAM-02 | Phase 4 | Pending |
| EXAM-03 | Phase 4 | Pending |
| EXAM-04 | Phase 4 | Pending |
| EXAM-05 | Phase 4 | Pending |
| EXAM-06 | Phase 4 | Pending |
| EXAM-07 | Phase 4 | Pending |
| EXAM-08 | Phase 4 | Pending |
| EXAM-09 | Phase 4 | Pending |
| EXAM-10 | Phase 4 | Pending |
| EXAM-11 | Phase 4 | Pending |
| STUD-01 | Phase 4 | Pending |
| STUD-02 | Phase 4 | Pending |
| STUD-03 | Phase 4 | Pending |
| STUD-04 | Phase 4 | Pending |
| STUD-05 | Phase 4 | Pending |
| STUD-06 | Phase 4 | Pending |
| STUD-07 | Phase 4 | Pending |
| STUD-08 | Phase 4 | Pending |
| STUD-09 | Phase 4 | Pending |
| STUD-10 | Phase 4 | Pending |
| STUD-11 | Phase 4 | Pending |
| STUD-12 | Phase 4 | Pending |
| AITL-01 | Phase 4 | Pending |
| AITL-02 | Phase 4 | Pending |
| AITL-03 | Phase 4 | Pending |
| AITL-04 | Phase 4 | Pending |
| AITL-05 | Phase 4 | Pending |
| AITL-06 | Phase 4 | Pending |
| AITL-07 | Phase 4 | Pending |
| AITL-08 | Phase 4 | Pending |
| AITL-09 | Phase 4 | Pending |
| CARE-01 | Phase 4 | Pending |
| CARE-02 | Phase 4 | Pending |
| CARE-03 | Phase 4 | Pending |
| CARE-04 | Phase 4 | Pending |
| CARE-05 | Phase 4 | Pending |
| CARE-06 | Phase 4 | Pending |
| PLAN-01 | Phase 4 | Pending |
| PLAN-02 | Phase 4 | Pending |
| PLAN-03 | Phase 4 | Pending |
| PLAN-04 | Phase 4 | Pending |
| PLAN-05 | Phase 4 | Pending |
| PLAN-06 | Phase 4 | Pending |
| CHAT-01 | Phase 5 | Pending |
| CHAT-02 | Phase 5 | Pending |
| CHAT-03 | Phase 5 | Pending |
| CHAT-04 | Phase 5 | Pending |
| CHAT-05 | Phase 5 | Pending |
| CHAT-06 | Phase 5 | Pending |
| CHAT-07 | Phase 5 | Pending |
| SOCL-01 | Phase 5 | Pending |
| SOCL-02 | Phase 5 | Pending |
| SOCL-03 | Phase 5 | Pending |
| SOCL-04 | Phase 5 | Pending |
| SOCL-05 | Phase 5 | Pending |
| SOCL-06 | Phase 5 | Pending |
| SOCL-07 | Phase 5 | Pending |
| STOR-01 | Phase 5 | Pending |
| STOR-02 | Phase 5 | Pending |
| STOR-03 | Phase 5 | Pending |
| STOR-04 | Phase 5 | Pending |
| STOR-05 | Phase 5 | Pending |
| ACHV-01 | Phase 5 | Pending |
| ACHV-02 | Phase 5 | Pending |
| ACHV-03 | Phase 5 | Pending |
| ACHV-04 | Phase 5 | Pending |
| FOCS-01 | Phase 6 | Pending |
| FOCS-02 | Phase 6 | Pending |
| FOCS-03 | Phase 6 | Pending |
| FOCS-04 | Phase 6 | Pending |
| FOCS-05 | Phase 6 | Pending |
| FOCS-06 | Phase 6 | Pending |
| FOCS-07 | Phase 6 | Pending |
| FOCS-08 | Phase 6 | Pending |
| PAYM-01 | Phase 6 | Pending |
| PAYM-02 | Phase 6 | Pending |
| PAYM-03 | Phase 6 | Pending |
| PAYM-04 | Phase 6 | Pending |
| PAYM-05 | Phase 6 | Pending |
| PAYM-06 | Phase 6 | Pending |
| SAFE-01 | Phase 6 | Pending |
| SAFE-02 | Phase 6 | Pending |
| SAFE-03 | Phase 6 | Pending |
| SAFE-04 | Phase 6 | Pending |
| SAFE-05 | Phase 6 | Pending |
| SAFE-06 | Phase 6 | Pending |
| SAFE-07 | Phase 6 | Pending |
| SAFE-08 | Phase 6 | Pending |
| OFFL-01 | Phase 7 | Pending |
| OFFL-04 | Phase 7 | Pending |
| OFFL-05 | Phase 7 | Pending |
| TEST-01 | Phase 7 | Pending |
| TEST-02 | Phase 7 | Pending |
| TEST-03 | Phase 7 | Pending |
| TEST-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 100 total
- Mapped to phases: 100
- Unmapped: 0

---
*Requirements defined: 2026-05-05*
*Last updated: 2026-05-05 after roadmap creation*
