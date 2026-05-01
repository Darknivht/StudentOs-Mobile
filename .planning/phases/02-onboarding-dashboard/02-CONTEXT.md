# Phase 2: Onboarding & Dashboard - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 implements the first-time user experience (7-step onboarding) and the main dashboard home screen with study progress visualization. This is the user's first impression after authentication.

**This phase delivers:**

- 7-step onboarding flow with unique gradient backgrounds and floating particle animations per step
- Onboarding state persistence (returning users skip directly to dashboard)
- Dashboard home screen with time-aware greeting and display name
- Streak card with current streak, longest streak, and flame animation
- Daily Brain Boost challenge (5 questions, 10 XP each, once per day)
- Study time widget (today's minutes, daily target progress bar, weekly trend)
- Study progress widget (notes created, quizzes completed, flashcards reviewed, focus minutes)
- Announcement banner (info/warning/success types, RLS-filtered from database)
- Offline status banner (yellow indicator when device is offline)
- Courses grid with progress cards (color accent, emoji, progress percentage)

</domain>

<decisions>
## Implementation Decisions

### Onboarding Flow (D-01)

- 7 steps: Welcome, AI Learning, Spaced Repetition, Focus Tools, Growth Tracking, Social, Ready
- Each step has a unique gradient background and floating particle animation
- Horizontal swipe or "Next" button to advance
- "Skip" option available on any step
- On completion, set onboardingSeen = true in appStore (MMKV-persisted)

### Onboarding State Persistence (D-02)

- appStore.onboardingSeen (boolean, already scaffolded in Phase 0) controls skip behavior
- RootNavigator checks onboardingSeen after auth — if false, show OnboardingScreen; if true, show MainNavigator
- Onboarding only shows once per device (MMKV persists across app restarts)

### Onboarding Animations (D-03)

- Use react-native-reanimated v4 (already installed in Phase 0) for all onboarding animations
- Floating particle effect: small circles/dots with randomized paths using Reanimated shared values
- Each step uses a different gradient pair (e.g., purple-blue, teal-green, orange-red, etc.)
- Page transitions use shared element or fade-through animations
- Particle animations loop continuously while the step is visible

### Dashboard Greeting (D-04)

- Time-aware greeting from getGreeting() utility (already exists in src/lib/utils.ts)
- Display name from authStore.user.displayName (already in AuthUser type)
- Greeting section at top of dashboard with avatar (or initials) and name

### Streak Card (D-05)

- Fetch streak data from Supabase profiles table (current_streak, longest_streak columns)
- Flame animation using react-native-reanimated — flame grows brighter with streak length
- Display "Current: X days" and "Best: Y days"
- If no streak, show encouragement message ("Start your streak today!")

### Daily Brain Boost (D-06)

- 5-question mini-quiz fetched from Supabase (random selection from question bank or AI-generated)
- 10 XP per correct answer (50 XP max per day)
- Once per day tracking (brain_boost_completed_at in profiles table)
- After completion, show score and XP earned
- If already completed today, show "Come back tomorrow!" with countdown

### Study Time Widget (D-07)

- Today's study minutes from study_sessions table (sum of today's sessions)
- Daily target from appStore.dailyStudyTarget (default: 60 minutes)
- Progress bar showing percentage of daily target
- Weekly trend: last 7 days of study minutes as a mini bar chart or sparkline

### Study Progress Widget (D-08)

- Aggregated counts from Supabase: notes created, quizzes completed, flashcards reviewed, focus minutes
- These are "today" counts for at-a-glance daily activity
- Cards with icons and numbers

### Announcement Banner (D-09)

- Fetch active announcements from Supabase announcements table
- RLS-filtered (user sees only announcements relevant to their tier/region)
- Banner types: info (blue), warning (amber), success (green)
- Dismissible (hide for session) but re-appears on next app open if still active
- Positioned below greeting, above dashboard content

### Offline Status Banner (D-10)

- Yellow banner appears when NetInfo detects no internet connection
- Text: "You're offline — some features may be limited"
- Auto-hides when connection restored
- Uses @react-native-community/netinfo for detection

### Courses Grid (D-11)

- Fetch courses from WatermelonDB (local-first) + Supabase fallback
- Course cards show: color accent (left border or background tint), emoji, title, progress percentage
- Progress = weighted: Notes 30%, Quizzes 30%, Flashcards 40%
- FlatList with 2 columns for phone, 3 for tablet
- "Add Course" card at the end (navigates to course creation, implemented in Phase 3)
- Tap course card navigates to CourseDetail (placeholder for now)

### the agent's Discretion

- Specific gradient color pairs for each onboarding step (choose visually distinct, appealing gradients)
- Particle animation exact parameters (count, size, speed, opacity ranges)
- Dashboard layout order of widgets (greeting → announcements → streak → brain boost → study time → study progress → courses is recommended)
- Exact styling of dashboard cards (rounded corners, shadows, padding values)
- Empty state messages for widgets when no data exists yet

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context

- `.planning/PROJECT.md` — Project vision, constraints
- `.planning/ROADMAP.md` §§94-117 — Phase 2 detailed requirements
- `.planning/REQUIREMENTS.md` — ONBOARD-01 through ONBOARD-03, DASH-01 through DASH-09

### Research Insights

- `.planning/research/PITFALLS.md` — General pitfalls to avoid
- `.planning/research/STACK.md` — react-native-reanimated, react-native-mmkv

### Prior Phase Outputs (MUST READ)

- `.planning/phases/00-foundation/00-01-SUMMARY.md` — Navigation structure, screen placeholders
- `.planning/phases/00-foundation/00-02-SUMMARY.md` — Zustand stores, theme system, utilities
- `.planning/phases/00-foundation/00-03-SUMMARY.md` — WatermelonDB schema, Supabase client
- `.planning/phases/01-auth-security/01-CONTEXT.md` — Auth flow, session, biometric decisions

### Existing Code (consumed by this phase)

- `src/stores/authStore.ts` — Auth state with user, isAuthenticated, signOut
- `src/stores/appStore.ts` — onboardingSeen flag, dailyStudyTarget
- `src/lib/theme.ts` — Design tokens (colors, spacing, typography)
- `src/lib/utils.ts` — getGreeting(), formatTime(), formatDate()
- `src/lib/constants.ts` — Subscription tiers, navigation tabs
- `src/types/auth.ts` — AuthUser, SubscriptionTier types
- `src/navigation/RootNavigator.tsx` — Auth/Main switch (needs onboarding check)
- `src/navigation/MainNavigator.tsx` — Bottom tabs (HomeScreen needs replacement)
- `src/screens/HomeScreen.tsx` — Placeholder (will be replaced with Dashboard)
- `src/database/schema.ts` — WatermelonDB schema with courses table
- `src/services/supabase/client.ts` — Supabase client singleton

</canonical_refs>

<specifics>
## Specific Ideas

### Onboarding Step Content

1. **Welcome**: "Welcome to StudentOS!" — Gradient: purple-to-blue. Particles: floating circles.
2. **AI Learning**: "Your AI-powered study companion" — Gradient: teal-to-cyan. Particles: sparkle shapes.
3. **Spaced Repetition**: "Never forget what you learn" — Gradient: green-to-emerald. Particles: card-flip shapes.
4. **Focus Tools**: "Stay focused, study smarter" — Gradient: orange-to-amber. Particles: clock ticks.
5. **Growth Tracking**: "Watch your progress grow" — Gradient: pink-to-rose. Particles: upward arrows.
6. **Social**: "Learn together, grow together" — Gradient: indigo-to-violet. Particles: connecting dots.
7. **Ready**: "Let's begin your journey!" — Gradient: purple-to-pink. Particles: confetti.

### Dashboard Layout (Top to Bottom)

1. Greeting bar (avatar + "Good morning, Chidi" + notification bell)
2. Announcement banner (if any active)
3. Offline status banner (if offline)
4. Streak card (horizontal, flame animation, current/best)
5. Daily Brain Boost card (interactive, shows if not completed today)
6. Row: Study Time | Study Progress (two cards side by side)
7. Courses section header + "See All" link
8. Courses grid (2-column FlatList)

### Course Card Design

- Rounded card with left color accent bar (4px wide, course color)
- Course emoji (32px) + title (bold)
- Progress bar (thin, colored by course color)
- "X% complete" text below progress bar

</specifics>

<deferred>
## Deferred Ideas

- Course creation flow (Phase 3: Smart Notes)
- Course detail screen with full notes/quizzes/flashcards (Phase 3+)
- Leaderboard integration in dashboard (Phase 13: Social Hub)
- Achievement toasts in dashboard (Phase 16: Gamification)
- XP progress bar in dashboard header (Phase 16: Gamification)
- Notification bell functionality (Phase 22: Notifications)
- Tablet-specific 3-column layout optimization (Phase 25: Continuous Improvement)
- Deep link to specific dashboard sections (Phase 24: Advanced Features)

</deferred>

---

_Phase: 02-onboarding-dashboard_
_Context gathered: 2026-04-29_
