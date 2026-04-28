# Phase 1: Auth & Security - Context

**Gathered:** 2026-04-26
**Status:** Ready for implementation

<domain>
## Phase Boundary

Phase 1 implements secure authentication with mobile-native biometrics and PIN protection. This is the gate through which all users enter the app.

**This phase delivers:**

- Email/password sign up and sign in via Supabase Auth
- Session persistence with expo-secure-store (hardware-backed Keychain/Keystore)
- Biometric authentication (Face ID / fingerprint) for app unlock
- 4-digit PIN lock as fallback when biometrics unavailable
- Blocked user detection and forced sign-out
- Subscription tier enforcement (Free/Plus/Pro)
- Auto session refresh via onAuthStateChange
- Password reset via email link

</domain>

<decisions>
## Implementation Decisions

### Auth Flow (D-01)

- On app open: Check session → if authenticated, show biometric/PIN lock → then main app
- On app open: Check session → if not authenticated, show sign-in screen
- Supabase handles all email/password auth; we just consume the session

### Session Storage (D-02)

- Supabase client configured with `persistSession: true` and `autoRefreshToken: true`
- Supabase's default storage replaced with expo-secure-store adapter
- This means tokens go to iOS Keychain / Android Keystore (hardware-backed, encrypted)
- NEVER use AsyncStorage for any credential or token

### Biometric Auth (D-03)

- Use expo-local-authentication for Face ID / fingerprint
- Prompt on every app foreground (not just cold start)
- If biometrics fail or are unavailable, fall back to PIN
- If biometrics are not enrolled on device, skip biometric prompt entirely
- Biometric lock can be toggled in settings (Phase 18), default ON

### PIN Lock (D-04)

- 4-digit numeric PIN
- Stored via expo-secure-store (hashed with SHA-256)
- Set up during first sign-in after auth
- Required if biometrics unavailable
- 5 failed attempts → 30-second lockout, then exponential backoff

### Blocked User (D-05)

- On every auth state change, fetch profile from Supabase `profiles` table
- If `is_blocked = true`, immediately sign out and show blocked message
- Blocked user cannot re-authenticate

### Subscription Tier (D-06)

- Fetch from `profiles.subscription_tier` on auth
- Stored in authStore (Zustand + MMKV persistence)
- Used by feature gates: check `subscription` before allowing premium features
- Tier changes via Supabase realtime subscription (Phase 20)

### Password Reset (D-07)

- Use Supabase `resetPasswordForEmail` with deep link
- Deep link redirects to in-app password reset screen
- Fallback: email link opens web page (simpler, no deep link config needed for v1)

### Auth State Shape (D-08)

- Zustand authStore already scaffolded in Phase 0
- Enhanced with: biometricEnabled, pinSet, isLocked, isBlocked
- RootNavigator reads isAuthenticated + isLocked to determine which navigator to show

</decisions>

<canonical_refs>

## Canonical References

### Project Context

- `.planning/PROJECT.md` — Project vision, constraints
- `.planning/ROADMAP.md` §§70-92 — Phase 1 detailed requirements
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-11

### Research Insights

- `.planning/research/PITFALLS.md` — PITFALL-01 (AsyncStorage), PITFALL-06 (biometric bypass)
- `.planning/research/STACK.md` — expo-local-authentication, expo-secure-store

### Existing Code (from Phase 0)

- `src/stores/authStore.ts` — Zustand auth store with MMKV persistence
- `src/services/supabase/client.ts` — Supabase client (needs secure-store adapter)
- `src/types/auth.ts` — AuthUser, SubscriptionTier types
- `src/navigation/RootNavigator.tsx` — Auth/Main switch (needs lock state)
- `src/navigation/AuthNavigator.tsx` — Auth stack (needs more screens)
- `src/lib/constants.ts` — Subscription tier limits
- `src/lib/theme.ts` — Design tokens for auth screens

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets from Phase 0

- authStore: Zustand + MMKV — already persists user, session, isAuthenticated
- Supabase client: Basic createClient with autoRefreshToken — needs secure-store adapter
- Navigation types: AuthStackParamList, MainTabParamList already defined
- Types: AuthUser, SubscriptionTier already defined
- Theme: colors, spacing, typography constants available for auth screen styling

### Established Patterns

- Zustand stores with MMKV persistence (authStore, appStore)
- Factory pattern for services (ai, payment)
- Navigation: Auth stack → Main tabs, conditional on isAuthenticated

### Integration Points

- Supabase Auth: signUp, signInWithPassword, signOut, resetPasswordForEmail, onAuthStateChange
- expo-secure-store: Store Supabase session tokens, PIN hash
- expo-local-authentication: authenticateAsync, isEnrolledAsync, supportedAuthenticationTypesAsync
- MMKV: Already used for Zustand persistence — extend authStore shape

</code_context>

<specifics>
## Specific Ideas

### Auth Screen Flow

1. **SignInScreen**: Email + password fields, "Sign In" button, "Forgot Password?" link, "Create Account" link
2. **SignUpScreen**: Email + password + confirm password, "Create Account" button, "Already have an account?" link
3. **ForgotPasswordScreen**: Email field, "Send Reset Link" button, back to sign in
4. **BiometricLockScreen**: App logo, "Unlock with Face ID / Fingerprint" button, "Use PIN" fallback
5. **PINLockScreen**: 4-digit PIN input with dots display, "Use Biometrics" fallback
6. **PINSetupScreen**: Create PIN, confirm PIN (shown on first sign-in)

### Secure-Store Supabase Adapter

Create a custom storage adapter for Supabase that uses expo-secure-store instead of the default AsyncStorage. This is critical — Supabase's default uses AsyncStorage which is NOT secure.

```typescript
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
```

### Auth State Machine

```
[No Session] → SignIn/SignUp → [Authenticated] → Biometric/PIN Check → [Unlocked] → MainApp
                                                ↓ (blocked)
                                            [Blocked] → SignedOut → SignIn
```

</specifics>

<deferred>
## Deferred Ideas

- Deep link password reset (use email link fallback for v1)
- Biometric toggle in settings (Phase 18)
- Subscription tier realtime updates (Phase 20)
- Session timeout / auto-lock after inactivity (Phase 18)

</deferred>

---

_Phase: 01-auth-security_
_Context gathered: 2026-04-26_
