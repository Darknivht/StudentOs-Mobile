# Codebase Concerns

**Analysis Date:** 2026-04-25

## Tech Debt

### Hardcoded Credentials
- **Issue:** Paystack public key is hardcoded in frontend code
- **Files:** `src/lib/paystackConfig.ts` (line 3)
- **Impact:** While the public key is intended to be public, having it directly in source control is not best practice
- **Fix approach:** Move to environment variables with proper Vite env var handling

### Hardcoded AdSense Placeholder
- **Issue:** AdSense client ID uses placeholder value that will never render real ads
- **Files:** `src/components/ads/GoogleAdBanner.tsx` (line 41)
- **Impact:** Ad component renders but shows no ads (placeholder `ca-pub-XXXXXXXXXXXXXXXX`)
- **Fix approach:** Add valid AdSense publisher ID via environment variable

### Extensive Use of `any` Type
- **Issue:** 217+ instances of `as const` or `any` type assertions found
- **Files:** Heavy usage in `src/pages/AdminResources.tsx`, `src/pages/Store.tsx`, `src/hooks/useSubscription.ts`
- **Impact:** TypeScript type safety is significantly compromised; runtime errors may go undetected
- **Fix approach:** Define proper TypeScript interfaces for all data structures, especially Supabase responses

### Silent Error Swallowing
- **Issue:** Multiple catch blocks silently fail without user feedback
- **Examples:**
  - `src/pages/Dashboard.tsx` (line 95): `updateAllCoursesProgress(user!.id).catch(() => {});`
  - `src/pages/AdminResources.tsx` (line 1566): `await invoke('delete-exam-question', { questionId: id }).catch(() => {});`
- **Impact:** Errors are hidden from users and developers; debugging is extremely difficult
- **Fix approach:** At minimum, log errors. Ideally show toast notifications for actionable errors.

---

## Known Bugs

### Store Empty State
- **Issue:** Store page shows no resources - needs seeded data in Supabase
- **Files:** `src/pages/Store.tsx`
- **Trigger:** Navigate to `/store` - shows empty state
- **Workaround:** Admin must seed store resources via AdminResources page
- **Status:** Documented in IMPROVEMENT_PLAN.md

### Missing Loading States
- **Issue:** Multiple pages lack skeleton loaders or loading indicators
- **Impact:** Poor UX during data fetching
- **Status:** Documented in IMPROVEMENT_PLAN.md as high priority

---

## Security Considerations

### Frontend-Only Subscription Checks
- **Issue:** Subscription tier checks happen in frontend code
- **Files:** `src/hooks/useSubscription.ts`, `src/components/subscription/FeatureGateDialog.tsx`
- **Current mitigation:** Backend edge functions (`ai-study`, `verify-payment`, `exam-practice`) validate subscriptions server-side
- **Recommendations:** Ensure ALL paid features have server-side validation; consider adding RLS policies in Supabase

### Environment Variables Not Validated
- **Issue:** Code uses `import.meta.env.VITE_SUPABASE_URL` and similar without fallback or validation
- **Files:** Multiple files including `src/lib/ai.ts`, `src/integrations/supabase/client.ts`
- **Current mitigation:** None - app will fail silently if env vars are missing
- **Recommendations:** Add validation with clear error messages on app initialization

---

## Performance Bottlenecks

### Large Dependency Bundle
- **Issue:** Multiple heavy dependencies bundled together
- **Packages:**
  - `@mlc-ai/web-llm` (offline AI) - ~50MB
  - `@huggingface/transformers` - large ML library
  - `pdfjs-dist` - PDF rendering
  - `recharts` - charting library
  - `framer-motion` - animation library
- **Impact:** Initial load time may be slow on mobile networks
- **Improvement path:** Implement code splitting; lazy load heavy components (AI chat, PDF viewer, charts)

### No Route-Based Code Splitting
- **Issue:** Single bundle likely contains all code
- **Impact:** Users download entire app even if they only use a subset of features
- **Improvement path:** Use React.lazy() for route components

---

## Error Handling Gaps

### Only One Global Error Boundary
- **Issue:** Single ErrorBoundary wraps entire app in `src/App.tsx` (line 84)
- **Impact:** Any unhandled error crashes the entire app; no granular recovery
- **Fragile areas:** Heavy AI processing components (`src/context/OfflineAIContext.tsx`), complex quiz components
- **Safe modification:** Add route-level or component-level ErrorBoundaries for critical flows
- **Test coverage:** No tests found for error boundary behavior

### Inconsistent Error Handling Patterns
- **Issue:** Mix of console.error, console.warn, silent catches, and toast notifications
- **Examples:**
  - Most files use `console.error` + silent catch
  - AdminResources.tsx uses `toast()` for errors
  - Some files have no error handling at all
- **Impact:** Inconsistent user experience; difficult to debug
- **Recommendations:** Standardize on toast notifications for user-facing errors; console.error only for development debugging

### Empty Returns Without Fallback UI
- **Issue:** 41 instances of `return null`, `return []`, `return {}` found
- **Examples:**
  - `src/pages/CoursePage.tsx` (line 291)
  - `src/components/ui/chart.tsx` (multiple)
  - `src/hooks/useCourseProgress.ts` (line 53)
- **Impact:** Components silently render nothing; difficult to diagnose why UI disappears
- **Recommendations:** Return loading states, error states, or empty states instead of null

---

## Configuration Issues

### Subscription Config is Kill Switch
- **Issue:** `SUBSCRIPTION_ENABLED` in `src/lib/subscriptionConfig.ts` is a simple boolean
- **Current:** `export const SUBSCRIPTION_ENABLED = true;`
- **Impact:** Disabling gives ALL users full access - binary on/off with no granularity
- **Recommendations:** Consider feature flags per feature rather than global kill switch

### Missing Environment Variable Validation
- **Issue:** No validation on startup that required env vars are present
- **Impact:** App may fail at runtime with cryptic errors
- **Recommendations:** Add startup validation script or initialization check

---

## Dependencies at Risk

### Multiple Beta/Very New Packages
- **Packages:**
  - `@mlc-ai/web-llm`: version 0.2.80 (early stage)
  - `@huggingface/transformers`: version 3.8.1
  - `vite-plugin-pwa`: version 1.2.0
- **Risk:** API changes may require code updates
- **Migration plan:** Pin versions; monitor changelogs for breaking changes

### Large ML Dependencies
- **Issue:** `@mlc-ai/web-llm` and `@huggingface/transformers` are 50MB+ each
- **Impact:** App size, install time, memory usage
- **Current usage:** Only in offline AI context
- **Recommendations:** Consider loading only when user explicitly requests offline AI

---

## Test Coverage Gaps

### No Test Files Found
- **Issue:** No test files detected in the codebase (no *.test.* or *.spec.* files)
- **What's not tested:** Entire application - all components, hooks, utilities
- **Risk:** Any refactoring could break functionality without detection; regressions common
- **Priority:** HIGH
- **Recommendations:** 
  - Add Vitest for unit tests
  - Add React Testing Library for component tests
  - Prioritize testing: subscription logic, payment flow, AI parsing, data sync

---

## Pattern Deviations from Best Practices

### 161+ Console Statements
- **Issue:** Excessive console.log, console.error, console.warn throughout codebase
- **Files:** Found in nearly every source file
- **Impact:** Performance (minimal), but reveals implementation details in production
- **Recommendations:** Remove or wrap console statements with debug flags; use proper logging library in production

### Inconsistent Naming Conventions
- **Issue:** Mixed patterns:
  - camelCase: `handleDragEnd`, `userDetail`
  - PascalCase: `HomeRoute`, `MobileBackHandler`
  - kebab-case: file names vary
- **Recommendations:** Enforce via ESLint rules

### No ESLint/Prettier CI Integration
- **Issue:** While ESLint config exists (`eslint.config.js`), no git hooks or CI enforcement visible
- **Impact:** Code style drift over time
- **Recommendations:** Add husky pre-commit hooks or CI pipeline checks

---

## Potential Edge Cases

### Offline AI Context Memory Leaks
- **Files:** `src/context/OfflineAIContext.tsx` (775+ lines)
- **Issue:** Large context handles model downloads, caching, generation
- **Fragile:** Complex async state management could lead to memory leaks
- **Safe modification:** Ensure all useEffect cleanups properly release model references
- **Test coverage:** Not tested

### Race Conditions in Offline Sync
- **Files:** `src/lib/offlineSync.ts`
- **Issue:** Queue-based sync could have race conditions with concurrent online/offline transitions
- **Test coverage:** Not tested

---

## Missing Critical Features (per IMPROVEMENT_PLAN.md)

1. **Exam packs purchase flow** - Not implemented
2. **Referral system** - Not implemented  
3. **AdMob for free tier** - Not implemented (only placeholder AdSense component exists)
4. **Complete Groups feature** - Incomplete
5. **Android build fix** - Not working
6. **Push notification setup** - Not implemented
7. **Analytics dashboard** - Not implemented

---

## Prioritization Recommendation

### High Priority (Fix Now)
1. Add proper error handling with user feedback (toast notifications)
2. Add test coverage for critical paths
3. Fix AdSense placeholder with real ID or remove component
4. Add environment variable validation

### Medium Priority (Next Sprint)
1. Add route-based code splitting
2. Define TypeScript interfaces to replace `any` types
3. Add component-level ErrorBoundaries
4. Remove excessive console statements or wrap with debug flag

### Lower Priority (Backlog)
1. Dependency audit and pinning
2. ESLint/Prettier CI integration
3. Performance optimization with lazy loading

---

*Concerns audit: 2026-04-25*