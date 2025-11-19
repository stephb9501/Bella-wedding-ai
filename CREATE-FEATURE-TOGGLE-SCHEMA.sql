-- =====================================================
-- FEATURE TOGGLE SYSTEM
-- =====================================================
-- Build features that don't launch until you're ready
-- Schedule releases for future dates
-- A/B test features with specific users
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Feature details
  feature_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., "vendor_video_uploads", "ai_matching"
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status
  is_enabled BOOLEAN DEFAULT false,
  environment VARCHAR(50) DEFAULT 'production', -- production, staging, development

  -- Scheduled release
  scheduled_enable_at TIMESTAMPTZ,
  scheduled_disable_at TIMESTAMPTZ,

  -- Targeting (who can see this feature)
  enabled_for_all BOOLEAN DEFAULT false,
  enabled_for_user_ids UUID[],
  enabled_for_vendor_tiers VARCHAR[], -- ['premium', 'elite']
  enabled_for_percentage INTEGER, -- 0-100, for gradual rollout

  -- Metadata
  created_by UUID REFERENCES users(id),
  last_modified_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature usage tracking
CREATE TABLE IF NOT EXISTS feature_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key VARCHAR(100) NOT NULL,
  user_id UUID,
  user_role VARCHAR(50),
  action VARCHAR(100), -- viewed, clicked, used
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feature_toggles_key ON feature_toggles(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON feature_toggles(is_enabled);
CREATE INDEX IF NOT EXISTS idx_feature_usage_log_feature ON feature_usage_log(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_usage_log_user ON feature_usage_log(user_id);

-- RLS
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage feature toggles" ON feature_toggles;
CREATE POLICY "Admins can manage feature toggles"
  ON feature_toggles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can log feature usage" ON feature_usage_log;
CREATE POLICY "Anyone can log feature usage"
  ON feature_usage_log FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view usage logs" ON feature_usage_log;
CREATE POLICY "Admins can view usage logs"
  ON feature_usage_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Trigger
CREATE TRIGGER update_feature_toggles_updated_at
  BEFORE UPDATE ON feature_toggles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function: Check if feature is enabled for user
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_feature_key VARCHAR,
  p_user_id UUID DEFAULT NULL,
  p_vendor_tier VARCHAR DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_feature RECORD;
  v_random_percentage INTEGER;
BEGIN
  SELECT * INTO v_feature
  FROM feature_toggles
  WHERE feature_key = p_feature_key;

  IF NOT FOUND THEN
    RETURN false; -- Feature doesn't exist
  END IF;

  -- Check if globally disabled
  IF NOT v_feature.is_enabled THEN
    RETURN false;
  END IF;

  -- Check scheduled times
  IF v_feature.scheduled_enable_at IS NOT NULL AND NOW() < v_feature.scheduled_enable_at THEN
    RETURN false; -- Not yet enabled
  END IF;

  IF v_feature.scheduled_disable_at IS NOT NULL AND NOW() > v_feature.scheduled_disable_at THEN
    RETURN false; -- Already disabled
  END IF;

  -- Check if enabled for all
  IF v_feature.enabled_for_all THEN
    RETURN true;
  END IF;

  -- Check specific user IDs
  IF p_user_id = ANY(v_feature.enabled_for_user_ids) THEN
    RETURN true;
  END IF;

  -- Check vendor tier
  IF p_vendor_tier = ANY(v_feature.enabled_for_vendor_tiers) THEN
    RETURN true;
  END IF;

  -- Check percentage rollout (for gradual releases)
  IF v_feature.enabled_for_percentage IS NOT NULL AND v_feature.enabled_for_percentage > 0 THEN
    -- Hash user_id to get consistent random percentage
    v_random_percentage := (hashtext(p_user_id::TEXT)::BIGINT % 100 + 100) % 100;
    IF v_random_percentage < v_feature.enabled_for_percentage THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Auto-enable/disable features based on schedule
CREATE OR REPLACE FUNCTION auto_toggle_scheduled_features()
RETURNS void AS $$
BEGIN
  -- Enable features that are scheduled
  UPDATE feature_toggles
  SET is_enabled = true
  WHERE scheduled_enable_at IS NOT NULL
    AND scheduled_enable_at <= NOW()
    AND is_enabled = false;

  -- Disable features that should expire
  UPDATE feature_toggles
  SET is_enabled = false
  WHERE scheduled_disable_at IS NOT NULL
    AND scheduled_disable_at <= NOW()
    AND is_enabled = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXAMPLE FEATURES (Starter Templates)
-- =====================================================

INSERT INTO feature_toggles (
  feature_key, feature_name, description, is_enabled, enabled_for_all
) VALUES
  ('vendor_video_uploads', 'Vendor Video Uploads', 'Allow vendors to upload video portfolio samples', false, false),
  ('ai_vendor_matching', 'AI Vendor Matching', 'AI-powered vendor recommendations for brides', false, false),
  ('live_chat_support', 'Live Chat Support', 'Real-time chat with vendors', false, false),
  ('virtual_venue_tours', 'Virtual Venue Tours', '360° virtual tours of venues', false, false),
  ('budget_tracker', 'Budget Tracker', 'Wedding budget tracking tool', false, false)
ON CONFLICT (feature_key) DO NOTHING;

-- =====================================================
-- SUCCESS! Feature toggle system created!
-- =====================================================
-- Features:
-- ✅ Build features without launching them
-- ✅ Schedule releases for future dates
-- ✅ Enable for specific users/tiers first (beta testing)
-- ✅ Gradual rollout (5% → 25% → 50% → 100%)
-- ✅ Auto-enable/disable based on schedule
-- ✅ Usage tracking
-- =====================================================
