# Phase 0: Foundation - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 0 establishes the technical foundation for the entire StudentOS Mobile app. All 24 subsequent phases depend on the infrastructure created here.

**This phase delivers:**
- Expo SDK 54 + Dev Client project setup
- React Navigation v7 (bottom tabs + stack)
- Zustand stores for global state
- WatermelonDB offline-first database
- API service layer with factory pattern for AI and payment providers
- Supabase client (auth, database, storage, realtime)
- Theme system with dark/light mode and design tokens

</domain>

<decisions>
## Implementation Decisions

### Core Technology Stack (Already Specified)
- **D-01:** Expo SDK 54 with Dev Client — for native module support
- **D-02:** TypeScript throughout
- **D-03:** React Navigation v7 (Bottom tabs + Stack)

### State Management (Already Specified)
- **D-04:** Zustand v5 for transient UI state (auth, subscription, UI)
- **D-05:** WatermelonDB for persistent offline data

### Data Models (Already Specified)
- **D-06:** WatermelonDB models: courses, notes, flashcards, quizzes, exam_attempts, users, sync_state

### API Layer (Already Specified)
- **D-07:** Factory pattern for AI providers via env vars (AI_PROVIDER, AI_BASE_URL, AI_API_KEY, AI_MODEL)
- **D-08:** Factory pattern for payment providers via env vars (PAYMENT_PROVIDER, PAYMENT_PUBLIC_KEY)
- **D-09:** Supabase client configured with: auth, database, storage, realtime

### Theme System (Already Specified)
- **D-10:** Dark/light mode with design tokens
- **D-11:** Consistent spacing and typography

### Project Structure (Agent's Discretion)
- Standard React Native + Expo folder organization:
  - `src/components/` — UI components
  - `src/hooks/` — Custom React hooks
  - `src/lib/` — Utilities and services
  - `src/screens/` — Screen components
  - `src/navigation/` — Navigation config
  - `src/database/` — WatermelonDB models
  - `src/stores/` — Zustand stores
  - `src/types/` — TypeScript types

### Navigation Tabs (Agent's Discretion)
- Standard mobile tab layout: Home/Dashboard, Study, Focus, Profile
- Stack navigation for detail screens within each tab

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, core value, constraints
- `.planning/ROADMAP.md` §§46-67 — Phase 0 detailed requirements
- `.planning/REQUIREMENTS.md` — All FOUND-* requirements

### Research Insights
- `.planning/research/STACK.md` — Recommended tech stack with versions
- `.planning/research/ARCHITECTURE.md` — Architecture patterns (offline-first, factory, four-layer)
- `.planning/research/PITFALLS.md` — Critical pitfalls to avoid:
  - PITFALL-01: Credentials in AsyncStorage (must use expo-secure-store)
  - PITFALL-02: Concurrent sync race (implement sync lock)
  - PITFALL-03: API keys in client (route through backend proxy)

### Codebase Patterns
- `.planning/codebase/CONVENTIONS.md` — Coding standards
- `.planning/codebase/STRUCTURE.md` — Existing code organization

[If no external specs: No external specs — requirements fully captured in decisions above]

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — this is the foundational phase creating new project

### Established Patterns
- From research: Four-layer architecture (UI → Business Logic → Data → Integration)
- Factory pattern for provider abstraction
- Offline-first with WatermelonDB sync engine

### Integration Points
- Supabase backend (existing web app backend to be reused)
- Environment variables for all provider configuration

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches aligned with the tech stack specified in research.

**Key implementation notes from research:**
- Start on Expo SDK 54 (not 55) for New Architecture stability
- Use react-native-mmkv v4 for secure storage (30-100x faster than AsyncStorage)
- Use react-native-gifted-charts for charts (Expo Go compatible)
- Test WatermelonDB expo plugin with SDK 54 before native builds

</specifics>

<deferred>
## Deferred Ideas

None — Phase 0 is purely foundational infrastructure.

</deferred>

---

*Phase: 00-foundation*
*Context gathered: 2026-04-25*