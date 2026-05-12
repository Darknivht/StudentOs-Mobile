# Phase 5 - Social & Communication

## Discussion

**Objective:** Enable students to connect with peers through chat, social features, achievements, and the store.

**Status:** Phase 5 is NOT YET started.

---

### Success Criteria (from ROADMAP.md):
1. Student sends direct messages and group chat messages via **Supabase Realtime**, uploads media with inline preview, replies with quoted preview, sees read receipts, and subscriptions reconnect when app returns to foreground — group chat requires Plus/Pro
2. Student views **global leaderboard** (all-time and weekly) with their rank highlighted, sends/receives friend requests, creates/joins study groups with invite codes, and discovers peers by school/grade/interests
3. Student browses **store** with search/filter by category/subject/grade, watches YouTube playlists with embedded player, downloads tier-gated resources with download tracking — Free/Plus/Pro access enforced
4. Student **earns 50+ achievements** across 5 categories, sees celebration toasts with XP rewards when unlocking new achievements, and views achievement history
5. Student **participates in study challenges** with progress bars and XP rewards, and challenges friends to quiz competitions for bonus XP

---

### Technical Decisions Needed:

#### 1. Chat Architecture
**Concern:** Supabase Realtime RAID capacity (200 concurrent connections, 500 KB/s max), message pagination & offline support.
**Considerations:** 
- Realtime for live updates; polling for native offline capability (expo-sqlite)
- FlatList with `onEndReached` for message pagination
- `expo-file-system` for media downloads, Supabase Storage for uploads

#### 2. KaTeX in Chat
**Concern:** How to render math in real-time chat?
**Decision:** Use `react-native-katex` or `react-native-render-html` with math parsing (same as web app). Test performance with large messages.

#### 3. Study Groups
**Concern:** Group management, member roles, invite codes.
**Decision:** 
- 6-character alphanumeric invite codes (unique)
- Member roles: `admin`, `moderator`, `member`
- Supabase RLS policies enforce per-role actions

#### 4. YouTube Player
**Concern:** Offline playback? Color scheme?
**Decision:** `react-native-youtube-iframe` or `expo-av` with YouTube URLs (screen limited to Free tier, offline downloads blocked)

#### 5. Achievements & XP
**Concern:** How to track achievements in real-time? XP calculations? 
**Decision:** Use Supabase Edge Function `calculate-achievements` triggered on each XP earning event (quiz, flashcard, Pomodoro). Achievements fetched on app launch + real-time updates via `.channel('achievements')`.

---

### Requirements Mapping:

**CHAT-01..CHAT-07** (Direct & Group Chat):
- Realtime subscriptions (Supabase `.channel()`)
- Media support (Supabase Storage)
- Read receipts (update `is_read` on message view)
- AppState reconnect logic

**SOCL-01..SOCL-07** (Social Hub):
- View leaderboard via `user_stats` table + `friends` table
- Send/accept/decline/block friend requests
- Create/join study groups with invite codes

**STOR-01..STOR-05** (Store):
- Search/filter resources
tier-based access via `subscription_tier` in RLS
- Downloads tracked via `resource_downloads` table

**ACHV-01..ACHV-04** (Achievements & XP):
50+ achievements pre-defined in JSON
- XP calculation for each action (quiz, flashcard, pomodoro, etc.)
- Achievement unlock detection + toast notification

#### 6. Read Receipts - `is_read` vs `read_at`?
**Concern:** Should we track the exact time when a message was read in addition to a boolean?
**Ideal State:** Use `read_at` nullable timestamp, which provides more useful analytics while being barely more expensive to store.
**Current State:** `is_read` boolean is simpler and sufficient for basic read receipts.
**Decision:** Start with `is_read` boolean for performance and simplicity (as per requirements). Future: switch to `read_at` timestamp for granular analytics.

---

### Summary:
- [ ] **CHAT-01..CHAT-07** - Chat: direct & group messages, media, read receipts
- [ ] **SOCL-01..SOCL-07** - Leaderboard, friends, study groups, peer finder
- [ ] **STOR-01..STOR-05** - Store with resources, downloads, tier-gated access
- [ ] **ACHV-01..ACHV-04** - Achievements: 50+ across 5 categories, celebration toasts
- [ ] **General** - All social features require `useSubscription` gate for Plus/Pro
