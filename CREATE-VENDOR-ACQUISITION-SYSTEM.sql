-- =====================================================
-- VENDOR & BRIDE ACQUISITION SYSTEM
-- =====================================================
-- This creates a lightweight vendor listing system and
-- bride-suggested vendor invite system
-- Allows thousands of vendors with minimal storage
-- =====================================================

-- ===========================================
-- PART 1: LIGHTWEIGHT VENDOR LISTINGS
-- ===========================================
-- Basic vendor info (no photos/files initially)
-- Can be imported in bulk from Google searches
-- Vendors can "claim" their listing later

CREATE TABLE IF NOT EXISTS vendor_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info (lightweight, text only)
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'USA',
  zip_code VARCHAR(20),

  -- Contact (optional - for unclaimed listings)
  phone VARCHAR(50),
  email VARCHAR(255),
  website_url TEXT,

  -- Brief description (200 chars max for lightweight)
  short_description VARCHAR(200),

  -- Status
  listing_type VARCHAR(50) DEFAULT 'basic', -- basic, claimed, premium
  is_claimed BOOLEAN DEFAULT false,
  claimed_by_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,

  -- Source tracking
  source VARCHAR(100), -- bulk_import, bride_suggestion, self_registered, google_scrape
  imported_by INTEGER REFERENCES users(id),

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Metrics (lightweight)
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PART 2: VENDOR INVITATIONS
-- ===========================================
-- Track invites sent to vendors to join platform

CREATE TABLE IF NOT EXISTS vendor_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who invited
  invited_by_user_id INTEGER REFERENCES users(id),
  invited_by_user_type VARCHAR(50), -- bride, admin, vendor, system
  invited_by_name VARCHAR(255),

  -- Vendor being invited
  vendor_listing_id UUID REFERENCES vendor_listings(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Invitation details
  invitation_token VARCHAR(255) UNIQUE,
  invitation_message TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'sent', -- sent, opened, clicked, registered, expired
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- If they registered
  registered_vendor_id UUID REFERENCES vendors(id),

  -- Tracking
  email_sent_count INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PART 3: BRIDE VENDOR SUGGESTIONS
-- ===========================================
-- Brides can suggest vendors they don't see listed

CREATE TABLE IF NOT EXISTS bride_vendor_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Bride making suggestion
  bride_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bride_name VARCHAR(255),
  bride_email VARCHAR(255),

  -- Suggested vendor
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  why_suggesting TEXT, -- "They did my sister's wedding"

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, invited, listed, rejected

  -- Actions taken
  invite_sent BOOLEAN DEFAULT false,
  invite_sent_at TIMESTAMPTZ,
  listing_created BOOLEAN DEFAULT false,
  listing_id UUID REFERENCES vendor_listings(id),
  vendor_registered BOOLEAN DEFAULT false,
  vendor_id UUID REFERENCES vendors(id),

  -- Admin notes
  admin_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PART 4: VENDOR REFERRAL PROGRAM
-- ===========================================
-- Vendors can refer other vendors and earn rewards

CREATE TABLE IF NOT EXISTS vendor_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who referred
  referrer_vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  referrer_name VARCHAR(255),
  referrer_email VARCHAR(255),

  -- Who was referred
  referred_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  referred_business_name VARCHAR(255),
  referred_email VARCHAR(255) NOT NULL,

  -- Referral code
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referral_link TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, registered, active, rewarded

  -- Reward tracking
  reward_type VARCHAR(50), -- free_month, discount, credits
  reward_amount DECIMAL(10,2),
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,

  -- Registration tracking
  referred_registered_at TIMESTAMPTZ,
  referred_first_payment_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_vendor_listings_category ON vendor_listings(category);
CREATE INDEX IF NOT EXISTS idx_vendor_listings_location ON vendor_listings(city, state);
CREATE INDEX IF NOT EXISTS idx_vendor_listings_claimed ON vendor_listings(is_claimed);
CREATE INDEX IF NOT EXISTS idx_vendor_listings_source ON vendor_listings(source);

CREATE INDEX IF NOT EXISTS idx_vendor_invitations_email ON vendor_invitations(email);
CREATE INDEX IF NOT EXISTS idx_vendor_invitations_token ON vendor_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_vendor_invitations_status ON vendor_invitations(status);

CREATE INDEX IF NOT EXISTS idx_bride_suggestions_status ON bride_vendor_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_bride_suggestions_bride ON bride_vendor_suggestions(bride_id);

CREATE INDEX IF NOT EXISTS idx_vendor_referrals_code ON vendor_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_vendor_referrals_referrer ON vendor_referrals(referrer_vendor_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE vendor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bride_vendor_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_referrals ENABLE ROW LEVEL SECURITY;

-- Public can view basic vendor listings
CREATE POLICY "Public can view vendor listings"
ON vendor_listings FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can manage everything
CREATE POLICY "Admins can manage vendor listings"
ON vendor_listings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = (auth.uid()::text::integer)
    AND users.role = 'admin'
  )
);

-- Vendors can view their invitations
CREATE POLICY "Vendors can view their invitations"
ON vendor_invitations FOR SELECT
TO authenticated
USING (email = auth.email() OR registered_vendor_id = auth.uid());

-- Brides can view/create their suggestions
CREATE POLICY "Brides can manage their suggestions"
ON bride_vendor_suggestions FOR ALL
TO authenticated
USING (bride_id = (auth.uid()::text::integer));

-- Vendors can view/create referrals
CREATE POLICY "Vendors can manage their referrals"
ON vendor_referrals FOR ALL
TO authenticated
USING (referrer_vendor_id = auth.uid() OR referred_vendor_id = auth.uid());

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(vendor_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base code from vendor name (first 6 chars + random)
  base_code := UPPER(REGEXP_REPLACE(SUBSTRING(vendor_name, 1, 6), '[^A-Z0-9]', '', 'g'));
  final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM vendor_referrals WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || LPAD((FLOOR(RANDOM() * 10000) + counter)::TEXT, 4, '0');
    IF counter > 100 THEN
      -- Fallback to pure random
      final_code := 'REF' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    END IF;
  END LOOP;

  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create listing when bride suggests vendor
CREATE OR REPLACE FUNCTION auto_create_listing_from_suggestion()
RETURNS TRIGGER AS $$
DECLARE
  new_listing_id UUID;
BEGIN
  -- Only proceed if status changed to 'listed'
  IF NEW.status = 'listed' AND
     (OLD.status IS NULL OR OLD.status != 'listed') AND
     NEW.listing_created = false THEN

    -- Create vendor listing
    INSERT INTO vendor_listings (
      business_name,
      category,
      city,
      state,
      phone,
      email,
      website_url,
      short_description,
      source,
      imported_by
    ) VALUES (
      NEW.business_name,
      NEW.category,
      NEW.city,
      NEW.state,
      NEW.phone,
      NEW.email,
      NEW.website,
      'Suggested by a bride: ' || COALESCE(NEW.why_suggesting, 'Recommended vendor'),
      'bride_suggestion',
      NEW.bride_id
    )
    RETURNING id INTO new_listing_id;

    -- Update suggestion with listing ID
    NEW.listing_created := true;
    NEW.listing_id := new_listing_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-creating listings
DROP TRIGGER IF EXISTS create_listing_from_suggestion ON bride_vendor_suggestions;
CREATE TRIGGER create_listing_from_suggestion
  BEFORE UPDATE ON bride_vendor_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_listing_from_suggestion();

-- Update timestamps
CREATE TRIGGER update_vendor_listings_updated_at
  BEFORE UPDATE ON vendor_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_invitations_updated_at
  BEFORE UPDATE ON vendor_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bride_suggestions_updated_at
  BEFORE UPDATE ON bride_vendor_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_referrals_updated_at
  BEFORE UPDATE ON vendor_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS! Vendor Acquisition System Created!
-- =====================================================
-- You can now:
-- 1. Bulk import thousands of vendors (lightweight)
-- 2. Let brides suggest vendors (auto-creates listing + sends invite)
-- 3. Track vendor invitations
-- 4. Enable vendor referral program
-- 5. Vendors can claim unclaimed listings
--
-- Storage: Minimal! Just text fields, no photos/files
-- =====================================================
