# Architecture Patterns: StudentOS Mobile

**Researched:** 2026-04-25
**Domain:** Mobile Learning Application Architecture
**Confidence:** HIGH

## Executive Summary

This architecture document establishes the foundational patterns for StudentOS Mobile, a React Native + Expo mobile learning application that operates as a first-class native counterpart to the existing StudentOS web application. The architecture addresses ten critical architectural dimensions: offline-first data persistence, configurable AI provider abstraction, payment provider abstraction, native module integration for app blocking, streaming AI responses, mathematical notation rendering, API service layer design, navigation hierarchy, state management, and component organization. Each dimension presents distinct challenges that require careful architectural decisions to ensure the application delivers production-grade performance while maintaining the flexibility to support configurable providers for AI and payments, offline-first operation with background synchronization, and native device features including app blocking for focus mode.

The recommended architecture follows a layered approach with clear separation of concerns: the **UI Layer** handles presentation and user interaction through React Navigation, the **Business Logic Layer** orchestrates feature-specific operations through Zustand stores and custom hooks, the **Data Layer** manages persistence through WatermelonDB and synchronization with Supabase, and the **Integration Layer** abstracts external services including AI providers, payment gateways, and native device capabilities. This separation enables the configurability requirements while maintaining testability and maintainability across a 30+ phase implementation roadmap.

## System Overview

### High-Level Architecture

The StudentOS Mobile architecture follows a four-layer design that separates concerns while enabling the configurable provider requirements central to the project specification. This architecture prioritizes offline-first operation as the default user experience, with background synchronization to Supabase when network connectivity is available. The architecture also accommodates the requirement for configurable AI and payment providers by implementing provider abstraction patterns that allow environment-variable-driven provider selection without code changes.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         UI LAYER                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  Screens   │  │ Components  │  │ Navigation │  │  Modals  │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘ │
└────────┼──────────────┼──────────────┼──────────────┼───────────┘
         │             │              │              │
         ▼             ▼              ▼              ▼
┌───────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                             │
│  ┌──────────────┐  ┌───��──────────┐  ┌──────────────┐          │
│  │   Zustand   │  │   Hooks     │  │  Services   │          │
│  │   Stores   │  │  (Custom)   │  │ (AI,Pay)   │          │
│  └─────┬──────┘  └──────┬──────┘  └─────┬──────┘          │
└────────┼──────────────┼──────────────┼──────────────┘
         │             │              │
         ▼             ▼              ▼
┌───────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                        │
│  ┌────────────────┐  ┌────────────────┐               │
│  │  WatermelonDB  │  │  Supabase    │               │
│  │  (Local SQLite│  │  (Remote DB) │               │
│  │  + Sync Engine│  │  + Edge Funcs│               │
│  └───────┬───────┘  └──────┬──────┘               │
└─────────┼──────────────────┼──────────────────────┘
          │                  │
          ▼                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ AI Providers│  │Payment Provs│  │ Native Mods│             │
│  │ (Config.)  │  │ (Config.)  │  │ (AppBlock)│             │
│  └────────────┘  └────────────┘  └────────────┘             │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

The data flow architecture distinguishes between online and offline operation modes, with WatermelonDB serving as the primary data store and Supabase as the synchronized backend. This offline-first approach ensures that user interactions feel instantaneous regardless of network status, with synchronization occurring in the background when connectivity is available.

**Online Data Flow:** When the device has network connectivity, user actions write to WatermelonDB immediately for instant UI feedback, then queue synchronization operations to Supabase through the sync engine. The sync engine batches changes and pushes them to Supabase using RPC calls, with the server responding with applied changes that are then pulled to the local database. If conflicts are detected during synchronization, the sync engine applies the configured conflict resolution strategy (default: last-write-wins based on timestamp comparison).

**Offline Data Flow:** When the device lacks network connectivity, user actions write to WatermelonDB normally without attempting synchronization. The sync engine tracks pending changes in a sync queue and monitors network status through NetInfo. When connectivity is restored, the sync engine triggers automatic synchronization with exponential backoff for failed operations. Users see an offline indicator in the UI when operating without connectivity.

### Key Architectural Decisions Summary

| Decision Area | Recommended Approach | Rationale |
|-------------|---------------------|----------|
| Local Database | WatermelonDB | Purpose-built for React Native with lazy loading and native thread execution |
| Sync Strategy | Two-phase sync (pull then push) with last-write-wins | Follows WatermelonDB standard pattern; last-write-wins handles most conflicts |
| AI Abstraction | Factory pattern with environment variable configuration | Enables configurable providers without code changes |
| Payment Abstraction | Provider interface with environment variable selection | Supports Paystack, Flutterwave, or other providers |
| Streaming | react-native-fetch-sse or react-native-ai-kit | Polyfill-free SSE consumption for Expo |
| Math Rendering | @dawsonxiong/react-native-latex-renderer (MathView) | Native SVG rendering, works offline, no WebView |
| Navigation | React Navigation v7 (Bottom Tabs + Stack) | Matches project requirements; familiar mobile pattern |
| State Management | Zustand for global state, WatermelonDB for persistence | Lightweight, TypeScript-native, minimal boilerplate |
| Native Modules | expo-app-blocker via Expo Dev Client | Cross-platform app blocking with full Expo integration |

## Component Boundaries and Responsibilities

### Navigation Components

The navigation architecture implements a bottom tab navigation structure with nested stack navigators for each feature area. This hierarchical navigation design provides familiar mobile navigation patterns while organizing features into logical groupings that mirror the web application's sidebar structure.

**Root Navigation Structure:**

| Navigator | Type | Purpose | Child Screens |
|-----------|------|---------|--------------|
| AuthStack | Stack | Authentication flows | SignIn, SignUp, ForgotPassword, VerifyEmail |
| MainTabs | Bottom Tabs | Primary navigation | HomeTab, StudyTab, SocialTab, ProfileTab |
| HomeStack | Stack | Home and dashboard | Dashboard, CourseDetail, AnnouncementDetail |
| StudyStack | Learning features | Notes, Flashcards, Quizzes, AI Tutor | NotesList, NoteDetail, NoteEditor, FlashcardsList, FlashcardReview, QuizzesList, QuizSession, AITutorChat |
| FocusStack | Focus and planning | Pomodoro, Schedule, FocusMode | Pomodoro, Schedule, FocusMode, FocusSession |
| SocialStack | Community features | Chat, Groups, Leaderboard | ChatList, ChatDetail, GroupsList, GroupDetail, Leaderboard |
| ProfileStack | User account | Settings, Achievements, Store | Profile, Settings, Achievements, Store, Upgrade |

**Navigation Responsibilities:**

| Component | Responsibility | Communication |
|-----------|---------------|---------------|
| RootNavigator | Conditionally renders AuthStack or MainTabs based on auth state | Uses auth store to determine initial route |
| MainTabs | Provides bottom tab bar with 4 primary tabs | Each tab hosts nested stack navigator |
| TabBar | Renders tab icons, badges for notifications | Updates badges from respective stores |
| StackNavigator | Manages screen stack within each tab area | Handles back navigation, gesture navigation |
| Screen | Renders feature-specific UI | Uses hooks and stores for data |

### API Service Layer Components

The API service layer abstracts all external communication including Supabase database operations, AI provider requests, and payment processing. This layer implements provider abstraction patterns that enable environment-variable-driven provider configuration without code changes.

**Core Service Components:**

| Service | Responsibility | Public API |
|---------|-------------|-----------|
| SupabaseClient | Database connection, auth, realtime | `supabase`, `auth`, `realtime` |
| SyncEngine | Local-to-remote synchronization | `sync()`, `push()`, `pull()`, `getStatus()` |
| AIProviderFactory | AI provider abstraction | `createProvider(config)`, `listProviders()` |
| AIChatService | Streaming AI chat interface | `sendMessage()`, `streamMessage()`, `abort()` |
| PaymentProviderFactory | Payment provider abstraction | `createProvider(config)`, `processPayment()` |
| PaymentService | Payment processing | `initializeTransaction()`, `verifyPayment()` |

**AI Provider Abstraction Pattern:**

The AI provider abstraction implements a factory pattern that creates provider-specific implementations based on environment configuration. This design enables users to configure different AI providers (OpenAI, Anthropic, Google Gemini, or custom endpoints) through environment variables while presenting a unified API to the application.

```typescript
// src/services/ai/providerFactory.ts

interface AIProviderConfig {
  provider: string;           // 'openai' | 'anthropic' | 'gemini' | 'custom'
  baseURL?: string;          // Custom endpoint base URL
  apiKey: string;           // Provider API key
  model?: string;           // Model name
  maxTokens?: number;        // Maximum response tokens
  temperature?: number;      // Sampling temperature (0-2)
}

interface AI_message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIProvider {
  name: string;
  sendMessage(messages: AI_message[]): Promise<string>;
  streamMessage(messages: AI_message[], onChunk: (chunk: string) => void): Promise<void>;
  abort(): void;
}

class AIProviderFactory {
  private static config: AIProviderConfig | null = null;

  static initialize(config: AIProviderConfig): void {
    this.config = config;
  }

  static createProvider(): AIProvider {
    if (!this.config) {
      throw new Error('AIProviderFactory not initialized');
    }

    switch (this.config.provider) {
      case 'openai':
        return new OpenAIProvider(this.config);
      case 'anthropic':
        return new AnthropicProvider(this.config);
      case 'gemini':
        return new GeminiProvider(this.config);
      case 'custom':
        return new CustomProvider(this.config);
      default:
        throw new Error(`Unknown AI provider: ${this.config.provider}`);
    }
  }

  static getConfig(): AIProviderConfig | null {
    return this.config;
  }
}
```

**Payment Provider Abstraction Pattern:**

The payment provider abstraction follows the same factory pattern as AI, enabling configurable payment providers through environment variables. This supports the current Paystack integration while allowing future providers like Flutterwave.

```typescript
// src/services/payment/providerFactory.ts

interface PaymentProviderConfig {
  provider: string;         // 'paystack' | 'flutterwave' | 'custom'
  publicKey: string;       // Provider public key
  environment?: string;     // 'test' | 'live'
}

interface PaymentTransaction {
  reference: string;
  amount: number;
  email: string;
  currency: string;
  plan?: string;
}

interface PaymentResult {
  success: boolean;
  reference?: string;
  message?: string;
  transaction?: any;
}

interface PaymentProvider {
  name: string;
  initializeTransaction(transaction: PaymentTransaction): Promise<{ accessCode: string; reference: string }>;
  verifyPayment(reference: string): Promise<PaymentResult>;
}

class PaymentProviderFactory {
  private static config: PaymentProviderConfig | null = null;

  static initialize(config: PaymentProviderConfig): void {
    this.config = config;
  }

  static createProvider(): PaymentProvider {
    if (!this.config) {
      throw new Error('PaymentProviderFactory not initialized');
    }

    switch (this.config.provider) {
      case 'paystack':
        return new PaystackProvider(this.config);
      case 'flutterwave':
        return new FlutterwaveProvider(this.config);
      default:
        throw new Error(`Unknown payment provider: ${this.config.provider}`);
    }
  }
}
```

### State Management Components

The state management architecture combines Zustand for global application state with WatermelonDB for persistent offline data. This dual-layer state approach ensures that transient UI state (loading indicators, form inputs) remains in memory while persistent data survives app restarts.

**Zustand Stores:**

| Store | Responsibility | Key State |
|-------|---------------|----------|
| AuthStore | User authentication | `user`, `session`, `isAuthenticated`, `subscription` |
| AppStore | Application settings | `theme`, `language`, `offlineMode` |
| NotesStore | Notes CRUD | `notes`, `selectedNote`, `isLoading` |
| FlashcardsStore | Flashcard management | `decks`, `currentReview`, `progress` |
| AIChatStore | AI tutor conversations | `messages`, `isStreaming`, `currentPersona` |
| FocusStore | Pomodoro and focus | `session`, `timer`, `blockedApps` |
| SyncStore | Sync status | `isOnline`, `pendingChanges`, `lastSyncAt` |
| PaymentStore | Subscription state | `subscription`, `availablePlans` |

**Store Pattern:**

```typescript
// src/stores/exampleStore.ts

import { create } from 'zustand';
import { createMMKVStorage } from '../storage/mmkv';

interface ExampleState {
  items: ExampleItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: ExampleItem) => Promise<void>;
}

export const useExampleStore = create<ExampleState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await exampleApi.getItems();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addItem: async (item) => {
    try {
      await exampleApi.createItem(item);
      set((state) => ({ items: [...state.items, item] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
```

### Native Module Components

The native module architecture supports app blocking functionality through the expo-app-blocker package, which provides cross-platform app blocking using native platform APIs. This requires Expo Dev Client and cannot run in standard Expo Go.

**Native Module Integration:**

| Module | Platform | Purpose | Native API |
|--------|----------|---------|-----------|
| AppBlocker | iOS | Screen Time API (FamilyControls, ManagedSettings, DeviceActivity) | iOS Screen Time APIs |
| AppBlocker | Android | UsageStatsManager + Foreground Service + System Overlay | Android UsageStats |
| FocusOverlay | Both | Full-screen focus during focus sessions | Native Overlay |

**Integration Pattern:**

```typescript
// src/services/native/appBlocker.ts

import {
  AppBlockerModule,
  FamilyActivityPicker,
  ShieldConfiguration,
} from 'expo-app-blocker';

class AppBlockerService {
  private static isInitialized = false;
  private static blockedApps: string[] = [];

  static async initialize(): Promise<void> {
    if (AppBlockerService.isInitialized) return;

    await AppBlockerModule.initialize();
    AppBlockerService.isInitialized = true;
  }

  static async openAppPicker(): Promise<string[]> {
    return new Promise((resolve) => {
      FamilyActivityPicker.present(
        (apps) => resolve(apps),
        () => resolve([])
      );
    });
  }

  static async startBlocking(appIds: string[]): Promise<void> {
    await AppBlockerModule.setBlockedApps(appIds);
    await AppBlockerModule.startBlocking();
    AppBlockerService.blockedApps = appIds;
  }

  static async stopBlocking(): Promise<void> {
    await AppBlockerModule.stopBlocking();
    AppBlockerService.blockedApps = [];
  }

  static async unlockTemporarily(minutes: number): Promise<void> {
    await AppBlockerModule.unlockTemporarily(minutes * 60 * 1000);
  }

  static configureShield(config: ShieldConfiguration): void {
    AppBlockerModule.configureShield(config);
  }
}
```

## Project Structure

### Recommended Directory Structure

The recommended project structure follows React Native + Expo conventions while organizing code to support the feature complexity across 30+ phases. The structure prioritizes co-location of related features while maintaining clear separation between layers.

```
StudentOSMobile/
├── app/                          # Expo Router app directory
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── _layout.tsx
│   ├── (main)/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── home/
│   │   │   │   ├── index.tsx
│   │   │   │   └── course/[id].tsx
│   │   │   ├── study/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── notes/
│   │   │   │   ├── flashcards/
│   │   │   │   ├── quizzes/
│   │   │   │   └── tutor/
│   │   │   ├── social/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── chat/
│   │   │   │   └── groups/
│   │   │   └── profile/
│   │   │       ├── index.tsx
│   │   │       ├── settings.tsx
│   │   │       └── achievements.tsx
│   │   ├── focus/
│   │   │   ├── index.tsx
│   │   │   ├── pomodoro.tsx
│   │   │   └── session.tsx
│   │   └── _layout.tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── ui/                   # Base UI components (shadcn pattern)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   ├── navigation/            # Navigation-specific components
│   │   │   ├── TabBar.tsx
│   │   │   └── Header.tsx
│   │   └── features/             # Feature-specific co-located components
│   │       ├── notes/
│   │       ├── flashcards/
│   │       ├── ai-tutor/
│   │       └── focus/
│   ├── stores/                  # Zustand stores (global state)
│   │   ├── authStore.ts
│   │   ├── appStore.ts
│   │   ├── notesStore.ts
│   │   ├── flashcardsStore.ts
│   │   ├── aiChatStore.ts
│   │   ├── focusStore.ts
│   │   ├── syncStore.ts
│   │   └── index.ts
│   ├── database/                # WatermelonDB setup
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── models/
│   │       ├── Note.ts
│   │       ├── Flashcard.ts
│   │       ├── Course.ts
│   │       └── index.ts
│   ├── services/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── sync.ts
│   │   ├── ai/
│   │   │   ├── providerFactory.ts
│   │   │   ├── providers/
│   │   │   │   ├── openai.ts
│   │   │   │   ├── anthropic.ts
│   │   │   │   │   └── gemini.ts
│   │   │   └── streaming.ts
│   │   ├── payment/
│   │   │   ├── providerFactory.ts
│   │   │   └── providers/
│   │   │       └── paystack.ts
│   │   └── native/
│   │       └── appBlocker.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOfflineStatus.ts
│   │   ├── useSync.ts
│   │   ├── useStreamingAI.ts
│   │   └── useMath.ts
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── theme.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── config/
│       └── providers.ts         # Provider configuration via environment
├── android/                     # Native Android directory (generated)
├── ios/                         # Native iOS directory (generated)
├── plugins/                     # Expo config plugins
├── index.js                    # Entry point
├── app.json                    # Expo configuration
├── babel.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### Key Files and Their Roles

| File Path | Purpose | Dependencies |
|-----------|---------|--------------|
| app/_layout.tsx | Root layout with providers | React Navigation, Zustand |
| src/database/schema.ts | WatermelonDB schema definition | WatermelonDB |
| src/database/models/*.ts | WatermelonDB model classes | WatermelonDB |
| src/services/supabase/client.ts | Supabase client singleton | @supabase/supabase-js |
| src/services/supabase/sync.ts | Sync engine implementation | WatermelonDB, Supabase |
| src/services/ai/providerFactory.ts | AI provider abstraction | All AI providers |
| src/services/payment/providerFactory.ts | Payment provider abstraction | Paystack |
| src/stores/*.ts | Zustand store definitions | zustand |
| src/hooks/*.ts | Custom React hooks | Stores, services |
| android/ or ios/ directories | Native modules | Expo Dev Client |

## Architectural Patterns

### Offline-First Pattern with WatermelonDB

The offline-first pattern ensures that all data operations occur against WatermelonDB first, with synchronization to Supabase happening in the background. This pattern prioritizes user experience by providing instant feedback regardless of network status, while ensuring data eventually reaches the server.

**Core Pattern Implementation:**

```typescript
// src/services/supabase/sync.ts

import { Database } from '../database';
import { createClient } from '@supabase/supabase-js';

interface SyncOptions {
  tables: string[];
  conflictStrategy: 'last-write-wins' | 'server-wins' | 'client-wins';
  syncInterval: number;
  maxRetries: number;
}

class SyncEngine {
  private database: Database;
  private supabase: any;
  private options: SyncOptions;
  private isSyncing = false;
  private syncQueue: any[] = [];

  constructor(database: Database, supabase: any, options: SyncOptions) {
    this.database = database;
    this.supabase = supabase;
    this.options = options;
  }

  async sync(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // Phase 1: Pull remote changes
      await this.pullChanges();

      // Phase 2: Push local changes
      await this.pushChanges();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  private async pullChanges(): Promise<void> {
    const lastPulledAt = await this.getLastPulledAt();

    const { data, error } = await this.supabase.rpc('pull_changes', {
      last_pulled_at: lastPulledAt,
      tables: this.options.tables,
    });

    if (error) throw error;

    await this.database.write(async (tx) => {
      for (const table of this.options.tables) {
        const changes = data[table] || [];
        for (const record of changes) {
          await tx.get(table).update(record);
        }
      }
    });

    await this.setLastPulledAt(new Date().toISOString());
  }

  private async pushChanges(): Promise<void> {
    const changes = await this.getPendingChanges();
    if (changes.length === 0) return;

    const { data, error } = await this.supabase.rpc('push_changes', {
      changes: JSON.stringify(changes),
    });

    if (error) throw error;

    if (data.conflicts) {
      await this.handleConflicts(data.conflicts);
    }

    await this.markChangesSynced(changes);
  }

  private async handleConflicts(conflicts: any[]): Promise<void> {
    for (const conflict of conflicts) {
      switch (this.options.conflictStrategy) {
        case 'last-write-wins':
          const winner = conflict.local.updated_at > conflict.remote.updated_at
            ? conflict.local
            : conflict.remote;
          await this.database
            .get(conflict.table)
            .update(winner);
          break;
        case 'server-wins':
          await this.database
            .get(conflict.table)
            .update(conflict.remote);
          break;
        case 'client-wins':
          await this.database
            .get(conflict.table)
            .update(conflict.local);
          break;
      }
    }
  }
}
```

**Database Schema Pattern:**

```typescript
// src/database/schema.ts

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'course_id', type: 'string', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'flashcards',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'deck_id', type: 'string' },
        { name: 'front', type: 'string' },
        { name: 'back', type: 'string' },
        { name: 'ease_factor', type: 'number' },
        { name: 'interval', type: 'number' },
        { name: 'due_date', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'courses',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'thumbnail', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});
```

### AI Provider Abstraction Pattern

The AI provider abstraction enables configurable AI backends through environment variable configuration. The factory pattern creates provider-specific implementations while presenting a unified API surface.

**Provider Interface:**

```typescript
// src/services/ai/types.ts

export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'custom';
  baseURL?: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIStreamingOptions {
  onChunk: (chunk: string, done: boolean) => void;
  onError?: (error: Error) => void;
  onComplete?: (fullResponse: string) => void;
  signal?: AbortSignal;
}

export interface AIProvider {
  readonly name: string;

  chat(messages: AIMessage[]): Promise<string>;
  streamChat(messages: AIMessage[], options: AIStreamingOptions): Promise<void>;
  abort(): void;
}
```

**Streaming Implementation:**

```typescript
// src/services/ai/streaming.ts

import { fetchSSE } from 'react-native-fetch-sse';

export async function streamAIResponse(
  url: string,
  body: any,
  options: {
    onChunk: (chunk: string) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
    signal?: AbortSignal;
  }
): Promise<void> {
  const { onChunk, onError, onComplete, signal } = options;

  try {
    await fetchSSE(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      onMessage: (data) => {
        // Parse SSE data: "data: {\"content\": \"Hello\"}"
        if (data.startsWith('data: ')) {
          const jsonStr = data.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.content) {
              onChunk(parsed.content);
            }
            if (parsed.done) {
              onComplete?.();
            }
          } catch {
            // Not JSON, treat as raw content
            onChunk(data);
          }
        }
      },
      onError: (error) => {
        onError?.(new Error(error));
      },
    });
  } catch (error) {
    if ((error as any).name !== 'AbortError') {
      onError?.(error as Error);
    }
  }
}
```

### Payment Abstraction Pattern

The payment abstraction follows the same factory pattern as AI providers, enabling configurable payment providers through environment variables while presenting a unified API.

**Payment Interface:**

```typescript
// src/services/payment/types.ts

export interface PaymentProviderConfig {
  provider: 'paystack' | 'flutterwave' | 'custom';
  publicKey: string;
  environment: 'test' | 'live';
}

export interface PaymentTransaction {
  amount: number;
  email: string;
  currency: string;
  reference?: string;
  plan?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  message?: string;
  transaction?: any;
}

export interface PaymentProvider {
  readonly name: string;

  initializeTransaction(transaction: PaymentTransaction): Promise<{
    accessCode: string;
    reference: string;
  }>;
  verifyPayment(reference: string): Promise<PaymentResult>;
}
```

### LaTeX Math Rendering Pattern

The math rendering pattern uses `@dawsonxiong/react-native-latex-renderer` for native SVG rendering that works without network connectivity, ensuring mathematical notation renders reliably in offline mode.

**Rendering Implementation:**

```typescript
// src/hooks/useMath.ts

import { useMemo } from 'react';
import { MathView, createKaTeXHTML } from '@dawsonxiong/react-native-latex-renderer';

interface MathOptions {
  fontSize?: number;
  color?: string;
  displayMode?: boolean;
}

export function useMathRenderer(latex: string, options: MathOptions = {}) {
  const { fontSize = 16, color = '#000000', displayMode = false } = options;

  const renderMath = useMemo(() => {
    try {
      return createKaTeXHTML(latex, {
        throwOnError: false,
        displayMode,
      }, {
        'font-size': `${fontSize}px`,
        color,
      });
    } catch (error) {
      console.error('LaTeX render error:', error);
      return null;
    }
  }, [latex, fontSize, color, displayMode]);

  return {
    renderMath,
    error: renderMath === null,
  };
}

// Usage in component
function MathDisplay({ latex }: { latex: string }) {
  const { renderMath, error } = useMathRenderer(latex);

  if (error) {
    return <Text style={{ color: 'red' }}>Invalid math expression</Text>;
  }

  return (
    <KaTeXAutoHeightWebView
      source={renderMath}
      style={{ minHeight: 30 }}
    />
  );
}
```

### Navigation Pattern

The navigation pattern implements bottom tabs with nested stacks using React Navigation v7, providing familiar mobile navigation while organizing features logically.

```typescript
// app/(main)/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/navigation/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <StudyIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => <SocialIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct Supabase Calls from Components

**Problem:** Bypassing WatermelonDB and calling Supabase directly from React components creates inconsistent data flow and breaks offline-first guarantees.

**Prevention:** All data access goes through WatermelonDB models. The sync engine handles synchronization transparently.

```typescript
// Anti-pattern (AVOID)
function NotesList() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    const { data } = supabase.from('notes').select('*');
    setNotes(data);
  }, []);
}

// Correct pattern
function NotesList() {
  const notes = useNotes(); // Uses WatermelonDB observe
  return <FlatList data={notes} renderItem={...} />;
}
```

### Anti-Pattern 2: Hardcoded Provider Credentials

**Problem:** Hardcoding API keys or provider credentials in source code creates security vulnerabilities and prevents configuration flexibility.

**Prevention:** All provider configuration through environment variables loaded at runtime. Use expo-secure-store for sensitive credentials.

```typescript
// Anti-pattern (AVOID)
const API_KEY = 'sk-xxxxxxxxxxxxx';
const PAYSTACK_KEY = 'pk_test_xxxxxxxx';

// Correct pattern
const API_KEY = process.env.AI_PROVIDER_API_KEY;
const PAYSTACK_KEY = await secureStore.get('paystack_key');
```

### Anti-Pattern 3: Blocking UI on Network Operations

**Problem:** Performing database or network operations synchronously in the UI thread causes jank and poor user experience.

**Prevention:** All database operations use WatermelonDB's async API on the native thread. Supabase calls happen asynchronously with loading states managed by Zustand.

### Anti-Pattern 4: Mixing State Layers

**Problem:** Storing persistent data in Zustand while transient UI state persists in WatermelonDB creates confusion and data inconsistency.

**Prevention:** Clear separation: Zustand for transient state (loading indicators, form inputs, UI preferences), WatermelonDB for persistent data (notes, flashcards, user data).

### Anti-Pattern 5: Ignoring Network State

**Problem:** Assuming network connectivity and not handling offline scenarios creates poor offline user experience.

**Prevention:** Always check network state before network operations. Use NetInfo to detect connectivity. Display appropriate offline indicators.

## Scalability Considerations

### At 100 Users (Initial Launch)

At initial launch with modest user base, the architecture supports straightforward operation without complex optimization. The sync engine runs on-demand when data changes occur, with background sync on app foreground. WatermelonDB handles local data efficiently, and Supabase's free tier accommodate moderate query volumes.

### At 10,000 Users (Growth Phase)

As user base grows, the sync strategy shifts to periodic background sync to reduce server load. Supabase connection pooling becomes important, and the sync engine implements batching to reduce individual RPC calls. Caching layer via React Query reduces redundant Supabase queries.

### At 100,000+ Users (Scale Phase)

At scale, the architecture requires server-side optimizations including read replicas for query-heavy endpoints. The sync engine implements conflict resolution for concurrent edits. WatermelonDB's lazy loading becomes critical for large datasets. Push notifications trigger sync instead of periodic polling.

| Scale | Sync Strategy | Supabase Usage | Optimization Focus |
|-------|--------------|---------------|---------------------|
| 100 users | On-demand + foreground | Free tier | Basic functionality |
| 10,000 users | Periodic background | Pro tier | Connection pooling, batching |
| 100,000+ users | Event-driven | Dedicated | Read replicas, conflict resolution |

## Build Order Implications

The architecture has specific implications for the build process that affect phase ordering and dependency management.

### Phase 0: Foundation Prerequisites

Phase 0 must establish the complete architectural foundation before any feature implementation. This includes WatermelonDB schema, sync engine, provider abstraction infrastructure, and navigation structure. Skipping or abbreviated foundation work creates compounding issues in later phases.

**Critical Foundation Components:**

| Component | Phase | Reason |
|-----------|-------|-------|
| WatermelonDB setup | Phase 0 | All features depend on local database |
| Sync engine | Phase 0 | Offline-first depends on sync |
| Provider factories | Phase 0 | AI and payment features depend on abstractions |
| Navigation | Phase 0 | All UI depends on navigation |
| Zustand stores | Phase 0 | State management for all features |

### Native Module Requirements

The app blocker feature requires Expo Dev Client, which changes the build workflow compared to JavaScript-only features. This has specific implications:

- Development builds require `npx expo run:ios` or `npx expo run:android` instead of standard Expo Go
- Native module testing requires physical devices (emulators lack some APIs like iOS Screen Time)
- Production builds via EAS Build require Apple approval for Screen Time APIs on iOS

### Testing Considerations

Each major architectural component requires testing before feature implementation:

- WatermelonDB schema migrations test
- Sync engine conflict resolution test
- Provider factory switching test
- Navigation flow test
- Offline operation test

## Integration Points

### Supabase Integration

The integration with Supabase uses existing edge functions while adding mobile-specific functions for operations better handled server-side.

| Integration Point | Purpose | Edge Function |
|--------------------|---------|----------------|
| Database | User data persistence | N/A (direct) |
| Auth | User authentication | N/A (Supabase Auth) |
| AI Chat | AI-powered chat | ai-study |
| Payment | Subscription verification | verify-payment |
| Sync | Data synchronization | push_changes, pull_changes |
| Realtime | Live updates | N/A (Supabase Realtime) |

### AI Provider Integration

The AI provider integration routes through the configurable factory with environment variables determining the provider. The Supabase edge function `ai-study` continues to work as a backend proxy when needed for API key protection.

### Payment Provider Integration

Payment integration uses the Paystack WebView for the payment flow (card entry, authentication) while verifying transactions server-side. This reduces PCI compliance requirements while maintaining security.

## Sources

### Primary Sources

- **WatermelonDB Sync:** Official documentation at watermelondb.dev/docs/Implementation/SyncImpl
- **Supabase Offline-First:** Blog post at supabase.com/blog/react-native-offline-first-watermelon-db
- **React Native SSE Streaming:** react-native-fetch-sse (npm: react-native-fetch-sse)
- **AI Abstraction Pattern:** react-native-ai-hooks (GitHub: nikapkh/react-native-ai-hooks)
- **Payment Abstraction:** react-native-paystack-webview (GitHub: just1and0/React-Native-Paystack-WebView)
- **Math Rendering:** @dawsonxiong/react-native-latex-renderer (npm: @dawsonxiong/react-native-latex-renderer)
- **App Blocking:** expo-app-blocker (npm: expo-app-blocker)

### Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Offline-first architecture | HIGH | Pattern well-documented, production-proven |
| AI abstraction | HIGH | Factory pattern standard, compatible libraries exist |
| Payment abstraction | HIGH | Paystack package stable |
| Streaming AI | HIGH | react-native-fetch-sse production-ready |
| Math rendering | MEDIUM | Multiple options; recommend validation testing |
| Native modules | HIGH | expo-app-blocker actively maintained |
| Navigation | HIGH | React Navigation v7 standard |

---

*Architecture research: 2026-04-25*