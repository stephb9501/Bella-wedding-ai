-- =====================================================
-- WEDDING WEBSITES TABLE: Comprehensive Website Builder
-- =====================================================
-- This migration creates the wedding_websites table for
-- the complete wedding website builder feature with all
-- sections, customization, and publishing capabilities
-- =====================================================

-- Create wedding_websites table
CREATE TABLE IF NOT EXISTS public.wedding_websites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Basic Info
  subdomain VARCHAR(100) UNIQUE,
  custom_domain VARCHAR(255),
  published BOOLEAN DEFAULT false,

  -- Hero Section
  hero_photo TEXT,
  couple_name_1 VARCHAR(255),
  couple_name_2 VARCHAR(255),
  wedding_date DATE,
  countdown_enabled BOOLEAN DEFAULT true,

  -- Our Story Section
  our_story TEXT,
  how_we_met TEXT,
  proposal_story TEXT,
  relationship_timeline JSONB DEFAULT '[]'::jsonb,

  -- Wedding Details
  venue_name VARCHAR(255),
  venue_address TEXT,
  venue_coordinates JSONB,
  ceremony_time TIME,
  ceremony_location TEXT,
  reception_time TIME,
  reception_location TEXT,
  dress_code VARCHAR(100),

  -- Schedule of Events
  schedule_events JSONB DEFAULT '[]'::jsonb,

  -- Wedding Party
  bridesmaids JSONB DEFAULT '[]'::jsonb,
  groomsmen JSONB DEFAULT '[]'::jsonb,

  -- Travel & Accommodations
  hotel_blocks JSONB DEFAULT '[]'::jsonb,
  directions TEXT,
  parking_info TEXT,

  -- Registry
  registry_links JSONB DEFAULT '[]'::jsonb,
  registry_message TEXT,

  -- RSVP Settings
  rsvp_enabled BOOLEAN DEFAULT true,
  rsvp_deadline DATE,
  meal_options JSONB DEFAULT '[]'::jsonb,

  -- Photos
  photos_json JSONB DEFAULT '[]'::jsonb,
  engagement_photos JSONB DEFAULT '[]'::jsonb,

  -- FAQ
  faq_json JSONB DEFAULT '[]'::jsonb,

  -- Contact
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_message TEXT,

  -- Design & Customization
  theme_color VARCHAR(50) DEFAULT 'rose',
  theme_font VARCHAR(100) DEFAULT 'inter',
  custom_css TEXT,

  -- Section Visibility & Order
  sections_enabled JSONB DEFAULT '{"hero": true, "story": true, "details": true, "schedule": true, "party": true, "travel": true, "registry": true, "rsvp": true, "photos": true, "faq": true, "contact": true}'::jsonb,
  sections_order JSONB DEFAULT '["hero", "story", "details", "schedule", "party", "travel", "registry", "rsvp", "photos", "faq", "contact"]'::jsonb,

  -- Analytics
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create RSVP responses table
CREATE TABLE IF NOT EXISTS public.wedding_rsvps (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES public.wedding_websites(id) ON DELETE CASCADE,

  -- Guest Info
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  number_of_guests INTEGER DEFAULT 1,

  -- RSVP Response
  attending BOOLEAN NOT NULL,
  meal_choice VARCHAR(100),
  dietary_restrictions TEXT,
  song_request VARCHAR(255),
  additional_notes TEXT,

  -- Metadata
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,

  UNIQUE(website_id, guest_email)
);

-- Create website analytics table
CREATE TABLE IF NOT EXISTS public.wedding_website_analytics (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES public.wedding_websites(id) ON DELETE CASCADE,

  -- Analytics Data
  visitor_ip INET,
  visitor_user_agent TEXT,
  page_visited VARCHAR(255),
  referrer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID DEFAULT gen_random_uuid()
);

-- Add indexes for performance
CREATE INDEX idx_wedding_websites_user_id ON public.wedding_websites(user_id);
CREATE INDEX idx_wedding_websites_subdomain ON public.wedding_websites(subdomain);
CREATE INDEX idx_wedding_websites_published ON public.wedding_websites(published);
CREATE INDEX idx_wedding_rsvps_website_id ON public.wedding_rsvps(website_id);
CREATE INDEX idx_wedding_rsvps_email ON public.wedding_rsvps(guest_email);
CREATE INDEX idx_wedding_analytics_website_id ON public.wedding_website_analytics(website_id);
CREATE INDEX idx_wedding_analytics_visited_at ON public.wedding_website_analytics(visited_at);

-- Enable Row Level Security
ALTER TABLE public.wedding_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_website_analytics ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to wedding_websites"
ON public.wedding_websites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to wedding_rsvps"
ON public.wedding_rsvps
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to wedding_website_analytics"
ON public.wedding_website_analytics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can manage their own websites
CREATE POLICY "Users can view their own wedding websites"
ON public.wedding_websites
FOR SELECT
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can create their own wedding websites"
ON public.wedding_websites
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can update their own wedding websites"
ON public.wedding_websites
FOR UPDATE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'))
WITH CHECK (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can delete their own wedding websites"
ON public.wedding_websites
FOR DELETE
TO authenticated
USING (user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email'));

-- Public can view published websites
CREATE POLICY "Anyone can view published wedding websites"
ON public.wedding_websites
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Public can submit RSVPs to published websites
CREATE POLICY "Anyone can submit RSVP to published websites"
ON public.wedding_rsvps
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_websites
    WHERE id = website_id AND published = true
  )
);

-- Website owners can view RSVPs
CREATE POLICY "Website owners can view RSVPs"
ON public.wedding_rsvps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_websites
    WHERE id = website_id
    AND user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email')
  )
);

-- Anyone can create analytics (anonymous tracking)
CREATE POLICY "Anyone can create analytics"
ON public.wedding_website_analytics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Website owners can view their analytics
CREATE POLICY "Website owners can view their analytics"
ON public.wedding_website_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_websites
    WHERE id = website_id
    AND user_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email')
  )
);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_wedding_websites_updated_at
BEFORE UPDATE ON public.wedding_websites
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique subdomain
CREATE OR REPLACE FUNCTION generate_wedding_subdomain(p_couple_name_1 VARCHAR, p_couple_name_2 VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_base VARCHAR;
  v_subdomain VARCHAR;
  v_counter INTEGER := 0;
BEGIN
  -- Create base from couple names
  v_base := lower(regexp_replace(
    concat(
      substring(p_couple_name_1, 1, 10),
      '-and-',
      substring(p_couple_name_2, 1, 10)
    ),
    '[^a-z0-9-]', '', 'g'
  ));

  v_subdomain := v_base;

  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.wedding_websites WHERE subdomain = v_subdomain) LOOP
    v_counter := v_counter + 1;
    v_subdomain := v_base || '-' || v_counter;
  END LOOP;

  RETURN v_subdomain;
END;
$$ LANGUAGE plpgsql;

-- Function to increment page views
CREATE OR REPLACE FUNCTION increment_website_views(p_website_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.wedding_websites
  SET
    page_views = page_views + 1,
    last_viewed_at = NOW()
  WHERE id = p_website_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.wedding_websites IS 'Stores comprehensive wedding website data with all sections and customization';
COMMENT ON TABLE public.wedding_rsvps IS 'Stores guest RSVP responses for wedding websites';
COMMENT ON TABLE public.wedding_website_analytics IS 'Tracks page views and visitor analytics for wedding websites';
