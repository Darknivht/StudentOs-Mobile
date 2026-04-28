# Technology Stack

**Analysis Date:** 2026-04-25

## Languages

**Primary:**
- TypeScript 5.8.3 - Type-safe frontend development
- JavaScript (ES2020) - React components and runtime

## Runtime

**Environment:**
- Node.js (via Vite dev server)
- Package Manager: Bun (bun.lock present)

**Build Tool:**
- Vite 5.4.19

## Frontend Framework

**Core:**
- React 18.3.1 - UI library
- React Router DOM 6.30.1 - Client-side routing

**Build Configuration:**
- `vite.config.ts` - Vite configuration with PWA and path aliases
- `tsconfig.json` - TypeScript with path mapping `@/*` → `./src/*`

## UI Component Library

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- shadcn/ui pattern via Radix UI primitives
- Custom theme in `tailwind.config.ts` with dark mode support

**UI Primitives (Radix UI):**
- Dialog, Dropdown Menu, Select, Toast, Tooltip
- Navigation Menu, Tabs, Accordion, Scroll Area
- Switch, Checkbox, Radio Group, Slider
- Avatar, Progress, Separator, Alert Dialog

**Components:**
- Framer Motion 12.23.26 - Animations
- Lucide React 0.462.0 - Icons
- Sonner 1.7.4 - Toast notifications
- Embla Carousel 8.6.0 - Carousels
- React Resizable Panels 2.1.9 - Panel layouts
- Vaul 0.9.9 - Drawer component

**Form Handling:**
- React Hook Form 7.61.1 - Form management
- Zod 3.25.76 - Schema validation
- @hookform/resolvers 3.10.0 - Zod integration

## State Management

**Approach:**
- TanStack Query (React Query) 5.83.0 - Server state
- React local state (useState, useCallback) - Component state
- Supabase real-time subscriptions - Live data sync

**Configuration:**
- Path alias: `@/*` → `./src/*` in `tsconfig.json`

## Backend Services

**Primary Backend:**
- Supabase 2.89.0 - PostgreSQL + Auth + Edge Functions
  - Location: `src/integrations/supabase/`
  - Client: `src/integrations/supabase/client.ts`
  - Types: `src/integrations/supabase/types.ts` (1564 lines, 30+ tables)

**Database Tables:**
- profiles, courses, notes, flashcards
- chat_messages, quiz_attempts, exam_*
- study_groups, achievements, study_sessions
- weekly_xp, focus_sessions, pomodoro_sessions
- peer_challenges, store_resources

**Edge Functions (Deno):**
- `ai-study` - AI study assistant with 24+ modes
- `verify-payment` - Paystack payment verification
- `job-search` - Job search integration
- `extract-pdf-text` / `extract-pdf-text-ocr` - PDF processing
- `exam-practice` - Exam practice engine
- `admin-verify` / `admin-resources` - Admin functions

**Deployment:**
- Vercel (vercel.json present)
- Supabase hosted at: `aubastwqendcpwwbusgs.supabase.co`

## Mobile Framework

**Capacitor 8.0.0:**
- Platform: Android (`android/` directory)
- App ID: `com.studentoss.app`
- Web directory: `dist`

**Native Plugins:**
- `@capacitor/app` 8.0.0 - App lifecycle
- `@capacitor/local-notifications` 8.0.0 - Push notifications
- `@capacitor/android` 8.0.0 - Android platform

**Configuration:**
- `capacitor.config.ts` - Core settings
- Background color: `#0f0f23`
- Preferred content mode: mobile
- Splash screen with spinner

## AI Integrations

**Primary AI:**
- **Provider:** Lovable AI Gateway (google/gemini-2.5-flash)
- **Access:** Via Supabase Edge Function (`ai-study`)
- **Client-side:** @mlc-ai/web-llm 0.2.80, @huggingface/transformers 3.8.1

**AI Modes (24+):**
- summarize, eli5, socratic, quiz, flashcards, fill_blanks
- mnemonic, cheatsheet, debate, concept_map
- math_solver, ocr_latex, diagram_interpreter
- code_debugger, translator, youtube_summary, book_scanner
- transcribe_audio, essay_grade, plagiarism, citation, bibliography
- research, research_full, thesis, chat, quick_answer

**AI Limits (Tier-based):**
- Free: 5 calls/day
- Plus: 30 calls/day
- Pro: Unlimited

## Payment Gateway

**Paystack Integration:**
- Public Key: `pk_test_58f0b0b6...` (test mode)
- Backend verification: `supabase/functions/verify-payment`

**Pricing (in Kobo/NGN):**
- Plus Monthly: ₦2,000
- Plus Yearly: ₦20,000
- Pro Monthly: ₦5,000
- Pro Yearly: ₦48,000
- Lifetime: ₦50,000

**Configuration:** `src/lib/paystackConfig.ts`

## Offline/PWA Capabilities

**PWA Support:**
- Vite PWA Plugin 1.2.0
- Service Worker: Workbox with auto-update

**Manifest:**
- Name: "StudentOS - AI Study Companion"
- Theme: #7c3aed (purple)
- Background: #0f0f23 (dark)
- Display: standalone
- Icons: 192x192 and 512x512

**Caching Strategy:**
- NetworkOnly: REST API and auth requests
- CacheFirst: Storage assets (7 days), fonts (1 year), CDN (30 days)
- Max file size: 10MB

**Offline Features:**
- Offline sync manager (`src/lib/offlineSync.ts`)
- Queue pending actions in localStorage
- Automatic sync on reconnect
- Offline hooks: `useOfflineSync`, `useOfflineStatus`, `useOfflineData`, `useOfflineAI`

**Custom Hooks:**
- `usePWAUpdate` - PWA update notifications
- `useOfflineStatus` - Online/offline detection
- `useOfflineSync` - Sync manager integration

## Key Dependencies

**Core:**
- react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.1
- @supabase/supabase-js 2.89.0, @tanstack/react-query 5.83.0

**UI:**
- tailwindcss 3.4.17, tailwindcss-animate 1.0.7
- @radix-ui/* (20+ packages)
- framer-motion 12.23.26, lucide-react 0.462.0

**Document Handling:**
- pdfjs-dist 4.4.168 (PDF rendering)
- jspdf 4.2.0 (PDF generation)
- html2canvas 1.4.1, html2pdf.js 0.10.2
- docx-preview 0.3.3

**Utilities:**
- zod 3.25.76, react-hook-form 7.61.1
- date-fns 3.6.0, clsx 2.1.1, tailwind-merge 2.6.0
- react-markdown 10.1.0, rehype-katex 7.0.1, remark-math 6.0.0
- katex 0.16.28, jszip 3.10.1
- recharts 2.15.4, canvas-confetti 1.9.4

**AI/ML:**
- @mlc-ai/web-llm 0.2.80
- @huggingface/transformers 3.8.1

**Mobile:**
- @capacitor/core 8.0.0, @capacitor/android 8.0.0
- @capacitor/local-notifications 8.0.0
- @capacitor/app 8.0.0

## Environment Variables

**Required (.env):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key

---

*Stack analysis: 2026-04-25*