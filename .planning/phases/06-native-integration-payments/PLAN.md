# Phase 6: Native Integration & Payments

## Overview
The app's killer native feature — Focus Mode app blocker — works via a custom Kotlin AccessibilityService module. Students can subscribe via Paystack with Nigerian payment methods (bank transfer + USSD), while parents can set safety controls.

## Completed Discussions

See [DISCUSS.md](discuss/DISCUSS.md) for the full discuss-phase.

**Key decisions:**
- **Focus Mode:** `create-expo-module` + Kotlin `AccessibilityService` (no root needed). Shows fullscreen overlay when blocked apps are detected. Persists across reboot via `BOOT_COMPLETED` broadcast.
- **Paystack:** WebView inline checkout + Supabase Edge Function for verification. Supports card, bank transfer, USSD. Nigerian market first.
- **Safety:** 4-digit PIN hashed in `profiles.parental_pin`. Daily time limits + content filters + safe search + under-14 mode.

## Plans

### Plan 06-01: Focus Mode - AccessibilityService Module
**Requirements FOCS-01, FOCS-03, FOCS-04** — App blocking
**NATIVE MODULE:**
- `modules/focus-mode/android/src/...` — Kotlin `AccessibilityService` subclass
- `modules/focus-mode/android/src/...` — `FocusModeModule` (Expo Module API)
- `modules/focus-mode/src/index.ts` — JS API facade

**SCREENS/UI:**
- `app/(tabs)/plan.tsx` — Focus screen (entrants: "Start Focus Session" button, blocked app selector, Pomodoro timer)
- Components — `FocusSessionCard`, `BlockedAppsPicker`, `PomodoroTimer`

**DB/MIGRATIONS:**
- Table: `focus_sessions` — start_time, end_time, blocked_packages (JSON), is_active, device_id, xp_awarded
- Table: `blocked_apps` — package_name, user_id, is_blocked (if per-user list)

**SPECS:**
| Spec | Details |
|------|---------|
| `FOCS-01` | Start/Stop Pomodoro focus sessions (25/50 min options), select apps to block from installed app list |
| `FOCS-03` | Android AccessibilityService detects `TYPE_WINDOW_STATE_CHANGED` events, blocks when target package detected |
| `FOCS-04` | `BOOT_COMPLETED` receiver restarts AccessibilityService after reboot, restores active focus sessions from DB |
| `FOCS-05` | On session complete, calls `useXP` hook to award XP (1 XP/min, bonus for no emergency exit) |

### Plan 06-02: Focus Mode - Overlay & Emergency Exit
**Requirements FOCS-02, FOCS-05** — Full-screen overlay with PIN
**NATIVE:**
- Custom `ViewGroup` overlay (floating over all other apps) with countdown timer
- Random inspirational quote pulled from quotes array
- Emergency exit requires PIN (hashed `profiles.parental_pin`)

**SCREENS/UI:**
- `app/(tabs)/plan.tsx` — Focus screen with Pomodoro timer, motivational quotes
- Components — `FocusOverlay`, `PinModal`, `MotivationalQuote`

**SPECS:**
| Spec | Details |
|------|---------|
| `FOCS-02` | Full-screen overlay with countdown timer, motivational quote, emergency exit button (requires PIN if parental controls enabled) |
| `FOCS-05` | XP logging on successful session completion, syncs with backend via edge function |

### Plan 06-03: Paystack - Payment Flow
**Requirements PAYM-01..PAYM-06** — Paystack checkout
**EDGEFUNCTION:**
- `supabase/functions/paystack-checkout/index.ts` — Initialize Paystack transaction, return auth_url
- `supabase/functions/paystack-verify/index.ts` — Verify payment, update `subscription_tier`

**JS API:**
- `lib/paystack.ts` — Helper to open checkout WebView, handle callback, verify payment

**SCREENS/UI:**
- `app/(tabs)/profile.tsx` — Upgrade button for free users, manage subscription
- Modal — Paystack WebView checkout

**SPECS:**
| Spec | Details |
|------|---------|
| `PAYM-01` | WebView opens Paystack checkout URL (inline JS). Supports card, bank transfer, USSD |
| `PAYM-02` | Card payment: Standard Paystack inline card form |
| `PAYM-03` | Bank transfer: Nigerian bank list in Paystack inline |
| `PAYM-04` | USSD: Generate USSD string, show to user |
| `PAYM-05` | On callback, call verify edge function. On success, update `subscription_tier` |
| `PAYM-06` | Basic retry logic (user can retry failed payment) |

### Plan 06-04: Subscription - Sync & Gating
**Requirements (from Phase 3/5)** — Kill switch, feature gating
**HOOKS:**
- Update `useSubscription.ts` — Periodic sync (every 5 min), event-driven sync, kill switch
- Feature gating: All existing features check `useSubscription` before allowing access

**SPECS:**
| Spec | Details |
|------|---------|
| `PAYM-sync` | Every 5 minutes, sync subscription status with Supabase. Sync on app foreground. Kill switch in Supabase (field `kill_enabled`): when true, all features are unlocked regardless of tier |
| `gate-all` | Every feature screen calls `gateFeature(type)` before rendering. Shows upgrade prompt for free users |

### Plan 06-05: Safety & Parental Controls
**Requirements SAFE-01..SAFE-08** — Safety features
**DB:**
- `profiles` — `parental_pin` (hashed), `content_filter_enabled`, `safe_search_enabled`, `is_under_14`
- `time_limits` — user_id, daily_minutes, warning_minutes
- `app_blocker_schedules` — user_id, app_package, start_time, end_time, days_of_week (JSON)

**HOOKS:**
- `hooks/useSafety.ts` — PIN verification, time limit check, content filter, safe search
- `hooks/useParentDashboard.ts` — Aggregates study time, activities, focus sessions, weekly trends

**SCREENS/UI:**
- `app/(tabs)/profile.tsx` — Settings → Parental Controls
- Sub-screens — PIN setup, time limits, content filter, under-14 mode, app blocker schedules
- `app/(tabs)/parent-dashboard.tsx` — Study time, activities, focus sessions, weekly trends

**SPECS:**
| Spec | Details |
|------|---------|
| `SAFE-01` | PIN setup: 4-digit PIN, stored as bcrypt hash in `profiles.parental_pin` |
| `SAFE-02` | Daily time limit: When exceeded, blocking overlay requires PIN to bypass |
| `SAFE-03` | Content filter: Sanitizes AI prompts (removes unsafe content) through edge function |
| `SAFE-04` | Safe search: Filters `educational_resources` by `is_safe` (store tables) |
| `SAFE-05` | Under-14 mode: Extra restrictions (no social, limited AI, read-only store) |
| `SAFE-06` | Weekly reports: Edge function `send-parent-report` emails parent dashboard summary |
| `SAFE-07` | App blocker schedules: Parents set time windows for app blocking (e.g., bedtime) |
| `SAFE-08` | Parent dashboard: Shows study time by day, activities list, focus session history, weekly trends chart |

## Success Criteria
1. **FOCS-01** — User can start a focus session with selected apps blocked
2. **FOCS-02** — Full-screen overlay with timer and quote, emergency exit with PIN
3. **FOCS-03** — AccessibilityService blocks apps when detected
4. **FOCS-04** — Sessions restore after device reboot
5. **FOCS-05** — XP awarded on successful session (1 XP/min)
6. **PAYM-01..04** — Paystack checkout works for card, bank transfer, USSD
7. **PAYM-05** — Payment verification updates user's subscription tier
8. **SAFE-01..08** — Parent controls functional (PIN, time limits, content filter, reports, dashboard)
9. **subscription.sync** — Syncs every 5 minutes, kill switch works
10. **gate-all** — Feature gating enforces tier limits across screens
