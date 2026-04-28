---
phase: 01-auth-security
verified: 2026-04-27T14:30:00Z
status: gaps_found
score: 8/11
must-haves:
  truths:
    - "User can sign up with email/password via Supabase Auth (AUTH-01)"
    - "User can sign in with email/password via Supabase Auth (AUTH-02)"
    - "User session persists across app restarts with secure token storage (AUTH-03)"
    - "User can sign out from any screen (AUTH-04)"
    - "User can reset password via email link (AUTH-05)"
    - "App lock with biometric authentication (Face ID / fingerprint) (AUTH-06)"
    - "App lock with 4-digit PIN stored via expo-secure-store (AUTH-07)"
    - "Blocked user enforcement with is_blocked flag check (AUTH-08)"
    - "Subscription tier enforcement Free/Plus/Pro feature gating (AUTH-09)"
    - "Secure credential storage encrypted hardware-backed Keychain/Keystore (AUTH-10)"
    - "Auto session refresh with onAuthStateChange subscription (AUTH-11)"
  artifacts:
    - path: "src/services/supabase/authService.ts"
      provides: "signUp, signIn, signOut, resetPassword, getSession, fetchUserProfile, onAuthStateChange"
    - path: "src/services/supabase/secureStoreAdapter.ts"
      provides: "Expo SecureStore adapter for Supabase token persistence"
    - path: "src/services/supabase/client.ts"
      provides: "Supabase client configured with secure-store adapter, autoRefreshToken, persistSession"
    - path: "src/services/auth/biometricService.ts"
      provides: "Biometric availability check, enrollment check, authenticate, enable/disable toggle"
    - path: "src/services/auth/pinService.ts"
      provides: "PIN set/verify/remove with SHA-256 hashing, lockout, exponential backoff"
    - path: "src/hooks/useAuth.ts"
      provides: "Main auth hook: signUp, signIn, signOut, resetPassword, unlock, onAuthStateChange subscription, AppState lock"
    - path: "src/hooks/useSubscription.ts"
      provides: "Subscription tier enforcement: canAccess, requireTier"
    - path: "src/stores/authStore.ts"
      provides: "Zustand store with MMKV persistence: user, session, lock state, blocked, subscription"
    - path: "src/navigation/RootNavigator.tsx"
      provides: "Conditional routing: auth/lock/blocked/main based on auth state"
    - path: "src/screens/auth/SignInScreen.tsx"
      provides: "Sign-in UI with email/password fields"
    - path: "src/screens/auth/SignUpScreen.tsx"
      provides: "Sign-up UI with email/password/confirm fields"
    - path: "src/screens/auth/ForgotPasswordScreen.tsx"
      provides: "Password reset UI with email input and success state"
    - path: "src/screens/auth/BiometricLockScreen.tsx"
      provides: "Biometric unlock UI with Face ID/fingerprint detection and PIN fallback"
    - path: "src/screens/auth/PINLockScreen.tsx"
      provides: "4-digit PIN entry with lockout timer and biometric fallback"
    - path: "src/screens/auth/PINSetupScreen.tsx"
      provides: "PIN creation/confirmation flow with 4-digit keypad"
    - path: "src/screens/auth/BlockedScreen.tsx"
      provides: "Blocked user message with sign-out action"
    - path: "src/providers/AuthProvider.tsx"
      provides: "React context wrapping useAuth for tree-wide access"
  key_links:
    - from: "App.tsx"
      to: "AuthProvider + RootNavigator"
      via: "import and JSX nesting"
    - from: "RootNavigator"
      to: "useAuth"
      via: "hook call for isAuthenticated, isLocked, isBlocked, signOut"
    - from: "RootNavigator"
      to: "BiometricLockScreen, PINLockScreen, BlockedScreen"
      via: "conditional rendering based on auth/lock/blocked state"
    - from: "useAuth"
      to: "authService (signUp, signIn, signOut, resetPassword, getSession, fetchUserProfile, onAuthStateChange)"
      via: "service imports"
    - from: "useAuth"
      to: "biometricService (isBiometricAvailable, isBiometricEnrolled, authenticateWithBiometrics, isBiometricLockEnabled)"
      via: "service imports"
    - from: "useAuth"
      to: "pinService (isPinSet, verifyPin)"
      via: "service imports"
    - from: "useAuth"
      to: "authStore"
      via: "useAuthStore selectors and actions"
    - from: "client.ts"
      to: "secureStoreAdapter"
      via: "storage: ExpoSecureStoreAdapter in createClient config"
    - from: "SignInScreen/SignUpScreen/ForgotPasswordScreen"
      to: "useAuth"
      via: "hook calls for signIn/signUp/resetPassword"
    - from: "BiometricLockScreen/PINLockScreen"
      to: "useAuth"
      via: "hook calls for unlockWithBiometrics/unlockWithPin"
    - from: "useSubscription"
      to: "authStore"
      via: "useAuthStore selector for subscription tier"
gaps:
  - truth: "User can sign out from any screen (AUTH-04)"
    status: partial
    reason: "signOut function exists in useAuth and is accessible via AuthProvider context, but no main app screen renders a sign-out button. ProfileScreen (the only main-screen user-accessible screen) is a Phase 0 placeholder with no sign-out UI. The BlockedScreen has sign-out, but that only covers the blocked state."
    artifacts:
      - path: "src/screens/ProfileScreen.tsx"
        issue: "Placeholder screen with no sign-out button"
      - path: "src/navigation/MainNavigator.tsx"
        issue: "No header or global sign-out action available"
    missing:
      - "Sign-out button or action on ProfileScreen (or a global header/menu)"
      - "Sign-out accessible from at least one main app screen beyond the blocked state"
  - truth: "Subscription tier enforcement Free/Plus/Pro feature gating (AUTH-09)"
    status: partial
    reason: "useSubscription hook with canAccess/requireTier logic exists and reads from authStore, but no feature gate component or actual gating UI exists. The hook provides the logic but nothing in the app calls canAccess or requireTier to restrict features. No FeatureGateDialog or UpgradePrompt component. This enforcement infrastructure exists but is not wired to any feature."
    artifacts:
      - path: "src/hooks/useSubscription.ts"
        issue: "Hook exists but never consumed by any feature screen"
      - path: "src/screens/ProfileScreen.tsx"
        issue: "No subscription display or tier gating"
    missing:
      - "At least one feature screen calling useSubscription.canAccess or requireTier"
      - "FeatureGateDialog or UpgradePrompt component for tier-blocked access"
deferred:
  - truth: "Subscription tier enforcement with UI gating and upgrade prompts"
    addressed_in: "Phase 19"
    evidence: "Phase 19 success criteria: 'Feature gating (FeatureGateDialog, UpgradePrompt components shown when blocked)' and 'useSubscription hook (auto-refresh every 5 min, subscription-updated event listener)'"
---

# Phase 1: Auth & Security Verification Report

**Phase Goal:** Secure authentication with mobile-native biometrics and PIN protection.

**Verified:** 2026-04-27T14:30:00Z

**Status:** gaps_found

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                           | Status     | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | User can sign up with email/password via Supabase Auth (AUTH-01)                | ✓ VERIFIED | `authService.signUp()` calls `supabase.auth.signUp({ email, password })`; `SignUpScreen.tsx` (174 lines) renders full form with email/password/confirm, validation, calls `useAuth().signUp`; `AuthNavigator` routes to SignUp screen                                                                                                                                                                                   |
| 2   | User can sign in with email/password via Supabase Auth (AUTH-02)                | ✓ VERIFIED | `authService.signIn()` calls `supabase.auth.signInWithPassword({ email, password })`; `SignInScreen.tsx` (163 lines) renders form, calls `useAuth().signIn`; `onAuthStateChange` in useAuth catches SIGNED_IN event                                                                                                                                                                                                     |
| 3   | User session persists across app restarts with secure token storage (AUTH-03)   | ✓ VERIFIED | `client.ts` configured with `persistSession: true`, `autoRefreshToken: true`, `storage: ExpoSecureStoreAdapter`; `useAuth.initialize()` calls `getSession()` on mount; authStore MMKV persistence preserves `isAuthenticated`, `user`, `session` across restarts                                                                                                                                                        |
| 4   | User can sign out from any screen (AUTH-04)                                     | ⚠️ PARTIAL | `signOut()` exists in `useAuth` (accessible via `AuthProvider` context throughout app tree) and works functionally. However, **no main app screen renders a sign-out button**. `ProfileScreen.tsx` is a Phase 0 placeholder (23 lines, just "Profile" text). Only `BlockedScreen` has a sign-out button. The plumbing is complete but the UI is missing.                                                                |
| 5   | User can reset password via email link (AUTH-05)                                | ✓ VERIFIED | `authService.resetPassword()` calls `supabase.auth.resetPasswordForEmail(email)`; `ForgotPasswordScreen.tsx` (172 lines) renders email input, sends reset link, shows success message with "Back to Sign In" navigation                                                                                                                                                                                                 |
| 6   | App lock with biometric authentication (Face ID / fingerprint) (AUTH-06)        | ✓ VERIFIED | `biometricService.ts` (51 lines) uses `expo-local-authentication`: `hasHardwareAsync()`, `isEnrolledAsync()`, `supportedAuthenticationTypesAsync()`, `authenticateAsync()`; `BiometricLockScreen.tsx` (131 lines) detects Face ID vs fingerprint, shows unlock button; `useAuth` AppState listener re-locks on app foreground; `RootNavigator` conditionally renders biometric lock when `isLocked && biometricEnabled` |
| 7   | App lock with 4-digit PIN stored via expo-secure-store (AUTH-07)                | ✓ VERIFIED | `pinService.ts` (79 lines): `setPin()` hashes with SHA-256 + salt, stores via `SecureStore.setItemAsync`; `verifyPin()` checks lockout, compares hashes, tracks failed attempts, implements exponential backoff (30s base, max 5 min); `PINLockScreen.tsx` (206 lines) renders 4-dot display + numeric keypad + lockout timer; `PINSetupScreen.tsx` (177 lines) has create/confirm flow                                 |
| 8   | Blocked user enforcement with is_blocked flag check (AUTH-08)                   | ✓ VERIFIED | `fetchUserProfile()` queries `profiles.is_blocked`; `useAuth.initialize()` checks `profile.isBlocked` → `signOut()` + `store.signOut()` if blocked; `onAuthStateChange` handler re-checks on SIGNED_IN; `RootNavigator` renders `BlockedScreen` when `isBlocked=true`; `authStore.setUser()` sets `isBlocked` from profile data                                                                                         |
| 9   | Subscription tier enforcement Free/Plus/Pro feature gating (AUTH-09)            | ⚠️ PARTIAL | `useSubscription.ts` (37 lines) implements tier hierarchy (free=0, plus=1, pro=2) with `canAccess()` and `requireTier()` methods. It reads from `authStore.subscription` which is populated from `profiles.subscription_tier`. However, **no feature screen calls these methods** — the hook exists but is not wired to any feature gating UI. No FeatureGateDialog or UpgradePrompt exists.                            |
| 10  | Secure credential storage encrypted hardware-backed Keychain/Keystore (AUTH-10) | ✓ VERIFIED | `secureStoreAdapter.ts` wraps `expo-secure-store` (iOS Keychain / Android Keystore); `client.ts` uses `storage: ExpoSecureStoreAdapter` for Supabase token persistence; PIN hash stored in SecureStore; biometric toggle stored in SecureStore; **no AsyncStorage usage found** in any auth-related file (PITFALL-01 avoided)                                                                                           |
| 11  | Auto session refresh with onAuthStateChange subscription (AUTH-11)              | ✓ VERIFIED | `authService.onAuthStateChange()` wraps `supabase.auth.onAuthStateChange()` with event/userId callback; `useAuth` subscribes on mount, handles SIGNED_IN (fetches profile, sets lock state) and SIGNED_OUT (clears store); cleanup unsubscribes on unmount; `client.ts` has `autoRefreshToken: true`                                                                                                                    |

**Score:** 8/11 truths verified (2 partial, 0 failed)

### Deferred Items

| #   | Item                                                                 | Addressed In | Evidence                                                                                       |
| --- | -------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| 1   | Subscription tier UI gating with FeatureGateDialog and UpgradePrompt | Phase 19     | Phase 19 SC: "Feature gating (FeatureGateDialog, UpgradePrompt components shown when blocked)" |
| 2   | Sign-out from Profile screen (full profile/settings UI)              | Phase 18     | Phase 18 SC: "Sign out action" (Profile & Settings phase)                                      |

### Required Artifacts

| Artifact                                      | Expected                                                                                | Status     | Details                                                                                                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/supabase/authService.ts`        | signUp, signIn, signOut, resetPassword, getSession, fetchUserProfile, onAuthStateChange | ✓ VERIFIED | 85 lines, all 7 functions implemented with Supabase client, error handling                                                                                                |
| `src/services/supabase/secureStoreAdapter.ts` | Expo SecureStore adapter for Supabase                                                   | ✓ VERIFIED | 9 lines, implements getItem/setItem/removeItem with SecureStore async methods                                                                                             |
| `src/services/supabase/client.ts`             | Supabase client with secure-store adapter                                               | ✓ VERIFIED | 28 lines, createClient with storage: ExpoSecureStoreAdapter, persistSession: true, autoRefreshToken: true                                                                 |
| `src/services/auth/biometricService.ts`       | Biometric auth                                                                          | ✓ VERIFIED | 51 lines, 6 functions: isBiometricAvailable, isBiometricEnrolled, getBiometricType, authenticateWithBiometrics, isBiometricLockEnabled, setBiometricLockEnabled           |
| `src/services/auth/pinService.ts`             | PIN lock with SHA-256 hashing, lockout                                                  | ✓ VERIFIED | 79 lines, 7 functions: setPin, verifyPin, isPinSet, removePin, getPinLockoutRemaining, getFailedPinAttempts, plus internal hashPin                                        |
| `src/hooks/useAuth.ts`                        | Main auth hook                                                                          | ✓ VERIFIED | 192 lines, complete: initialize, onAuthStateChange subscription, AppState foreground re-lock, signUp, signIn, signOut, resetPassword, unlockWithBiometrics, unlockWithPin |
| `src/hooks/useSubscription.ts`                | Tier enforcement                                                                        | ✓ VERIFIED | 37 lines, canAccess/requireTier logic with tier hierarchy — **wired to authStore but not consumed by any feature screen**                                                 |
| `src/stores/authStore.ts`                     | Zustand store with lock state                                                           | ✓ VERIFIED | 90 lines, MMKV persistence, state: user, session, isAuthenticated, isLoading, subscription, isBlocked, isLocked, biometricEnabled, pinSet with all actions                |
| `src/navigation/RootNavigator.tsx`            | Conditional routing: auth/lock/blocked/main                                             | ✓ VERIFIED | 89 lines, 4-state routing: loading → blocked → unauthenticated → locked (biometric/PIN) → main app                                                                        |
| `src/screens/auth/SignInScreen.tsx`           | Sign-in screen                                                                          | ✓ VERIFIED | 163 lines, email/password inputs, error handling, navigation to SignUp/ForgotPassword                                                                                     |
| `src/screens/auth/SignUpScreen.tsx`           | Sign-up screen                                                                          | ✓ VERIFIED | 174 lines, email/password/confirm inputs, validation, navigation to SignIn                                                                                                |
| `src/screens/auth/ForgotPasswordScreen.tsx`   | Password reset screen                                                                   | ✓ VERIFIED | 172 lines, email input, send reset link, success state, back to sign in                                                                                                   |
| `src/screens/auth/BiometricLockScreen.tsx`    | Biometric lock screen                                                                   | ✓ VERIFIED | 131 lines, detects Face ID/fingerprint, unlock button, PIN fallback link                                                                                                  |
| `src/screens/auth/PINLockScreen.tsx`          | PIN lock screen                                                                         | ✓ VERIFIED | 206 lines, 4-dot display, numeric keypad, lockout timer, biometric fallback                                                                                               |
| `src/screens/auth/PINSetupScreen.tsx`         | PIN setup screen                                                                        | ✓ VERIFIED | 177 lines, create/confirm flow, 4-digit keypad, error handling                                                                                                            |
| `src/screens/auth/BlockedScreen.tsx`          | Blocked user screen                                                                     | ✓ VERIFIED | 66 lines, blocked message with sign-out button                                                                                                                            |
| `src/providers/AuthProvider.tsx`              | Auth context provider                                                                   | ✓ VERIFIED | 20 lines, React context wrapping useAuth, useAuthContext hook with guard                                                                                                  |

### Key Link Verification

| From                 | To                             | Via                            | Status  | Details                                                                                                             |
| -------------------- | ------------------------------ | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------- |
| App.tsx              | AuthProvider + RootNavigator   | Import and JSX nesting         | ✓ WIRED | AuthProvider wraps RootNavigator in gesture/safe-area providers                                                     |
| RootNavigator        | useAuth                        | Hook call                      | ✓ WIRED | Destructures isAuthenticated, isLocked, isBlocked, signOut, biometricEnabled, pinSet                                |
| RootNavigator        | BiometricLockScreen            | Conditional render             | ✓ WIRED | Renders when `isLocked && (biometricEnabled \|\| lockMode === 'biometric')`                                         |
| RootNavigator        | PINLockScreen                  | Conditional render             | ✓ WIRED | Renders when `isLocked && !biometricEnabled`                                                                        |
| RootNavigator        | BlockedScreen                  | Conditional render             | ✓ WIRED | Renders when `isBlocked`, passes `onSignOut={signOut}`                                                              |
| RootNavigator        | AuthNavigator                  | Conditional render             | ✓ WIRED | Renders when `!isAuthenticated && !isBlocked`                                                                       |
| useAuth              | authService (7 functions)      | Service imports                | ✓ WIRED | All auth service functions imported and used in hook logic                                                          |
| useAuth              | biometricService (4 functions) | Service imports                | ✓ WIRED | isBiometricAvailable, isBiometricEnrolled, authenticateWithBiometrics, isBiometricLockEnabled used in init + unlock |
| useAuth              | pinService (2 functions)       | Service imports                | ✓ WIRED | isPinSet used in init, verifyPin used in unlockWithPin                                                              |
| useAuth              | authStore                      | useAuthStore selectors/actions | ✓ WIRED | Reads user, isAuthenticated, etc.; calls setUser, setLocked, signOut, etc.                                          |
| client.ts            | secureStoreAdapter             | storage config in createClient | ✓ WIRED | `storage: ExpoSecureStoreAdapter` passed to Supabase createClient                                                   |
| SignInScreen         | useAuth.signIn                 | Hook call                      | ✓ WIRED | `const { signIn, isLoading } = useAuth()`                                                                           |
| SignUpScreen         | useAuth.signUp                 | Hook call                      | ✓ WIRED | `const { signUp, isLoading } = useAuth()`                                                                           |
| ForgotPasswordScreen | useAuth.resetPassword          | Hook call                      | ✓ WIRED | `const { resetPassword, isLoading } = useAuth()`                                                                    |
| BiometricLockScreen  | useAuth.unlockWithBiometrics   | Hook call                      | ✓ WIRED | `const { unlockWithBiometrics, pinSet } = useAuth()`                                                                |
| PINLockScreen        | useAuth.unlockWithPin          | Hook call                      | ✓ WIRED | `const { unlockWithPin } = useAuth()`                                                                               |
| useSubscription      | authStore                      | useAuthStore selector          | ✓ WIRED | `const subscription = useAuthStore((s) => s.subscription)` — but no feature screen consumes this hook               |
| AuthNavigator        | Auth screens                   | Screen components              | ✓ WIRED | Stack.Navigator with SignIn, SignUp, ForgotPassword, PINSetup screens                                               |
| services/index.ts    | All auth services              | Re-exports                     | ✓ WIRED | All auth functions re-exported from barrel                                                                          |

### Data-Flow Trace (Level 4)

| Artifact        | Data Variable     | Source                                                        | Produces Real Data                                                                                            | Status    |
| --------------- | ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- |
| useAuth         | `user`            | `fetchUserProfile()` → Supabase `profiles` table              | ✓ Yes — queries `id, email, display_name, avatar_url, subscription_tier, is_blocked, created_at` from real DB | ✓ FLOWING |
| useAuth         | `isAuthenticated` | Derived from `user !== null` via authStore `setUser`          | ✓ Yes — set when Supabase session has valid user + profile                                                    | ✓ FLOWING |
| useAuth         | `isLocked`        | AppState listener + init check (biometricEnabled \|\| pinSet) | ✓ Yes — reads from SecureStore, set on app foreground                                                         | ✓ FLOWING |
| useAuth         | `subscription`    | `fetchUserProfile()` → `profiles.subscription_tier`           | ✓ Yes — real DB column, cast to SubscriptionTier type                                                         | ✓ FLOWING |
| useSubscription | `subscription`    | authStore → MMKV persisted                                    | ✓ Yes — same data as useAuth                                                                                  | ✓ FLOWING |
| RootNavigator   | `isBlocked`       | authStore → `fetchUserProfile.is_blocked`                     | ✓ Yes — real DB flag, enforced on SIGNED_IN event                                                             | ✓ FLOWING |
| PINLockScreen   | `lockoutMs`       | `getPinLockoutRemaining()` → SecureStore                      | ✓ Yes — reads stored lockout timestamp, computes remaining                                                    | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior                                   | Command                                                                                    | Result                                            | Status |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------ |
| Module exports expected functions          | `node -e "const m = require('./src/services/index.ts'); console.log(Object.keys(m))"` 2>&1 | Cannot test — TypeScript module with Expo imports | ? SKIP |
| No AsyncStorage usage in auth files        | Grep for "AsyncStorage" in src/                                                            | Zero matches found                                | ✓ PASS |
| All auth screens export correctly          | Grep for screen exports in src/screens/auth/index.ts                                       | 7 screens exported                                | ✓ PASS |
| Services barrel exports all auth functions | Grep for auth function names in src/services/index.ts                                      | All 13 auth functions exported                    | ✓ PASS |

### Requirements Coverage

| Requirement | Source          | Description                                                 | Status      | Evidence                                                                                                                                             |
| ----------- | --------------- | ----------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01     | REQUIREMENTS.md | Sign up with email/password via Supabase Auth               | ✓ SATISFIED | `authService.signUp()` → Supabase `signUp`; `SignUpScreen` UI complete                                                                               |
| AUTH-02     | REQUIREMENTS.md | Sign in with email/password via Supabase Auth               | ✓ SATISFIED | `authService.signIn()` → Supabase `signInWithPassword`; `SignInScreen` UI complete                                                                   |
| AUTH-03     | REQUIREMENTS.md | Session persists across app restarts (secure token storage) | ✓ SATISFIED | Supabase client with `persistSession: true` + SecureStore adapter; authStore MMKV persistence                                                        |
| AUTH-04     | REQUIREMENTS.md | User can sign out from any screen                           | ⚠️ PARTIAL  | `signOut()` function exists and is accessible via `useAuth`/`AuthProvider`, but no main app screen renders a sign-out button. BlockedScreen has one. |
| AUTH-05     | REQUIREMENTS.md | User can reset password via email link                      | ✓ SATISFIED | `authService.resetPassword()` → Supabase `resetPasswordForEmail`; `ForgotPasswordScreen` UI complete with success state                              |
| AUTH-06     | REQUIREMENTS.md | App lock with biometric authentication                      | ✓ SATISFIED | `biometricService` using expo-local-authentication; `BiometricLockScreen`; AppState re-lock on foreground                                            |
| AUTH-07     | REQUIREMENTS.md | 4-digit PIN stored via expo-secure-store                    | ✓ SATISFIED | `pinService` with SHA-256 + salt; `PINLockScreen` with 4-dot keypad; `PINSetupScreen` with create/confirm; lockout with exponential backoff          |
| AUTH-08     | REQUIREMENTS.md | Blocked user enforcement (is_blocked flag)                  | ✓ SATISFIED | `fetchUserProfile` checks `is_blocked`; useAuth forces signOut; RootNavigator renders BlockedScreen                                                  |
| AUTH-09     | REQUIREMENTS.md | Subscription tier enforcement (Free/Plus/Pro)               | ⚠️ PARTIAL  | `useSubscription` hook with `canAccess`/`requireTier` logic exists, but no feature screen calls it and no gating UI exists                           |
| AUTH-10     | REQUIREMENTS.md | Secure credential storage (hardware-backed)                 | ✓ SATISFIED | All tokens in expo-secure-store (Keychain/Keystore); PIN hash in SecureStore; zero AsyncStorage usage                                                |
| AUTH-11     | REQUIREMENTS.md | Auto session refresh with onAuthStateChange                 | ✓ SATISFIED | `authService.onAuthStateChange()` wraps Supabase subscription; `useAuth` subscribes and handles events; `autoRefreshToken: true` in client config    |

### Anti-Patterns Found

| File                                | Line    | Pattern                                                                                                                                          | Severity | Impact                                                                                            |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| src/hooks/useAuth.ts                | 146-153 | signOut catches and logs error but still calls store.signOut() — if Supabase signOut fails, local state is cleared but server session may remain | ℹ️ Info  | User appears signed out locally but session may persist on server. Common pattern, not a blocker. |
| src/screens/auth/PINSetupScreen.tsx | 48-60   | handlePinSet is called inside handleDigit callback but not defined with useCallback — could cause stale closure in theory                        | ℹ️ Info  | Minimal practical impact — PIN setup is a one-time flow                                           |

**No blocker anti-patterns found. No TODO/FIXME/PLACEHOLDER markers in any auth file. No AsyncStorage usage detected (PITFALL-01 avoided). No empty implementations or stub returns.**

### Human Verification Required

### 1. Biometric Unlock on Real Device

**Test:** Install app on iOS/Android device with Face ID or fingerprint enrolled. Sign in, close app, reopen.
**Expected:** Biometric prompt appears on app reopen. Successful biometric auth unlocks app to main screen.
**Why human:** expo-local-authentication requires real hardware — biometric APIs are not available in simulators for full testing.

### 2. PIN Lock and Lockout on Real Device

**Test:** Set a 4-digit PIN, lock the app, enter wrong PIN 5 times.
**Expected:** After 5 failures, lockout timer appears (30s), then exponential backoff on subsequent failures. Correct PIN unlocks immediately.
**Why human:** SecureStore and lockout timing behavior may differ across devices; needs real device testing.

### 3. Session Persistence Across App Restart

**Test:** Sign in, fully close the app (swipe away), reopen.
**Expected:** App does not show sign-in screen; instead shows biometric/PIN lock if configured, or goes directly to main app.
**Why human:** SecureStore persistence behavior on app kill vs. background varies by platform; needs real device verification.

### 4. Blocked User Detection

**Test:** Sign in as a user, then set `is_blocked = true` in the profiles table via Supabase dashboard.
**Expected:** On next auth state change or app reopen, user is signed out and sees BlockedScreen.
**Why human:** Requires manipulating database state and observing real-time enforcement.

### 5. Password Reset Email Delivery

**Test:** Enter email on Forgot Password screen, tap "Send Reset Link".
**Expected:** Supabase sends password reset email, app shows success message.
**Why human:** Email delivery depends on Supabase auth configuration and email provider.

### Gaps Summary

**2 partial truths identified:**

1. **AUTH-04 — Sign out from any screen**: The `signOut` plumbing is complete and accessible via `AuthProvider` context anywhere in the component tree. The gap is that no main app screen (Home, Study, Focus, Profile) currently renders a sign-out button or action. ProfileScreen is a Phase 0 placeholder. The BlockedScreen has a sign-out button, but that only covers the blocked state. This is a **UI gap**, not an architecture gap — the infrastructure is fully wired.

2. **AUTH-09 — Subscription tier enforcement**: The `useSubscription` hook provides correct tier hierarchy logic (`canAccess`, `requireTier`) and reads from authStore. However, no feature screen in the app calls these methods, and no `FeatureGateDialog` or `UpgradePrompt` component exists. The enforcement **logic** is complete but the enforcement **wiring** is absent. This is intentionally deferred to Phase 19 (Payments & Subscriptions), which explicitly includes "Feature gating (FeatureGateDialog, UpgradePrompt components shown when blocked)" in its success criteria.

**Both gaps are partial implementations where the infrastructure exists but the consumer-facing integration is deferred to later phases (18 and 19 respectively).** The auth/security core — sign up, sign in, session persistence, biometric/PIN lock, blocked user enforcement, secure storage, and auto-refresh — is fully implemented and wired.

---

_Verified: 2026-04-27T14:30:00Z_
_Verifier: the agent (gsd-verifier)_
