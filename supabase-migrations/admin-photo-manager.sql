-- Admin Photo Manager Database Schema
-- Run this in your Supabase SQL Editor

-- Create the admin_images table
CREATE TABLE IF NOT EXISTS public.admin_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Image details
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE, -- Path in Supabase Storage
  public_url TEXT NOT NULL, -- Full public URL
  file_size INTEGER, -- Size in bytes
  mime_type TEXT, -- image/jpeg, image/png, etc.

  -- Image usage/type
  image_type TEXT NOT NULL CHECK (image_type IN (
    'landing_hero',
    'dashboard_banner',
    'marketing_block',
    'testimonial',
    'vendor_showcase',
    'other'
  )),

  -- Active status
  is_active BOOLEAN DEFAULT false,

  -- Soft delete
  is_archived BOOLEAN DEFAULT false,

  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  alt_text TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_images_type_active ON public.admin_images(image_type, is_active) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_admin_images_archived ON public.admin_images(is_archived);

-- Enable RLS (Row Level Security)
ALTER TABLE public.admin_images ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view images
CREATE POLICY "Admin users can view all images"
  ON public.admin_images
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'YOUR_ADMIN_EMAIL@example.com'  -- Replace with your actual admin email
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can insert images
CREATE POLICY "Admin users can insert images"
  ON public.admin_images
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'YOUR_ADMIN_EMAIL@example.com'  -- Replace with your actual admin email
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can update images
CREATE POLICY "Admin users can update images"
  ON public.admin_images
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'YOUR_ADMIN_EMAIL@example.com'  -- Replace with your actual admin email
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can delete images
CREATE POLICY "Admin users can delete images"
  ON public.admin_images
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN (
      'YOUR_ADMIN_EMAIL@example.com'  -- Replace with your actual admin email
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add role column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Function to ensure only one active image per type
CREATE OR REPLACE FUNCTION public.enforce_single_active_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If this image is being set to active
  IF NEW.is_active = true THEN
    -- Deactivate all other images of the same type
    UPDATE public.admin_images
    SET is_active = false, updated_at = NOW()
    WHERE image_type = NEW.image_type
      AND id != NEW.id
      AND is_active = true
      AND is_archived = false;
  END IF;

  -- Update the updated_at timestamp
  NEW.updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_enforce_single_active_image ON public.admin_images;
CREATE TRIGGER trigger_enforce_single_active_image
  BEFORE INSERT OR UPDATE ON public.admin_images
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_active_image();

-- Create Supabase Storage bucket for bella-images
-- Note: This needs to be run separately or created via Supabase Dashboard
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('bella-images', 'bella-images', true);

-- Storage policy: Allow admins to upload
-- CREATE POLICY "Admin users can upload images"
--   ON storage.objects
--   FOR INSERT
--   WITH CHECK (
--     bucket_id = 'bella-images'
--     AND auth.jwt() ->> 'email' IN ('YOUR_ADMIN_EMAIL@example.com')
--   );

-- Storage policy: Public read access
-- CREATE POLICY "Public can view images"
--   ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'bella-images');

COMMENT ON TABLE public.admin_images IS 'Admin-managed images for Bella Wedding AI brand assets';
COMMENT ON COLUMN public.admin_images.image_type IS 'Type/usage of image: landing_hero, dashboard_banner, marketing_block, testimonial, vendor_showcase, other';
COMMENT ON COLUMN public.admin_images.is_active IS 'Only one image per type can be active at a time';
COMMENT ON COLUMN public.admin_images.is_archived IS 'Soft delete flag - archived images do not show on public site';
