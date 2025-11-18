-- =====================================================
-- CREATE VENDOR PHOTOS TABLE
-- =====================================================
-- This creates the vendor_photos table for storing vendor portfolio images
-- Run this in your Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS vendor_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_photos_vendor_id ON vendor_photos(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_created_at ON vendor_photos(created_at DESC);

-- Add comments
COMMENT ON TABLE vendor_photos IS 'Portfolio photos uploaded by vendors';
COMMENT ON COLUMN vendor_photos.vendor_id IS 'References the vendor who owns this photo';
COMMENT ON COLUMN vendor_photos.photo_url IS 'URL path to the uploaded photo';

-- Enable Row Level Security (RLS)
ALTER TABLE vendor_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Vendors can view their own photos
CREATE POLICY "Vendors can view their own photos"
  ON vendor_photos FOR SELECT
  USING (vendor_id = auth.uid());

-- Vendors can insert their own photos
CREATE POLICY "Vendors can insert their own photos"
  ON vendor_photos FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

-- Vendors can delete their own photos
CREATE POLICY "Vendors can delete their own photos"
  ON vendor_photos FOR DELETE
  USING (vendor_id = auth.uid());

-- Public can view all vendor photos (for browsing)
CREATE POLICY "Public can view all vendor photos"
  ON vendor_photos FOR SELECT
  USING (true);

-- Verify table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vendor_photos'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS! Vendor photos table created!
-- =====================================================
