-- =====================================================
-- VOWS TABLE: AI-Powered Vow Writer Feature
-- =====================================================
-- This migration creates the vows table for storing
-- user-generated wedding vows with AI assistance
-- =====================================================

-- Create vows table
CREATE TABLE IF NOT EXISTS public.vows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partner_name VARCHAR(255) NOT NULL,
  how_met TEXT,
  favorite_memory TEXT,
  love_most TEXT,
  promises TEXT,
  tone VARCHAR(50) NOT NULL CHECK (tone IN ('romantic', 'funny', 'traditional', 'modern')),
  length VARCHAR(20) NOT NULL CHECK (length IN ('short', 'medium', 'long')),
  generated_vow TEXT,
  edited_vow TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on user_id for faster lookups
CREATE INDEX idx_vows_user_id ON public.vows(user_id);

-- Enable Row Level Security
ALTER TABLE public.vows ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to vows"
ON public.vows
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can only access their own vows
CREATE POLICY "Users can view their own vows"
ON public.vows
FOR SELECT
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can insert their own vows"
ON public.vows
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can update their own vows"
ON public.vows
FOR UPDATE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'))
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can delete their own vows"
ON public.vows
FOR DELETE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vows_updated_at BEFORE UPDATE ON public.vows
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.vows IS 'Stores AI-generated and user-edited wedding vows with RLS enabled';
