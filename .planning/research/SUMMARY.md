# StudentOS Mobile — Research Summary

**Project:** React Native + Expo mobile learning app  
**Researched:** April 2026  
**Confidence:** MEDIUM-HIGH

---

## Executive Summary

StudentOS Mobile is a first-class mobile counterpart to the existing StudentOS web application—a comprehensive learning OS targeting Nigerian/African students with exam preparation (WAEC/NECO/JAMB/IELTS/TOEFL), AI tutoring, gamification, and focus enforcement. The app must function offline-first with WatermelonDB local storage syncing to Supabase, feature configurable AI/payment providers, and integrate native device capabilities including biometrics and app blocking for focus mode.

The recommended stack uses Expo SDK 54 (RN 0.81) for New Architecture stability, Zustand + WatermelonDB for offline-first state, react-native-mmkv for encrypted secure storage, and React Navigation v7 for the navigation hierarchy. The architecture follows a four-layer design (UI, Business Logic, Data, Integration) with provider abstractions for AI and payments. Critical pitfalls center on security (credentials in AsyncStorage), sync reliability (concurrent syncs, device clock), and CBT integrity (timer desync in background, answer persistence).

This synthesis recommends prioritizing Phase 1-3 for MVP: foundation + auth + dashboard, then Phase 7 for offline sync engine before any cloud-dependent features.

---

## 1. Recommended Stack

One-liner per core technology:

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Expo SDK 54 + Dev Client | New Architecture stable; EAS Update support; config plugins for native features |
| **Language** | TypeScript 5.x | Runtime safety; React Navigation v7 auto-type inference |
| **Navigation** | React Navigation v7 (static API) | Auto-deep-linking; isolated re-renders; lazy screen mounting |
| **State** | Zustand v5 | 1.2KB vs Redux 15KB; zero boilerplate; MMKV persistence |
| **Offline DB** | WatermelonDB | Lazy loading; reactive queries; Supabase sync protocol |
| **Secure Storage** | react-native-mmkv v4 | 30-100x faster than AsyncStorage; AES encryption; sync hydration |
| **Animations** | react-native-reanimated v4 | UI-thread animations; CSS transitions; New Architecture |
| **PDF** | react-native-pdf-jsi | Google Play 16KB compliant; JSI 80x faster |
| **Math/LaTeX** | KaTeX + WebView | Production-grade math rendering; works offline |
| **Charts** | react-native-gifted-charts | Expo Go compatible; no Skia dependency |
| **Biometrics** | expo-local-authentication | SDK-native; Face ID/Touch ID/BiometricPrompt unified |
| **Notifications** | expo-notifications | Local + push; FCM/APNs; offline study reminders |
| **Deep Links** | expo-linking + v7 static config | Auto-generated paths; Universal Links |
| **AI Client** | OpenAI SDK + configurable env | Provider abstraction via factory pattern |

**Start on SDK 54:** Last version with Old Architecture support. Safe upgrade path to SDK 55+ in Q3 2026 after verifying WatermelonDB plugin compatibility.

---

## 2. Table Stakes Features

Essential features the app cannot ship without:

| Priority | Feature | Minimum Viable |
|----------|---------|---------------|
| 1 | Supabase Auth (email/password + social) | Standard JWT + refresh rotation |
| 2 | Biometric authentication | Face ID/Fingerprint unlock via expo-local-authentication |
| 3 | Dashboard | First-screen after login; shows progress, streak, AI tutor |
| 4 | Smart Notes (basic) | Create, edit, auto-save, course assignment |
| 5 | Offline-first database | WatermelonDB local persistence |
| 6 | AI Tutor chat | Persona selection; streaming responses via SSE |
| 7 | ExamPrep CBT | WAEC/NECO/JAMB question engine; timer; submit |
| 8 | Push notifications | Study reminders; streak alerts |
| 9 | Gamification (basic) | XP system; streak tracking; level progression |
| 10 | Payments (basic) | Paystack integration; 3-tier subscriptions |

**Note:** Offline DB (WatermelonDB) enables all features. If it fails, the app fails.

---

## 3. Differentiators

What makes StudentOS Mobile special vs. competitors:

| Category | Differentiator | Why It Wins |
|----------|-------------|------------|
| **AI Automation** | AI-generated flashcards from notes | No manual creation |
| **AI Automation** | AI quiz generation from notes | Automated content |
| **AI Automation** | AI weakness detector | Personalized study plans |
| **Content** | All-in-one OS (notes + flashcards + CBT + AI + focus) | No switching apps |
| **Focus** | App blocker (Android) | Forest-style blocking |
| **Focus** | Focus Mode with overlay | Deep work enforcement |
| **Social** | Study challenges with friends | Real-time quiz duels |
| **Social** | Group study + leaderboards | Social motivation |
| **Parental** | Parent PIN + content filters | K-12 market segment |
| **Market** | Mobile money (MTN MoMo, M-Pesa) | 60%+ African users excluded by cards |

**Moat:** Competitors are siloed (CBT OR gamification OR flashcard OR AI). StudentOS integrates all features with AI automation—unique in the Nigerian/African market.

---

## 4. Key Architectural Decisions

Critical choices that enable the feature set:

| Decision | Approach | Rationale |
|----------|----------|----------|
| **Local Database** | WatermelonDB with sync engine | Lazy loading critical for 50+ exam prep sets |
| **Sync Strategy** | Two-phase (pull then push) + last-write-wins | WatermelonDB standard; server timestamps |
| **AI Abstraction** | Factory pattern + env variables | Switch providers without code changes |
| **Payment Abstraction** | Paystack primary, Flutterwave secondary | Nigerian market coverage |
| **Streaming** | react-native-sse (polyfill-free) | Tokens appear progressively |
| **Math Rendering** | KaTeX via WebView | Production-grade; offline works |
| **Navigation** | React Navigation v7 bottom tabs + nested stacks | Familiar mobile pattern |
| **Native Modules** | expo-app-blocker via Dev Client | iOS Screen Time APIs + Android UsageStats |
| **State Layers** | Zustand (transient) + WatermelonDB (persistent) | Clear separation |

**Four-Layer Architecture:**
1. **UI Layer** — Screens, components, navigation
2. **Business Logic Layer** — Zustand stores, custom hooks
3. **Data Layer** — WatermelonDB + Supabase sync
4. **Integration Layer** — AI providers, payment providers, native modules

---

## 5. Watch Out For

Top pitfalls to prevent (from 32 documented):

### Critical (Must Prevent)
1. **Credentials in AsyncStorage** — Tokens expose as plaintext. Use expo-secure-store (iOS Keychain / Android Keystore).
2. **Concurrent Sync Race** — Multiple `synchronize()` calls break. Implement sync lock with ref.
3. **API Keys in Client** — AI keys visible in JS bundle. Route through backend proxy.
4. **Payment Verification Client-Side** — Spoofable. Verify via webhook server-side.
5. **CBT Timer Desync** — Background app = wrong time. Store start time, recalculate on foreground.

### High Impact
6. **Answer Not Saved on Network Fail** — Lose exam data. Save to WatermelonDB immediately, sync in background.
7. **Biometric Bypass** — Local success check spoofable. Unlock secure credentials, validate with server.

### Moderate
8. **New Architecture Incompatibility** — Some native modules fail. Test early; keep old arch for production.
9. **FlatList at Scale** — 10,000+ questions lag. Use getItemLayout, pagination.
10. **Device Clock Dependence** — Conflict resolution breaks. Use server-assigned timestamps.

---

## 6. MVP Scope

**Phase 1-3 (MVP):**

| Phase | Deliverables | Features Enabled |
|-------|------------|----------------|
| Phase 0 | WatermelonDB schema, sync engine, Zustand stores, navigation | All |
| Phase 1 | Auth (Supabase + biometric + PIN) | All features |
| Phase 2 | Dev environment (Dev Client, new arch config) | Native modules |
| Phase 3 | Dashboard, basic notes, offline DB | Core learning |

**Phase 4-8 (Post-MVP):**

| Phase | Deliverables | Features |
|-------|------------|----------|
| Phase 4 | API Gateway / provider abstraction | AI + payments |
| Phase 5 | Security foundation (SecureStore, cert pinning) | All features |
| Phase 6 | AI Tutor with streaming | Core differentiator |
| Phase 7 | Offline sync engine | Cloud features work |
| Phase 8 | Flashcards + SM-2 | Spaced repetition |

**Scope: MVP ships with auth, notes, AI tutor, exam CBT, offline-first, basic gamification, and basic payments.** Everything else lands in post-MVP phases.

---

## 7. Phase Ordering Hints

Recommended phase structure with rationale:

```
Phase 0 (Foundation)
├── WatermelonDB setup + schema
├── Sync engine skeleton
├── Zustand stores
├── React Navigation v7 structure
└── WHY: All features depend on local DB. Don't skip.

Phase 1 (Auth & Security)
├── Supabase Auth (email + social)
├── Biometric unlock
├── App lock PIN
└── WHY: All subsequent features require auth state.

Phase 2 (Dev Environment)
├── expo-dev-client in dependencies
├── New/old architecture config
└── WHY: Native modules require Dev Client.

Phase 3 (Dashboard + Notes)
├── Home dashboard
├── Basic notes CRUD
└── WHY: First impressions. Core content.

Phase 4 (API Gateway)
├── Provider abstraction factories
├── Backend proxy for AI
└── WHY: AI features route through custom backend.

Phase 5 (Security Foundation)
├── expo-secure-store for tokens
├── Certificate pinning
└── WHY: Security non-negotiable.

Phase 6 (AI Tutor)
├── Streaming chat
├── Persona selection
└── WHY: Primary differentiator.

Phase 7 (Offline Sync Engine)
├── Sync engine with lock
├── Conflict resolution
├── Sync status UI
└── WHY: Cloud features won't work without it.

Phase 8 (Flashcards)
├── SM-2 spaced repetition
├── AI generation
└── WHY: Requires offline sync working.
```

**Critical dependencies:**
- Phase 0 → Phases 1, 3, 7 (foundation for all)
- Phase 1 → Phase 5 (auth state for security)
- Phase 3 → Phase 6 (notes context for AI)
- Phase 7 → Phase 8 (offline sync for flashcards)
- Phase 7 → Phase 14 (CBT engine)

**Research flags:**
- Phase 14 (CBT Engine): Needs deeper research on question randomization and weakness analytics
- Phase 15 (Payments): Needs research on Flutterwave USSD flow implementation
- Phase 20 (App Blocker): Needs research on iOS Screen Time API approval process

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Primary sources verified; SDK versions current |
| Features | MEDIUM-HIGH | Market analysis + competitor apps verified |
| Architecture | HIGH | Pattern well-documented; production-proven |
| Pitfalls | HIGH | Community discussions confirm issues |

**Gaps to address during planning:**
- CBT question bank sourcing strategy
- WatermelonDB sync conflict resolution specifics for exam answers
- iOS Screen Time API approval timeline
- Mobile money (MTN MoMo) integration details

---

## Sources Aggregated

- STACK.md: Expo SDK changelogs, React Navigation v7 docs, WatermelonDB docs, react-native-mmkv GitHub
- FEATURES.md: Nigerian EdTech market analysis, Duolingo/Quizlet/Khan Academy patterns
- ARCHITECTURE.md: WatermelonDB sync guide, Supabase offline-first blog, factory pattern implementations
- PITFALLS.md: WatermelonDB GitHub issues, Expo docs, React Native performance guides

---

*Summary committed: 2026-04-25*