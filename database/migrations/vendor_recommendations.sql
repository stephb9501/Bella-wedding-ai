-- Wedding Preferences for AI Recommendations
CREATE TABLE IF NOT EXISTS wedding_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Budget preferences
  total_budget DECIMAL(10, 2),
  budget_flexibility TEXT CHECK (budget_flexibility IN ('strict', 'flexible', 'very_flexible')),

  -- Style preferences
  wedding_style TEXT[], -- ['rustic', 'modern', 'traditional', 'bohemian', 'vintage', 'romantic', 'glamorous']
  color_scheme TEXT[],
  formality_level TEXT CHECK (formality_level IN ('casual', 'semi_formal', 'formal', 'black_tie')),

  -- Location preferences
  preferred_cities TEXT[],
  max_distance_miles INTEGER DEFAULT 50,
  outdoor_indoor TEXT CHECK (outdoor_indoor IN ('outdoor', 'indoor', 'both', 'no_preference')),

  -- Vendor priorities (1-5 rating of importance)
  venue_priority INTEGER DEFAULT 5 CHECK (venue_priority BETWEEN 1 AND 5),
  photographer_priority INTEGER DEFAULT 4 CHECK (photographer_priority BETWEEN 1 AND 5),
  caterer_priority INTEGER DEFAULT 4 CHECK (caterer_priority BETWEEN 1 AND 5),
  florist_priority INTEGER DEFAULT 3 CHECK (florist_priority BETWEEN 1 AND 5),
  dj_priority INTEGER DEFAULT 3 CHECK (dj_priority BETWEEN 1 AND 5),

  -- Additional preferences
  guest_count INTEGER,
  dietary_restrictions TEXT[],
  special_requirements TEXT,
  must_haves TEXT[],
  deal_breakers TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(wedding_id)
);

-- Vendor Recommendations (cached)
CREATE TABLE IF NOT EXISTS vendor_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Recommendation scoring
  match_score DECIMAL(5, 2) NOT NULL, -- 0-100 score
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),

  -- Score breakdown
  budget_match_score DECIMAL(5, 2),
  style_match_score DECIMAL(5, 2),
  location_match_score DECIMAL(5, 2),
  rating_score DECIMAL(5, 2),
  availability_score DECIMAL(5, 2),
  popularity_score DECIMAL(5, 2),

  -- Recommendation metadata
  reason TEXT,
  match_highlights TEXT[],
  potential_concerns TEXT[],

  -- Bride interaction
  viewed_at TIMESTAMP,
  interested BOOLEAN DEFAULT NULL, -- NULL = not responded, true = interested, false = not interested
  contacted_at TIMESTAMP,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',

  UNIQUE(wedding_id, vendor_id)
);

-- User interactions with vendors (for learning)
CREATE TABLE IF NOT EXISTS vendor_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,

  interaction_type TEXT CHECK (interaction_type IN (
    'view', 'save', 'contact', 'book', 'review', 'share', 'dismiss'
  )),

  duration_seconds INTEGER, -- for 'view' interactions
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_preferences_wedding ON wedding_preferences(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_preferences_user ON wedding_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_recommendations_wedding ON vendor_recommendations(wedding_id);
CREATE INDEX IF NOT EXISTS idx_vendor_recommendations_score ON vendor_recommendations(wedding_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_recommendations_expires ON vendor_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_vendor_interactions_user_vendor ON vendor_interactions(user_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_interactions_wedding ON vendor_interactions(wedding_id);

-- Enable Row Level Security
ALTER TABLE wedding_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wedding_preferences
CREATE POLICY wedding_preferences_user_policy ON wedding_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for vendor_recommendations
CREATE POLICY vendor_recommendations_user_policy ON vendor_recommendations
  FOR ALL
  USING (wedding_id IN (
    SELECT id FROM weddings WHERE bride_user_id = auth.uid() OR groom_user_id = auth.uid()
  ));

-- RLS Policies for vendor_interactions
CREATE POLICY vendor_interactions_user_policy ON vendor_interactions
  FOR ALL
  USING (user_id = auth.uid());

-- Policy: Vendors can see interactions with their profile
CREATE POLICY vendor_interactions_vendor_policy ON vendor_interactions
  FOR SELECT
  USING (vendor_id IN (
    SELECT id FROM vendors WHERE id = auth.uid()
  ));

-- Function to clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM vendor_recommendations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add vendor style tags for better matching
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS style_tags TEXT[];
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ideal_for TEXT[]; -- ['small_weddings', 'large_weddings', 'destination', 'elopement', 'outdoor', 'indoor']

-- Update trigger for wedding_preferences
CREATE OR REPLACE FUNCTION update_wedding_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wedding_preferences_update_trigger
BEFORE UPDATE ON wedding_preferences
FOR EACH ROW
EXECUTE FUNCTION update_wedding_preferences_timestamp();
