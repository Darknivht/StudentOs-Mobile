-- Phase 3: Create notes-uploads storage bucket and ai_usage table

-- Create storage bucket for note file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notes-uploads',
  'notes-uploads',
  true,
  10485760,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policy: users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'notes-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: users can read their own uploads
CREATE POLICY "Users can read own uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'notes-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: public read (for sharing)
CREATE POLICY "Public read access for notes-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'notes-uploads');

-- Create ai_usage table for tracking AI call quotas
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL DEFAULT 'general',
  model TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast quota lookups (user + today's date)
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date
  ON ai_usage (user_id, created_at DESC);

-- RLS: users can only see their own usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage"
  ON ai_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own AI usage"
  ON ai_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());
