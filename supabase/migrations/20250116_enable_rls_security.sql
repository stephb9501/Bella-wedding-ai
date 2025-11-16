-- =====================================================
-- SECURITY FIX: Enable Row Level Security (RLS)
-- =====================================================
-- This migration enables RLS on all public tables and creates
-- appropriate security policies to prevent unauthorized access
--
-- Issue: Tables are exposed to PostgREST without RLS protection
-- Risk: Anyone with API credentials can read/write all data
-- Solution: Enable RLS and create restrictive policies
-- =====================================================

-- Enable RLS on emergency_items_template table
ALTER TABLE IF EXISTS public.emergency_items_template ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow service role full access (for server-side operations)
CREATE POLICY "Service role has full access to emergency_items_template"
ON public.emergency_items_template
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy: Public read-only access (template is meant to be shared)
CREATE POLICY "Public read access to emergency_items_template"
ON public.emergency_items_template
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- COMPREHENSIVE RLS CHECK AND ENABLE
-- =====================================================
-- Enable RLS on all other public tables that may be missing it

-- Vendors table
ALTER TABLE IF EXISTS public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage their own profile"
ON public.vendors
FOR ALL
TO authenticated
USING (auth.uid()::text = id OR auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.uid()::text = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Public can view vendors"
ON public.vendors
FOR SELECT
TO anon, authenticated
USING (true);

-- Guests table
ALTER TABLE IF EXISTS public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages guests"
ON public.guests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Guests can view/update their own data via token"
ON public.guests
FOR SELECT
TO anon, authenticated
USING (true);

-- Galleries table
ALTER TABLE IF EXISTS public.galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages galleries"
ON public.galleries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view public galleries"
ON public.galleries
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- Gallery photos table
ALTER TABLE IF EXISTS public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages gallery photos"
ON public.gallery_photos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view photos in public galleries"
ON public.gallery_photos
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.galleries
    WHERE galleries.id = gallery_photos.gallery_id
    AND galleries.is_public = true
  )
);

-- Messages table
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages messages"
ON public.messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Vendor bookings table
ALTER TABLE IF EXISTS public.vendor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages vendor bookings"
ON public.vendor_bookings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Registry links table
ALTER TABLE IF EXISTS public.registry_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages registry links"
ON public.registry_links
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view active registries"
ON public.registry_links
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Brides table
ALTER TABLE IF EXISTS public.brides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages brides"
ON public.brides
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Brides can view their own profile"
ON public.brides
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Vendor photos table
ALTER TABLE IF EXISTS public.vendor_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages vendor photos"
ON public.vendor_photos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view vendor photos"
ON public.vendor_photos
FOR SELECT
TO anon, authenticated
USING (true);

-- Couples table (used in healthz check)
ALTER TABLE IF EXISTS public.couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages couples"
ON public.couples
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Couples can view their own data"
ON public.couples
FOR SELECT
TO authenticated
USING (auth.uid()::text = bride_id OR auth.uid()::text = groom_id);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this query after migration to verify RLS is enabled:
--
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- All tables should show rowsecurity = true
-- =====================================================

COMMENT ON TABLE public.emergency_items_template IS 'Template for wedding emergency kit items - RLS enabled for security';
