# StudentOS Mobile — Agent Guide

## Project

Convert the StudentOS React PWA + Capacitor wrapper into a true native React Native (Expo) Android app with pixel-perfect feature parity. See `.planning/PROJECT.md` for full context.

**Core value:** The native app must be indistinguishable from the web app.

## Stack

- **Framework:** React Native + Expo SDK 52+
- **Language:** TypeScript (strict)
- **Styling:** NativeWind v4 (TailwindCSS for RN)
- **Navigation:** Expo Router (file-based routing)
- **Animations:** Reanimated 3 + Moti
- **State:** TanStack React Query + Context API
- **Backend:** Supabase (unchanged — PostgreSQL, Auth, Storage, Edge Functions)
- **Payments:** Paystack via WebView
- **Offline:** expo-sqlite + NetInfo
- **Native Module:** Focus Mode AccessibilityService (Kotlin via Expo Modules API)

## Architecture

```
monorepo/
├── apps/
│   ├── mobile/     # React Native (Expo) app
│   └── web/        # Existing React web app (studentoss/)
├── packages/
│   └── shared/     # @studentos/shared — portable hooks, types, utils
└── .planning/      # GSD project docs
```

## GSD Workflow

- **Mode:** YOLO (auto-approve, just execute)
- **Granularity:** Standard (5-8 phases, 3-5 plans each)
- **Execution:** Parallel where possible
- **Git:** Planning docs tracked in version control

## Key Constraints

- Android-first (iOS deferred to v1.1)
- No new features — feature parity with web app only
- Must run on 2GB RAM Android 8+ devices
- No on-device AI in v1 (cloud-first)
- No Material Design redesign (replicate existing Tailwind design system)

## Commands

```bash
# Install dependencies (from monorepo root)
npm install

# Start Expo dev server
npx expo start

# Run on Android
npx expo run:android

# Run tests
npm test

# Lint
npx eslint .
```

## Key Files

| File | Purpose |
|------|---------|
| `.planning/PROJECT.md` | Project context, requirements, decisions |
| `.planning/ROADMAP.md` | 7-phase execution roadmap |
| `.planning/REQUIREMENTS.md` | 100 v1 requirements with traceability |
| `.planning/STATE.md` | Current phase/plan status |
| `.planning/config.json` | Workflow preferences |
| `.planning/research/` | Stack, features, architecture, pitfalls research |
| `studentoss/` | Existing React web app source |

## Phase Progress

| # | Phase | Status |
|---|-------|--------|
| 1 | Foundation & Platform Services | Not started |
| 2 | UI Primitives & Navigation Shell | Not started |
| 3 | Core Study & AI Features | Not started |
| 4 | Exam Prep & Advanced Tools | Not started |
| 5 | Social & Communication | Not started |
| 6 | Native Integration & Payments | Not started |
| 7 | Offline Sync, Polish & Quality | Not started |
