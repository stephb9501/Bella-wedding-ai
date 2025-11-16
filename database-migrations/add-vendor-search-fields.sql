-- Migration: Add ZIP code search, pricing, and enhanced vendor features
-- Run this in Supabase SQL Editor

-- Add new columns to vendors table
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS travel_radius INTEGER DEFAULT 50, -- miles
ADD COLUMN IF NOT EXISTS starting_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_tier VARCHAR(20) CHECK (price_tier IN ('Affordable', 'Moderate', 'Premium', 'Luxury')),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8), -- for faster distance calculations
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS response_rate INTEGER DEFAULT 0, -- percentage 0-100
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0, -- 0.00 to 5.00
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_profile_view_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_inquiries INTEGER DEFAULT 0;

-- Create index for ZIP code searches
CREATE INDEX IF NOT EXISTS idx_vendors_zip_code ON vendors(zip_code);

-- Create index for price tier searches
CREATE INDEX IF NOT EXISTS idx_vendors_price_tier ON vendors(price_tier);

-- Create index for category + tier searches (common query pattern)
CREATE INDEX IF NOT EXISTS idx_vendors_category_tier ON vendors(category, tier);

-- Create function to update latitude/longitude from ZIP code
-- Note: You'll need to integrate with a geocoding API (Google Maps, etc.) to populate these
-- This is a placeholder function
CREATE OR REPLACE FUNCTION update_vendor_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  -- TODO: Call geocoding API to get lat/lng from zip_code
  -- For now, this is a placeholder
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update coordinates when ZIP changes
DROP TRIGGER IF EXISTS trigger_update_vendor_coordinates ON vendors;
CREATE TRIGGER trigger_update_vendor_coordinates
  BEFORE INSERT OR UPDATE OF zip_code ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_coordinates();

-- Add comment explaining the schema
COMMENT ON COLUMN vendors.zip_code IS 'Vendor business ZIP code for location-based search';
COMMENT ON COLUMN vendors.travel_radius IS 'Maximum distance vendor will travel (in miles)';
COMMENT ON COLUMN vendors.starting_price IS 'Starting price for services';
COMMENT ON COLUMN vendors.price_tier IS 'Price category: Affordable, Moderate, Premium, Luxury';
COMMENT ON COLUMN vendors.latitude IS 'Latitude for distance calculations';
COMMENT ON COLUMN vendors.longitude IS 'Longitude for distance calculations';
