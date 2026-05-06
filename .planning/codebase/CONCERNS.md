---
title: Technical Concerns
last_mapped_commit: 2026-05-04
---

# Technical Concerns

**Mapped:** 2026-05-04

## High Priority Concerns

### 1. No Test Suite
- **Issue:** No unit, integration, or E2E tests
- **Risk:** Regression bugs, hard to refactor
- **Impact:** Development velocity decreases as codebase grows

### 2. Hardcoded Test Paystack Key
- **File:** `src/lib/paystackConfig.ts`
- **Value:** `pk_test_58f4b0b6d69b01ee0e2b3a78b5de225b1ebd0ed8`
- **Issue:** Test key exposed in source code
- **Risk:** Security concern, should use env vars

### 3. Large Bundle Size
- **Issue:** Heavy dependencies (WebLLM, PDF.js, Recharts)
- **Risk:** Slow initial load, especially on mobile
- **Impact:** Poor user experience

### 4. Offline Mode Complexity
- **Files:** `src/hooks/useOffline*.ts`, `src/lib/offlineSync.ts`
- **Issue:** Complex sync logic with potential data loss
- **Risk:** Data inconsistency between online/offline states

## Medium Priority Concerns

### 5. AI Context Management
- **Files:** `src/context/OfflineAIContext.tsx`
- **Issue:** Large context windows, memory pressure on mobile
- **Risk:** App crashes on low-memory devices

### 6. No Error Boundary Around Every Route
- **Issue:** Only one top-level ErrorBoundary in App.tsx
- **Risk:** One route crash takes down entire app

### 7. No API Rate Limiting on Frontend
- **Issue:** Users can spam API calls
- **Risk:** Cost overruns, server abuse

## Security Concerns

- **Exposed Keys:** Paystack test key visible in source
- **Supabase RLS:** All data access controlled by RLS, no server-side validation

## Performance Concerns

- **First Load:** Heavy dependencies load at startup
- **AI Inference:** WebLLM downloads large model files
- **Mobile:** Limited memory for large AI models