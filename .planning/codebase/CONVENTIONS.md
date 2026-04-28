# Coding Conventions

**Analysis Date:** 2026-04-25

## Naming Patterns

**Files:**
- PascalCase for components: `Dashboard.tsx`, `CourseCard.tsx`
- camelCase for utilities/hooks: `useAuth.tsx`, `useToast.ts`
- kebab-case for configs: `eslint.config.js`, `tsconfig.json`

**Directories:**
- camelCase for feature directories: `src/components/dashboard/`, `src/hooks/`
- Lowercase for UI component directories: `src/components/ui/`

**Functions:**
- camelCase: `fetchData`, `handleAddCourse`, `checkBlocked`
- Use descriptive verbs: `handleDelete`, `loadCachedFallback`

**Variables:**
- camelCase: `courses`, `profile`, `fetchError`
- Boolean prefixes: `isOnline`, `authReady`, `loading`

**Types/Interfaces:**
- PascalCase: `Course`, `Profile`, `AuthContextType`
- Suffix with type kind when ambiguous: `Course`, `CourseData`

## Code Style

**Formatting:**
- Tool: ESLint + Prettier (implied by project structure)
- Tab width: 2 spaces
- Single quotes for strings
- Trailing commas in multiline

**Linting:**
- ESLint with `typescript-eslint` and `react-hooks` plugin
- Key rules enforced:
  - `react-hooks/exhaustive-deps`: enabled (recommended)
  - `react-refresh/only-export-components`: warn
  - `@typescript-eslint/no-unused-vars`: off

**TypeScript Configuration:**
- `strict`: false (not enforced)
- `noImplicitAny`: false
- `strictNullChecks`: false
- `noUnusedLocals`: false
- `noUnusedParameters`: false
- Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React/framework imports
2. Third-party library imports (Radix UI, Lucide, etc.)
3. Internal absolute imports (`@/`)
4. Relative imports

**Path Aliases:**
- `@/*` - src directory
- `@/components` - components
- `@/components/ui` - shadcn/ui components
- `@/hooks` - custom hooks
- `@/lib` - utilities
- `@/integrations` - external service clients

**Example:**
```typescript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CourseCard from '@/components/dashboard/CourseCard';
```

## Component Patterns

**Functional Components:**
```typescript
const ComponentName = () => {
  // hooks first
  const { user } = useAuth();
  const [state, setState] = useState<Type>();
  
  // effects second
  useEffect(() => {
    // logic
  }, [dependency]);
  
  // handlers third
  const handleAction = () => { };
  
  // return JSX last
  return <div>...</div>;
};

export default ComponentName;
```

**Props Pattern:**
- Define interfaces at top of file
- Destructure in function parameters
- Spread rest props when needed

**State Management:**
- `useState` for local component state
- `useAuth` hook for auth context
- `useOfflineData` for offline support
- `useToast` for notifications

## UI Component Pattern (shadcn/ui)

Components use `React.forwardRef` pattern:

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const ComponentName = React.forwardRef<HTMLDivElement, Props>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("base-classes", className)} {...props} />
  )
);
ComponentName.displayName = "ComponentName";

export { ComponentName };
```

**Variant Components (CVA pattern):**
```typescript
import { cva, type VariantProps } from "class-variance-authority";

const componentVariants = cva("base-class", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface Props extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof componentVariants> {}
```

## CSS/Styling Approach

**Framework:** Tailwind CSS v3 with CSS variables

**Base Colors (CSS variables):**
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

**Custom Colors:**
- Success/warning colors for status
- Sidebar-specific colors
- Card, popover, accent variants

**Custom Animations:**
- `fade-in`, `scale-in`, `slide-up`
- `accordion-down/up`
- `shimmer`, `wiggle`, `bounce-gentle`
- `typing`

**Custom Shadows:**
- `glow` and `glow-lg` for emphasis
- `elevated` for elevated surfaces

**Dark Mode:**
- Enabled via `darkMode: ["class"]`
- Components use `dark:` prefix

**Responsive Classes:**
- xs: 400px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

## Error Handling

**Try/Catch Pattern:**
```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  // handle data
} catch (error) {
  console.error('Error message:', error);
  // show toast or fallback
}
```

**Toast Notifications:**
```typescript
import { useToast } from '@/hooks/useToast';

const { toast } = useToast();
toast({ title: 'Success', description: 'Action completed.' });
toast({ title: 'Error', description: 'Failed.', variant: 'destructive' });
```

## Logging

**Console Usage:**
- `console.error` for errors
- `console.warn` for warnings
- No `console.log` in production code

## Comments

**When to Comment:**
- Complex async logic (race conditions, timeouts)
- Non-obvious side effects
- Blocked operations (fire-and-forget pattern)

**Pattern Examples:**
```typescript
// 1. Restore session FIRST
// 2. THEN subscribe to changes (no await inside!)
// Fire-and-forget blocked check
```

## Function Design

**Size:** Components can be large (100+ lines) but extract sub-components when reused

**Async Pattern:**
```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const { data, error } = await service.operation();
    if (error) throw error;
    setState(data);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

**Timeout Pattern:**
```typescript
const timeout = new Promise<'timeout'>((resolve) =>
  setTimeout(() => resolve('timeout'), FETCH_TIMEOUT_MS)
);
const result = await Promise.race([work(), timeout]);
if (result === 'timeout') { /* fallback */ }
```

## Module Design

**Exports:**
- Default export for page components: `export default PageName`
- Named exports for UI components: `export { Component, ComponentVariant }`

**Barrel Files:** Not extensively used; imports are direct

---

*Convention analysis: 2026-04-25*