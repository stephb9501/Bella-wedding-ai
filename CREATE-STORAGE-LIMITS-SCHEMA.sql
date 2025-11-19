-- =====================================================
-- STORAGE LIMITS SYSTEM
-- =====================================================
-- Prevent excessive file uploads per wedding
-- Tiered limits based on vendor subscription
-- Cost-effective while still generous for legitimate use
-- =====================================================

-- Add file upload limits to vendor tiers
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS files_per_wedding_limit INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS storage_per_wedding_mb INTEGER DEFAULT 250;

-- Set tier-based limits
-- Free: 25 files, 250MB per wedding (plenty for most vendors)
-- Premium: 50 files, 500MB per wedding
-- Featured: 100 files, 1GB per wedding
-- Elite: 200 files, 2GB per wedding

UPDATE vendors SET
  files_per_wedding_limit = 25,
  storage_per_wedding_mb = 250
WHERE tier = 'free';

UPDATE vendors SET
  files_per_wedding_limit = 50,
  storage_per_wedding_mb = 500
WHERE tier = 'premium';

UPDATE vendors SET
  files_per_wedding_limit = 100,
  storage_per_wedding_mb = 1024
WHERE tier = 'featured';

UPDATE vendors SET
  files_per_wedding_limit = 200,
  storage_per_wedding_mb = 2048
WHERE tier = 'elite';

-- Function to check if vendor can upload more files to a booking
CREATE OR REPLACE FUNCTION can_upload_file_to_booking(
  p_vendor_id UUID,
  p_booking_id UUID,
  p_file_size_bytes BIGINT
) RETURNS JSONB AS $$
DECLARE
  v_vendor_tier VARCHAR(20);
  v_file_limit INTEGER;
  v_storage_limit_mb INTEGER;
  v_current_file_count INTEGER;
  v_current_storage_bytes BIGINT;
  v_storage_limit_bytes BIGINT;
  v_result JSONB;
BEGIN
  -- Get vendor's tier and limits
  SELECT tier, files_per_wedding_limit, storage_per_wedding_mb
  INTO v_vendor_tier, v_file_limit, v_storage_limit_mb
  FROM vendors
  WHERE id = p_vendor_id;

  -- Convert MB to bytes
  v_storage_limit_bytes := v_storage_limit_mb::BIGINT * 1024 * 1024;

  -- Get current usage for this booking
  SELECT
    COUNT(*),
    COALESCE(SUM(file_size_bytes), 0)
  INTO v_current_file_count, v_current_storage_bytes
  FROM project_files
  WHERE booking_id = p_booking_id
  AND uploaded_by_user_id = p_vendor_id
  AND is_latest_version = true;

  -- Check if limits would be exceeded
  IF v_current_file_count >= v_file_limit THEN
    v_result := jsonb_build_object(
      'can_upload', false,
      'reason', 'file_count_limit',
      'message', format('File limit reached (%s/%s files). Upgrade to %s for more storage.',
                        v_current_file_count, v_file_limit,
                        CASE v_vendor_tier
                          WHEN 'free' THEN 'Premium'
                          WHEN 'premium' THEN 'Featured'
                          WHEN 'featured' THEN 'Elite'
                          ELSE 'higher tier'
                        END),
      'current_file_count', v_current_file_count,
      'file_limit', v_file_limit,
      'current_storage_mb', ROUND(v_current_storage_bytes / 1024.0 / 1024.0, 2),
      'storage_limit_mb', v_storage_limit_mb,
      'vendor_tier', v_vendor_tier
    );
    RETURN v_result;
  END IF;

  IF (v_current_storage_bytes + p_file_size_bytes) > v_storage_limit_bytes THEN
    v_result := jsonb_build_object(
      'can_upload', false,
      'reason', 'storage_limit',
      'message', format('Storage limit reached (%s/%s MB). Upgrade to %s for more storage.',
                        ROUND(v_current_storage_bytes / 1024.0 / 1024.0, 2),
                        v_storage_limit_mb,
                        CASE v_vendor_tier
                          WHEN 'free' THEN 'Premium'
                          WHEN 'premium' THEN 'Featured'
                          WHEN 'featured' THEN 'Elite'
                          ELSE 'higher tier'
                        END),
      'current_file_count', v_current_file_count,
      'file_limit', v_file_limit,
      'current_storage_mb', ROUND(v_current_storage_bytes / 1024.0 / 1024.0, 2),
      'storage_limit_mb', v_storage_limit_mb,
      'vendor_tier', v_vendor_tier
    );
    RETURN v_result;
  END IF;

  -- Can upload
  v_result := jsonb_build_object(
    'can_upload', true,
    'current_file_count', v_current_file_count,
    'file_limit', v_file_limit,
    'current_storage_mb', ROUND(v_current_storage_bytes / 1024.0 / 1024.0, 2),
    'storage_limit_mb', v_storage_limit_mb,
    'remaining_files', v_file_limit - v_current_file_count,
    'remaining_storage_mb', ROUND((v_storage_limit_bytes - v_current_storage_bytes) / 1024.0 / 1024.0, 2),
    'vendor_tier', v_vendor_tier
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- View for monitoring storage usage
CREATE OR REPLACE VIEW vendor_storage_usage AS
SELECT
  v.id as vendor_id,
  v.business_name,
  v.tier,
  v.files_per_wedding_limit,
  v.storage_per_wedding_mb,
  pf.booking_id,
  vb.bride_name,
  vb.wedding_date,
  COUNT(pf.id) as file_count,
  ROUND(SUM(pf.file_size_bytes) / 1024.0 / 1024.0, 2) as storage_used_mb,
  ROUND((COUNT(pf.id)::FLOAT / v.files_per_wedding_limit * 100), 1) as file_usage_percent,
  ROUND((SUM(pf.file_size_bytes) / 1024.0 / 1024.0 / v.storage_per_wedding_mb * 100), 1) as storage_usage_percent
FROM vendors v
LEFT JOIN project_files pf ON pf.uploaded_by_user_id = v.id
LEFT JOIN vendor_bookings vb ON vb.id = pf.booking_id
WHERE pf.is_latest_version = true
GROUP BY v.id, v.business_name, v.tier, v.files_per_wedding_limit, v.storage_per_wedding_mb,
         pf.booking_id, vb.bride_name, vb.wedding_date;

-- =====================================================
-- RECOMMENDED LIMITS (COST-EFFECTIVE):
-- =====================================================
-- Free Tier: 25 files, 250MB per wedding
--   - Enough for: 10-15 mood board images, 5-10 contracts/invoices
--   - Cost: ~$0.02/month per wedding (Supabase pricing)
--
-- Premium Tier: 50 files, 500MB per wedding
--   - Enough for: 30-40 inspiration photos, all documents
--   - Cost: ~$0.04/month per wedding
--
-- Featured Tier: 100 files, 1GB per wedding
--   - Enough for: Large mood boards, high-res photos, videos
--   - Cost: ~$0.08/month per wedding
--
-- Elite Tier: 200 files, 2GB per wedding
--   - Enough for: Extensive portfolios, video samples
--   - Cost: ~$0.16/month per wedding
--
-- ASSUMPTIONS:
-- - Supabase Storage: $0.021/GB/month
-- - Average wedding lifecycle: 6-12 months
-- - Most files deleted after wedding (90-day auto-delete)
-- - Typical vendor uploads 10-30 files per wedding
-- =====================================================

-- =====================================================
-- USAGE EXAMPLES:
-- =====================================================

-- EXAMPLE 1: Check if vendor can upload file
-- SELECT can_upload_file_to_booking(
--   'vendor-123',
--   'booking-456',
--   5242880  -- 5MB file
-- );
--
-- Returns:
-- {
--   "can_upload": true,
--   "current_file_count": 10,
--   "file_limit": 25,
--   "current_storage_mb": 45.5,
--   "storage_limit_mb": 250,
--   "remaining_files": 15,
--   "remaining_storage_mb": 204.5,
--   "vendor_tier": "free"
-- }

-- EXAMPLE 2: Check usage for all weddings
-- SELECT * FROM vendor_storage_usage
-- WHERE vendor_id = 'vendor-123';

-- EXAMPLE 3: Find vendors near their limits (to upsell)
-- SELECT * FROM vendor_storage_usage
-- WHERE file_usage_percent > 80
--    OR storage_usage_percent > 80
-- ORDER BY storage_usage_percent DESC;

-- =====================================================
-- SUCCESS! Storage limits created!
-- =====================================================
-- ✅ Prevents abuse (no "million files" uploads)
-- ✅ Cost-effective (pennies per wedding)
-- ✅ Generous for legitimate use
-- ✅ Tiered upsell opportunity
-- ✅ Automatic monitoring
-- =====================================================
