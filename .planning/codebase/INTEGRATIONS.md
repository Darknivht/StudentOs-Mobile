# External Integrations

**Analysis Date:** 2026-04-25

## APIs & External Services

**Backend as a Service:**
- **Supabase** - Database, Auth, Edge Functions, Storage
  - Project: `aubastwqendcpwwbusgs.supabase.co`
  - Client: `@supabase/supabase-js` 2.89.0
  - Auth: Supabase Auth with localStorage persistence
  - Connection: `src/integrations/supabase/client.ts`

**AI Services:**
- **Lovable AI Gateway** - Primary AI backend
  - Endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions`
  - Model: `google/gemini-2.5-flash`
  - Access via: Supabase Edge Function `ai-study`
  - Auth: `LOVABLE_API_KEY` (server-side only)

**Payment Processing:**
- **Paystack** - Nigerian payment gateway
  - Verification endpoint: `https://api.paystack.co/transaction/verify/{reference}`
  - Public Key: `pk_test_58f4b0b6d69b01ee0e2b3a78b5de225b1ebd0ed8`
  - Backend: Supabase Edge Function `verify-payment`
  - Secret Key: `PAYSTACK_SECRET_KEY` (server-side only)

## API Endpoints / Edge Functions

**AI Study Assistant:**
- Endpoint: `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/ai-study`
- Method: POST
- Auth: Bearer token (session or anon key)
- Features: 24+ AI modes (chat, quiz, flashcards, summarize, etc.)
- Rate limiting: Per-tier daily limits

**Payment Verification:**
- Endpoint: `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/verify-payment`
- Method: POST
- Auth: Service role key (internal)
- Payload: `{ reference, user_id, plan }`

**PDF Processing:**
- `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/extract-pdf-text`
- `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/extract-pdf-text-ocr`

**Exam Practice:**
- `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/exam-practice`

**Job Search:**
- `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/job-search`

**Admin Functions:**
- `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/admin-verify`
- `https://aubastwqendcpwwbusgs.supabase.co/functions/v1/admin-resources`

## Third-Party Library Integrations

**PDF Handling:**
- `pdfjs-dist` 4.4.168 - PDF rendering in browser
- `jspdf` 4.2.0 - PDF document generation
- `html2canvas` 1.4.1 - Screenshot capture
- `html2pdf.js` 0.10.2 - HTML to PDF conversion
- `docx-preview` 0.3.3 - Word document preview

**Math Rendering:**
- `katex` 0.16.28 - LaTeX rendering
- `rehype-katex` 7.0.1 - Markdown integration
- `remark-math` 6.0.0 - Math in Markdown

**Data Visualization:**
- `recharts` 2.15.4 - Charts (XP progress, study analytics)

**Animations:**
- `framer-motion` 12.23.26 - React animations
- `canvas-confetti` 1.9.4 - Celebration effects
- `tailwindcss-animate` 1.0.7 - CSS animations

**Form Validation:**
- `zod` 3.25.76 - Schema validation
- `react-hook-form` 7.61.1 - Form management
- `@hookform/resolvers` 3.10.0 - Zod integration

**Date Utilities:**
- `date-fns` 3.6.0 - Date formatting and manipulation

**File Handling:**
- `jszip` 3.10.1 - ZIP file creation

**Markdown:**
- `react-markdown` 10.1.0 - Markdown rendering

**Theming:**
- `next-themes` 0.3.0 - Dark mode support

**Icons:**
- `lucide-react` 0.462.0 - Icon library

## Mobile Native Plugin Integrations

**Capacitor Plugins:**
- `@capacitor/core` 8.0.0 - Core Capacitor runtime
- `@capacitor/cli` 8.0.0 - Build tooling
- `@capacitor/android` 8.0.0 - Android platform
- `@capacitor/app` 8.0.0 - App lifecycle events
- `@capacitor/local-notifications` 8.0.0 - Push notifications

**Splash Screen Configuration:**
- Duration: 2000ms
- Auto-hide: enabled
- Background: #0f0f23
- Spinner color: #7c3aed

**Keyboard Configuration:**
- Resize mode: body
- Full screen resize: enabled

**Status Bar:**
- Style: dark
- Background: #0f0f23

## Storage Services

**Primary Database:**
- Supabase PostgreSQL
- 30+ tables for user data, content, analytics

**File Storage:**
- Supabase Storage (referenced in workbox caching)
- CDN caching for storage assets (7 days)

**Local Storage:**
- Session persistence (localStorage)
- Offline pending actions queue
- Sync status tracking
- Location: `src/lib/offlineSync.ts`

**Session Storage:**
- Supabase auth tokens
- Automatic refresh enabled

## Authentication Provider

**Provider:** Supabase Auth

**Features:**
- Email/password authentication
- Session persistence in localStorage
- Auto-refresh tokens
- Integration: `src/integrations/supabase/client.ts`

**User Profile:**
- Linked to `profiles` table
- Fields: subscription_tier, total_xp, current_streak, grade_level, study_persona, etc.

## Monitoring & Observability

**Error Tracking:**
- Console logging (console.error for errors)
- Error boundaries in React components

**Analytics:**
- XP tracking (weekly_xp table)
- Study session analytics (study_sessions table)
- Achievement system (achievements table)

**PWA Updates:**
- `usePWAUpdate` hook for update notifications
- Auto-update via service worker

## CI/CD & Deployment

**Frontend Hosting:**
- Vercel (vercel.json present)
- URL: https://studentoss.lovable.app

**Mobile:**
- Capacitor build for Android
- APK generation via Gradle

**Edge Functions:**
- Supabase Edge Functions (Deno runtime)
- Deployed to Supabase Cloud

## Environment Configuration

**Required Environment Variables:**
```
VITE_SUPABASE_URL=https://aubastwqendcpwwbusgs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon_key>
```

**Server-side Variables (Edge Functions):**
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
LOVABLE_API_KEY
PAYSTACK_SECRET_KEY
```

**Environment Files:**
- `.env` - Local environment variables

## Offline Capabilities

**Service Worker (Workbox):**
- API calls: NetworkOnly
- Storage assets: CacheFirst (7 days)
- Fonts: CacheFirst (1 year)
- CDN assets: CacheFirst (30 days)

**Offline Sync Manager:**
- Queue: localStorage (`offline_pending_actions`)
- Status: localStorage (`offline_sync_status`)
- Auto-sync on reconnect
- Custom hooks: `useOfflineSync`, `useOfflineStatus`, `useOfflineData`, `useOfflineAI`

---

*Integration audit: 2026-04-25*