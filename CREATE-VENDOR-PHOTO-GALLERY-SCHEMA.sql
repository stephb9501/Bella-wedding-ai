-- =====================================================
-- VENDOR PHOTO GALLERY SYSTEM
-- =====================================================
-- Allow vendors to upload multiple photos (portfolio)
-- Display in vendor profile
-- Main profile photo + additional gallery photos
-- =====================================================

CREATE TABLE IF NOT EXISTS vendor_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vendor
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Photo details
  photo_url TEXT NOT NULL,
  photo_path TEXT,
  file_name VARCHAR(255),
  file_size BIGINT, -- bytes

  -- Photo metadata
  caption TEXT,
  photo_type VARCHAR(50) DEFAULT 'portfolio', -- portfolio, work_sample, venue, setup, other
  is_profile_photo BOOLEAN DEFAULT false,

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Visibility
  is_visible BOOLEAN DEFAULT true,

  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_photos_vendor ON vendor_photos(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_profile ON vendor_photos(is_profile_photo);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_visible ON vendor_photos(is_visible);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_order ON vendor_photos(vendor_id, display_order);

ALTER TABLE vendor_photos ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own photos
DROP POLICY IF EXISTS "Vendors can view their photos" ON vendor_photos;
CREATE POLICY "Vendors can view their photos"
  ON vendor_photos FOR SELECT
  USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can upload photos" ON vendor_photos;
CREATE POLICY "Vendors can upload photos"
  ON vendor_photos FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can update their photos" ON vendor_photos;
CREATE POLICY "Vendors can update their photos"
  ON vendor_photos FOR UPDATE
  USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Vendors can delete their photos" ON vendor_photos;
CREATE POLICY "Vendors can delete their photos"
  ON vendor_photos FOR DELETE
  USING (vendor_id = auth.uid());

-- Everyone can view visible photos
DROP POLICY IF EXISTS "Anyone can view visible photos" ON vendor_photos;
CREATE POLICY "Anyone can view visible photos"
  ON vendor_photos FOR SELECT
  USING (is_visible = true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Set photo as profile photo
CREATE OR REPLACE FUNCTION set_profile_photo(
  p_photo_id UUID,
  p_vendor_id UUID
) RETURNS void AS $$
BEGIN
  -- Unset all other profile photos for this vendor
  UPDATE vendor_photos
  SET is_profile_photo = false
  WHERE vendor_id = p_vendor_id;

  -- Set this photo as profile photo
  UPDATE vendor_photos
  SET is_profile_photo = true
  WHERE id = p_photo_id
    AND vendor_id = p_vendor_id;
END;
$$ LANGUAGE plpgsql;

-- Get vendor gallery
CREATE OR REPLACE FUNCTION get_vendor_gallery(
  p_vendor_id UUID
) RETURNS TABLE (
  id UUID,
  photo_url TEXT,
  caption TEXT,
  photo_type VARCHAR,
  is_profile_photo BOOLEAN,
  display_order INTEGER,
  uploaded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vp.id,
    vp.photo_url,
    vp.caption,
    vp.photo_type,
    vp.is_profile_photo,
    vp.display_order,
    vp.uploaded_at
  FROM vendor_photos vp
  WHERE vp.vendor_id = p_vendor_id
    AND vp.is_visible = true
  ORDER BY vp.is_profile_photo DESC, vp.display_order ASC, vp.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW vendor_photo_counts AS
SELECT
  v.id as vendor_id,
  v.business_name,
  COUNT(vp.id) as total_photos,
  COUNT(CASE WHEN vp.is_profile_photo THEN 1 END) as profile_photo_count,
  COUNT(CASE WHEN vp.photo_type = 'portfolio' THEN 1 END) as portfolio_photos
FROM vendors v
LEFT JOIN vendor_photos vp ON vp.vendor_id = v.id AND vp.is_visible = true
GROUP BY v.id, v.business_name;

-- =====================================================
-- SUCCESS! Vendor photo gallery created!
-- =====================================================
-- Features:
-- ✅ Vendors can upload multiple photos
-- ✅ Set main profile photo
-- ✅ Additional portfolio photos
-- ✅ Caption and categorize photos
-- ✅ Display order control
-- ✅ Hide/show photos
-- =====================================================
