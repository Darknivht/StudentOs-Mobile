# Architecture

**Analysis Date:** 2026-04-25

## Pattern Overview

**Overall:** React Single Page Application with Client-Side Routing

**Key Characteristics:**
- Component-based architecture with feature-scoped directories
- Context API for global state (Auth, Offline AI)
- React Query for server state and caching
- Supabase as backend-as-a-service for authentication and database
- shadcn/ui component library built on Radix UI primitives
- PWA support with service workers for offline functionality

## Layers

**Page Layer:**
- Purpose: Top-level route components that define screen content
- Location: `src/pages/`
- Contains: 28 page components (Dashboard.tsx, Study.tsx, Flashcards.tsx, etc.)
- Depends on: Feature components, layout components
- Used by: React Router in App.tsx

**Feature Components Layer:**
- Purpose: Business logic and feature-specific UI components
- Location: `src/components/[feature-name]/` (e.g., `src/components/dashboard/`, `src/components/notes/`)
- Contains: Feature-specific components (CourseCard.tsx, NoteCard.tsx, etc.)
- Depends on: UI components, hooks, lib utilities
- Used by: Page components

**UI Components Layer:**
- Purpose: Reusable, design-system compliant base components
- Location: `src/components/ui/`
- Contains: 45+ shadcn/ui components (button.tsx, card.tsx, dialog.tsx, etc.)
- Depends on: Radix UI primitives, Tailwind CSS
- Used by: Feature components, page components

**Layout Components:**
- Purpose: Application shell and navigation structure
- Location: `src/components/layout/`
- Contains: AppLayout.tsx, BottomNav.tsx
- Provides: Consistent app wrapper, navigation bar, routing context

**Hooks Layer:**
- Purpose: Reusable stateful logic and side effects
- Location: `src/hooks/`
- Contains: 19 custom hooks (useAuth.tsx, useCourseProgress.ts, useFocusMode.ts, etc.)
- Depends on: React hooks, integrations
- Used by: Components, pages

**Integrations Layer:**
- Purpose: External service clients and API wrappers
- Location: `src/integrations/`
- Contains: Supabase client configuration
- Provides: Database access, authentication, real-time subscriptions

**Utilities Layer:**
- Purpose: Pure functions and helper utilities
- Location: `src/lib/`
- Contains: ai.ts, formatters.ts, utils.ts, offlineSync.ts, etc.
- Provides: Formatting, AI processing, offline sync logic

## Data Flow

**Authentication Flow:**

1. App initializes → AuthProvider restores session from localStorage via Supabase
2. User credentials stored in Supabase Auth (email/password)
3. User state managed via `useAuth()` hook (AuthContext)
4. Protected routes check `user` from useAuth before rendering
5. Blocked users automatically signed out on app load

**Route → Page Data Flow:**

1. User navigates to route (e.g., /study)
2. React Router matches route to Page component
3. Page component wraps in AppLayout (provides navigation)
4. Page uses custom hooks to fetch data (e.g., useCourseProgress)
5. Hook queries Supabase via React Query
6. Data rendered via feature components

**Offline Data Flow:**

1. OfflineAIContext detects offline state
2. useOfflineData hook loads cached data from IndexedDB
3. OfflineSync hook queues mutations for later sync
4. When online, mutations replayed to Supabase

## State Management

**Global State:**
- AuthContext: User, session, auth methods (via React Context)
- OfflineAIContext: Offline mode, AI processing queue
- ThemeContext: Dark/light theme preference (via next-themes)

**Server State:**
- React Query: Cached server data, loading states, refetching
- Supabase: Persistent database, auth sessions

**Local State:**
- React useState: Component-specific state
- localStorage: Theme preference, onboarding seen flag, auth tokens

## Routing Structure

**Primary Routes (App.tsx):**

| Route | Page | Layout |
|-------|------|--------|
| `/` | HomeRoute (conditional) | None/AppLayout |
| `/auth` | Auth | None |
| `/course/:courseId` | CoursePage | AppLayout |
| `/study` | Study | AppLayout |
| `/notes` | SmartNotes | AppLayout |
| `/tutor` | AITutor | AppLayout |
| `/flashcards` | Flashcards | AppLayout |
| `/quizzes` | Quizzes | AppLayout |
| `/focus` | Focus | AppLayout |
| `/achievements` | Achievements | AppLayout |
| `/plan` | Plan | AppLayout |
| `/social` | Social | AppLayout |
| `/career` | Career | AppLayout |
| `/safety` | Safety | AppLayout |
| `/profile` | Profile | AppLayout |
| `/upgrade` | Upgrade | AppLayout |
| `/chat` | Chat | AppLayout |
| `/group/:groupId` | GroupChat | AppLayout |
| `/focus-session` | FocusSession | AppLayout |
| `/store` | Store | AppLayout |
| `/exams` | ExamPrep | AppLayout |
| `/docs/*` | Docs* | DocsLayout |
| `/install` | Install | None |

**Conditional Routes:**
- If no user → Onboarding or Auth
- If user → Dashboard inside AppLayout

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Page load
- Responsibilities: Render App into #root, load CSS

**Router Entry:**
- Location: `src/App.tsx`
- Triggers: App render
- Responsibilities: Configure providers, define routes, handle auth routing

**Authentication Entry:**
- Location: `src/hooks/useAuth.tsx`
- Triggers: App initialization, sign in/sign up
- Responsibilities: Manage user session, provide auth context

## Key Architectural Decisions

**1. Supabase for Backend**
- Rationale: Fast development, built-in auth, real-time, offline support
- Trade-offs: Vendor lock-in, limited customization

**2. Client-Side Routing**
- Rationale: SPA experience, no page reloads, PWA support
- Trade-offs: No SSR by default, SEO limitations (mitigated via routing)

**3. shadcn/ui Components**
- Rationale: Accessible, customizable, Tailwind-based
- Trade-offs: Larger bundle, requires manual updates

**4. React Query for Server State**
- Rationale: Caching, optimistic updates, background refetch
- Trade-offs: Learning curve, additional complexity

**5. Feature-First Component Organization**
- Rationale: Co-located components with related features
- Trade-offs: Initial discovery harder, but logical grouping

## Cross-Cutting Concerns

**Authentication:**
- Supabase Auth with email/password
- useAuth hook provides signUp, signIn, signOut methods
- Blocked user check on every auth state change

**Error Handling:**
- ErrorBoundary at app root for crash recovery
- Toast notifications for user feedback (use-toast hook)

**Offline Support:**
- PWAUpdateBanner for service worker updates
- OfflineStatusBanner for connectivity status
- IndexedDB for offline data persistence
- ResilientFetch for network error handling

**Theme:**
- next-themes for dark/light mode
- Persisted in localStorage
- Tailwind CSS for styling

---

*Architecture analysis: 2026-04-25*