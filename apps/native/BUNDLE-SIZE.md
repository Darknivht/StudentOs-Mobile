# Bundle Size Baseline — Phase 1

**Date:** 2026-05-06
**Expo SDK:** 54.0.34
**Engine:** Hermes (bytecode)

## Production Export

```
npx expo export --platform android
```

## Results

| Component | Size |
|-----------|------|
| JS Bundle (Hermes bytecode `.hbc`) | 6.87 MB |
| Assets (24 files) | ~25 KB |
| metadata.json | 1.81 KB |
| **Total** | **~6.90 MB** |

## Module Count

- **3,390 modules** bundled

## Assets Breakdown

- @react-navigation/elements icons (back, clear, close, search): ~2.5 KB
- expo-router dev tools icons (arrow, error, file, forward, pkg, sitemap, unmatched): ~17 KB
- Navigation icon masks: ~0.7 KB

## Target

- **< 10 MB JS bundle**: ✅ PASS (6.87 MB)
- **Hermes confirmed active**: ✅ PASS (`.hbc` output = Hermes bytecode)

## Notes

- This is a **Phase 1 baseline** with stub screens and minimal UI
- Bundle size will grow significantly as real feature UI is added in Phases 2-6
- Supabase JS client (~400 KB), React Navigation, and Reanimated are the largest contributors
- Code splitting and lazy loading should be evaluated in Phase 7 (Offline Sync & Polish)
- The 6.87 MB Hermes bytecode compresses to ~1.5-2 MB when served as an OTA update
