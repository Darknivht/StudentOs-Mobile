# Feature Landscape: StudentOS Mobile

**Domain:** Mobile Learning Application (React Native + Expo)  
**Researched:** 2026-04-25  
**Confidence:** MEDIUM-HIGH (verified via multiple web sources, market analysis, and competitor apps)

---

## Executive Summary

The StudentOS Mobile feature landscape draws from comprehensive analysis of mobile learning apps in the Nigerian/African market, global best practices from apps like Duolingo, Khan Academy, Quizlet, and industry reports on EdTech. The app targets a unique position combining exam preparation (WAEC/NECO/JAMB/IELTS/TOEFL/SAT/GRE), AI tutoring, gamification, and focus enforcement—a combination not fully addressed by existing competitors.

**Key insight:** The market gap is NOT in content (thousands of CBT apps exist) but in an ALL-IN-ONE OS experience combining study tools, AI assistance, focus mode, parental controls, and social features. Existing CBT apps are siloed; StudentOS Mobile can win by integration.

---

## 1. Authentication & Security Features

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Supabase Auth (email/password) | Table Stakes | Low | Standard backend auth; reuse existing web app auth |
| Social login (Google) | Table Stakes | Low | Expo Auth Session |
| Social login (Apple) | Table Stakes | Low | iOS requirement for App Store |
| Biometric authentication (Face ID/Fingerprint) | Table Stakes | Medium | expo-local-authentication; OS-level security |
| App lock PIN | Table Stakes | Medium | expo-secure-store for encrypted storage |
| Session management with secure tokens | Table Stakes | Low | JWT + refresh token rotation |
| Subscription tier enforcement | Table Stakes | Low | Gate features based on user.tier |
| Parent PIN for parental controls | Differentiator | Medium | Separate PIN for parent mode |
| Biometric re-auth on resume | Differentiator | Low | Require biometrics when returning to app |
| Device fingerprinting | Anti-Feature | High | Privacy concern; unnecessary complexity |
| Captcha verification | Anti-Feature | Low | Adds friction; not needed for education |

### Authentication Details

**Biometric Authentication (expo-local-authentication):**
- Uses device's Secure Enclave (iOS) or BiometricPrompt (Android)
- Falls back to device passcode if biometrics fail
- MUST check `hasHardwareAsync()` and `isEnrolledAsync()` before prompting
- Store tokens in expo-secure-store, not AsyncStorage

**App Lock PIN:**
- 4-6 digit PIN stored encrypted via expo-secure-store
- Optional: require biometric to set/unlock PIN
- Lock after 5 failed attempts (30-second cooldown)

**Sources:** OWASP MASVS, expo-local-authentication docs, 2026 mobile security best practices

---

## 2. Core Learning Features

### 2.1 Notes Module

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Rich text note creation (markdown) | Table Stakes | Low | react-native-markdown-display |
| PDF/DOCX upload with text extraction | Table Stakes | High | Requires native module |
| Image upload with OCR | Differentiator | High | expo-ocr-kit or vision-camera-ml-kit |
| Note viewer with AI summary | Differentiator | Medium | Summarize endpoint via AI |
| Auto-save every 3 seconds | Table Stakes | Low | Debounced local save |
| Course/subject assignment | Table Stakes | Low | Foreign key to courses |
| Daily note creation quotas | Table Stakes | Low | Tier-based limits |
| Note search and filters | Table Stakes | Low | WatermelonDB FTS |
| Handwriting-to-text | Anti-Feature | Very High | Requires specialized ML; defer |

**Note Architecture:**
- Local-first: Write to WatermelonDB immediately
- Sync to Supabase in background when online
- Offline indicator: Show cached content
- Auto-save: Debounce 3s, save to local DB

**OCR Pipeline:**
- Capture image → expo-camera or expo-image-picker
- Process with expo-ocr-kit (on-device, no API)
- Extract text → Create note from extracted text
- NO internet required for OCR

### 2.2 Flashcards & SM-2

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Manual flashcard creation | Table Stakes | Low | Front/back/notes fields |
| AI-generated from notes | Differentiator | Medium | AI extracts key facts |
| SM-2 spaced repetition | Table Stakes | Medium | @open-spaced-repetition/sm-2 |
| Flashcard list with search/filter | Table Stakes | Low | WatermelonDB queries |
| Course assignment | Table Stakes | Low | Same as notes |
| Review statistics | Table Stakes | Low | Track accuracy % |
| Flashcard generation quotas | Table Stakes | Low | Tier-based AI limits |

**SM-2 Implementation:**
- 6 rating levels: 0-5
- Fields: repetitions, ease_factor, interval, due_date
- Calculate on review, update local DB
- Next review = now + interval days

**FSRS Alternative:**
- Newer algorithm (2023) using neural networks
- Better accuracy than SM-2
- Consider for v2: @scheduling-libs/fsrs-js

### 2.3 Quizzes

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| AI quiz generation from notes | Differentiator | Medium | Prompt engineering critical |
| Quiz taking flow (timer, feedback) | Table Stakes | Medium | Timer + immediate feedback |
| Quiz history and review | Table Stakes | Low | Past quiz results |
| Friend quiz challenges | Differentiator | Medium | Real-time or async |
| Quiz generation quotas | Table Stakes | Low | Tier-based |
| Quiz categories/difficulty | Table Stakes | Low | Filter by type |
| Random question shuffling | Table Stakes | Low | Math.random for order |

**AI Quiz Generation:**
- Input: Note text or course syllabus
- Output: JSON with question + 4 options + answer + explanation
- Cache generated quizzes (don't regenerate)
- Limit: 10 questions per quiz for performance

### 2.4 Exam Prep CBT Engine

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Exam selector (WAEC/NECO/JAMB/etc.) | Table Stakes | Low | Dropdown with icons |
| Subject selector per exam | Table Stakes | Low | Dynamic based on exam |
| Quick practice mode | Table Stakes | Low | Random questions |
| Timed practice mode | Table Stakes | Low | Countdown timer |
| Topic-based practice | Table Stakes | Medium | Topic filter |
| Year-based practice | Table Stakes | Medium | Filter by year |
| Mock exam (full simulation) | Differentiator | High | Match real CBT environment |
| Multi-subject combined | Differentiator | High | 4-subject simulation |
| Guided mode (hints) | Differentiator | Medium | Provide hints |
| Bookmark questions | Table Stakes | Low | Save for review |
| Session review with explanations | Table Stakes | Low | Post-session review |
| Performance analytics | Differentiator | High | Radar chart by subject |
| Weakness report | Differentiator | Medium | AI identifies weak areas |
| Study plan generation | Differentiator | Medium | AI creates plan |
| Per-exam subscriptions | Table Stakes | Low | Tier-based exam access |

**CBT Interface Requirements:**
- Match JAMB's 5-option format (A, B, C, D, E → replaced with A, B, C, D, P, N, S, R for JAMB)
- Timer in top bar
- Question navigation (1-100)
- Flag for review button
- Submit confirmation

**Sources:** MySchool CBT, Examscholars, Justclickk CBT apps (Nigerian market)

---

## 3. AI Integration Patterns

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Chat interface with AI tutor | Differentiator | Medium | Main AI feature |
| Persona selection (4 types) | Differentiator | Low | Prompt templates |
| Course-aware context injection | Differentiator | Medium | Include course in prompt |
| Streaming responses (SSE) | Table Stakes | Medium | Server-sent events |
| Math rendering (KaTeX) | Table Stakes | Medium | react-native-katex |
| Voice mode (STT/TTS) | Differentiator | High | expo-speech + voice module |
| Daily AI call quotas | Table Stakes | Low | Tier-based limits |
| Configurable AI provider | Differentiator | Medium | Base URL + API key + model |
| AI math solver | Differentiator | High | Step-by-step working |
| Code debugger | Differentiator | Medium | Code review agent |
| Language translator | Differentiator | Low | 50+ languages |
| AI summary for notes | Differentiator | Low | Note → summary |
| AI cheat sheet generator | Differentiator | Medium | Notes → cheatsheet |
| AI mnemonic generator | Differentiator | Medium | Memory aids |
| AI cram mode | Differentiator | Medium | Intensive review |
| Concept linker | Differentiator | Medium | Connect concepts |
| Fill-in-the-blanks | Differentiator | Medium | Auto-generate |

**AI Architecture:**
- All AI calls via configurable backend (not direct from app)
- Expo Dev Client → custom edge function
- Edge function calls AI provider (configurable)
- Stream responses with native EventSource
- Cache responses for offline

**Persona Prompt Templates:**

```
Chill: "You're a supportive study buddy. Keep it casual and encouraging."
Strict: "You're a rigorous tutor. High standards, precise answers."
Fun: "You're an energetic learning companion. Make it entertaining."
Motivator: "You're a coach who pushes users to achieve their best."
```

**Voice Mode (v2+):**
- STT: expo-speech (on-device)
- TTS: expo-speech (on-device)
- Latency concerns: Use short audio clips
- Consider: Web Speech API as alternative

---

## 4. Offline-First Features

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| WatermelonDB offline-first | Table Stakes | High | Core architecture |
| Background sync on reconnect | Table Stakes | High | Sync engine |
| Queue mutations for sync | Table Stakes | Medium | Pending changes |
| Offline status indicator | Table Stakes | Low | UI banner |
| Offline AI (cached responses) | Anti-Feature | Very High | Not worth complexity |
| Note viewing offline | Table Stakes | Low | Cached content |
| Flashcard study offline | Table Stakes | Low | Local SM-2 |
| CBT questions offline | Differentiator | High | Bundle questions locally |

**WatermelonDB Architecture:**
- Local SQLite: Source of truth
- Sync: Pull + Push functions
- Observables: Auto-update UI on data change
- Conflict resolution: Per-column client-wins

**Sync Strategy:**

```typescript
// Sync triggers:
// 1. App foreground (AppState)
// 2. Network reconnect (NetInfo)
// 3. Manual pull-to-refresh
// 4. Debounced (prevent spam)
```

**Sources:** WatermelonDB docs, Supabase blog on offline-first RN

---

## 5. Native Integrations

### 5.1 Camera (OCR)

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Document capture for notes | Table Stakes | Medium | expo-camera + expo-image-picker |
| Real-time OCR scanning | Differentiator | High | expo-ocr-kit or vision-camera-ml-kit |
| Barcode/QR scanning | Differentiator | Medium | vision-camera-ml-kit |

**OCR Options:**

| Package | Platform | Real-time | Offline | Notes |
|---------|----------|----------|---------|-------|
| expo-ocr-kit | iOS/Android | No | Yes | Image-based, Expo-native |
| vision-camera-ml-kit | iOS/Android | Yes | Yes | Frame processor |
| expo-text-extractor | iOS/Android | No | Yes | ML Kit + Vision |

**Recommendation:** expo-ocr-kit for image capture → note creation workflow

### 5.2 Microphone (Audio)

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Voice note recording | Differentiator | Medium | expo-av |
| Lecture recording | Differentiator | High | Background recording |
| Voice input for AI | Differentiator | High | STT integration |
| Audio playback | Table Stakes | Low | expo-av |

### 5.3 Notifications

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Push notifications | Table Stakes | Medium | Expo Notifications |
| Focus mode reminders | Differentiator | Low | Scheduled notifications |
| Streak alerts | Table Stakes | Low | Daily reminder |
| Daily challenge | Table Stakes | Low | Time-based trigger |
| Local notifications | Table Stakes | Low | expo-notifications local |

**Background Fetch:**
- Not reliable on iOS (15-minute intervals)
- Use WorkManager on Android
- Consider: Silent push for updates

### 5.4 App Blocker (Focus Mode)

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Pomodoro timer | Table Stakes | Low | Native timer |
| App selector for blocking | Differentiator | Very High | Android only (UsageStats) |
| Full-screen overlay | Differentiator | High | Activity approach |
| Emergency exit with PIN | Differentiator | Medium | Override mechanism |
| Background blocking | Differentiator | Very High | AccessibilityService |
| Boot persistence | Differentiator | High | Boot receiver |
| Focus notifications | Table Stakes | Low | Local notifications |

**iOS Limitation:** iOS does not allow app blocking. Consider:
- Screen Time API (limited, iOS 15+)
- Guided Access as alternative
- Focus mode features only

**Android Implementation:**
- UsageStatsManager for app usage data
- AccessibilityService for overlay
- DeviceAdminReceiver for lock
- Native module via Expo Dev Client

**Sources:** Android developer docs, Focus apps like Freedom, Forest

---

## 6. Gamification Patterns

### 6.1 Core Gamification

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| XP system across activities | Table Stakes | Low | Activity → XP mapping |
| Streak tracking | Table Stakes | Medium | Daily activity check |
| Daily challenges (3 rotating) | Differentiator | Medium | 3 challenges/day |
| Daily Brain Boost (5-question) | Differentiator | Low | Quick quiz challenge |
| Level system (1000 XP = 1) | Table Stakes | Low | Level progression |
| Achievement system (50+ achievements) | Differentiator | Medium | 5 categories |
| Progress bars | Table Stakes | Low | Visual feedback |

### 6.2 Achievements Categories

| Category | Example Achievements |
|----------|---------------------|
| Study | First note, 7-day streak, 100 hours studied |
| Exams | First mock exam, Perfect score, All subjects |
| Social | First friend, Create group, Lead leaderboard |
| AI | First AI chat, 100 AI conversations |
| Milestones | Level 10, Level 50, Year-long streak |

### 6.3 Leaderboards

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Global leaderboard | Differentiator | Medium | All-time XP |
| Weekly leaderboard | Differentiator | Low | Current week |
| School/group leaderboard | Differentiator | High | Supabase query |
| Subject leaderboard | Differentiator | Medium | Per-subject XP |

**Sources:** Duolingo, Lilo, Mindoria gamification analysis

---

## 7. Social Features

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Friends list (requests, accept) | Differentiator | Medium | Supabase Realtime |
| Study challenges (friend) | Differentiator | Medium | Time-limited |
| Leaderboard comparison | Differentiator | Low | Display side-by-side |
| Study groups | Differentiator | High | Create, join, invite |
| Group chat | Differentiator | Medium | Supabase Realtime |
| Shared resources | Differentiator | Medium | Group notes/study |
| Peer finder | Anti-Feature | High | Discovery concerns |
| Direct messages | Differentiator | Medium | DMs with friends |
| Real-time chat updates | Differentiator | Medium | WebSocket/Realtime |

**Privacy Considerations:**
- No public profiles visible by default
- Opt-in peer discovery only
- Block/report functionality
- No location sharing

---

## 8. Parental Controls (Mobile-Specific)

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Parental PIN protection | Differentiator | Low | Separate from user PIN |
| Daily time limits | Differentiator | Medium | Time-based limits |
| Content filter toggle | Differentiator | Medium | Filter by category |
| Safe search toggle | Differentiator | Low | Force SafeSearch |
| Under 14 mode | Differentiator | High | Restricted features |
| Parent email for reports | Differentiator | Low | Email notifications |
| Parent dashboard | Differentiator | High | Separate parent view |
| App blocking per category | Differentiator | High | UsageStats blocking |
| Study mode enforcement | Differentiator | Medium | Blocking non-educational |

**iOS Parental Controls:**
- Screen Time API (iOS 15+)
- FamilyKit for shared management
- Limitations: Not full app blocking

**Android Parental Controls:**
- DeviceAdminReceiver for restrictions
- UsageStatsManager for monitoring
- Google Family Link integration (optional)

**Sources:** Google Family Link, Boomerang Parental Control, Mobicip analysis

---

## 9. Payment Patterns (African Market)

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Paystack integration | Table Stakes | Medium | Primary provider |
| Flutterwave alternative | Differentiator | Medium | Secondary option |
| Card payments (Visa/MC/Verve) | Table Stakes | Low | Standard cards |
| Bank transfer | Table Stakes | Medium | USSD + bank |
| Mobile money (MTN MoMo) | Differentiator | Medium | Nigeria mobile |
| USSD payment | Differentiator | High | Flutterwave |
| Subscription tiers (Free/Plus/Pro) | Table Stakes | Low | 3 tiers |
| Per-exam subscriptions | Differentiator | Medium | Exam gate |
| Payment verification | Table Stakes | Medium | Webhook + fetch |
| Kill switch for payments | Table Stakes | Low | Environment toggle |

**Providers:**

| Provider | Strengths | Use Case |
|----------|-----------|---------|
| Paystack (Stripe) | Better dev experience, cleaner API | Primary |
| Flutterwave | More payment methods, pan-Africa | Secondary |
| Monnify | Bank transfer focus | Nigeria-only |

**Subscription Architecture:**
- User subscribes → Payment → Webhook → Update user.tier
- Verify on app open (fetch current status)
- Cache tier locally (offline grace period)
- Handle payment failures gracefully

**Sources:** Nigerian payment gateway analysis 2026

---

## 10. Focus & Study Tools

| Feature | Classification | Complexity | Notes |
|---------|---------------|------------|-------|
| Pomodoro timer | Table Stakes | Low | Configurable durations |
| Study timetable | Table Stakes | Medium | Weekly calendar |
| Smart scheduler (AI) | Differentiator | High | AI-optimized schedule |
| Weakness detector (AI) | Differentiator | Medium | AI analysis |
| Lo-fi radio | Differentiator | Medium | Background audio |
| Sleep calculator | Differentiator | Low | Sleep hygiene |
| Progress tracker | Table Stakes | Medium | Charts + stats |
| Focus Mode | Differentiator | High | App blocking |
| Lo-fi audio | Differentiator | Medium | Native audio player |

---

## 11. Feature Dependencies

Critical dependency chain for phase ordering:

```
Phase 0: Foundation
├── Auth (Phase 1) requires: Secure storage, Zustand
├── Notes (Phase 3) requires: Auth
│   └── AI Tutor (Phase 4) requires: Notes context
│       └── Quizzes (Phase 6) requires: Notes + AI
└── Offline DB (Phase 0 or 20) enables all

Phase 1: Auth & Security
└── All subsequent features require auth

Phase 2: Onboarding
└── Dashboard (requires onboarding completion)

Phase 3: Smart Notes
└── AI Tutor context (requires notes data)

Phase 4: AI Tutor
└── Notes (Phase 3) → AI generates flashcards/quizzes

Phase 5: Flashcards
└── SM-2 requires local DB offline sync

Phase 7: ExamPrep CBT
└── Questions database (requires offline storage)

Phase 8: Study Suite
└── AI Tutor (Phase 4) for tools

Phase 11: Plan & Focus
└── Most features before (analytics)

Phase 16: Gamification
└── Foundation → all activities feed XP

Phase 17: Parental Controls
└── Auth (Phase 1) for parent PIN

Phase 19: Payments
└── Auth (Phase 1) for subscription

Phase 20: Offline Mode
└── WatermelonDB (Phase 0 or standalone)
```

---

## 12. MVP Recommendation

### Must-Have (Phase 1-3 + core features)

| Priority | Feature | Reasoning |
|----------|---------|-----------|
| 1 | Supabase Auth | Foundation; all features need user |
| 2 | Biometric/PIN | Security requirement |
| 3 | Dashboard | First impressions |
| 4 | Notes (basic) | Core content creation |
| 5 | Offline DB | Mobile expectation |
| 6 | AI Tutor chat | Primary differentiator |
| 7 | ExamPrep CBT | Core revenue driver |
| 8 | Push notifications | Engagement |
| 9 | Gamification basic | Retention |
| 10 | Payment (basic) | Revenue |

### Should-Have (Phase 4-8)

| Priority | Feature | Reasoning |
|----------|---------|-----------|
| 11 | Flashcards + SM-2 | Learning utility |
| 12 | AI Quiz generation | Automated content |
| 13 | Focus timer | Productivity |
| 14 | Leaderboard | Social motivation |
| 15 | Parent controls | Market segment |

### Nice-to-Have (Later phases)

| Priority | Feature | Reasoning |
|----------|---------|-----------|
| 16 | App blocker | Focus enforcement |
| 17 | Voice mode | Accessibility |
| 18 | OCR for notes | Convenience |
| 19 | Groups/chat | Social features |
| 20 | Advanced gamification | Retention |

### Anti-Features (Explicitly NOT Build)

| Feature | Reason | Alternative |
|---------|--------|------------|
| Video calling | High complexity, defer to v2 | Audio focus sessions |
| Custom AI model training | Not feasible | Use providers |
| Social discovery (public) | Privacy risks | Opt-in only |
| Web dashboard | Focus on mobile | Existing web app |
| iOS app blocker | Not possible | Guided Access |

---

## 13. Priority Matrix

| Feature | MVP | Phase Priority | Complexity | Dependencies |
|---------|-----|---------------|-----------|--------------|
| Auth (Supabase) | Yes | 1 | Low | None |
| Biometric/PIN | Yes | 1 | Medium | Auth |
| Dashboard | Yes | 2 | Low | None |
| Notes | Yes | 3 | Low | Auth |
| Notes + OCR | No | 3 | High | Camera |
| AI Tutor | Yes | 4 | Medium | Notes |
| Voice Mode | No | 4 | High | STT/TTS |
| Flashcards + SM-2 | Yes | 5 | Medium | Notes |
| AI Quizzes | No | 6 | Medium | Notes |
| Exam CBT | Yes | 7 | High | Offline DB |
| Study Suite | No | 8 | Medium-High | AI Tutor |
| Focus Mode | No | 11 | High | — |
| App Blocker | No | 12 | Very High | Native |
| Social Hub | No | 13 | High | — |
| Gamification | Yes | 16 | Low-Medium | — |
| Payments | Yes | 19 | Medium | Auth |
| Offline Sync | Yes | 20 | High | WatermelonDB |
| Parent Controls | No | 17 | Medium | Auth, parent PIN |

---

## 14. Competitive Analysis Summary

| App | Strengths | Weaknesses | StudentOS Differentiation |
|-----|-----------|------------|---------------------------|
| MySchool CBT | 60K+ questions, offline | No AI, no social, siloed | AI + All-in-one |
| Justclickk CBT | Offline, AI chatbot | No gamification, basic UX | Gamification + OS |
| Duolingo | Best gamification | Not exam-focused, no CBT | Exam depth |
| Khan Academy | Quality content | No customization, no social | Social + AI |
| Quizlet | Flashcard standard | No AI generation, basic | AI generation |
| Mysched | Focus features | No learning, limited | Integrated learning |

**Moat:** The combination of all features in ONE app with AI automation creates unique value. Competitors are siloed (CBT OR gamification OR flashcard OR AI); StudentOS integrates all.

---

## Sources

- **Mobile Learning Best Practices:** eLearning Industry 2026, App Verticals mobile learning blueprint
- **Authentication:** OWASP MASVS, expo-local-authentication docs, biometric implementation guides
- **Offline-First:** WatermelonDB docs, Supabase offline-first blog, NeedleCode sync architecture
- **Gamification:** Duolingo, Lilo, Mindoria, Survicate gamification apps analysis
- **Parental Controls:** Google Family Link, Boomerang, Mobicip feature analysis
- **Payments:** Paystack/Flutterwave 2026 docs, Nigerian payment gateway comparison
- **CBT Patterns:** MySchool CBT, Examscholars, Justclickk, Campusinfo Nigerian apps
- **AI Integration:** Trigma AI tutor guide, XenonApps 2026 AI integration guide
- **OCR:** expo-ocr-kit, vision-camera-ml-kit, React Native OCR packages
- **SM-2:** @open-spaced-repetition/sm-2, spaced repetition implementation guides
- **Social Features:** Lilo study timer, Challengeer social goals, LearnClash quiz duels

---

*Document confidence: MEDIUM-HIGH. Multiple verified sources for each category. Nigerian market apps analyzed. Community patterns confirmed across EdTech industry.*

*Last updated: 2026-04-25*