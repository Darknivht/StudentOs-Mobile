# Phase 7 - Offline Sync, Polish & Quality

## Discussion

**Objective:** Ensure the app works reliably offline, runs smoothly on budget 2GB RAM Android 8+ devices, and has automated tests covering critical user journeys.

**Status:** Phase 7 NOT YET started.

---

### Success Criteria (from ROADMAP.md):
1. Student can view cached notes, review flashcard decks, view course list, and read AI summaries while offline — all stored in expo-sqlite local database
2. When device goes offline, online-required features (AI generation, sending messages, payments, new exam questions) clearly indicate that a connection is needed; when reconnected, queued mutations sync automatically
3. Unit tests cover business logic hooks (useAuth, useSubscription, SM-2 algorithm, XP calculation, streak logic); integration tests cover Supabase Auth flow; E2E tests cover critical user journeys
4. Frontend API rate limiting prevents users from spamming AI and edge function calls
5. App runs smoothly on 2GB RAM Android 8+ devices with optimized bundle size, code splitting, and lazy loading

---

### Technical Decisions Needed:

#### 1. Offline Data Storage - What to Cache?
**Concern:** Not everything should be cached. We need a strategy for what stores locally vs not.
**Decision:**

**STORED LOCALLY (expo-sqlite):**
- Notes (title, body, course_id, last_modified)
- Flashcard decks & cards (front, back, sm2_interval, sm2_repetition, sm2_easiness, next_review_at)
- Courses (name, color, icon, progress)
- AI summaries (note_id, summary_text, model_used, created_at)
- User preferences, cached versions of resource metadata (not files)
- Sync state (last_sync_at, sync_queue)

**NOT STORED LOCALLY (always online):**
- Realtime chat messages (already stored in Supabase, too large for local)
- Payment transactions
- Exam questions (can be fetched on demand)
- Store resource files (metadata only cached)

#### 2. Sync Strategy - When and How?
**Concern:** How do we handle conflicts? What if user edits a note offline, goes back online, and the Supabase version was updated?
**Decision:**

**Read-only sync (from server):**
- Sync new notes, flashcards, courses from Supabase on app launch + every 30 min
- Fetch only changed records (WHERE last_modified > last_sync_at)

**Write sync (to server):**
- All mutations create a `sync_queue` row with `{table, operation, payload, conflict_strategy}`
- On reconnect: process sync_queue in order, merge conflicts with `last_write_wins` + conflict resolution flag
- `conflict_resolution`: `server_wins` (default), `client_wins`, `prompt`

#### 3. 2GB RAM Optimization - What to Optimize?
**Concern:** Our app needs to work on budget 2GB devices running Android 8+.
**Decision:**

**Benchmarks:**
- APK size < 60MB (debug) / < 40MB (release) ✅ (currently ~34MB)
- JS bundle < 10MB ✅ (currently 9.34MB)
- Memory footprint < 150MB (RN default is ~100-120MB)
- Cold start < 3 seconds on 2GB device

**Optimizations:**
- Code splitting: Lazy load heavy features (Study/Exams/etc) with React.lazy() + Suspense
- Lazy load images with expo-image placeholder
- FlatList everywhere for lists > 20 items
- Use `useMemo`/`useCallback` on heavy computations (XP, streak)
- Reduce Reanimated 3 spring animations on low-end
- Background task (expo-background-task) for sync, NOT for expensive computations

#### 4. Testing - What to Test?
**Concern:** Testing hooks with Supabase dependency is tricky.
**Decision:**
- **Unit tests:** Jest + testing-library/react-native (hooks with mocked Supabase)
- **Integration tests:** Supabase Auth flow (login → fetch user → logout)
- **E2E tests:** Detox or maestro (critical journeys: login → onboarding → create note → take quiz)

#### 5. Quality - Lint, Typecheck, Performance Budgets
**Decision:**
- ESLint (Flat Config) + Prettier for formatting
- TypeScript strict mode enabled
- Pre-commit hooks (Husky) for lint/typecheck (not commit hooks to avoid delays)
- Build size budget: max 10MB JS bundle, APK < 60MB
- Performance: React Profiler for render optimization

---

### Summary:
- [ ] **OFFL-01** - Notes, flashcards, courses, AI summaries cached in expo-sqlite
- [ ] **OFFL-04** - Online features show offline indicator
- [ ] **OFFL-05** - Sync-on-reconnect with conflict resolution
- [ ] **TEST-01** - Unit tests for business logic hooks
- [ ] **TEST-02** - Integration tests for Supabase Auth
- [ ] **TEST-03** - E2E tests for critical journeys
- [ ] **TEST-04** - Frontend API rate limiting
- [ ] **OPT-01** - Lazy loading, code splitting, FlatList
- [ ] **OPT-02** - APK < 60MB, JS bundle < 10MB, memory < 150MB
- [ ] **OPT-03** - Pre-commit lint/typecheck, performance monitoring
