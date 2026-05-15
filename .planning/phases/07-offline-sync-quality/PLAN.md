# Phase 7: Offline Sync, Polish & Quality

## Overview
Core features work reliably offline with structured local storage and sync-on-reconnect. The app runs smoothly on 2GB Android 8+ devices, and critical user journeys have automated test coverage.

## Completed Discussions

See [DISCUSS.md](discuss/DISCUSS.md) for the full discuss-phase.

**Key decisions:**
- **Offline data:** Notes, flashcards, courses, AI summaries cached in expo-sqlite. Online features show offline indicators.
- **Sync strategy:** Read-only from server (first/last), write via sync_queue with conflict resolution (last_write_wins + resolution flag)
- **2GB optimization:** Lazy loading, code splitting, FlatList, useMemo, reduced animations
- **Testing:** Jest + testing-library (unit), Supabase Auth integration, Detox/maestro (E2E)
- **Quality:** ESLint + Prettier, TypeScript strict, pre-commit hooks, performance budgets

## Plans

### Plan 07-01: expo-sqlite Offline Schema & Migrations
**Requirements OFFL-01** — Offline data storage
**DATABASE:**
- `services/sqlite.ts` — expo-sqlite connection + migration system
- Tables: `notes`, `flashcard_decks`, `flashcard_cards`, `courses`, `ai_summaries`, `sync_queue`, `sync_state`

**MIGRATIONS:**
| Version | Changes |
|---------|---------|
| V1.0 | Initial: notes, flashcard_decks, flashcard_cards, courses, sync_queue, sync_state |
| V1.1 | Add `ai_summaries` table, `last_modified` to notes, `next_review_at` to flashcards |
| V1.2 | Add `conflict_strategy` field to sync_queue |

**SCHEMA:**
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  course_id TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Plan 07-02: Offline Sync Hooks
**Requirements OFFL-04, OFFL-05** — Online indicators, sync-on-reconnect
**HOOKS:**
- `hooks/useOffline.ts` — `isOnline`, `isOffline`, retry logic, sync-on-reconnect
- `hooks/useNotesOffline.ts` — CRUD notes from local DB, sync to Supabase
- `hooks/useFlashcardsOffline.ts` — CRUD flashcards from local DB, sync to Supabase, SM-2 review
- `hooks/useCoursesOffline.ts` — CRUD courses from local DB, sync to Supabase
- `hooks/useAISummariesOffline.ts` — Read AI summaries from local DB

**UI:**
- `components/OfflineIndicator.tsx` — Top bar, shows offline state + sync status
- `components/SyncQueueBadge.tsx` — Badge on App tab/bottom sheet showing pending syncs

### Plan 07-03: 2GB RAM Optimization
**Requirements (from Phase 7 success criteria)**

**OPTIMIZATIONS:**
- Lazy loading: All heavy routes (Study/Exams/Social) use `React.lazy` + `Suspense`
- Code splitting: Separate bundles for AI features, charts, store
- FlatList: All lists > 20 items use FlatList with `onEndReached`
- `useMemo`/`useCallback`: Memoize expensive computations (XP calc, streak, leaderboard)
- Reduced animations: Lower spring tension on Reanimated 3 for <2GB devices
- expo-image: Use `placeholder` for lazy loading images

**CONFIGURATION:**
- `metro.config.js` — Tree shaking, minification
- `app.json` — Bundle size, memory limits
- `.env` — `DISABLE_REANIMATED` for low-end

### Plan 07-04: Critical Tests
**Requirements TEST-01, TEST-02, TEST-03** — Unit, integration, E2E tests

**SETUP:**
- `jest.config.js` + `testing-library/react-native`
- `tests/` directory with unit/integration/e2e subdirs

**TESTS:**
| Category | Test |
|----------|------|
| **Unit** | useAuth — login, logout, session persistence |
| **Unit** | useSubscription — gateFeature, checkLimit, incrementUsage |
| **Unit** | useFlashcards — SM-2 algorithm (interval, repetition, easiness) |
| **Unit** | useXP — award XP, check next level |
| **Unit** | useStreak — streak tracking, daily reset, longest streak |
| **Integration** | Auth flow: login → fetch user → logout, tokens cleared |
| **Integration** | Create note → sync to Supabase → query from DB |
| **Integration** | Mark flashcard as correct/incorrect → repeat after interval |
| **E2E** | Journey: Onboarding → Login → Home → Create note → Quiz |
| **E2E** | Journey: Study → Flashcard deck → Review → Streak |

### Plan 07-05: Quality Pass
**Requirements TEST-04, OPT-01, OPT-02, OPT-03** — Rate limiting, lint, typecheck, performance

**RATE LIMITING:**
- `lib/rateLimiter.ts` — Token bucket algorithm (5 req/min, burst 10)
- Applied to: AI calls, edge functions, quiz submissions, flashcard reviews

**LINT/TYPING:**
- `eslint.config.mjs` — TypeScript + React + Prettier + Import/Export rules
- `tsconfig.json` — Strict mode, path aliases
- Pre-commit: Husky + lint-staged (on pre-existing files only)

**PERFORMANCE:**
- Memory profiling: Flipper (`react-native-flipper`)
- Bundle size: Analyzed with `react-native-bundle-visualizer`
- Target: APK < 60MB, JS bundle < 10MB, memory < 150MB
- CI/CD: GitHub Actions on PR (lint, typecheck, unit tests, E2E on Android emulator)

## Success Criteria
1. **OFFL-01** — Notes, flashcards, courses, AI summaries cached locally in SQLite
2. **OFFL-04** — Online features show "Offline" indicator with retry button
3. **OFFL-05** — Queued mutations sync on reconnect with conflict handling (server wins by default)
4. **TEST-01..04** — All unit/integration/E2E tests pass, rate limiting active
5. **OPT-01..03** — APK < 60MB, JS bundle < 10MB, memory < 150MB, lazy loaded features, FlatList everywhere
6. **Quality** — ESLint + Prettier pass, TypeScript strict, pre-commit hooks, CI/CD on PR for tiers
