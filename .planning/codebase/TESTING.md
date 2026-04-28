# Testing Patterns

**Analysis Date:** 2026-04-25

## Test Framework

**Testing Framework:** Not currently configured
- No Jest, Vitest, or other test runner detected
- No test files (*.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx) found

**Note:** The codebase lacks automated testing infrastructure

## Linting

**ESLint Configuration:**
- Config file: `eslint.config.js`
- Parser: `typescript-eslint`
- Plugins: `react-hooks`, `react-refresh`

**Run Command:**
```bash
npm run lint
# or
bun run lint
```

**Lint Scope:** Runs on all `*.ts` and `*.tsx` files in project

**Key Rules:**
```javascript
{
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-unused-vars": "off"
  }
}
```

## Type Checking

**TypeScript Configuration:**
- Base: `tsconfig.json` (references app/node configs)
- App config: `tsconfig.app.json`
- Node config: `tsconfig.node.json`

**Type Checking:** No dedicated command; TypeScript is integrated into build process

**Compiler Options:**
- `isolatedModules`: true
- `jsx`: react-jsx
- `lib`: ES2020, DOM, DOM.Iterable
- `moduleResolution`: bundler
- `skipLibCheck`: true
- `strict`: false (not enforced)
- `noImplicitAny`: false
- `strictNullChecks`: false

## Build Commands

**Package Scripts:**
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
```

**Build Tool:** Vite 5.4.19

**Development:**
```bash
npm run dev
# Starts on http://localhost:5173 or configured port
```

**Production Build:**
```bash
npm run build
# Output: dist/ directory
```

## CI/CD Configuration

**Vercel Configuration:**
- File: `vercel.json`
- Rewrites all routes to `/` for SPA support

**Deployment Target:** Vercel (implied by configuration)

**CI Pipeline:** Not detected
- No GitHub Actions, CircleCI, or other CI configs found

## Code Quality Tools

**Pre-commit Hooks:** Not detected

**Formatting:**
- Prettier: Not explicitly configured but likely via ESLint
- PostCSS: Configured with Tailwind + Autoprefixer

**Type Checking Integration:**
- TypeScript integrated into build via Vite SWC plugin
- `@vitejs/plugin-react-swc` for fast builds

## Mobile/Desktop Build

**Capacitor Configuration:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npx cap sync
npx cap open android  # Opens in Android Studio
```

**Capacitor Plugins Used:**
- `@capacitor/app` - App lifecycle
- `@capacitor/local-notifications` - Push notifications

## Offline Support Testing

**Offline Data Hook:** `src/hooks/useOfflineData.ts`
- `useOfflineData()` - Hook for offline state
- `cacheDataLocally(key, data)` - Cache data
- `getCachedData<T>(key)` - Retrieve cached data
- `offlineData.fetchCourses()` - Fetch courses with fallback

## Coverage

**Enforcement:** None

**Note:** No test coverage infrastructure in place

## Code Quality Gaps

1. **No Unit Tests** - No testing framework configured
2. **No E2E Tests** - No Playwright or Cypress detected
3. **No Coverage Reports** - No coverage collection
4. **No Pre-commit Validation** - Linting not enforced pre-commit
5. **Relaxed TypeScript** - `strict: false` allows implicit `any`

## Best Practices (For Future Implementation)

### Suggested Test Setup:
```bash
npm install -D vitest @testing-library/react jsdom
```

### Suggested Configuration:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

### Suggested Scripts:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

*Testing analysis: 2026-04-25*