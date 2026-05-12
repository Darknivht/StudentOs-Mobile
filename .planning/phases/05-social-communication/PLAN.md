# Phase 5: Social & Communication

## Overview
Students connect with peers through real-time chat, global leaderboards with friend request & study group features, an educational resource store with tier-gated downloads and YouTube integration, and 50+ achievements across 5 categories with XP rewards and celebration toasts.

## Completed Discussions

See [DISCUSS.md](discuss/DISCUSS.md) for the full discuss-phase.

**Key decisions:**
- Reuse `useSubscription` hook (already built in Phase 3) for Plus/Pro gating
- Supabase Realtime for chat (200 concurrent, 500KB/s — adequate for MVP)
- KaTeX rendering via `react-native-markdown-display` (already tested)
- Read receipts: `is_read` boolean (sufficient for MVP; can migrate to `read_at` later)
- Achievements computed via lazy query + manual XP tracking, not full realtime table insertion

## Plans

### Plan 05-01: Chat Infrastructure
**Requirements CHAT-01 & CHAT-02** — Direct & group messaging
**HOOKS/TYPES/SERVICES:**
- `hooks/useChat.ts` — subscribe/unsubscribe Supabase Realtime channels, track `online`/`offline` state, queue offline messages with `expo-sqlite`
- `hooks/useDirectMessages.ts` — fetch / paginate direct messages (25 messages per page via `pageParam`), optimistic UI updates
- `hooks/useGroupMessages.ts` — same as direct but includes `group_id` filter, restricts creation to tier >= Plus
- `types/chat.ts` — `Message`, `Conversation`, `Group`, `Participant` types

**SCREENSUI:**
- `app/(tabs)/chat/list.tsx` — List of conversations (last message, read status, avatar)
- `app/(tabs)/chat/[conversationId].tsx` — Chat detail (messages list, send bar, image picker)
- `app/(tabs)/chat/group/create.tsx` — Plus-only group creation with name, avatar, initial members
- Components — `MessageBubble`, `SendBar`, `MemberPicker`, `ConversationHeader`

**DB/MIGRATIONS:**
- Tables — `direct_messages`, `group_messages`, `conversations`, `groups`, `group_members`
- Indexes — `sender_id`, `recipient_id`, `group_id`, `created_at`
- RLS — User can read own messages, only group members read group messages, only Plus/Pro creates groups

**SPECS:**
| Spec | Details |
|------|---------|
| `CHAT-01` | DM via Supabase Realtime, messages table with sender_id/recipient_id, auto-scroll-to-bottom on new message |
| `CHAT-02` | Group messages, group_members join table (role: owner/admin/member), check `tier` in `useSubscription` before creating |
| `CHAT-05` | Realtime subscriptions re-attach on foreground with `AppState` listener + `user?.id` as `receiver` channel filter |
| `CHAT-07` | `AppState` reconnection — reattach on 'active', detach on 'background' |

### Plan 05-02: Chat Features (Media, Replies, Read Receipts)
**Requirements CHAT-03, CHAT-04, CHAT-06** — Media upload, message replies, read receipts
**HOOKS/TYPES/SERVICES:**
- `hooks/useMediaUpload.ts` — compress image via `expo-image-picker` (max 1024px), resize image if needed, generate random filename, upload to `chat-media` bucket, return public URL
- `hooks/useReply.ts` — quote referenced `message_id` with preview text (limit to 80 chars), handle reply-to-reply (limit to single level)
- `hooks/useReadReceipts.ts` — mark `is_read=true` on view via IntersectionObserver

**SCREENSUI:**
- `MessageBubble` — Inline image thumbnail (80px × 80px corner), quoted reply preview view
- `SendBar` — Long-press message → action menu (Reply, Copy, Delete), camera/photo selector
- `ChatHeader` — Online/offline indicator for recipient, typing indicator (optional for MVP)

**SUPABASE:**
- Storage bucket `chat-media` with RLS (authenticated access only)
- `messages` table — `media_url` (nullable), `reply_to_id` (nullable, self-referencing)
- Update `is_read` on conversation open (batch update for last 50 unread)

### Plan 05-03: Social Hub (Leaderboard, Friends, Study Groups, Peer Finder)
**Requirements SOCL-01..SOCL-07** — Social features

**HOOKS:**
- `hooks/useLeaderboard.ts` — Weekly query `user_stats` ordered by `weekly_xp DESC`, global query by `total_xp DESC`; fetch top 100 + user + adjacent peers (±3)
- `hooks/useFriends.ts` — CRUD for friend requests (send/accept/decline/block), status: `pending`, `accepted`, `blocked`
- `hooks/useStudyGroups.ts` — Create/join/via invite code, roles: `owner`, `admin`, `member`
- `hooks/usePeerFinder.ts` — Filter by school/grade/interests, paginated search

**SCREENSUI:**
- `app/(tabs)/social/index.tsx` — Entrance with cards: Leaderboard, Friends, Study Groups, Peer Finder, Store, Achievements
- `app/(tabs)/social/leaderboard.tsx` — Tabs: This Week | All Time, user rank highlighted, school-filter dropdown
- `app/(tabs)/social/friends.tsx` — Search by username, toggle tabs (All/Pending/Blocked), request badges
- `app/(tabs)/social/groups.tsx` — List groups, create group button (Plus check), invite code input
- `app/(tabs)/social/groups/[groupId].tsx` — Group detail with  tabs: Chat | Resources | Members (roles editable by admin/owner)
- `app/(tabs)/social/peers.tsx` — Search by filters (school dropdown, grade slider, interests chips), results as cards

**DB/MIGRATIONS:**
- `friendships` — `requester_id`, `recipient_id`, `status` enum, `created_at`
- `study_groups` — `name`, `invite_code` (unique, 6-char), `is_public`, `max_members`, `subject`, `grade` (nullable)
- `group_members` — `group_id`, `user_id`, `role` enum, `joined_at`

### Plan 05-04: Store (Resources, YouTube, Downloads)
**Requirements STOR-01..STOR-05** — Educational resource store

**HOOKS:**
- `hooks/useStore.ts` — Fetch resources, filter by category/subject/grade, search by title
- `hooks/useResourceDownload.ts` — Check tier permissions (Free resource = all, Plus = Free+Plus, Pro = all), track with `expo-file-system`

**SCREENSUI:**
- `app/(tabs)/store/index.tsx` — Resource grid with thumbnail, title, author, tier badge, search bar, filter dropdowns
- `app/(tabs)/store/[resourceId].tsx` — Resource detail: cover image, description, download button (disabled if tier insufficient)
- `app/(tabs)/store/youtube.tsx` — List of curated playlists, embedded `react-native-youtube-iframe` player
- Components — `ResourceCard`, `DownloadButton` (with progress), `YouTubePlayer`, `TierBadge`

**DB/MIGRATIONS:**
- `educational_resources` — `title`, `description`, `url`, `download_count`, `tier_required` (enum), `resource_type`, `subject`, `grade`
- `resource_downloads` — `user_id`, `resource_id`, `downloaded_at`

### Plan 05-05: Achievements & Challenges
**Requirements ACHV-01..ACHV-04, SOCL-02..SOCL-03** — 50+ achievements, study challenges
**HOOKS:**
- `hooks/useAchievements.ts` — Lazy query achievements JSON + manual XP tracking
- `hooks/useChallenges.ts` — Active challenge list, user challenge progress
- `hooks/useXP.ts` — Award XP to user (quiz, flashcard, pomodoro, etc.), detect new achievement unlocks

**SCREENSUI:**
- `app/(tabs)/achievements/index.tsx` — Grid with category tabs (5 categories), unlocked/locked state, progress bar, XP reward
- `app/(tabs)/achievements/[id].tsx` — Achievement detail: description, progress, history of unlocks (if any)
- `app/(tabs)/challenges/...` — Active challenges list, progress bar, XP reward on completion
events. Awards XP on new unlock. |

**ACHIEVEMENTS DATA:**
JSON file `achievements.json` with 50+ definitions: `id`, `name`, `description`, `category`, `xp_reward`, `tiers` (target via `quiz_count`, `streak_days`, etc.)

## Success Criteria
1. **CHAT-01 & CHAT-02** — Direct & group messaging functional, messages sent/received in real time
2. **CHAT-03** — Media upload to chat, inline preview shown
3. **CHAT-04** — Message replies with quote preview
4. **CHAT-05** — Realtime without manual refresh
5. **CHAT-06** — Read receipts on messages
6. **CHAT-07** — AppState reconnection functional
7. **SOCL-01** — Leaderboard shows top 100 + user rank + filters
8. **SOCL-02** — Study challenges functional with progress bars
9. **SOCL-03** — Friend challenges (quiz) functional
10. **SOCL-04** — Friend system (send/accept/decline/block) functional
11. **SOCL-05** — Study groups with invite codes functional
12. **SOCL-06** — Group detail (chat, resources, members) functional
13. **SOCL-07** — Peer finder search functional
14. **STOR-01** — Store resource cards with thumbnails
15. **STOR-02** — Search/filter by category/subject/grade
16. **STOR-03** — YouTube player embedded
17. **STOR-04** — Tier-gated access enforced
18. **STOR-05** — Download tracking increments count
19. **ACHV-01** — 50+ achievements across 5 categories
20. **ACHV-02** — Achievements computed from real-time queries
21. **ACHV-03** — Celebration toast with XP reward on unlock
22. **ACHV-04** — `user_achievements` table tracks unlocks with timestamps
