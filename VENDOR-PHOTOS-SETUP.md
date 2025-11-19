# 📸 Fix Vendor Photos Error

## Current Issue:
You're seeing "Failed to fetch photos" because the `vendor_photos` table doesn't exist yet.

## Quick Fix:

### 1. Go to Supabase SQL Editor
https://supabase.com/dashboard/project/cksukpgjkuarktbohseh/sql/new

### 2. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS vendor_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_photos_vendor_id ON vendor_photos(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_photos_created_at ON vendor_photos(created_at DESC);

ALTER TABLE vendor_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own photos"
  ON vendor_photos FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own photos"
  ON vendor_photos FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete their own photos"
  ON vendor_photos FOR DELETE
  USING (vendor_id = auth.uid());

CREATE POLICY "Public can view all vendor photos"
  ON vendor_photos FOR SELECT
  USING (true);
```

### 3. Click "Run"

### 4. Refresh your vendor dashboard

The "Failed to fetch photos" error will be gone and you'll be able to upload photos!

---

## What This Does:
- Creates `vendor_photos` table to store your portfolio images
- Sets up security so vendors can only manage their own photos
- Allows public to view vendor photos (for couples browsing)
- Automatically tracks vendor_id, photo URLs, and timestamps

---

**After running this SQL, your photo upload feature will work perfectly!**
