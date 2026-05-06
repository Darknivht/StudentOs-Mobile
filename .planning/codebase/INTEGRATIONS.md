---
title: External Integrations
last_mapped_commit: 2026-05-04
---

# External Integrations

**Mapped:** 2026-05-04

## Backend & Database

### Supabase
- **URL:** `https://aubastwqendcpwwbusgs.supabase.co`
- **Services:** PostgreSQL, Authentication, Storage, Edge Functions
- **Client:** `src/integrations/supabase/client.ts`

### Supabase Edge Functions
- `ai-study` - AI tutoring
- `exam-practice` - Exam prep
- `job-search` - Career search
- `verify-payment` - Payment verification
- `extract-pdf-text` - PDF text extraction

## Payments

### Paystack
- **Public Key (Test):** `pk_test_58f4b0b6d69b01ee0e2b3a78b5de225b1ebd0ed8`
- **Config:** `src/lib/paystackConfig.ts`

## AI & ML Services

### WebLLM (On-device LLM)
- **Package:** `@mlc-ai/web-llm`
- **Purpose:** On-device AI inference (offline mode)
- **Context:** `src/context/OfflineAIContext.tsx`

## Mobile Platform

### Capacitor
- **Version:** 8.0.0
- **Plugins:** `@capacitor/core`, `@capacitor/app`, `@capacitor/local-notifications`

## Storage

- **Local Storage:** Auth tokens, theme, offline cache
- **Service Worker:** Runtime caching for static assets and CDN

## Environment Variables

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key