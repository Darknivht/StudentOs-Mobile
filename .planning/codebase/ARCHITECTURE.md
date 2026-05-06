---
title: Architecture
last_mapped_commit: 2026-05-04
---

# Architecture

**Mapped:** 2026-05-04

## Architectural Pattern

**Component-Based Architecture** with React + functional components and hooks.

### Key Patterns

1. **Custom Hooks** - Business logic extraction (`src/hooks/`)
2. **Context API** - Global state (Auth, Theme, Offline AI)
3. **React Query** - Server state caching

## Layer Structure

```
Pages → Components → Hooks/Context → Utils → Integrations
```

## Data Flow

1. **User Action** → Page component
2. **Page** → Custom hook / React Query
3. **Hook** → Supabase client / API call
4. **Response** → Update local state / React Query cache
5. **UI Update** → React re-render

### Offline Mode
1. **OfflineAIContext** (`src/context/OfflineAIContext.tsx`)
2. **WebLLM** runs in-browser LLM inference
3. **Local storage** caches for offline access

## Key Abstractions

### Routing (React Router)
- **Entry:** `src/App.tsx`
- **Layout:** `src/components/layout/AppLayout.tsx`

### State Management
| State Type | Solution |
|------------|----------|
| User Auth | `useAuth` hook + AuthContext |
| Theme | Next Themes |
| Server Data | TanStack React Query |
| UI State | Local useState/useReducer |
| Offline AI | OfflineAIContext |

### Error Handling
- **Error Boundary:** `src/components/ErrorBoundary.tsx`
- **Resilient Fetch:** `src/lib/resilientFetch.ts`

## PWA Architecture

- Service Worker via `vite-plugin-pwa`
- Cache strategies: NetworkOnly for API, CacheFirst for static assets