-- Vendor Photos Gallery Table
CREATE TABLE IF NOT EXISTS vendor_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  category TEXT DEFAULT 'gallery', -- 'gallery', 'portfolio', 'before', 'after', 'profile'
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendor_photos_vendor_id ON vendor_photos(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_featured ON vendor_photos(vendor_id, is_featured);

-- Enable Row Level Security
ALTER TABLE vendor_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Vendors can only manage their own photos
CREATE POLICY vendor_photos_vendor_policy ON vendor_photos
  FOR ALL
  USING (vendor_id IN (
    SELECT id FROM vendors WHERE id = auth.uid()
  ));

-- Policy: Everyone can view photos
CREATE POLICY vendor_photos_public_view ON vendor_photos
  FOR SELECT
  USING (true);

-- Add photo_count to vendors table for quick reference
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

-- Function to update photo count
CREATE OR REPLACE FUNCTION update_vendor_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vendors SET photo_count = photo_count + 1 WHERE id = NEW.vendor_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE vendors SET photo_count = photo_count - 1 WHERE id = OLD.vendor_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update photo count
CREATE TRIGGER vendor_photo_count_trigger
AFTER INSERT OR DELETE ON vendor_photos
FOR EACH ROW
EXECUTE FUNCTION update_vendor_photo_count();
