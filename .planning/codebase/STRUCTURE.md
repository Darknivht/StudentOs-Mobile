---
title: Directory Structure
last_mapped_commit: 2026-05-04
---

# Directory Structure

**Mapped:** 2026-05-04

## Root Structure

```
StudentOs-Mobile/
├── studentoss/          # Main React application
│   ├── src/             # Source code
│   ├── supabase/        # Edge functions
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── android/             # Android app (Capacitor)
└── .planning/           # GSD planning docs
```

## Application Structure (studentoss/src)

```
src/
├── main.tsx                    # Entry point
├── App.tsx                      # Root component + routing
│
├── pages/                       # Route pages (30+)
│   ├── Auth.tsx, Dashboard.tsx, Onboarding.tsx
│   ├── Study.tsx, SmartNotes.tsx, AITutor.tsx
│   ├── Flashcards.tsx, Quizzes.tsx, Focus.tsx
│   ├── Achievements.tsx, Plan.tsx, Social.tsx
│   ├── Career.tsx, Safety.tsx, Profile.tsx
│   ├── CoursePage.tsx, Upgrade.tsx, Chat.tsx
│   ├── GroupChat.tsx, FocusSession.tsx
│   ├── Store.tsx, ExamPrep.tsx, AdminResources.tsx
│   ├── Install.tsx, ResetPassword.tsx, Terms.tsx
│   ├── Privacy.tsx, NotFound.tsx
│   └── docs/                   # Documentation routes
│
├── components/                  # Reusable components
│   ├── ui/                     # shadcn/ui components (40+)
│   ├── layout/                 # Layout (AppLayout, BottomNav)
│   ├── study/                  # Study features
│   ├── gamification/           # Gamification
│   ├── safety/                 # Safety features
│   ├── store/                  # Store features
│   ├── planning/               # Planning features
│   ├── notes/                  # Note features
│   ├── exam-prep/              # Exam prep features
│   ├── career/                # Career features
│   ├── academic/               # Academic features
│   └── focus/                  # Focus mode
│
├── hooks/                     # Custom React hooks (20+)
│   ├── useAuth.tsx, useFocusMode.tsx
│   ├── useOfflineStatus.tsx, useOfflineData.tsx
│   └── ...
│
├── lib/                       # Utilities & config
│   ├── utils.ts, ai.ts, paystackConfig.ts
│   ├── subscriptionConfig.ts, educationConfig.ts
│   ├── offlineSync.ts, resilientFetch.ts
│
├── context/                   # React Context
│   └── OfflineAIContext.tsx
│
├── integrations/              # External integrations
│   └── supabase/ (client.ts, types.ts)
│
└── plugins/                   # Capacitor plugins
    ├── FocusModePlugin.ts
    └── FocusModePluginWeb.ts
```

## Supabase Functions

```
supabase/functions/
├── ai-study/index.ts
├── exam-practice/index.ts
├── job-search/index.ts
├── verify-payment/index.ts
├── admin-verify/index.ts
├── admin-resources/index.ts
├── extract-pdf-text/index.ts
└── extract-pdf-text-ocr/index.ts
```