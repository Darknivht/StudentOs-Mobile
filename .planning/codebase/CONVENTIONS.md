---
title: Code Conventions
last_mapped_commit: 2026-05-04
---

# Code Conventions

**Mapped:** 2026-05-04

## Language & Style

- **Language:** TypeScript (strict mode)
- **React:** Functional components with hooks
- **Styling:** Tailwind CSS (utility-first)
- **File Extension:** `.tsx` for components, `.ts` for utilities/hooks

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Dashboard.tsx`, `AppLayout.tsx` |
| Hooks | camelCase (prefix `use`) | `useAuth.tsx`, `useFocusMode.tsx` |
| UI Components | kebab-case | `button.tsx`, `card.tsx` |
| Constants | PascalCase | `SUBSCRIPTION_ENABLED` |

## Import Conventions

```tsx
// Absolute imports (via @ alias)
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Path alias: @ → src/
```

## React Patterns

### Custom Hooks
- Named with `use` prefix
- Encapsulate business logic

### Context Usage
```tsx
// Provider wraps App
<OfflineAIProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</OfflineAIProvider>
```

## Tailwind CSS

- Use `cn()` from `@/lib/utils` for class merging
- Dark mode via `next-themes` (class attribute)

## State Management

| Scenario | Approach |
|----------|----------|
| Component-local | `useState` |
| App-wide user state | `useAuth` hook + Context |
| Server data | TanStack React Query |
| Theme | Next Themes Context |

## Error Handling

- **UI:** Toast notifications via `useToast`
- **Critical:** Error Boundary catches unhandled errors