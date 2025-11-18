-- =====================================================
-- CREATE VENDOR_BOOKINGS TABLE
-- =====================================================
-- This table stores booking requests from brides to vendors
-- Run this in your Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS vendor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  bride_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Bride Information
  bride_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Wedding Details
  wedding_date DATE,
  venue VARCHAR(255),
  budget_range VARCHAR(100),
  message TEXT,

  -- Booking Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined

  -- Response Tracking
  vendor_responded BOOLEAN DEFAULT false,
  vendor_response_time INTEGER, -- Minutes to first response
  responded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_vendor ON vendor_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_bride ON vendor_bookings(bride_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_status ON vendor_bookings(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_created ON vendor_bookings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Vendors can view their own bookings
CREATE POLICY "Vendors can view their bookings"
  ON vendor_bookings FOR SELECT
  USING (vendor_id = auth.uid());

-- Vendors can update their bookings (status, response)
CREATE POLICY "Vendors can update their bookings"
  ON vendor_bookings FOR UPDATE
  USING (vendor_id = auth.uid());

-- Brides can view their own bookings
CREATE POLICY "Brides can view their bookings"
  ON vendor_bookings FOR SELECT
  USING (bride_id = auth.uid());

-- Brides can create bookings
CREATE POLICY "Brides can create bookings"
  ON vendor_bookings FOR INSERT
  WITH CHECK (bride_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_vendor_bookings_updated_at
  BEFORE UPDATE ON vendor_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS! Vendor bookings table created!
-- =====================================================
-- Now the Bookings tab in vendor dashboard will work!
