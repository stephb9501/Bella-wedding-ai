-- =====================================================
-- VENDOR AVAILABILITY AND BOOKING REQUESTS SYSTEM
-- =====================================================
-- This migration creates a comprehensive booking and availability
-- system for vendors including availability calendar and booking requests
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: vendor_availability
-- Stores vendor availability by date and time slot
-- =====================================================
CREATE TABLE IF NOT EXISTS vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  time_slot VARCHAR(20) CHECK (time_slot IN ('all_day', 'morning', 'afternoon', 'evening')),
  price_override DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, date, time_slot)
);

-- =====================================================
-- TABLE 2: booking_requests
-- Enhanced booking request system with status tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_date DATE NOT NULL,
  time_slot VARCHAR(20) CHECK (time_slot IN ('all_day', 'morning', 'afternoon', 'evening')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  vendor_response TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- vendor_availability indexes
CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor_id ON vendor_availability(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date ON vendor_availability(vendor_id, date);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_is_available ON vendor_availability(vendor_id, is_available);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date_range ON vendor_availability(date);

-- booking_requests indexes
CREATE INDEX IF NOT EXISTS idx_booking_requests_vendor_id ON booking_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id ON booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_vendor_status ON booking_requests(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_wedding_date ON booking_requests(wedding_date);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON booking_requests(created_at DESC);

-- =====================================================
-- FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_booking_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Set responded_at when status changes from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.responded_at IS NULL THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================
DROP TRIGGER IF EXISTS vendor_availability_updated_at_trigger ON vendor_availability;
CREATE TRIGGER vendor_availability_updated_at_trigger
BEFORE UPDATE ON vendor_availability
FOR EACH ROW
EXECUTE FUNCTION update_availability_updated_at();

DROP TRIGGER IF EXISTS booking_requests_updated_at_trigger ON booking_requests;
CREATE TRIGGER booking_requests_updated_at_trigger
BEFORE UPDATE ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION update_booking_requests_updated_at();

-- =====================================================
-- FUNCTION: Check availability before booking
-- Prevents double bookings on the same date/time
-- =====================================================
CREATE OR REPLACE FUNCTION check_vendor_availability(
  p_vendor_id UUID,
  p_wedding_date DATE,
  p_time_slot VARCHAR(20)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_available BOOLEAN;
  v_has_accepted_booking BOOLEAN;
BEGIN
  -- Check if vendor has marked this date as available
  SELECT is_available INTO v_is_available
  FROM vendor_availability
  WHERE vendor_id = p_vendor_id
    AND date = p_wedding_date
    AND (time_slot = p_time_slot OR time_slot = 'all_day' OR p_time_slot = 'all_day');

  -- If no availability record, assume unavailable
  IF v_is_available IS NULL THEN
    v_is_available := false;
  END IF;

  -- Check if there's already an accepted booking for this date
  SELECT EXISTS(
    SELECT 1 FROM booking_requests
    WHERE vendor_id = p_vendor_id
      AND wedding_date = p_wedding_date
      AND status = 'accepted'
      AND (time_slot = p_time_slot OR time_slot = 'all_day' OR p_time_slot = 'all_day')
  ) INTO v_has_accepted_booking;

  -- Return true only if available and no accepted booking
  RETURN v_is_available AND NOT v_has_accepted_booking;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Auto-update availability when booking accepted
-- Marks date as unavailable when booking is accepted
-- =====================================================
CREATE OR REPLACE FUNCTION auto_update_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- When a booking is accepted, mark that date as unavailable
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO vendor_availability (vendor_id, date, is_available, time_slot)
    VALUES (NEW.vendor_id, NEW.wedding_date, false, COALESCE(NEW.time_slot, 'all_day'))
    ON CONFLICT (vendor_id, date, time_slot)
    DO UPDATE SET is_available = false, updated_at = NOW();
  END IF;

  -- When a booking is cancelled or declined, optionally mark as available again
  IF (NEW.status = 'cancelled' OR NEW.status = 'declined') AND OLD.status = 'accepted' THEN
    UPDATE vendor_availability
    SET is_available = true, updated_at = NOW()
    WHERE vendor_id = NEW.vendor_id
      AND date = NEW.wedding_date
      AND time_slot = COALESCE(NEW.time_slot, 'all_day');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update availability on booking status change
-- =====================================================
DROP TRIGGER IF EXISTS booking_status_availability_trigger ON booking_requests;
CREATE TRIGGER booking_status_availability_trigger
AFTER INSERT OR UPDATE OF status ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION auto_update_availability_on_booking();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on vendor_availability
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view availability (public calendar)
CREATE POLICY vendor_availability_select_policy ON vendor_availability
  FOR SELECT
  USING (true);

-- Policy: Vendors can manage their own availability
CREATE POLICY vendor_availability_insert_policy ON vendor_availability
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_id
        AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY vendor_availability_update_policy ON vendor_availability
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_id
        AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY vendor_availability_delete_policy ON vendor_availability
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_id
        AND vendors.user_id = auth.uid()
    )
  );

-- Enable RLS on booking_requests
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own booking requests
CREATE POLICY booking_requests_select_user_policy ON booking_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Vendors can view booking requests for their services
CREATE POLICY booking_requests_select_vendor_policy ON booking_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_id
        AND vendors.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can create booking requests
CREATE POLICY booking_requests_insert_policy ON booking_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own booking requests (cancel)
CREATE POLICY booking_requests_update_user_policy ON booking_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Vendors can update booking requests for their services
CREATE POLICY booking_requests_update_vendor_policy ON booking_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_id
        AND vendors.user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own booking requests
CREATE POLICY booking_requests_delete_policy ON booking_requests
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTION: Get vendor booking summary
-- Returns aggregated booking statistics for a vendor
-- =====================================================
CREATE OR REPLACE FUNCTION get_vendor_booking_summary(p_vendor_id UUID)
RETURNS TABLE(
  total_requests BIGINT,
  pending_requests BIGINT,
  accepted_bookings BIGINT,
  declined_requests BIGINT,
  upcoming_bookings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_requests,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_requests,
    COUNT(*) FILTER (WHERE status = 'accepted')::BIGINT as accepted_bookings,
    COUNT(*) FILTER (WHERE status = 'declined')::BIGINT as declined_requests,
    COUNT(*) FILTER (WHERE status = 'accepted' AND wedding_date >= CURRENT_DATE)::BIGINT as upcoming_bookings
  FROM booking_requests
  WHERE vendor_id = p_vendor_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE vendor_availability IS 'Vendor availability calendar with date-specific pricing';
COMMENT ON TABLE booking_requests IS 'Booking requests from users to vendors with status tracking';
COMMENT ON COLUMN vendor_availability.time_slot IS 'Optional time slot: all_day, morning, afternoon, evening';
COMMENT ON COLUMN vendor_availability.price_override IS 'Optional custom pricing for specific dates';
COMMENT ON COLUMN booking_requests.status IS 'Request status: pending, accepted, declined, cancelled';
COMMENT ON COLUMN booking_requests.vendor_response IS 'Vendor message when accepting/declining';
COMMENT ON COLUMN booking_requests.responded_at IS 'Auto-set when status changes from pending';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration:
--
-- Check tables exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('vendor_availability', 'booking_requests');
--
-- Check indexes:
-- SELECT indexname FROM pg_indexes
-- WHERE tablename IN ('vendor_availability', 'booking_requests');
--
-- Check RLS policies:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('vendor_availability', 'booking_requests');
--
-- Test availability check:
-- SELECT check_vendor_availability('vendor-uuid-here', '2025-06-15', 'all_day');
-- =====================================================
