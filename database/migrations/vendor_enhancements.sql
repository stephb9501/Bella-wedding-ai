-- =====================================================
-- VENDOR ENHANCEMENTS FOR ADVANCED SEARCH
-- =====================================================
-- This migration adds fields needed for advanced vendor search:
-- - Price range (1-4 for $-$$$$)
-- - Coordinates for distance calculations
-- - Full-text search capabilities
-- - Additional search-related fields
-- =====================================================

-- Add new columns to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS price_range INTEGER DEFAULT 2 CHECK (price_range >= 1 AND price_range <= 4),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS starting_price INTEGER,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
ADD COLUMN IF NOT EXISTS weddings_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'booked'));

-- Add comments for documentation
COMMENT ON COLUMN public.vendors.price_range IS 'Price tier: 1 = $, 2 = $$, 3 = $$$, 4 = $$$$';
COMMENT ON COLUMN public.vendors.latitude IS 'Latitude coordinate for distance calculations';
COMMENT ON COLUMN public.vendors.longitude IS 'Longitude coordinate for distance calculations';
COMMENT ON COLUMN public.vendors.starting_price IS 'Starting price in USD';
COMMENT ON COLUMN public.vendors.average_rating IS 'Average rating from reviews (0.00-5.00)';
COMMENT ON COLUMN public.vendors.review_count IS 'Total number of reviews';
COMMENT ON COLUMN public.vendors.years_in_business IS 'Years the business has been operating';
COMMENT ON COLUMN public.vendors.weddings_completed IS 'Number of weddings completed';
COMMENT ON COLUMN public.vendors.is_featured IS 'Whether vendor is featured/highlighted';
COMMENT ON COLUMN public.vendors.profile_views IS 'Number of profile views';
COMMENT ON COLUMN public.vendors.availability_status IS 'Current availability status';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vendors_price_range ON public.vendors(price_range);
CREATE INDEX IF NOT EXISTS idx_vendors_average_rating ON public.vendors(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors(city, state);
CREATE INDEX IF NOT EXISTS idx_vendors_coordinates ON public.vendors(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON public.vendors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_tier_featured ON public.vendors(tier, is_featured);

-- Create full-text search index
-- Add a generated column for full-text search
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(business_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(city || ' ' || state, '')), 'D')
) STORED;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_vendors_search_vector ON public.vendors USING gin(search_vector);

-- Create a function to update average rating (to be called by trigger or manually)
CREATE OR REPLACE FUNCTION update_vendor_rating(vendor_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.vendors
  SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00)
      FROM public.reviews
      WHERE vendor_id = vendor_id_param
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE vendor_id = vendor_id_param
    )
  WHERE id = vendor_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update vendor ratings when reviews change
CREATE OR REPLACE FUNCTION trigger_update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM update_vendor_rating(OLD.vendor_id);
    RETURN OLD;
  ELSE
    PERFORM update_vendor_rating(NEW.vendor_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_vendor_rating_trigger ON public.reviews;
CREATE TRIGGER update_vendor_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_vendor_rating();

-- Create a function to calculate distance between coordinates (Haversine formula)
-- Returns distance in miles
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 3959; -- Earth's radius in miles
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);

  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);

  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Sample data update for existing vendors (optional - you can customize coordinates)
-- This is just example data for major US cities
UPDATE public.vendors SET
  latitude = 40.7128,
  longitude = -74.0060,
  price_range = 2,
  years_in_business = 5,
  weddings_completed = 50
WHERE city ILIKE '%new york%' AND latitude IS NULL;

UPDATE public.vendors SET
  latitude = 34.0522,
  longitude = -118.2437,
  price_range = 3,
  years_in_business = 7,
  weddings_completed = 75
WHERE city ILIKE '%los angeles%' AND latitude IS NULL;

UPDATE public.vendors SET
  latitude = 41.8781,
  longitude = -87.6298,
  price_range = 2,
  years_in_business = 4,
  weddings_completed = 40
WHERE city ILIKE '%chicago%' AND latitude IS NULL;

UPDATE public.vendors SET
  latitude = 29.7604,
  longitude = -95.3698,
  price_range = 2,
  years_in_business = 6,
  weddings_completed = 60
WHERE city ILIKE '%houston%' AND latitude IS NULL;

UPDATE public.vendors SET
  latitude = 33.4484,
  longitude = -112.0740,
  price_range = 2,
  years_in_business = 5,
  weddings_completed = 45
WHERE city ILIKE '%phoenix%' AND latitude IS NULL;

-- Set default values for other vendors
UPDATE public.vendors
SET
  price_range = 2,
  years_in_business = FLOOR(RANDOM() * 10 + 2)::INTEGER,
  weddings_completed = FLOOR(RANDOM() * 80 + 20)::INTEGER
WHERE price_range IS NULL OR years_in_business IS NULL OR weddings_completed IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check that new columns were added:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'vendors' AND table_schema = 'public'
-- ORDER BY ordinal_position;
--
-- Check indexes:
-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename = 'vendors' AND schemaname = 'public';
--
-- Test distance function:
-- SELECT calculate_distance(40.7128, -74.0060, 34.0522, -118.2437) as distance_miles;
--
-- Test full-text search:
-- SELECT business_name, city, state FROM vendors
-- WHERE search_vector @@ to_tsquery('english', 'photography | photographer');
-- =====================================================
