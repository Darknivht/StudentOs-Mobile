---
title: Testing Practices
last_mapped_commit: 2026-05-04
---

# Testing Practices

**Mapped:** 2026-05-04

## Current Testing Status

**No formal test suite exists.** The codebase does not currently have:
- Unit tests
- Integration tests
- E2E tests
- Test runner configuration (Jest/Vitest)

## Code Quality Tools

### ESLint
- **Command:** `npm run lint`
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

### TypeScript
- **Strict mode** enabled in `tsconfig.json`
- Catches type errors at compile time

## Manual Testing Approaches

- **Browser:** `npm run dev` → localhost:8081
- **PWA:** Chrome DevTools → Application → Service Workers
- **Mobile:** Capacitor for Android builds

## Test Coverage Recommendations

### Priority Areas for Testing
1. **Authentication** (`src/hooks/useAuth.tsx`) - Critical auth flow
2. **Payment Logic** - Money handling
3. **Offline Sync** (`src/lib/offlineSync.ts`) - Data integrity

### Recommended Test Stack
- **Unit:** Vitest + React Testing Library
- **E2E:** Playwright or Cypress

## Areas Needing Tests

| Area | Risk | Priority |
|------|------|----------|
| Auth flow (login/logout) | High | Critical |
| Payment processing | High | Critical |
| Offline data sync | High | High |
| AI response parsing | Medium | High |
| Route protection | Medium | High |