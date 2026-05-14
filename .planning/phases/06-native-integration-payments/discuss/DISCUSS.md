# Phase 6 - Native Integration & Payments

## Discussion

**Objective:** Phase 6 is the "killer feature" phase — builds the app's unique native differentiator (Focus Mode app blocker via custom Kotlin AccessibilityService) and enables real money for subscriptions via Paystack, plus Safety controls for parents.

**Status:** Phase 6 NOT YET started.

---

### Success Criteria (from ROADMAP.md):
1. Student starts a focus session via Pomodoro timer, selects apps to block (TikTok, Instagram, etc.), and blocked apps are prevented from opening during the session via native AccessibilityService — blocking state restores after device reboot
2. Student sees a full-screen focus overlay with countdown timer and motivational quote during active sessions; emergency exit requires parental PIN if parental controls are enabled; focus sessions log XP awards
3. Student completes Paystack checkout in WebView with card, bank transfer, or USSD; payment verification updates subscription tier; bank transfer + USSD work for Nigerian market
4. Subscription state syncs every 5 minutes and on events; feature gating shows upgrade prompts when free users hit paywalls; kill switch unlocks all features when disabled
5. Parent sets 4-digit PIN, configures daily time limits with blocking overlay, enables content filter and safe search, sets under-14 mode, receives weekly progress reports, configures app blocker schedules, and views parent dashboard with study time, activities, focus sessions, and weekly trends

---

### Technical Decisions Needed:

#### 1. Focus Mode - How to Block Apps?
**Concern:** Android AccessibilityService is powerful but complex. How do we block individual apps without requiring root access?
**Options:**
- **AccessibilityService** — Can detect when user taps on a specific app, trigger an overlay, and redirect. Does NOT require root. **This is what we use.**
- **DeviceAdmin** — Can disable apps entirely but requires device owner setup (not practical). Rejected.
- **Launcher replacement** — Replace home screen, too invasive. Rejected.

**Decision:** `create-expo-module` + Kotlin + `AccessibilityService`. The service listens for window changes; when a blocked app is detected, we show a full-screen overlay with a countdown timer that prevents the user from accessing the app until the focus session ends.

#### 2. Focus Mode - How to Store Blocked App List?
**Concern:** The device restarts, and apps need to be blocked across reboots.
**Decision:** 
- `expo-sqlite` (local DB) for storing the blocked app list (package names + timers)
- `react-native-background-task` (or Expo `BackgroundFetch`) to restart the AccessibilityService on boot via `BOOT_COMPLETED` broadcast receiver in AndroidManifest.xml
- Session data: start_time, end_time, blocked_packages (JSON), is_active, device_id

#### 3. Focus Mode - XP Integration
**Concern:** How do we award XP for completed Pomodoro sessions?
**Decision:** Call `useXP` hook from the focus session service when the user completes a focus session (timer reaches 0). Log it like any other XP event, which will trigger the achievement check.

**XP per minute:** 1 XP per minute of focused work (e.g., 25 min Pomodoro = 25 XP). Bonus for completing without emergency exit.

#### 4. Paystack - Payment Flow
**Concern:** Paystack requires a backend (can't process payments in-app directly from Supabase). What's the minimal setup?
**Decision:**
- Use **Paystack inline JS** via WebView
- Create a **Supabase Edge Function** (or simple Netlify/Vercel function) that:
  1. Receives payment amount + email
  2. Calls Paystack API to initialize transaction
  3. Returns transaction-reference/authorization_url to app
  4. WebView redirects to the bank transfer/USSD flow
  5. App receives `callback_url` redirect, sends verification request to edge function
  6. Edge function verifies with Paystack, updates user `subscription_tier` in DB

**Security:** NEVER store the Paystack secret key in the app. Always in edge function.

#### 5. Safety - Parental Controls - Where to Store PIN?
**Concern:** Parent sets a PIN to prevent kids from disabling Focus Mode or changing settings. Must be secure.
**Decision:** Store in `profiles.parental_pin` as hashed value (bcrypt). We don't need to verify the PIN frequently enough to warrant local storage.

---

### Summary:
- [ ] **FOCS-01** - Focus Mode: Start/Stop session, select apps to block, Pomodoro timer
- [ ] **FOCS-02** - Focus Mode: Full-screen overlay with countdown, motivational quote, emergency exit with PIN
- [ ] **FOCS-03** - Focus Mode: Block apps via AccessibilityService (no root required)
- [ ] **FOCS-04** - Focus Mode: Restore blocking after device reboot
- [ ] **FOCS-05** - Focus Mode: Log sessions, award XP (1 XP/minute, bonus for no emergency exit)
- [ ] **FOCS-06** - Focus Mode: Study challenges with XP rewards
- [ ] **FOCS-07** - Focus Mode: Friend challenges with XP rewards
- [ ] **FOCS-08** - Focus Mode: Group focus sessions (future)
- [ ] **PAYM-01** - Paystack: Initialize checkout via WebView
- [ ] **PAYM-02** - Paystack: Card payment via Paystack inline
- [ ] **PAYM-03** - Paystack: Bank transfer (Nigerian market)
- [ ] **PAYM-04** - Paystack: USSD (Nigerian market)
- [ ] **PAYM-05** - Paystack: Verify payment with edge function, update subscription tier
- [ ] **PAYM-06** - Paystack: Refund/Retry logic (MPV: just basic success/failure)
- [ ] **SAFE-01** - Safety: 4-digit PIN hashed in profiles table
- [ ] **SAFE-02** - Safety: Daily time limit enforcement with full-screen blocking overlay
- [ ] **SAFE-03** - Safety: Content filter (AI prompt sanitization)
- [ ] **SAFE-04** - Safety: Safe search for store resources
- [ ] **SAFE-05** - Safety: Under-14 mode with extra restrictions
- [ ] **SAFE-06** - Safety: Weekly progress reports (email)
- [ ] **SAFE-07** - Safety: App blocker schedules
- [ ] **SAFE-08** - Safety: Parent dashboard (study time, activities, focus sessions, weekly trends)
