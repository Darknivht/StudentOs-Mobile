---
phase: 1
slug: foundation-platform-services
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + React Native Testing Library |
| **Config file** | `apps/native/jest.config.js` — Wave 0 installs |
| **Quick run command** | `npx jest --config apps/native/jest.config.js --onlyChanged` |
| **Full suite command** | `npx jest --config apps/native/jest.config.js --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --config apps/native/jest.config.js --onlyChanged`
- **After every plan wave:** Run `npx jest --config apps/native/jest.config.js --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FND-01 | — | N/A | unit | `npx jest apps/native/.../monorepo.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FND-02 | — | N/A | unit | `npx jest packages/shared/.../exports.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FND-05 | — | N/A | visual | `npx expo start` + manual | N/A | ⬜ pending |
| 01-02-01 | 02 | 1 | FND-04 | — | N/A | unit | `npx jest apps/native/app/.../routing.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | NAVL-01 | — | N/A | visual | Manual — verify 5 tabs render | N/A | ⬜ pending |
| 01-02-03 | 02 | 1 | NAVL-02 | — | N/A | unit | `npx jest apps/native/app/.../auth-redirect.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 2 | NAVL-03 | T-1-03 | Validate deep link origin | integration | `npx jest apps/native/.../deep-link.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | AUTH-01 | — | N/A | integration | `npx jest apps/native/.../auth-signup.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | AUTH-02 | T-1-01 | SecureStore used for tokens | integration | `npx jest apps/native/.../auth-session.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | AUTH-03 | T-1-03 | Deep link validates origin | integration | `npx jest apps/native/.../password-reset.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-04 | 03 | 2 | AUTH-04 | — | SecureStore cleared on signout | unit | `npx jest apps/native/.../auth-signout.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-05 | 03 | 2 | AUTH-05 | — | Blocked user immediately signed out | unit | `npx jest apps/native/.../blocked-user.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | AITR-01 | — | N/A | integration | `npx jest apps/native/.../sse-stream.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 2 | AITR-04 | — | N/A | visual | Manual — verify KaTeX renders | N/A | ⬜ pending |
| 01-04-03 | 04 | 2 | FND-03 | T-1-02, T-1-04 | Zod validates all env vars at startup | unit | `npx jest apps/native/.../env-validation.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-04 | 04 | 2 | FND-06 | T-1-05 | Error messages sanitized in prod | unit | `npx jest apps/native/.../error-boundary.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-05 | 04 | 3 | FND-07 | — | N/A | manual | Manual — verify app runs on 2GB AVD | N/A | ⬜ pending |
| 01-04-06 | 04 | 3 | FND-08 | — | N/A | manual | `npx expo export --dump-sourcemap` + bundle analysis | N/A | ⬜ pending |
| 01-04-07 | 04 | 3 | NAVL-04 | — | N/A | visual | Manual — verify dark mode toggle | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/native/jest.config.js` — Jest config for React Native
- [ ] `apps/native/jest/setup.js` — Jest setup with React Native mocks
- [ ] `npm install --save-dev jest @testing-library/react-native @testing-library/jest-native` — if no framework detected
- [ ] `packages/shared/jest.config.js` — Jest config for shared package

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 5 tabs render in bottom navigation | NAVL-01 | Visual rendering requires device/emulator | Launch app on emulator, verify 5 tabs visible and navigable |
| KaTeX math expressions render as native views | AITR-04 | Math rendering is visual; no automated pixel comparison | Navigate to MathView test screen, verify formula renders correctly |
| App runs without OOM on 2GB AVD | FND-07 | Requires specific AVD profile with limited RAM | Launch app on 2GB AVD, navigate all screens, monitor memory in DevTools |
| Dark mode toggle applies theme across all screens | NAVL-04 | Full visual verification across screens | Toggle dark mode, verify all screens apply dark theme |
| Deep link opens app from email link | NAVL-03 | Requires external intent simulation | Use `adb shell am start -a android.intent.action.VIEW -d "studentos://reset-password?token=xxx"` to test |
| Bundle size within acceptable range | FND-08 | Requires production build analysis | Run `npx expo export`, check bundle size in output |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
