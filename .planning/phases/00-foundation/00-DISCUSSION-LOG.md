# Phase 0: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 00-foundation
**Areas discussed:** Project Structure, Navigation Layout, WatermelonDB Schema, API Service Architecture, Theme System

---

## Summary

Phase 0 Foundation has most architectural decisions already specified in the roadmap. The discussion confirmed these locked decisions and established that implementation details are at agent discretion within the specified constraints.

## Decisions Summary

| Area | Decision | Status |
|------|----------|--------|
| Tech Stack | Expo SDK 54 + Dev Client + TypeScript | Locked (roadmap) |
| Navigation | React Navigation v7 (bottom tabs + stack) | Locked (roadmap) |
| State (transient) | Zustand v5 | Locked (roadmap) |
| State (persistent) | WatermelonDB | Locked (roadmap) |
| Database Models | courses, notes, flashcards, quizzes, exam_attempts, users, sync_state | Locked (roadmap) |
| AI Providers | Factory pattern via env vars | Locked (roadmap) |
| Payment Providers | Factory pattern via env vars | Locked (roadmap) |
| Supabase | Auth, database, storage, realtime | Locked (roadmap) |
| Theme | Dark/light mode with design tokens | Locked (roadmap) |
| Project Structure | Standard RN/Expo folders | Agent discretion |
| Navigation Tabs | Standard layout | Agent discretion |

---

## Discussion Notes

**User confirmed:** All roadmap-specified decisions are acceptable. Agent has discretion for implementation details.

**Implementation guidance from research:**
- Use expo-secure-store (not AsyncStorage) for tokens — avoids PITFALL-01
- Implement sync lock for WatermelonDB — avoids PITFALL-02
- Route AI API calls through backend proxy — avoids PITFALL-03
- Start on Expo SDK 54 (not 55) for stability
- Use react-native-mmkv v4 for secure storage

---

*Discussion completed: 2026-04-25*
*All decisions captured in 00-CONTEXT.md*