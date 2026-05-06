---
title: Technology Stack
last_mapped_commit: 2026-05-04
---

# Technology Stack

**Mapped:** 2026-05-04

## Languages & Runtimes

| Category | Technology | Version |
|----------|------------|---------|
| Frontend | TypeScript | 5.8.3 |
| Frontend | React | 18.3.1 |
| Runtime | Node.js (via Vite) | - |
| Mobile | Capacitor | 8.0.0 |

## Core Frameworks

| Framework | Purpose | Version |
|-----------|---------|---------|
| Vite | Build tool & dev server | 5.4.19 |
| React Router DOM | Client-side routing | 6.30.1 |
| TanStack React Query | Server state management | 5.83.0 |
| TailwindCSS | Utility-first CSS | 3.4.17 |
| shadcn/ui | Component library | (via Radix) |
| Framer Motion | Animations | 12.23.26 |
| Next Themes | Dark mode support | 0.3.0 |

## Key Dependencies

### UI Components
- `@radix-ui/*` - Headless UI components (dialog, dropdown, select, etc.)
- `lucide-react` - Icon library
- `tailwind-merge` - Class merging utility
- `clsx` - Conditional classes

### AI & ML
- `@mlc-ai/web-llm` - Web-based LLM inference
- `@huggingface/transformers` - Transformer models

### Documents & Media
- `pdfjs-dist` - PDF rendering
- `jspdf` - PDF generation
- `docx-preview` - Word document preview

### Storage & Backend
- `@supabase/supabase-js` - Supabase client
- PWA via `vite-plugin-pwa` - Offline capabilities

## Build Configuration

- **Port:** 8081
- **Path alias:** `@` → `./src`
- **PWA:** Enabled with offline caching

## Configuration Files

- `studentoss/package.json` - Dependencies
- `studentoss/tsconfig.json` - TypeScript config
- `studentoss/vite.config.ts` - Vite build config
- `studentoss/tailwind.config.ts` - Tailwind theme