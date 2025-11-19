-- =====================================================
-- ADD VENDOR RATING COLUMNS
-- =====================================================
-- Adds rating fields to vendors table so we can display real ratings
-- instead of hardcoded 4.9 for everyone
-- =====================================================

-- Add rating columns
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT NULL;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create index for sorting by rating
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(average_rating DESC);

-- Add comments
COMMENT ON COLUMN vendors.average_rating IS 'Average star rating (1.0-5.0) calculated from reviews';
COMMENT ON COLUMN vendors.review_count IS 'Total number of reviews received';

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'vendors'
  AND column_name IN ('average_rating', 'review_count');

-- =====================================================
-- SUCCESS! Rating columns added to vendors table
-- =====================================================
--
-- Now vendors will show:
-- - NULL rating = "New" badge (no reviews yet)
-- - 1.0-5.0 rating = Actual star rating
-- - review_count = Number of reviews
--
-- The hardcoded 4.9 will be replaced with real data!
-- =====================================================
