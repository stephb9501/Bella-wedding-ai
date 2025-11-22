-- =====================================================
-- VENDOR VERIFICATION AND BADGE SYSTEM
-- =====================================================
-- This migration adds vendor verification and badge system:
-- - Verification fields in vendors table
-- - Vendor badges table for managing multiple badge types
-- - Functions for auto-awarding badges based on criteria
-- =====================================================

-- Add verification and badge fields to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_rate DECIMAL(5, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS avg_response_time_hours DECIMAL(8, 2);

-- Add comments for documentation
COMMENT ON COLUMN public.vendors.is_verified IS 'Whether vendor has been verified by admin';
COMMENT ON COLUMN public.vendors.verified_at IS 'Timestamp when vendor was verified';
COMMENT ON COLUMN public.vendors.verified_by IS 'Admin user ID who verified the vendor';
COMMENT ON COLUMN public.vendors.verification_notes IS 'Admin notes about verification';
COMMENT ON COLUMN public.vendors.featured_until IS 'Timestamp until which vendor is featured';
COMMENT ON COLUMN public.vendors.response_rate IS 'Percentage of messages responded to (0-100)';
COMMENT ON COLUMN public.vendors.avg_response_time_hours IS 'Average response time in hours';

-- Create vendor_badges table for different badge types
CREATE TABLE IF NOT EXISTS public.vendor_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'verified',
    'premium',
    'elite',
    'top_rated',
    'responsive',
    'featured',
    'certified',
    'eco_friendly'
  )),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, badge_type)
);

-- Add comments for badge table
COMMENT ON TABLE public.vendor_badges IS 'Stores badges awarded to vendors';
COMMENT ON COLUMN public.vendor_badges.badge_type IS 'Type of badge: verified, premium, elite, top_rated, responsive, featured, certified, eco_friendly';
COMMENT ON COLUMN public.vendor_badges.metadata IS 'Additional badge-specific data (certifications, criteria met, etc.)';
COMMENT ON COLUMN public.vendor_badges.expires_at IS 'When the badge expires (null = never expires)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vendors_is_verified ON public.vendors(is_verified);
CREATE INDEX IF NOT EXISTS idx_vendors_verified_at ON public.vendors(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_featured_until ON public.vendors(featured_until) WHERE featured_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vendor_badges_vendor_id ON public.vendor_badges(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_badges_badge_type ON public.vendor_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_vendor_badges_expires_at ON public.vendor_badges(expires_at) WHERE expires_at IS NOT NULL;

-- Function to get all active badges for a vendor
CREATE OR REPLACE FUNCTION get_vendor_badges(vendor_id_param UUID)
RETURNS TABLE (
  badge_type TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vb.badge_type,
    vb.awarded_at,
    vb.expires_at,
    vb.metadata
  FROM public.vendor_badges vb
  WHERE vb.vendor_id = vendor_id_param
    AND (vb.expires_at IS NULL OR vb.expires_at > NOW())
  ORDER BY vb.awarded_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to award a badge to a vendor
CREATE OR REPLACE FUNCTION award_vendor_badge(
  vendor_id_param UUID,
  badge_type_param TEXT,
  metadata_param JSONB DEFAULT '{}'::jsonb,
  expires_at_param TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  badge_id UUID;
BEGIN
  -- Insert or update the badge
  INSERT INTO public.vendor_badges (vendor_id, badge_type, metadata, expires_at)
  VALUES (vendor_id_param, badge_type_param, metadata_param, expires_at_param)
  ON CONFLICT (vendor_id, badge_type)
  DO UPDATE SET
    metadata = metadata_param,
    expires_at = expires_at_param,
    updated_at = NOW()
  RETURNING id INTO badge_id;

  RETURN badge_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove a badge from a vendor
CREATE OR REPLACE FUNCTION remove_vendor_badge(
  vendor_id_param UUID,
  badge_type_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.vendor_badges
  WHERE vendor_id = vendor_id_param AND badge_type = badge_type_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-award badges based on criteria
CREATE OR REPLACE FUNCTION auto_award_vendor_badges(vendor_id_param UUID)
RETURNS TABLE (badge_type TEXT, awarded BOOLEAN) AS $$
DECLARE
  vendor_record RECORD;
BEGIN
  -- Get vendor data
  SELECT
    v.average_rating,
    v.review_count,
    v.response_rate,
    v.avg_response_time_hours,
    v.tier,
    v.is_verified
  INTO vendor_record
  FROM public.vendors v
  WHERE v.id = vendor_id_param;

  -- Top Rated Badge: 4.5+ stars with 10+ reviews
  IF vendor_record.average_rating >= 4.5 AND vendor_record.review_count >= 10 THEN
    PERFORM award_vendor_badge(vendor_id_param, 'top_rated',
      jsonb_build_object('rating', vendor_record.average_rating, 'review_count', vendor_record.review_count));
    RETURN QUERY SELECT 'top_rated'::TEXT, true;
  ELSE
    PERFORM remove_vendor_badge(vendor_id_param, 'top_rated');
    RETURN QUERY SELECT 'top_rated'::TEXT, false;
  END IF;

  -- Responsive Badge: 90%+ response rate within 24hrs
  IF vendor_record.response_rate >= 90 AND vendor_record.avg_response_time_hours <= 24 THEN
    PERFORM award_vendor_badge(vendor_id_param, 'responsive',
      jsonb_build_object('response_rate', vendor_record.response_rate, 'avg_response_time', vendor_record.avg_response_time_hours));
    RETURN QUERY SELECT 'responsive'::TEXT, true;
  ELSE
    PERFORM remove_vendor_badge(vendor_id_param, 'responsive');
    RETURN QUERY SELECT 'responsive'::TEXT, false;
  END IF;

  -- Elite Badge: Premium tier + verified + top rated
  IF vendor_record.tier IN ('premium', 'elite') AND
     vendor_record.is_verified AND
     vendor_record.average_rating >= 4.5 AND
     vendor_record.review_count >= 10 THEN
    PERFORM award_vendor_badge(vendor_id_param, 'elite');
    RETURN QUERY SELECT 'elite'::TEXT, true;
  ELSE
    PERFORM remove_vendor_badge(vendor_id_param, 'elite');
    RETURN QUERY SELECT 'elite'::TEXT, false;
  END IF;

  -- Featured badge based on featured_until
  IF EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = vendor_id_param
      AND v.featured_until IS NOT NULL
      AND v.featured_until > NOW()
  ) THEN
    PERFORM award_vendor_badge(vendor_id_param, 'featured', '{}'::jsonb,
      (SELECT featured_until FROM public.vendors WHERE id = vendor_id_param));
    RETURN QUERY SELECT 'featured'::TEXT, true;
  ELSE
    PERFORM remove_vendor_badge(vendor_id_param, 'featured');
    RETURN QUERY SELECT 'featured'::TEXT, false;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vendor badges when vendor data changes
CREATE OR REPLACE FUNCTION trigger_auto_award_badges()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auto_award_vendor_badges(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS auto_award_badges_trigger ON public.vendors;
CREATE TRIGGER auto_award_badges_trigger
  AFTER INSERT OR UPDATE OF average_rating, review_count, response_rate, avg_response_time_hours, tier, is_verified, featured_until
  ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_award_badges();

-- Function to verify a vendor (called by admin)
CREATE OR REPLACE FUNCTION verify_vendor(
  vendor_id_param UUID,
  admin_user_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.vendors
  SET
    is_verified = true,
    verified_at = NOW(),
    verified_by = admin_user_id,
    verification_notes = notes
  WHERE id = vendor_id_param;

  -- Award verified badge
  PERFORM award_vendor_badge(vendor_id_param, 'verified',
    jsonb_build_object('verified_by', admin_user_id, 'verified_at', NOW()));

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to revoke vendor verification
CREATE OR REPLACE FUNCTION revoke_vendor_verification(
  vendor_id_param UUID,
  admin_user_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.vendors
  SET
    is_verified = false,
    verified_at = NULL,
    verified_by = admin_user_id,
    verification_notes = notes
  WHERE id = vendor_id_param;

  -- Remove verified badge
  PERFORM remove_vendor_badge(vendor_id_param, 'verified');

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to set featured status with expiry
CREATE OR REPLACE FUNCTION set_vendor_featured(
  vendor_id_param UUID,
  featured_days INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.vendors
  SET
    is_featured = true,
    featured_until = NOW() + (featured_days || ' days')::INTERVAL
  WHERE id = vendor_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Update existing featured vendors to have featured_until
UPDATE public.vendors
SET featured_until = NOW() + INTERVAL '30 days'
WHERE is_featured = true AND featured_until IS NULL;

-- Create view for vendors with their badges
CREATE OR REPLACE VIEW vendors_with_badges AS
SELECT
  v.*,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'badge_type', vb.badge_type,
        'awarded_at', vb.awarded_at,
        'expires_at', vb.expires_at,
        'metadata', vb.metadata
      )
      ORDER BY vb.awarded_at DESC
    ) FILTER (WHERE vb.id IS NOT NULL),
    '[]'::jsonb
  ) as badges
FROM public.vendors v
LEFT JOIN public.vendor_badges vb ON v.id = vb.vendor_id
  AND (vb.expires_at IS NULL OR vb.expires_at > NOW())
GROUP BY v.id;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check that new columns were added:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'vendors' AND table_schema = 'public'
-- AND column_name IN ('is_verified', 'verified_at', 'verified_by', 'verification_notes', 'featured_until')
-- ORDER BY ordinal_position;
--
-- Check vendor_badges table:
-- SELECT * FROM vendor_badges LIMIT 5;
--
-- Test auto-award function:
-- SELECT * FROM auto_award_vendor_badges('your-vendor-id-here');
--
-- Test verify vendor function:
-- SELECT verify_vendor('your-vendor-id-here', 'admin-user-id-here', 'Verified after checking credentials');
--
-- View vendors with badges:
-- SELECT business_name, is_verified, badges FROM vendors_with_badges LIMIT 10;
-- =====================================================
