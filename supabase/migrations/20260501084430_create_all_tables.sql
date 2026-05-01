-- ============================================
-- StudentOS Mobile — Initial Schema
-- New database, designed for the mobile app
-- ============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES
-- id = auth.users.id (1:1 with auth user)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  display_name text,
  full_name text,
  avatar_url text,
  username text,
  subscription_tier text default 'free',
  subscription_expires_at timestamptz,
  is_blocked boolean default false,
  total_xp integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_study_date date,
  ai_calls_today integer default 0,
  ai_calls_reset_at timestamptz,
  flashcards_generated_today integer default 0,
  notes_today integer default 0,
  quizzes_today integer default 0,
  job_searches_this_month integer default 0,
  job_searches_reset_month timestamptz,
  daily_time_limit integer,
  content_filter_enabled boolean default true,
  safe_search_enabled boolean default true,
  grade_level text,
  school_name text,
  study_persona text,
  is_under_14 boolean default false,
  parent_email text,
  parental_pin text,
  brain_boost_completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, user_id, email, display_name)
  values (
    new.id,
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- COURSES
-- Mobile uses: title, description, emoji (NOT name/icon like web)
-- ============================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text,
  emoji text,
  progress integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- NOTES
-- ============================================
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  summary text,
  course_id uuid references public.courses(id) on delete set null,
  source_type text,
  file_url text,
  original_filename text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- FLASHCARDS
-- ============================================
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  course_id uuid references public.courses(id) on delete set null,
  note_id uuid references public.notes(id) on delete set null,
  ease_factor real default 2.5,
  interval_days integer default 0,
  repetitions integer default 0,
  next_review timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- QUIZ ATTEMPTS
-- ============================================
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid references public.notes(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  quiz_data jsonb not null,
  score integer not null,
  total_questions integer not null,
  completed_at timestamptz default now()
);

-- ============================================
-- FOCUS SESSIONS
-- Mobile uses: duration_minutes
-- ============================================
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_duration_minutes integer not null,
  duration_minutes integer,
  actual_duration_minutes integer,
  start_time timestamptz default now(),
  end_time timestamptz,
  status text default 'active',
  blocked_apps jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- STUDY SESSIONS
-- Mobile uses: duration_minutes
-- ============================================
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date default current_date,
  duration_minutes integer default 0,
  total_minutes integer default 0,
  activities_count integer default 0,
  xp_earned integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- WEEKLY XP
-- Mobile uses: source column for upsert conflict
-- ============================================
create table public.weekly_xp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  xp_earned integer default 0,
  source text default 'general',
  notes_created integer default 0,
  quizzes_completed integer default 0,
  flashcards_reviewed integer default 0,
  focus_minutes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, created_at, source)
);

-- ============================================
-- ANNOUNCEMENTS
-- Mobile uses: message (NOT content), starts_at/ends_at
-- ============================================
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text default 'info',
  is_active boolean default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- BRAIN BOOST QUESTIONS
-- Mobile-only table
-- ============================================
create table public.brain_boost_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  correct_index integer not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- QUIZ QUESTIONS
-- Mobile-only table (fallback for brain boost)
-- ============================================
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  correct_index integer not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- POMODORO SESSIONS
-- ============================================
create table public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  session_type text default 'work',
  duration_minutes integer not null,
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null,
  requirement_value integer not null,
  xp_reward integer default 0
);

-- ============================================
-- USER ACHIEVEMENTS
-- ============================================
create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  course_id uuid references public.courses(id) on delete set null,
  note_id uuid references public.notes(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- STUDY GROUPS
-- ============================================
create table public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  creator_id uuid not null references auth.users(id) on delete cascade,
  invitation_code text not null default gen_random_uuid()::text,
  is_public boolean default true,
  max_members integer default 10,
  topic text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- STUDY GROUP MEMBERS
-- ============================================
create table public.study_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- ============================================
-- MESSAGES (Group chat + DMs)
-- ============================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  group_id uuid references public.study_groups(id) on delete cascade,
  content text not null,
  image_url text,
  message_type text,
  is_read boolean default false,
  reply_to_id uuid references public.messages(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- GROUP RESOURCES
-- ============================================
create table public.group_resources (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  resource_id text not null,
  resource_type text not null,
  shared_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============================================
-- FRIENDSHIPS
-- ============================================
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- ============================================
-- PEER CHALLENGES
-- ============================================
create table public.peer_challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references auth.users(id) on delete cascade,
  challenged_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid references public.notes(id) on delete set null,
  quiz_data jsonb,
  challenger_score integer,
  challenged_score integer,
  status text default 'pending',
  xp_reward integer default 0,
  expires_at timestamptz default now() + interval '7 days',
  created_at timestamptz default now()
);

-- ============================================
-- CHALLENGE CLAIMS
-- ============================================
create table public.challenge_claims (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.peer_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  claimed_date timestamptz default now(),
  xp_earned integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- BLOCKED APP LIST
-- ============================================
create table public.blocked_app_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_name text not null,
  app_name text not null,
  app_icon text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- EXAM TYPES
-- ============================================
create table public.exam_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  logo_url text,
  country text,
  exam_mode text default 'cbt',
  questions_per_subject integer default 50,
  subjects_required integer default 4,
  time_limit_minutes integer default 120,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- EXAM SUBJECTS
-- ============================================
create table public.exam_subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam_type_id uuid not null references public.exam_types(id) on delete cascade,
  icon text,
  ai_prompt text,
  topics_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- EXAM TOPICS
-- ============================================
create table public.exam_topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject_id uuid not null references public.exam_subjects(id) on delete cascade,
  description text,
  difficulty text default 'medium',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- EXAM QUESTIONS
-- ============================================
create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  correct_index integer default 0,
  explanation text,
  exam_type_id uuid not null references public.exam_types(id) on delete cascade,
  subject_id uuid not null references public.exam_subjects(id) on delete cascade,
  topic_id uuid references public.exam_topics(id) on delete set null,
  difficulty text default 'medium',
  source text,
  year text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- EXAM ATTEMPTS
-- ============================================
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_type_id uuid not null references public.exam_types(id) on delete cascade,
  subject_id uuid not null references public.exam_subjects(id) on delete cascade,
  topic_id uuid references public.exam_topics(id) on delete set null,
  question_id uuid references public.exam_questions(id) on delete set null,
  session_id text not null,
  selected_index integer not null,
  is_correct boolean not null,
  time_spent_seconds integer,
  created_at timestamptz default now()
);

-- ============================================
-- EXAM BOOKMARKS
-- ============================================
create table public.exam_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

-- ============================================
-- EXAM PDFS
-- ============================================
create table public.exam_pdfs (
  id uuid primary key default gen_random_uuid(),
  exam_type_id uuid not null references public.exam_types(id) on delete cascade,
  subject_id uuid not null references public.exam_subjects(id) on delete cascade,
  filename text not null,
  file_url text not null,
  status text,
  questions_generated integer,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- EXAM SUBSCRIPTIONS
-- ============================================
create table public.exam_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  exam_type_id uuid references public.exam_types(id) on delete set null,
  status text default 'active',
  starts_at timestamptz default now(),
  expires_at timestamptz,
  amount_paid integer,
  payment_reference text,
  created_at timestamptz default now()
);

-- ============================================
-- QUESTION REPORTS
-- ============================================
create table public.question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  reason text not null,
  details text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ============================================
-- STORE RESOURCES
-- ============================================
create table public.store_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text not null,
  category text not null,
  grade_level text not null,
  author text,
  file_url text,
  youtube_url text,
  thumbnail_url text,
  is_free boolean default true,
  required_tier text default 'free',
  download_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- STUDY GOALS
-- ============================================
create table public.study_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  goal_type text default 'daily',
  course_id uuid references public.courses(id) on delete set null,
  due_date timestamptz not null,
  priority text default 'medium',
  completed boolean default false,
  reminder_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_courses_user_id on public.courses(user_id);
create index idx_notes_user_id on public.notes(user_id);
create index idx_notes_course_id on public.notes(course_id);
create index idx_flashcards_user_id on public.flashcards(user_id);
create index idx_flashcards_course_id on public.flashcards(course_id);
create index idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index idx_focus_sessions_user_id on public.focus_sessions(user_id);
create index idx_study_sessions_user_id on public.study_sessions(user_id);
create index idx_weekly_xp_user_id on public.weekly_xp(user_id);
create index idx_pomodoro_sessions_user_id on public.pomodoro_sessions(user_id);
create index idx_chat_messages_user_id on public.chat_messages(user_id);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_group_id on public.messages(group_id);
create index idx_exam_questions_subject on public.exam_questions(subject_id);
create index idx_exam_questions_type on public.exam_questions(exam_type_id);
create index idx_exam_attempts_user on public.exam_attempts(user_id);
create index idx_study_group_members_group on public.study_group_members(group_id);
create index idx_study_group_members_user on public.study_group_members(user_id);
create index idx_friendships_user on public.friendships(user_id);
create index idx_announcements_active on public.announcements(is_active);
create index idx_brain_boost_active on public.brain_boost_questions(is_active);
create index idx_study_goals_user on public.study_goals(user_id);
create index idx_user_achievements_user on public.user_achievements(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.notes enable row level security;
alter table public.flashcards enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.study_sessions enable row level security;
alter table public.weekly_xp enable row level security;
alter table public.announcements enable row level security;
alter table public.brain_boost_questions enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.pomodoro_sessions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.chat_messages enable row level security;
alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;
alter table public.messages enable row level security;
alter table public.group_resources enable row level security;
alter table public.friendships enable row level security;
alter table public.peer_challenges enable row level security;
alter table public.challenge_claims enable row level security;
alter table public.blocked_app_list enable row level security;
alter table public.exam_types enable row level security;
alter table public.exam_subjects enable row level security;
alter table public.exam_topics enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_bookmarks enable row level security;
alter table public.exam_pdfs enable row level security;
alter table public.exam_subscriptions enable row level security;
alter table public.question_reports enable row level security;
alter table public.store_resources enable row level security;
alter table public.study_goals enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles: users can read/update own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view other profiles" on public.profiles for select using (true);

-- Courses: full CRUD for owner
create policy "Users can manage own courses" on public.courses for all using (auth.uid() = user_id);

-- Notes: full CRUD for owner
create policy "Users can manage own notes" on public.notes for all using (auth.uid() = user_id);

-- Flashcards: full CRUD for owner
create policy "Users can manage own flashcards" on public.flashcards for all using (auth.uid() = user_id);

-- Quiz attempts: owner read/insert
create policy "Users can manage own quiz attempts" on public.quiz_attempts for all using (auth.uid() = user_id);

-- Focus sessions: owner CRUD
create policy "Users can manage own focus sessions" on public.focus_sessions for all using (auth.uid() = user_id);

-- Study sessions: owner CRUD
create policy "Users can manage own study sessions" on public.study_sessions for all using (auth.uid() = user_id);

-- Weekly XP: owner CRUD
create policy "Users can manage own weekly xp" on public.weekly_xp for all using (auth.uid() = user_id);

-- Announcements: anyone can read active
create policy "Anyone can read announcements" on public.announcements for select using (is_active = true);

-- Brain boost questions: anyone can read active
create policy "Anyone can read brain boost questions" on public.brain_boost_questions for select using (is_active = true);

-- Quiz questions: anyone can read
create policy "Anyone can read quiz questions" on public.quiz_questions for select using (true);

-- Pomodoro sessions: owner CRUD
create policy "Users can manage own pomodoro sessions" on public.pomodoro_sessions for all using (auth.uid() = user_id);

-- Achievements: anyone can read
create policy "Anyone can read achievements" on public.achievements for select using (true);

-- User achievements: owner read/insert
create policy "Users can manage own achievements" on public.user_achievements for all using (auth.uid() = user_id);

-- Chat messages: owner CRUD
create policy "Users can manage own chat messages" on public.chat_messages for all using (auth.uid() = user_id);

-- Study groups: anyone can read, creator can manage
create policy "Anyone can read study groups" on public.study_groups for select using (true);
create policy "Creators can insert study groups" on public.study_groups for insert with check (auth.uid() = creator_id);
create policy "Creators can update study groups" on public.study_groups for update using (auth.uid() = creator_id);

-- Study group members: members can read, anyone can insert
create policy "Members can read group members" on public.study_group_members for select using (true);
create policy "Anyone can join groups" on public.study_group_members for insert with check (true);

-- Messages: sender can insert, participants can read
create policy "Users can read own messages" on public.messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id or group_id in (select group_id from public.study_group_members where user_id = auth.uid()));
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- Group resources: members can read
create policy "Members can read group resources" on public.group_resources for select using (true);

-- Friendships: owner can manage
create policy "Users can manage own friendships" on public.friendships for all using (auth.uid() = user_id or auth.uid() = friend_id);

-- Peer challenges: participants can manage
create policy "Users can manage own challenges" on public.peer_challenges for all using (auth.uid() = challenger_id or auth.uid() = challenged_id);

-- Challenge claims: owner manage
create policy "Users can manage own claims" on public.challenge_claims for all using (auth.uid() = user_id);

-- Blocked app list: owner CRUD
create policy "Users can manage own blocked apps" on public.blocked_app_list for all using (auth.uid() = user_id);

-- Exam types: anyone can read active
create policy "Anyone can read exam types" on public.exam_types for select using (is_active = true);

-- Exam subjects: anyone can read active
create policy "Anyone can read exam subjects" on public.exam_subjects for select using (is_active = true);

-- Exam topics: anyone can read active
create policy "Anyone can read exam topics" on public.exam_topics for select using (is_active = true);

-- Exam questions: anyone can read active
create policy "Anyone can read exam questions" on public.exam_questions for select using (is_active = true);

-- Exam attempts: owner CRUD
create policy "Users can manage own exam attempts" on public.exam_attempts for all using (auth.uid() = user_id);

-- Exam bookmarks: owner CRUD
create policy "Users can manage own exam bookmarks" on public.exam_bookmarks for all using (auth.uid() = user_id);

-- Exam PDFs: anyone can read
create policy "Anyone can read exam pdfs" on public.exam_pdfs for select using (true);

-- Exam subscriptions: owner CRUD
create policy "Users can manage own exam subscriptions" on public.exam_subscriptions for all using (auth.uid() = user_id);

-- Question reports: owner insert/read
create policy "Users can manage own reports" on public.question_reports for all using (auth.uid() = user_id);

-- Store resources: anyone can read
create policy "Anyone can read store resources" on public.store_resources for select using (true);

-- Study goals: owner CRUD
create policy "Users can manage own study goals" on public.study_goals for all using (auth.uid() = user_id);

-- ============================================
-- HELPER: generate_invite_code function
-- ============================================
create or replace function public.generate_invite_code()
returns text as $$
  select upper(substr(md5(random()::text), 1, 8));
$$ language sql volatile;

-- ============================================
-- TRIGGER: auto-update updated_at
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.courses for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.notes for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.flashcards for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.study_sessions for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.study_groups for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.friendships for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.store_resources for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.study_goals for each row execute function public.update_updated_at();
