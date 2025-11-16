-- Wedding Website Builder Schema

-- Create wedding websites table
CREATE TABLE IF NOT EXISTS wedding_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  template VARCHAR(50) DEFAULT 'elegant',
  published BOOLEAN DEFAULT false,
  custom_domain VARCHAR(200),
  slug VARCHAR(100) UNIQUE,

  -- Hero section
  hero_enabled BOOLEAN DEFAULT true,
  hero_partner_one_name VARCHAR(200),
  hero_partner_two_name VARCHAR(200),
  hero_wedding_date DATE,
  hero_background_image TEXT,

  -- Our Story section
  story_enabled BOOLEAN DEFAULT true,
  story_content TEXT,

  -- Wedding Details section
  details_enabled BOOLEAN DEFAULT true,
  ceremony_time VARCHAR(50),
  ceremony_location VARCHAR(300),
  reception_time VARCHAR(50),
  reception_location VARCHAR(300),

  -- Photo Gallery section
  gallery_enabled BOOLEAN DEFAULT true,
  gallery_images TEXT[],

  -- RSVP section (Premium only)
  rsvp_enabled BOOLEAN DEFAULT false,
  rsvp_deadline DATE,

  -- Registry section
  registry_enabled BOOLEAN DEFAULT true,
  registry_links JSONB, -- [{ name: "Amazon", url: "..." }]

  -- Travel section
  travel_enabled BOOLEAN DEFAULT true,
  travel_hotels TEXT,
  travel_transportation TEXT,

  -- FAQ section
  faq_enabled BOOLEAN DEFAULT true,
  faq_questions JSONB, -- [{ question: "...", answer: "..." }]

  -- Theme customization
  theme_primary_color VARCHAR(20) DEFAULT '#D4A574',
  theme_font_family VARCHAR(50) DEFAULT 'serif',

  -- Metadata
  view_count INTEGER DEFAULT 0,
  last_published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create wedding RSVPs table (for tracking guest responses)
CREATE TABLE IF NOT EXISTS wedding_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES wedding_websites(id) ON DELETE CASCADE,
  guest_name VARCHAR(200) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  attending BOOLEAN NOT NULL,
  number_of_guests INTEGER DEFAULT 1,
  dietary_restrictions TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wedding_websites_user ON wedding_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_websites_slug ON wedding_websites(slug);
CREATE INDEX IF NOT EXISTS idx_wedding_websites_published ON wedding_websites(published);
CREATE INDEX IF NOT EXISTS idx_wedding_rsvps_website ON wedding_rsvps(website_id);

-- Disable RLS for service role access
ALTER TABLE wedding_websites DISABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_rsvps DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE wedding_websites IS 'Stores wedding website data for Premium users';
COMMENT ON TABLE wedding_rsvps IS 'Stores RSVP responses from wedding website guests';
COMMENT ON COLUMN wedding_websites.slug IS 'Unique URL slug for website (e.g., sarah-and-michael)';
COMMENT ON COLUMN wedding_websites.custom_domain IS 'Custom domain for Premium users (e.g., sarahandmichael.com)';
