-- =====================================================
-- VENDOR REVIEWS AND RATINGS SYSTEM
-- =====================================================
-- This migration creates a comprehensive review system for vendors
-- including reviews, votes, and automatic rating calculations
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: vendor_reviews
-- Enhanced vendor reviews with full features
-- =====================================================
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_booking BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vendor_id) -- One review per user per vendor
);

-- =====================================================
-- TABLE 2: review_votes
-- Track which users found reviews helpful
-- =====================================================
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES vendor_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- =====================================================
-- ALTER vendors table to add rating columns
-- =====================================================
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_user_id ON vendor_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON vendor_reviews(vendor_id, rating);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_created ON vendor_reviews(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_average_rating ON vendors(average_rating DESC);

-- =====================================================
-- FUNCTION: Update vendor average rating
-- Recalculates vendor's average rating and review count
-- =====================================================
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_vendor_id UUID;
  v_avg_rating DECIMAL(3, 2);
  v_review_count INTEGER;
BEGIN
  -- Determine which vendor_id to update
  IF TG_OP = 'DELETE' THEN
    v_vendor_id := OLD.vendor_id;
  ELSE
    v_vendor_id := NEW.vendor_id;
  END IF;

  -- Calculate new average rating and count
  SELECT
    COALESCE(AVG(rating), 0)::DECIMAL(3, 2),
    COUNT(*)::INTEGER
  INTO v_avg_rating, v_review_count
  FROM vendor_reviews
  WHERE vendor_id = v_vendor_id;

  -- Update vendor table
  UPDATE vendors
  SET
    average_rating = v_avg_rating,
    review_count = v_review_count,
    updated_at = NOW()
  WHERE id = v_vendor_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update vendor rating on review changes
-- =====================================================
DROP TRIGGER IF EXISTS vendor_reviews_rating_trigger ON vendor_reviews;
CREATE TRIGGER vendor_reviews_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON vendor_reviews
FOR EACH ROW
EXECUTE FUNCTION update_vendor_rating();

-- =====================================================
-- FUNCTION: Update review helpful count
-- Updates the helpful_count when votes are added/removed
-- =====================================================
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
DECLARE
  v_review_id UUID;
  v_count INTEGER;
BEGIN
  -- Determine which review to update
  IF TG_OP = 'DELETE' THEN
    v_review_id := OLD.review_id;
  ELSE
    v_review_id := NEW.review_id;
  END IF;

  -- Count helpful votes
  SELECT COUNT(*)::INTEGER
  INTO v_count
  FROM review_votes
  WHERE review_id = v_review_id;

  -- Update review
  UPDATE vendor_reviews
  SET
    helpful_count = v_count,
    updated_at = NOW()
  WHERE id = v_review_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update helpful count on votes
-- =====================================================
DROP TRIGGER IF EXISTS review_votes_count_trigger ON review_votes;
CREATE TRIGGER review_votes_count_trigger
AFTER INSERT OR DELETE ON review_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- =====================================================
-- FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_vendor_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Update timestamp on review update
-- =====================================================
DROP TRIGGER IF EXISTS vendor_reviews_updated_at_trigger ON vendor_reviews;
CREATE TRIGGER vendor_reviews_updated_at_trigger
BEFORE UPDATE ON vendor_reviews
FOR EACH ROW
EXECUTE FUNCTION update_vendor_reviews_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on vendor_reviews
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view reviews
CREATE POLICY vendor_reviews_select_policy ON vendor_reviews
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create reviews
CREATE POLICY vendor_reviews_insert_policy ON vendor_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY vendor_reviews_update_policy ON vendor_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY vendor_reviews_delete_policy ON vendor_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on review_votes
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view votes (for counting)
CREATE POLICY review_votes_select_policy ON review_votes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can add votes
CREATE POLICY review_votes_insert_policy ON review_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own votes
CREATE POLICY review_votes_delete_policy ON review_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- INITIAL DATA MIGRATION (optional)
-- Migrate existing reviews if they exist
-- =====================================================
-- If you have existing reviews in the 'reviews' table, you can migrate them:
-- INSERT INTO vendor_reviews (id, vendor_id, user_id, rating, review_text, created_at, updated_at)
-- SELECT id, vendor_id, user_id, rating, review_text, created_at, updated_at
-- FROM reviews
-- WHERE NOT EXISTS (
--   SELECT 1 FROM vendor_reviews WHERE vendor_reviews.id = reviews.id
-- );

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE vendor_reviews IS 'Vendor reviews with ratings, titles, and verification';
COMMENT ON TABLE review_votes IS 'Tracks which users found reviews helpful';
COMMENT ON COLUMN vendor_reviews.verified_booking IS 'True if the user actually booked this vendor';
COMMENT ON COLUMN vendor_reviews.helpful_count IS 'Number of users who found this review helpful';
COMMENT ON COLUMN vendors.average_rating IS 'Auto-calculated average rating from all reviews';
COMMENT ON COLUMN vendors.review_count IS 'Auto-calculated total number of reviews';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration:
--
-- Check tables exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE '%review%';
--
-- Check vendor rating columns:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'vendors' AND column_name LIKE '%rating%';
--
-- Check triggers:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE '%review%';
-- =====================================================
