# Codebase Structure

**Analysis Date:** 2026-04-25

## Directory Layout

```
studentoss/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Router and providers
│   ├── index.css            # Global styles
│   │
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components (45 files)
│   │   ├── layout/          # AppLayout, BottomNav
│   │   ├── dashboard/      # Dashboard feature components
│   │   ├── notes/          # Smart notes feature
│   │   ├── flashcards/     # Flashcards feature
│   │   ├── quiz/          # Quizzes feature
│   │   ├── study/         # Study feature
│   │   ├── focus/          # Focus mode feature
│   │   ├── ai-tools/      # AI tutor feature
│   │   ├── planning/      # Study planning feature
│   │   ├── career/        # Career feature
│   │   ├── social/        # Social features
│   │   ├── profile/      # User profile feature
│   │   ├── settings/     # Settings feature
│   │   ├── exam-prep/    # Exam prep feature
│   │   ├── subscription/ # Subscription/upgrade feature
│   │   ├── gamification/ # Achievements feature
│   │   ├── store/        # Virtual store feature
│   │   ├── documents/    # Document handling
│   │   ├── export/       # Content export
│   │   ├── flashcards/   # Flashcard system
│   │   ├── flashcards/   # Flashcard system
│   │   ├── safety/       # Safety features
│   │   ├── academic/     # Academic features
│   │   ├── pwa/          # PWA components
│   │   ├── chat/         # Chat features
│   │   └── ads/          # Ad components
│   │
│   ├── pages/              # Route page components (30 files)
│   │   └── docs/          # Documentation pages
│   │
│   ├── hooks/              # Custom React hooks (19 files)
│   │
│   ├── lib/               # Utility functions (10 files)
│   │
│   ├── integrations/       # External service clients
│   │   └── supabase/      # Supabase client & types
│   │
│   ├── context/            # React contexts
│   │
│   └── plugins/            # Plugin system
│
├── public/                 # Static assets
├── supabase/              # Backend definitions
├── android/               # Native Android config
├── index.html             # HTML entry
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig*.json         # TypeScript configs
└── capacitor.config.ts    # Capacitor (PWA) config
```

## Directory Purposes

**src/components/ui/:**
- Purpose: Reusable, design-system compliant UI components
- Contains: 45+ components from shadcn/ui (button.tsx, card.tsx, dialog.tsx, etc.)
- Key files: `button.tsx`, `card.tsx`, `dialog.tsx`, `sheet.tsx`, `form.tsx`

**src/components/layout/:**
- Purpose: Application shell and navigation structure
- Contains: AppLayout.tsx, BottomNav.tsx
- Key files: `AppLayout.tsx` (main app wrapper with navigation), `BottomNav.tsx` (mobile navigation)

**src/components/[feature-name]/:**
- Purpose: Feature-specific business logic and UI
- Contains: Components, dialogs, and widgets specific to each feature
- Examples: `dashboard/` (CourseCard, StatsCard), `notes/` (NoteCard, NoteViewerDialog)

**src/pages/:**
- Purpose: Top-level route components
- Contains: 30 page components mapped to routes
- Key files: `Dashboard.tsx`, `Study.tsx`, `SmartNotes.tsx`, `Flashcards.tsx`, `Quizzes.tsx`, `Focus.tsx`, `Profile.tsx`

**src/hooks/:**
- Purpose: Reusable stateful logic
- Contains: 19 custom hooks
- Key files: `useAuth.tsx` (authentication), `useCourseProgress.ts`, `useFocusMode.ts`, `useOfflineAI.ts`, `useOfflineSync.ts`

**src/lib/:**
- Purpose: Pure functions and utilities
- Contains: 10 utility modules
- Key files: `ai.ts` (AI processing), `formatters.ts` (date/number formatting), `utils.ts` (general utils), `offlineSync.ts` (offline data sync)

**src/integrations/supabase/:**
- Purpose: External service integration
- Contains: Supabase client, types
- Key files: `client.ts` (Supabase client instance)

**src/context/:**
- Purpose: Global state providers
- Contains: OfflineAIContext
- Key files: `OfflineAIContext.tsx`

## Key File Locations

**Entry Points:**
- `src/main.tsx` - React app initialization
- `src/App.tsx` - Router and provider setup, route definitions
- `index.html` - HTML shell with #root div

**Configuration:**
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS theme
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `capacitor.config.ts` - PWA/native configuration

**Authentication:**
- `src/hooks/useAuth.tsx` - Auth context and hooks
- `src/integrations/supabase/client.ts` - Supabase client

**Routing:**
- `src/App.tsx` - All route definitions (lines 96-133)

**Core Logic:**
- `src/lib/ai.ts` - AI tutoring logic
- `src/lib/offlineSync.ts` - Offline data synchronization
- `src/components/dashboard/` - Dashboard widgets and cards

## Naming Conventions

**Files:**
- PascalCase for components: `CourseCard.tsx`, `NoteViewerDialog.tsx`
- camelCase for utilities: `formatters.ts`, `utils.ts`
- camelCase for hooks: `useAuth.tsx`, `useCourseProgress.ts`

**Directories:**
- lowercase, hyphenated: `src/components/dashboard/`, `src/components/notes/`
- Feature directories match route names where possible

**Components:**
- Page components: Named after route (e.g., `Dashboard.tsx`, `Study.tsx`)
- Feature components: PascalCase (e.g., `CourseCard.tsx`, `NoteCard.tsx`)
- UI components: From shadcn/ui (e.g., `Button.tsx`, `Card.tsx`)

## Page Components

All located in `src/pages/`:

| File | Route | Description |
|------|-------|-------------|
| Dashboard.tsx | `/` | Main dashboard after login |
| Auth.tsx | `/auth` | Sign in/sign up |
| Onboarding.tsx | `/` | First-time user onboarding |
| Study.tsx | `/study` | Course study view |
| SmartNotes.tsx | `/notes` | Smart notes feature |
| AITutor.tsx | `/tutor` | AI tutor chat |
| Flashcards.tsx | `/flashcards` | Flashcard decks |
| Quizzes.tsx | `/quizzes` | Quiz system |
| Focus.tsx | `/focus` | Focus mode |
| Achievements.tsx | `/achievements` | Gamification |
| Plan.tsx | `/plan` | Study planning |
| Social.tsx | `/social` | Social features |
| Career.tsx | `/career` | Career features |
| Safety.tsx | `/safety` | Safety features |
| Profile.tsx | `/profile` | User profile |
| CoursePage.tsx | `/course/:courseId` | Single course view |
| Upgrade.tsx | `/upgrade` | Subscription upgrade |
| Chat.tsx | `/chat` | Chat interface |
| GroupChat.tsx | `/group/:groupId` | Group chat |
| FocusSession.tsx | `/focus-session` | Active focus session |
| Store.tsx | `/store` | Virtual store |
| ExamPrep.tsx | `/exams` | Exam prep |
| NotFound.tsx | `*` | 404 page |
| ResetPassword.tsx | `/reset-password` | Password reset |
| Install.tsx | `/install` | PWA install prompt |
| AdminResources.tsx | `/admin-resources` | Admin features |
| Terms.tsx | `/terms` | Terms of service |
| Privacy.tsx | `/privacy` | Privacy policy |

## Component Categories

**Layout Components:**
- `AppLayout.tsx` - Main app wrapper with navigation
- `BottomNav.tsx` - Bottom navigation bar

**Dashboard Components:**
- `CourseCard.tsx` - Course display card
- `StatsCard.tsx` - Statistics widget
- `StreakCard.tsx` - Study streak display
- `StudyProgressWidget.tsx` - Progress visualization
- `StudyTimeWidget.tsx` - Study time tracking
- `AnnouncementBanner.tsx` - Announcements

**Notes Components:**
- `NoteCard.tsx` - Note display
- `NoteViewerDialog.tsx` - Note viewer modal
- `AISummaryDialog.tsx` - AI summary dialog
- `FileUpload.tsx` - File upload handling
- `SocraticTutor.tsx` - Socratic tutoring

**UI Components (shadcn/ui):**
- Primitives: button, card, dialog, sheet, drawer
- Forms: input, textarea, label, form, select
- Feedback: toast, alert, progress, skeleton
- Navigation: tabs, sidebar, breadcrumb
- Data: table, calendar, chart, accordion

## Where to Add New Code

**New Feature:**
- Implementation: Create `src/components/[feature-name]/` directory
- Page: Add `[FeatureName].tsx` to `src/pages/`
- Tests: Create `src/components/[feature-name]/*.test.tsx`
- Route: Add route in `src/App.tsx`

**New Component/Module:**
- Feature component: `src/components/[feature]/NewComponent.tsx`
- UI component: Extend existing `src/components/ui/` component
- Shared: Consider if it belongs in existing feature directory

**New Page:**
- Create: `src/pages/PageName.tsx`
- Add route: In `src/App.tsx` Routes block
- Import: At top of App.tsx
- Wrap: In `<AppLayout>` for authenticated routes

**New Hook:**
- Create: `src/hooks/useHookName.tsx`
- Export: Named export `useHookName`
- Use: Import from `@/hooks/useHookName`

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (general)
- Feature-specific: Create in feature directory
- AI logic: `src/lib/ai.ts`

## Special Directories

**src/plugins/:**
- Purpose: Plugin system for extensibility
- Contains: Plugin loading and management
- Generated: No
- Committed: Yes

**public/:**
- Purpose: Static assets served directly
- Contains: Images, icons, fonts
- Generated: No
- Committed: Yes

**supabase/:**
- Purpose: Backend schema and migrations
- Contains: SQL migrations, type definitions
- Generated: Partially (types auto-generated)
- Committed: Yes

**android/:**
- Purpose: Native Android build configuration
- Contains: Capacitor Android config
- Generated: Yes (via Capacitor)
- Committed: Yes

---

*Structure analysis: 2026-04-25*