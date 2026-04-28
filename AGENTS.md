<!-- GSD:project-start source:PROJECT.md -->
## Project

**StudentOS Mobile**

A production-grade mobile learning OS for students, rebuilt from scratch with React Native + Expo. This is the mobile counterpart to the existing StudentOS web app (studentoss/), bringing all 32+ features to native iOS/Android with improved security, offline capability, mobile-native integrations, and polished touch-first UX. The mobile version is not a wrapper — it's a first-class native application that can optionally operate independently from the web backend.

**Core Value:** A student's complete learning operating system that works everywhere — on the go, offline, with focus enforcement, biometric security, and every feature the web app has — built to production grade.

### Constraints

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
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.8.3 - Type-safe frontend development
- JavaScript (ES2020) - React components and runtime
## Runtime
- Node.js (via Vite dev server)
- Package Manager: Bun (bun.lock present)
- Vite 5.4.19
## Frontend Framework
- React 18.3.1 - UI library
- React Router DOM 6.30.1 - Client-side routing
- `vite.config.ts` - Vite configuration with PWA and path aliases
- `tsconfig.json` - TypeScript with path mapping `@/*` → `./src/*`
## UI Component Library
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- shadcn/ui pattern via Radix UI primitives
- Custom theme in `tailwind.config.ts` with dark mode support
- Dialog, Dropdown Menu, Select, Toast, Tooltip
- Navigation Menu, Tabs, Accordion, Scroll Area
- Switch, Checkbox, Radio Group, Slider
- Avatar, Progress, Separator, Alert Dialog
- Framer Motion 12.23.26 - Animations
- Lucide React 0.462.0 - Icons
- Sonner 1.7.4 - Toast notifications
- Embla Carousel 8.6.0 - Carousels
- React Resizable Panels 2.1.9 - Panel layouts
- Vaul 0.9.9 - Drawer component
- React Hook Form 7.61.1 - Form management
- Zod 3.25.76 - Schema validation
- @hookform/resolvers 3.10.0 - Zod integration
## State Management
- TanStack Query (React Query) 5.83.0 - Server state
- React local state (useState, useCallback) - Component state
- Supabase real-time subscriptions - Live data sync
- Path alias: `@/*` → `./src/*` in `tsconfig.json`
## Backend Services
- Supabase 2.89.0 - PostgreSQL + Auth + Edge Functions
- profiles, courses, notes, flashcards
- chat_messages, quiz_attempts, exam_*
- study_groups, achievements, study_sessions
- weekly_xp, focus_sessions, pomodoro_sessions
- peer_challenges, store_resources
- `ai-study` - AI study assistant with 24+ modes
- `verify-payment` - Paystack payment verification
- `job-search` - Job search integration
- `extract-pdf-text` / `extract-pdf-text-ocr` - PDF processing
- `exam-practice` - Exam practice engine
- `admin-verify` / `admin-resources` - Admin functions
- Vercel (vercel.json present)
- Supabase hosted at: `aubastwqendcpwwbusgs.supabase.co`
## Mobile Framework
- Platform: Android (`android/` directory)
- App ID: `com.studentoss.app`
- Web directory: `dist`
- `@capacitor/app` 8.0.0 - App lifecycle
- `@capacitor/local-notifications` 8.0.0 - Push notifications
- `@capacitor/android` 8.0.0 - Android platform
- `capacitor.config.ts` - Core settings
- Background color: `#0f0f23`
- Preferred content mode: mobile
- Splash screen with spinner
## AI Integrations
- **Provider:** Lovable AI Gateway (google/gemini-2.5-flash)
- **Access:** Via Supabase Edge Function (`ai-study`)
- **Client-side:** @mlc-ai/web-llm 0.2.80, @huggingface/transformers 3.8.1
- summarize, eli5, socratic, quiz, flashcards, fill_blanks
- mnemonic, cheatsheet, debate, concept_map
- math_solver, ocr_latex, diagram_interpreter
- code_debugger, translator, youtube_summary, book_scanner
- transcribe_audio, essay_grade, plagiarism, citation, bibliography
- research, research_full, thesis, chat, quick_answer
- Free: 5 calls/day
- Plus: 30 calls/day
- Pro: Unlimited
## Payment Gateway
- Public Key: `pk_test_58f0b0b6...` (test mode)
- Backend verification: `supabase/functions/verify-payment`
- Plus Monthly: ₦2,000
- Plus Yearly: ₦20,000
- Pro Monthly: ₦5,000
- Pro Yearly: ₦48,000
- Lifetime: ₦50,000
## Offline/PWA Capabilities
- Vite PWA Plugin 1.2.0
- Service Worker: Workbox with auto-update
- Name: "StudentOS - AI Study Companion"
- Theme: #7c3aed (purple)
- Background: #0f0f23 (dark)
- Display: standalone
- Icons: 192x192 and 512x512
- NetworkOnly: REST API and auth requests
- CacheFirst: Storage assets (7 days), fonts (1 year), CDN (30 days)
- Max file size: 10MB
- Offline sync manager (`src/lib/offlineSync.ts`)
- Queue pending actions in localStorage
- Automatic sync on reconnect
- Offline hooks: `useOfflineSync`, `useOfflineStatus`, `useOfflineData`, `useOfflineAI`
- `usePWAUpdate` - PWA update notifications
- `useOfflineStatus` - Online/offline detection
- `useOfflineSync` - Sync manager integration
## Key Dependencies
- react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.1
- @supabase/supabase-js 2.89.0, @tanstack/react-query 5.83.0
- tailwindcss 3.4.17, tailwindcss-animate 1.0.7
- @radix-ui/* (20+ packages)
- framer-motion 12.23.26, lucide-react 0.462.0
- pdfjs-dist 4.4.168 (PDF rendering)
- jspdf 4.2.0 (PDF generation)
- html2canvas 1.4.1, html2pdf.js 0.10.2
- docx-preview 0.3.3
- zod 3.25.76, react-hook-form 7.61.1
- date-fns 3.6.0, clsx 2.1.1, tailwind-merge 2.6.0
- react-markdown 10.1.0, rehype-katex 7.0.1, remark-math 6.0.0
- katex 0.16.28, jszip 3.10.1
- recharts 2.15.4, canvas-confetti 1.9.4
- @mlc-ai/web-llm 0.2.80
- @huggingface/transformers 3.8.1
- @capacitor/core 8.0.0, @capacitor/android 8.0.0
- @capacitor/local-notifications 8.0.0
- @capacitor/app 8.0.0
## Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- PascalCase for components: `Dashboard.tsx`, `CourseCard.tsx`
- camelCase for utilities/hooks: `useAuth.tsx`, `useToast.ts`
- kebab-case for configs: `eslint.config.js`, `tsconfig.json`
- camelCase for feature directories: `src/components/dashboard/`, `src/hooks/`
- Lowercase for UI component directories: `src/components/ui/`
- camelCase: `fetchData`, `handleAddCourse`, `checkBlocked`
- Use descriptive verbs: `handleDelete`, `loadCachedFallback`
- camelCase: `courses`, `profile`, `fetchError`
- Boolean prefixes: `isOnline`, `authReady`, `loading`
- PascalCase: `Course`, `Profile`, `AuthContextType`
- Suffix with type kind when ambiguous: `Course`, `CourseData`
## Code Style
- Tool: ESLint + Prettier (implied by project structure)
- Tab width: 2 spaces
- Single quotes for strings
- Trailing commas in multiline
- ESLint with `typescript-eslint` and `react-hooks` plugin
- Key rules enforced:
- `strict`: false (not enforced)
- `noImplicitAny`: false
- `strictNullChecks`: false
- `noUnusedLocals`: false
- `noUnusedParameters`: false
- Path alias: `@/*` maps to `./src/*`
## Import Organization
- `@/*` - src directory
- `@/components` - components
- `@/components/ui` - shadcn/ui components
- `@/hooks` - custom hooks
- `@/lib` - utilities
- `@/integrations` - external service clients
## Component Patterns
- Define interfaces at top of file
- Destructure in function parameters
- Spread rest props when needed
- `useState` for local component state
- `useAuth` hook for auth context
- `useOfflineData` for offline support
- `useToast` for notifications
## UI Component Pattern (shadcn/ui)
## CSS/Styling Approach
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- Success/warning colors for status
- Sidebar-specific colors
- Card, popover, accent variants
- `fade-in`, `scale-in`, `slide-up`
- `accordion-down/up`
- `shimmer`, `wiggle`, `bounce-gentle`
- `typing`
- `glow` and `glow-lg` for emphasis
- `elevated` for elevated surfaces
- Enabled via `darkMode: ["class"]`
- Components use `dark:` prefix
- xs: 400px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
## Error Handling
## Logging
- `console.error` for errors
- `console.warn` for warnings
- No `console.log` in production code
## Comments
- Complex async logic (race conditions, timeouts)
- Non-obvious side effects
- Blocked operations (fire-and-forget pattern)
## Function Design
## Module Design
- Default export for page components: `export default PageName`
- Named exports for UI components: `export { Component, ComponentVariant }`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Component-based architecture with feature-scoped directories
- Context API for global state (Auth, Offline AI)
- React Query for server state and caching
- Supabase as backend-as-a-service for authentication and database
- shadcn/ui component library built on Radix UI primitives
- PWA support with service workers for offline functionality
## Layers
- Purpose: Top-level route components that define screen content
- Location: `src/pages/`
- Contains: 28 page components (Dashboard.tsx, Study.tsx, Flashcards.tsx, etc.)
- Depends on: Feature components, layout components
- Used by: React Router in App.tsx
- Purpose: Business logic and feature-specific UI components
- Location: `src/components/[feature-name]/` (e.g., `src/components/dashboard/`, `src/components/notes/`)
- Contains: Feature-specific components (CourseCard.tsx, NoteCard.tsx, etc.)
- Depends on: UI components, hooks, lib utilities
- Used by: Page components
- Purpose: Reusable, design-system compliant base components
- Location: `src/components/ui/`
- Contains: 45+ shadcn/ui components (button.tsx, card.tsx, dialog.tsx, etc.)
- Depends on: Radix UI primitives, Tailwind CSS
- Used by: Feature components, page components
- Purpose: Application shell and navigation structure
- Location: `src/components/layout/`
- Contains: AppLayout.tsx, BottomNav.tsx
- Provides: Consistent app wrapper, navigation bar, routing context
- Purpose: Reusable stateful logic and side effects
- Location: `src/hooks/`
- Contains: 19 custom hooks (useAuth.tsx, useCourseProgress.ts, useFocusMode.ts, etc.)
- Depends on: React hooks, integrations
- Used by: Components, pages
- Purpose: External service clients and API wrappers
- Location: `src/integrations/`
- Contains: Supabase client configuration
- Provides: Database access, authentication, real-time subscriptions
- Purpose: Pure functions and helper utilities
- Location: `src/lib/`
- Contains: ai.ts, formatters.ts, utils.ts, offlineSync.ts, etc.
- Provides: Formatting, AI processing, offline sync logic
## Data Flow
## State Management
- AuthContext: User, session, auth methods (via React Context)
- OfflineAIContext: Offline mode, AI processing queue
- ThemeContext: Dark/light theme preference (via next-themes)
- React Query: Cached server data, loading states, refetching
- Supabase: Persistent database, auth sessions
- React useState: Component-specific state
- localStorage: Theme preference, onboarding seen flag, auth tokens
## Routing Structure
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
- If no user → Onboarding or Auth
- If user → Dashboard inside AppLayout
## Entry Points
- Location: `src/main.tsx`
- Triggers: Page load
- Responsibilities: Render App into #root, load CSS
- Location: `src/App.tsx`
- Triggers: App render
- Responsibilities: Configure providers, define routes, handle auth routing
- Location: `src/hooks/useAuth.tsx`
- Triggers: App initialization, sign in/sign up
- Responsibilities: Manage user session, provide auth context
## Key Architectural Decisions
- Rationale: Fast development, built-in auth, real-time, offline support
- Trade-offs: Vendor lock-in, limited customization
- Rationale: SPA experience, no page reloads, PWA support
- Trade-offs: No SSR by default, SEO limitations (mitigated via routing)
- Rationale: Accessible, customizable, Tailwind-based
- Trade-offs: Larger bundle, requires manual updates
- Rationale: Caching, optimistic updates, background refetch
- Trade-offs: Learning curve, additional complexity
- Rationale: Co-located components with related features
- Trade-offs: Initial discovery harder, but logical grouping
## Cross-Cutting Concerns
- Supabase Auth with email/password
- useAuth hook provides signUp, signIn, signOut methods
- Blocked user check on every auth state change
- ErrorBoundary at app root for crash recovery
- Toast notifications for user feedback (use-toast hook)
- PWAUpdateBanner for service worker updates
- OfflineStatusBanner for connectivity status
- IndexedDB for offline data persistence
- ResilientFetch for network error handling
- next-themes for dark/light mode
- Persisted in localStorage
- Tailwind CSS for styling
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
