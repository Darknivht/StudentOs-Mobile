# Stack Research

**Domain:** React PWA → React Native (Expo) Android conversion — StudentOS educational platform
**Researched:** 2026-05-05
**Confidence:** HIGH

## Current Web Stack (Source)

| Category | Technology | Version | Role |
|----------|-----------|---------|------|
| Language | TypeScript | 5.8.3 | Primary language |
| UI Framework | React | 18.3.1 | Component model |
| Build Tool | Vite | 5.4.19 | Dev server + bundler |
| Routing | React Router DOM | 6.30.1 | Client-side routing |
| State Management | TanStack React Query | 5.83.0 | Server state |
| Styling | TailwindCSS | 3.4.17 | Utility-first CSS |
| Component Library | shadcn/ui (Radix) | via Radix | Headless UI components |
| Animations | Framer Motion | 12.23.26 | Declarative animations |
| Dark Mode | Next Themes | 0.3.0 | Theme switching |
| Backend | Supabase | latest | Auth, DB, Storage, Realtime, Edge Functions |
| Payments | Paystack | Inline JS SDK | Nigerian payment gateway |
| AI (Cloud) | Lovable AI Gateway | — | Gemini 2.5, GPT-5 |
| AI (On-device) | @mlc-ai/web-llm + @huggingface/transformers | — | WASM-based inference |
| Mobile Wrapper | Capacitor | 8.0.0 | Android WebView wrapper |
| PWA | vite-plugin-pwa | — | Service Worker, offline |
| PDF | jsPDF + html2canvas | — | PDF generation |
| Math | KaTeX | — | Math rendering |
| Icons | lucide-react | — | Icon library |

## Recommended Native Stack (Target)

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| Framework | React Native (Expo SDK 54) | 54+ | Managed workflow, OTA updates, native module API |
| Language | TypeScript | 5.x | Shared with web; same type system |
| Routing | Expo Router | v4+ | File-based routing, deep linking, typed routes |
| State Management | TanStack React Query | 5.x | Same as web; works in RN with persistence adapter |
| Styling | NativeWind v4 | 4.x | TailwindCSS v3 for RN; stable, NOT v5 (beta) |
| Component Library | NativeWindUI | latest | RN-native components with NativeWind className API |
| Animations | React Native Reanimated 3 | 3.x | Closest Framer Motion equivalent; worklet-based |
| Animation Bridge | Moti | latest | Declarative API on top of Reanimated; eases Framer Motion migration |
| Gesture Handling | react-native-gesture-handler | 2.x | Required companion to Reanimated |
| Dark Mode | NativeWind useColorScheme | built-in | Replaces Next Themes |
| Backend | Supabase JS Client | latest | Same SDK; RN-compatible with storage adapter |
| Auth Storage | expo-secure-store | latest | Encrypted token storage (Android Keystore) |
| Local DB | expo-sqlite | latest | Replaces IndexedDB; structured + KV store |
| Offline Detection | @react-native-community/netinfo | latest | Replaces navigator.onLine |
| Payments | Paystack via WebView (MVP) | react-native-webview | No official RN SDK; WebView checkout intercept |
| AI | Cloud-only via Supabase Edge Functions | — | On-device inference deferred (WASM/browser-only) |
| PDF Export | expo-print + react-native-view-shot | latest | Replaces html2canvas/jsPDF DOM pipeline |
| Math | react-native-math-view | latest | Native KaTeX rendering; no WebView per expression |
| Icons | @roninoss/icons | latest | RN-compatible icon library |
| Lists | @shopify/flash-list | latest | High-performance virtualized lists |
| Sheets | @gorhom/bottom-sheet | latest | Native bottom sheets (replaces Radix Dialog/Sheet) |
| Navigation Containers | expo-router Tabs + Stack | built-in | Replaces React Router |
| Local Storage | expo-sqlite/kv-store | latest | Replaces localStorage; used by React Query persister |
| Text-to-Speech | expo-speech | latest | Replaces window.speechSynthesis |
| Speech-to-Text | expo-voice | latest | Replaces webkitSpeechRecognition |
| Camera | expo-camera | latest | For Book Scanner, OCR tools |
| Audio | expo-audio | latest | For Lecture Recorder |
| File System | expo-file-system | latest | File storage, downloads |
| Sharing | expo-sharing | latest | Replaces navigator.share |
| Clipboard | expo-clipboard | latest | Replaces navigator.clipboard |
| Haptics | expo-haptics | latest | Native feedback on interactions |
| OTA Updates | expo-updates / EAS Update | latest | Replaces Service Worker PWA updates |
| Dev Client | expo-dev-client | latest | Required for custom native modules (FocusMode) |
| Native Module | expo-focus-mode (custom) | local | Kotlin AccessibilityService for app blocking |

## Version Requirements

| Package | Minimum Version | Why |
|---------|----------------|-----|
| Expo SDK | 54+ | expo-sqlite/kv-store, improved monorepo support |
| NativeWind | 4.x (NOT 5.x) | v5 is beta/preview; v4 is stable with TW v3 |
| React Native Reanimated | 3.x | Required for shared transitions, worklets |
| expo-sqlite | latest (SDK 54) | localStorage polyfill, KV store, structured queries |

## Monorepo Setup

The web app continues to exist alongside the native app. Shared code goes in `packages/shared/`:

```
StudentOs-Mobile/
├── apps/web/       # Existing React PWA
├── apps/native/    # New React Native (Expo) app
├── packages/shared/ # @studentos/shared — business logic, types, config
└── supabase/       # Edge functions (unchanged)
```

**@studentos/shared** contains: Supabase types, domain models, business logic utilities, subscription config, AI gateway config, pure TypeScript hooks (via dependency injection). No platform-specific imports allowed.

## Sources

- **Expo SDK 54 documentation** — expo-sqlite, expo-router, expo-modules, monorepo support
- **NativeWind v4 documentation** — stable release, TailwindCSS v3 compatibility
- **React Native Reanimated 3** — official docs, worklet architecture
- **Supabase JS Client** — React Native support, storage adapter pattern
- **PROJECT.md** — Stack decisions (Expo, NativeWind, Expo Router, Reanimated)
- **Codebase STACK.md** — Current web stack versions and dependencies
- **ARCHITECTURE.md (research)** — Monorepo structure, component mapping, code sharing strategy

---
*Stack research for: StudentOS Mobile — React PWA to React Native (Expo) conversion*
*Researched: 2026-05-05*
