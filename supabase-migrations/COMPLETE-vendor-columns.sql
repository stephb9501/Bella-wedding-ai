-- =====================================================
-- COMPLETE VENDOR COLUMNS - RUN THIS ONE!
-- =====================================================
-- This adds ALL columns needed for vendor registration
-- AND the additional profile columns
-- Run this in your Supabase SQL Editor
-- =====================================================

DO $$
BEGIN
    -- ==========================================
    -- CRITICAL COLUMNS FOR VENDOR REGISTRATION
    -- ==========================================

    -- Add tier column (subscription level) - REQUIRED
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'tier'
    ) THEN
        ALTER TABLE vendors ADD COLUMN tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'featured', 'elite'));
    END IF;

    -- Add subscription_tier - REQUIRED
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE vendors ADD COLUMN subscription_tier TEXT DEFAULT 'free';
    END IF;

    -- Add photo_count - REQUIRED
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'photo_count'
    ) THEN
        ALTER TABLE vendors ADD COLUMN photo_count INTEGER DEFAULT 0;
    END IF;

    -- Add message_count_this_month - REQUIRED
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'message_count_this_month'
    ) THEN
        ALTER TABLE vendors ADD COLUMN message_count_this_month INTEGER DEFAULT 0;
    END IF;

    -- Add booking_requests - REQUIRED
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'booking_requests'
    ) THEN
        ALTER TABLE vendors ADD COLUMN booking_requests INTEGER DEFAULT 0;
    END IF;

    -- Add profile_views - REQUIRED
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'profile_views'
    ) THEN
        ALTER TABLE vendors ADD COLUMN profile_views INTEGER DEFAULT 0;
    END IF;

    -- Add is_featured - REQUIRED
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE vendors ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- ==========================================
    -- ADDITIONAL PROFILE COLUMNS
    -- ==========================================

    -- Add business_description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'business_description'
    ) THEN
        ALTER TABLE vendors ADD COLUMN business_description TEXT;
    END IF;

    -- Add service_areas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'service_areas'
    ) THEN
        ALTER TABLE vendors ADD COLUMN service_areas TEXT[];
    END IF;

    -- Add starting_price
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'starting_price'
    ) THEN
        ALTER TABLE vendors ADD COLUMN starting_price DECIMAL(10,2);
    END IF;

    -- Add portfolio_images
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'portfolio_images'
    ) THEN
        ALTER TABLE vendors ADD COLUMN portfolio_images TEXT[];
    END IF;

    -- Add years_in_business
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'years_in_business'
    ) THEN
        ALTER TABLE vendors ADD COLUMN years_in_business INTEGER;
    END IF;

    -- Add website_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'website_url'
    ) THEN
        ALTER TABLE vendors ADD COLUMN website_url TEXT;
    END IF;

    -- Add instagram_handle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'instagram_handle'
    ) THEN
        ALTER TABLE vendors ADD COLUMN instagram_handle VARCHAR(100);
    END IF;

    -- Add timestamps if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE vendors ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vendors' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE vendors ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_tier ON vendors(tier);
CREATE INDEX IF NOT EXISTS idx_vendors_is_featured ON vendors(is_featured);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);

-- Add comments
COMMENT ON TABLE vendors IS 'Vendor profiles with subscription tiers and metrics';
COMMENT ON COLUMN vendors.tier IS 'Vendor subscription tier: free, premium, featured, or elite';
COMMENT ON COLUMN vendors.is_featured IS 'Whether vendor is featured on homepage';
COMMENT ON COLUMN vendors.photo_count IS 'Number of photos uploaded by vendor';

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vendors'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS! Vendor registration will now work!
-- =====================================================
