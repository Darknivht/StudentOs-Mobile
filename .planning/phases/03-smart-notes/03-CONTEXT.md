# Phase 3: Smart Notes - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning
**Source:** /gsd-discuss-phase user decisions

<domain>
## Phase Boundary

Phase 3 implements the Smart Notes content ingestion layer — the primary way students create, upload, summarize, and manage study notes. This is the first feature-rich content screen after the dashboard, and the foundation for AI-driven features (flashcard generation, quiz generation) in later phases.

**This phase delivers:**

- Notes list screen with course-grouped sections and search
- Rich text note creation/editing with auto-save
- File upload (PDF, DOCX, image/camera OCR) with text extraction
- Note viewer with full content display
- AI summary generation (short/medium/long) with streaming
- Socratic tutor mode for notes
- "Ask AI Tutor" bridge with note context pre-population
- Note cards with title, preview, source badge, course tag, date
- Quick actions: view, generate summary, generate flashcards, generate quiz, delete
- Daily note creation quotas enforced by tier
- Note deletion with confirmation
- Swipe-to-delete and swipe-to-pin actions

</domain>

<decisions>
## Implementation Decisions

### Rich Text Editor (D-01)

- Use `react-native-pell-rich-text` for WYSIWYG editing
- Editor produces HTML output stored in `content` column
- Toolbar: bold, italic, underline, heading, list, code block
- NOT markdown — HTML is the source format (matching web app)
- Auto-save every 3 seconds with debounce (NOT on every keystroke)

### File Upload Strategy (D-02)

- Dual approach: edge function primary (when online), client-side fallback (when offline)
- PDF upload → `extract-pdf-text` Supabase edge function (returns extracted text)
- DOCX upload → `extract-pdf-text` edge function (supports DOCX too)
- Image/camera OCR → `extract-pdf-text-ocr` Supabase edge function
- Offline fallback: save file locally to WatermelonDB, queue for extraction on reconnect
- File stored in Supabase Storage bucket `notes-uploads`, URL saved to `file_url` column
- Original filename preserved in `original_filename` column
- Source type tracked in `source_type` column: 'manual' | 'pdf' | 'docx' | 'image'

### AI Actions UX (D-03)

- Bottom sheet pattern (NOT inline buttons)
- Floating action button (FAB) at bottom-right of note viewer
- Tap FAB → bottom sheet slides up with AI action options:
  - Generate Summary (short/medium/long selector)
  - Socratic Mode (AI asks leading questions)
  - Generate Flashcards (navigates to Phase 5, creates from note context)
  - Generate Quiz (navigates to Phase 6, creates from note context)
  - Ask AI Tutor (pre-populates tutor with note context)
- Use `@gorhom/bottom-sheet` for the bottom sheet component

### Note Organization (D-04)

- Course-grouped sections on notes list screen
- Each course is a collapsible section header with course emoji + title + note count
- "Uncategorized" section at bottom for notes without a course
- Within each section, notes sorted by `updated_at` descending (most recent first)
- FlatList with SectionList structure for performance

### Search (D-05)

- Title-only search (NOT full-text content search)
- Search bar at top of notes list screen
- Filters as you type with 300ms debounce
- Clear button in search bar

### Swipe Actions (D-06)

- Swipe-to-delete (swipe left → red delete action with confirmation)
- Swipe-to-pin (swipe right → pin action, pinned notes appear at top of their section)
- Pin state tracked via `is_pinned` column (needs schema addition)
- Plus: overflow menu on each card with "Edit", "Share", "Course assignment" options

### Camera OCR Integration (D-07)

- Camera icon inside note creation flow (NOT a separate screen)
- When creating a new note, user can tap camera icon to:
  1. Open device camera
  2. Take photo of text/document
  3. Photo sent to `extract-pdf-text-ocr` edge function
  4. Extracted text inserted into note content
- Uses `expo-image-picker` with camera option
- Seamless — user stays in the note creation flow

### Subscription Quotas (D-08)

- Free: 3 notes/day
- Plus: 10 notes/day
- Pro: unlimited
- Quota tracked via `notes_created_today` count vs tier limit
- Reset at midnight UTC
- Show remaining count in header area of notes list
- When quota exceeded: show UpgradePrompt with tier info

### WatermelonDB Schema Updates (D-09)

- Add columns to `notes` table: `summary`, `source_type`, `file_url`, `original_filename`, `is_pinned`
- Bump schema version from 1 to 2
- Create migration for schema version bump

### Navigation Integration (D-10)

- Add Notes tab to bottom tab navigator (between Study and Focus)
- Add NotesStack to navigation types
- Notes list → Note Editor → Note Viewer flow
- Course detail screen placeholder navigates to filtered notes list

### the agent's Discretion

- Exact color values for source badges (PDF=orange, DOCX=blue, Image=green, Manual=gray is recommended)
- Specific rich-text toolbar icon set and ordering
- Bottom sheet animation speed and spring config
- Empty state illustrations/messages for notes list
- Confirmation dialog wording for delete action
- Auto-save debounce timer value (3s per D-01, but implementation details are discretionary)
- Whether to use `expo-document-picker` or `expo-file-system` for file selection

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context

- `.planning/PROJECT.md` — Project vision, constraints
- `.planning/ROADMAP.md` §§130-155 — Phase 3 detailed requirements
- `.planning/REQUIREMENTS.md` — NOTES-01 through NOTES-14

### Research Insights

- `.planning/research/PITFALLS.md` — General pitfalls to avoid
- `.planning/research/STACK.md` — React Native + Expo SDK 54 patterns

### Prior Phase Outputs (MUST READ)

- `.planning/phases/00-foundation/00-01-SUMMARY.md` — Navigation structure, screen placeholders
- `.planning/phases/00-foundation/00-02-SUMMARY.md` — Zustand stores, theme system, utilities
- `.planning/phases/00-foundation/00-03-SUMMARY.md` — WatermelonDB schema, Supabase client, AI factory
- `.planning/phases/02-onboarding-dashboard/02-CONTEXT.md` — Dashboard patterns, course cards

### Existing Code (consumed by this phase)

- `src/database/schema.ts` — WatermelonDB schema (needs migration for new columns)
- `src/database/models/note.ts` — Note model (needs new fields)
- `src/database/index.ts` — Database singleton
- `src/services/supabase/client.ts` — Supabase client singleton
- `src/services/ai/providerFactory.ts` — AIProviderFactory for streaming
- `src/services/ai/types.ts` — AIProvider, AIMessage, AIStreamingOptions types
- `src/stores/authStore.ts` — Auth state with subscription tier
- `src/stores/appStore.ts` — App state with onboarding, dailyStudyTarget
- `src/lib/theme.ts` — Design tokens (colors, spacing, typography)
- `src/lib/constants.ts` — SUBSCRIPTION_TIERS with noteQuota
- `src/lib/utils.ts` — formatDate, formatTime, getGreeting utilities
- `src/types/auth.ts` — AuthUser, SubscriptionTier types
- `src/navigation/MainNavigator.tsx` — Bottom tab navigator (needs Notes tab)
- `src/navigation/types.ts` — Navigation type definitions (needs NotesStack)
- `src/hooks/useCourses.ts` — Course fetching hook
- `src/hooks/useSubscription.ts` — Subscription tier access hook
- `src/screens/dashboard/CourseCard.tsx` — Card pattern reference

</canonical_refs>

<specifics>
## Specific Ideas

### Source Badge Colors

- PDF: orange (#f59e0b)
- DOCX: blue (#3b82f6)
- Image/Camera: green (#22c55e)
- Manual/Typed: gray (#6b6b8a)

### Note Card Design

- Similar pattern to CourseCard: rounded card, card background (#12122a)
- Left accent bar colored by source type (4px wide)
- Title (bold, truncated 1 line)
- Preview text (150 chars max, mutedForeground color, 2 lines max)
- Bottom row: source badge icon + label, course tag pill, relative date
- Pin icon (📌) at top-right if pinned

### Notes List Screen Layout

1. Search bar at top (with safe area inset)
2. Quota indicator ("3/3 notes today — Free plan" or "5 notes today")
3. "New Note" FAB button (bottom-right, purple)
4. SectionList grouped by course
5. Each section: course header (emoji + title + count), collapsible
6. Within section: note cards in FlatList
7. Swipe actions on each card (left=delete, right=pin)

### Note Editor Screen Layout

1. Top bar: back button, course selector dropdown, "Done" button
2. Title input (large, bold placeholder "Note title...")
3. Rich text toolbar (bold, italic, underline, heading, list, code)
4. Rich text editor (full remaining height)
5. Bottom bar: camera icon, attach file icon, auto-save status indicator

### AI Bottom Sheet Layout

1. Handle bar at top
2. Title: "AI Actions"
3. Action rows (icon + title + description):
   - 📝 Generate Summary → sub-options: Short / Medium / Long
   - 🤔 Socratic Mode → "AI will ask questions about your note"
   - 🃏 Generate Flashcards → "Create flashcard deck from this note"
   - ❓ Generate Quiz → "Create a quiz from this note"
   - 💬 Ask AI Tutor → "Continue in AI Tutor with this note's context"

</specifics>

<deferred>
## Deferred Ideas

- Full-text content search (title-only search per D-05, content search deferred to Phase 25)
- Rich text image embedding within editor (inline images — complex, deferred)
- Note sharing/social features (Phase 13: Social Hub)
- Note version history (Phase 24: Advanced Features)
- Collaborative note editing (not in v1 roadmap)
- Offline AI summary generation (requires local LLM — Phase 20+)
- Export notes as PDF (Phase 21: PDF Export & Documents)
- Note tags/labels system (not in NOTES requirements, deferred to v2)
- Voice-to-text note creation (Phase 24: Advanced Features)

</deferred>

---

_Phase: 03-smart-notes_
_Context gathered: 2026-05-01 via /gsd-discuss-phase_
