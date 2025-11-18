-- =====================================================
-- ADD MISSING VENDOR COLUMNS
-- =====================================================
-- This migration adds all the columns expected by the frontend
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add tier column (subscription level)
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'featured', 'elite'));

-- Add metrics columns
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS message_count_this_month INTEGER DEFAULT 0;

ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS booking_requests INTEGER DEFAULT 0;

ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Add featured flag
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add timestamps if they don't exist
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add subscription tier column (if different from tier)
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Create index on tier for faster queries
CREATE INDEX IF NOT EXISTS idx_vendors_tier ON public.vendors(tier);
CREATE INDEX IF NOT EXISTS idx_vendors_is_featured ON public.vendors(is_featured);

-- Add comment
COMMENT ON TABLE public.vendors IS 'Vendor profiles with subscription tiers and metrics';
COMMENT ON COLUMN public.vendors.tier IS 'Vendor subscription tier: free, premium, featured, or elite';
COMMENT ON COLUMN public.vendors.is_featured IS 'Whether vendor is featured on homepage';
COMMENT ON COLUMN public.vendors.photo_count IS 'Number of photos uploaded by vendor';

-- =====================================================
-- DONE! After running this, vendor registration will work
-- =====================================================
