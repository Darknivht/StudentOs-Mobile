# StudentOS Mobile — Native Android Conversion

## What This Is

StudentOS is a comprehensive AI-powered learning operating system for Nigerian and international students, currently running as a React 18 + TypeScript + Vite PWA wrapped with Capacitor 8 for Android. This project converts it into a true native Android app using React Native (Expo), while maintaining pixel-perfect UI parity with the existing web app. The conversion also addresses identified technical weaknesses (no tests, hardcoded keys, no env validation, bundle size, offline sync, error boundaries, security).

## Core Value

The native app must be **indistinguishable from the web app** — same UI, same features, same architecture, same UX. Users should not recognize any difference except improved performance and native platform integration.

## Requirements

### Validated

- ✓ React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui component system — existing
- ✓ Supabase backend (PostgreSQL, Auth, Storage, Edge Functions) — existing
- ✓ 30+ pages covering notes, AI tutor, flashcards, quizzes, exam prep (WAEC/NECO/JAMB/IELTS/TOEFL/SAT/GRE), study suite, AI tools, career module, social hub, chat, store, gamification, achievements, parental controls — existing
- ✓ Paystack payment integration (Free/Plus/Pro tiers + per-exam subscriptions) — existing
- ✓ AI integration via Lovable AI Gateway (Gemini 2.5, GPT-5) + WebLLM on-device inference — existing
- ✓ PWA with service worker, IndexedDB offline sync, background sync — existing
- ✓ Capacitor 8 Android wrapper with custom FocusMode plugin (AccessibilityService app blocker) — existing
- ✓ Framer Motion animations, onboarding flow, Pomodoro timer — existing
- ✓ Dark mode, responsive layout, PDF export (Fast + HD modes) — existing
- ✓ Real-time chat (DMs + groups) via Supabase Realtime — existing

### Active

- [ ] Replace Capacitor wrapper with React Native (Expo) native Android app
- [ ] Replicate all 30+ pages with pixel-perfect UI parity using React Native equivalents
- [ ] Replace shadcn/ui + Radix with React Native equivalent component library (e.g., React Native Paper, Gluestack UI, or custom NativeWind + Reanimated)
- [ ] Replace React Router with Expo Router (file-based routing)
- [ ] Replace TailwindCSS web with NativeWind (Tailwind for React Native)
- [ ] Replace Framer Motion with React Native Reanimated 3
- [ ] Rebuild Focus Mode plugin as native Android AccessibilityService (Kotlin/Java module)
- [ ] Add comprehensive test suite (unit + integration + E2E)
- [ ] Move Paystack key to environment variables with validation
- [ ] Add environment variable validation (zod or similar)
- [ ] Optimize bundle size (code splitting, lazy loading, tree shaking)
- [ ] Add per-route error boundaries
- [ ] Improve offline sync reliability
- [ ] Add frontend API rate limiting
- [ ] Ensure all existing Supabase integrations work natively
- [ ] Ensure Paystack payment flow works natively (Paystack React Native SDK or WebView)

### Out of Scope

- iOS build — focus on Android first; iOS support deferred (Expo makes it achievable later but not in v1)
- Redesign of existing UI — this is a conversion, not a redesign
- New features beyond what the web app currently has — feature parity only
- Backend changes — Supabase schema and edge functions remain unchanged
- Web app removal — web app continues to exist alongside native app

## Context

- **Existing codebase** is a brownfield React PWA at `studentoss/` with 30+ pages, 40+ shadcn/ui components, 20+ custom hooks, 8 Supabase edge functions
- **Current mobile strategy** uses Capacitor 8 to wrap the PWA — this creates a WebView-based app with poor native integration
- **Focus Mode** is the killer native feature — it uses a custom Java AccessibilityService to block distracting apps during study sessions. This MUST work in the native app and requires a native module.
- **Target market** is Nigerian students on low-to-mid-range Android devices — performance and offline capability are critical
- **Supabase** is the sole backend — all data, auth, storage, and edge functions run through it
- **Paystack** is the payment gateway — specific to Nigerian market (cards, bank transfer, USSD)
- **AI features** rely on Lovable AI Gateway (cloud) + WebLLM (on-device). On-device inference will need a React Native equivalent (e.g., ONNX Runtime React Native or expo-ml)
- **No tests exist** — this is a critical gap that should be addressed during conversion
- **Known security issue** — Paystack test key hardcoded in source

## Constraints

- **Tech Stack**: React Native (Expo) — chosen because it shares the most architectural patterns with the existing React codebase (hooks, components, TypeScript), enabling maximum code reuse and fastest path to parity
- **Backend**: Supabase must remain unchanged — no schema migrations, no new edge functions for the native app
- **Payments**: Paystack must work natively — Nigerian market requires bank transfer + USSD support
- **Performance**: Must run smoothly on low-end Android devices (2GB RAM, older Android versions)
- **Offline**: Core features (notes, flashcards, courses) must work offline
- **Android-first**: iOS deferred — not a constraint on architecture (Expo supports both), but no iOS testing/building in v1
- **Feature Parity**: No feature may be missing or degraded compared to the web app

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native (Expo) over Kotlin/Flutter | Shares React architecture (hooks, components, TypeScript), fastest path to parity, team can reuse patterns. Kotlin = full rewrite. Flutter = different paradigm. | — Pending |
| Expo over bare React Native | Managed workflow simplifies native module integration, OTA updates, build process. Ejection available if needed for Focus Mode plugin. | — Pending |
| NativeWind (TailwindCSS) for styling | Closest match to existing TailwindCSS utility classes, enables reuse of design tokens and theme configuration | — Pending |
| Expo Router for navigation | File-based routing matches React Router v6 patterns, supports deep linking, typed routes | — Pending |
| Reanimated 3 for animations | Closest equivalent to Framer Motion, supports shared transitions, gesture-based animations | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-05 after initialization*
