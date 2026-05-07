# Plan 02-03: Reanimated 3 Animation Utility Layer + Onboarding Flow

## Goal
Create reusable animation hooks using Reanimated 3 (matching framer-motion patterns from the web app), then build the full 7-step onboarding flow with spring animations, gradient backgrounds, floating particles, and swipe navigation — replicating the web app's Onboarding.tsx exactly.

## Requirements
- ONBD-01 (7-step onboarding with particle effects, gradient backgrounds)
- ONBD-02 (returning users skip onboarding)
- ONBD-03 (onboarding completion → auth)

## Animation Utilities to Build

### `hooks/useFadeIn.ts`
- Fade in with optional delay, duration, translateY offset
- Uses Reanimated `useAnimatedStyle` + `withTiming`

### `hooks/useSlideIn.ts`
- Slide in from left/right/bottom with spring physics
- Uses `withSpring` (stiffness: 250, damping: 28 — matching framer-motion values)

### `hooks/useScalePress.ts`
- Scale down on press in (0.95), scale back on press out (1.0)
- Uses `useAnimatedStyle` + `withSpring` (stiffness: 400, damping: 20)
- Returns `animatedStyle` + `onPressIn`/`onPressOut` handlers

### `hooks/useAnimatedPager.ts`
- Pager-style animation for onboarding slides
- `enter`/`center`/`exit` variants matching web's slideVariants
- Directional transitions (left/right based on swipe direction)

## Onboarding Flow

### Structure (replicating web Onboarding.tsx exactly)
- 7 slides with same content, icons, gradients, particle colors
- Full-screen gradient backgrounds per slide
- Floating particles (20 per slide, animated with Reanimated)
- Swipeable (GestureHandler + Reanimated)
- Progress bar at top
- Skip button
- Dot indicators at bottom
- Back/Next/Get Started buttons
- Slide transitions: spring animation with scale (0.9 → 1.0)

### Slides (exact copy from web)
1. Welcome to StudentOS — violet/purple/indigo gradient
2. AI-Powered Learning — blue/cyan/teal gradient
3. Never Forget Again — emerald/green/teal gradient
4. Stay in the Zone — orange/amber/yellow gradient
5. Track Your Growth — pink/rose/red gradient
6. Study Together — indigo/blue/violet gradient
7. Ready to Begin? — fuchsia/purple/violet gradient

### Completion
- Set `onboarding_seen=true` in kv-store
- Navigate to `/(auth)/login`

## Files to Create
- `apps/native/hooks/useFadeIn.ts`
- `apps/native/hooks/useSlideIn.ts`
- `apps/native/hooks/useScalePress.ts`
- `apps/native/hooks/useAnimatedPager.ts`
- `apps/native/components/FloatingParticles.tsx`
- `apps/native/app/onboarding.tsx` — REWRITE (full implementation)

## Dependencies
- `react-native-reanimated` (already installed)
- `react-native-gesture-handler` (already installed)
- `lucide-react-native` (already installed)

## Verification
- Each animation hook produces smooth spring animations
- Onboarding renders 7 slides with gradient backgrounds and particles
- Swipe left/right navigates between slides
- Skip button goes directly to auth
- Progress bar animates width on slide change
- Dot indicators update and are tappable
- "Get Started" button on last slide completes onboarding
- Returning users skip onboarding entirely
