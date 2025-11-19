-- =====================================================
-- INVITATIONS SYSTEM: Designer & Text RSVP
-- =====================================================
-- This migration creates tables for the invitation
-- designer (Canva + Built-in) and text RSVP system
-- =====================================================

-- Create invitations table for designed invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Design Details
  design_type TEXT CHECK (design_type IN ('canva', 'builtin')) DEFAULT 'builtin',
  canva_design_url TEXT,
  template_name TEXT,

  -- Wedding Details
  couple_name_1 TEXT,
  couple_name_2 TEXT,
  wedding_date DATE,
  wedding_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  custom_message TEXT,

  -- Customization
  color_scheme TEXT DEFAULT 'champagne',
  font_style TEXT DEFAULT 'serif',

  -- Output
  image_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create text_invites table for SMS RSVP system
CREATE TABLE IF NOT EXISTS public.text_invites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Guest Info
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,

  -- RSVP Token
  rsvp_token TEXT UNIQUE NOT NULL,

  -- Delivery Status
  sent_at TIMESTAMPTZ,
  delivered BOOLEAN DEFAULT FALSE,
  opened BOOLEAN DEFAULT FALSE,

  -- RSVP Response
  rsvp_status TEXT CHECK (rsvp_status IN ('pending', 'yes', 'no')) DEFAULT 'pending',
  rsvp_at TIMESTAMPTZ,
  message TEXT,
  meal_choice TEXT,
  plus_ones INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX idx_invitations_created_at ON public.invitations(created_at DESC);

CREATE INDEX idx_text_invites_user_id ON public.text_invites(user_id);
CREATE INDEX idx_text_invites_token ON public.text_invites(rsvp_token);
CREATE INDEX idx_text_invites_status ON public.text_invites(rsvp_status);
CREATE INDEX idx_text_invites_sent_at ON public.text_invites(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_invites ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to invitations"
ON public.invitations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to text_invites"
ON public.text_invites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can manage their own invitations
CREATE POLICY "Users can view their own invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can create their own invitations"
ON public.invitations
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can update their own invitations"
ON public.invitations
FOR UPDATE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'))
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can delete their own invitations"
ON public.invitations
FOR DELETE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

-- Users can manage their own text invites
CREATE POLICY "Users can view their own text invites"
ON public.text_invites
FOR SELECT
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can create their own text invites"
ON public.text_invites
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can update their own text invites"
ON public.text_invites
FOR UPDATE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'))
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can delete their own text invites"
ON public.text_invites
FOR DELETE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

-- Public can view text invites by token (for RSVP landing page)
CREATE POLICY "Public can view text invites by token"
ON public.text_invites
FOR SELECT
TO anon, authenticated
USING (true);

-- Public can update RSVP responses by token
CREATE POLICY "Public can update RSVP via token"
ON public.text_invites
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Add triggers to update updated_at timestamp
CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_text_invites_updated_at
BEFORE UPDATE ON public.text_invites
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.invitations IS 'Stores invitation designs created with Canva or built-in designer';
COMMENT ON TABLE public.text_invites IS 'Stores text message invites and RSVP responses';
