# Plan 02-04: Offline Banner, Sync Indicator, Ad Banner

## Goal
Build the connectivity status and monetization banners that appear across the app — offline banner, reconnection sync indicator, and ad banner for free-tier users.

## Requirements
- OFFL-02 (offline status banner displays when device is offline)
- OFFL-03 (sync indicator shows spinner when reconnecting)

## Components

### 1. OfflineStatusBanner
- Replicates web app's `OfflineStatusBanner.tsx`
- Uses `@react-native-community/netinfo` for connectivity detection
- Shows amber "You're offline" banner when disconnected
- Shows green "You're back online! Syncing..." when reconnecting
- Animated entrance/exit using Reanimated (height: 0 → auto, opacity: 0 → 1)
- Placed at root layout level, above all content

### 2. SyncIndicator
- Appears briefly when device reconnects after being offline
- Shows spinner + "Syncing data..." text
- Auto-dismisses after 3 seconds or when sync completes
- Uses `isOnline` + `wasOffline` state from useNetInfo hook

### 3. AdBanner (free-tier)
- Shows banner ad placeholder for free-tier users
- Hidden for Plus/Pro subscribers
- Placed at bottom of content area (above tab bar on tab screens)
- Placeholder rectangle with "Ad Space" text (real ad SDK integration deferred to Phase 6)
- Respects subscription tier from auth context

## Implementation

### useNetInfo Hook
- Wraps `@react-native-community/netinfo`
- Returns `{ isOnline, wasOffline, isConnected }`
- Tracks previous offline state for "back online" detection
- `wasOffline` resets after 3 seconds of being back online

## Files Created
- `apps/native/hooks/useNetInfo.ts` ✅
- `apps/native/components/OfflineStatusBanner.tsx` ✅
- `apps/native/components/SyncIndicator.tsx` ✅
- `apps/native/components/AdBanner.tsx` ✅

## Files Modified
- `apps/native/app/_layout.tsx` — added OfflineStatusBanner at top ✅

## Dependencies Installed
- `@react-native-community/netinfo` ✅

## Verification
- ✅ TypeScript compiles clean
- ⬜ Airplane mode → amber "You're offline" banner appears (needs device testing)
- ⬜ Turn off airplane mode → green "You're back online!" banner appears briefly
- ⬜ Sync indicator shows spinner for 3 seconds after reconnection
- ⬜ AdBanner renders for free-tier users, hidden for Plus/Pro
- ⬜ Both banners animate in/out smoothly
