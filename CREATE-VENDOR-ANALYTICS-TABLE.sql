-- =====================================================
-- CREATE VENDOR_ANALYTICS TABLE
-- =====================================================
-- This table tracks daily vendor metrics for analytics
-- =====================================================

CREATE TABLE IF NOT EXISTS vendor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Daily metrics
  profile_views INT DEFAULT 0,
  search_impressions INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  booking_requests_received INT DEFAULT 0,
  photos_uploaded INT DEFAULT 0,

  -- Engagement metrics
  avg_time_on_profile INT DEFAULT 0, -- seconds
  bounce_rate DECIMAL(5,2) DEFAULT 0, -- percentage

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent duplicate entries
  UNIQUE(vendor_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_vendor ON vendor_analytics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_date ON vendor_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_analytics_vendor_date ON vendor_analytics(vendor_id, date DESC);

-- Enable Row Level Security
ALTER TABLE vendor_analytics ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own analytics
CREATE POLICY "Vendors can view their analytics"
  ON vendor_analytics FOR SELECT
  USING (vendor_id = auth.uid());

-- System can insert/update analytics (use service role)
CREATE POLICY "Service can manage analytics"
  ON vendor_analytics FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to increment daily view count
CREATE OR REPLACE FUNCTION increment_vendor_views(vendor_id_input UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or update today's analytics
  INSERT INTO vendor_analytics (vendor_id, date, profile_views)
  VALUES (vendor_id_input, CURRENT_DATE, 1)
  ON CONFLICT (vendor_id, date)
  DO UPDATE SET profile_views = vendor_analytics.profile_views + 1;

  -- Also update the vendors table total
  UPDATE vendors
  SET profile_views = COALESCE(profile_views, 0) + 1
  WHERE id = vendor_id_input;
END;
$$;

-- =====================================================
-- SUCCESS! Vendor analytics table created!
-- =====================================================
