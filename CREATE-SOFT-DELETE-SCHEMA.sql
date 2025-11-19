-- =====================================================
-- ADD SOFT DELETE FUNCTIONALITY
-- =====================================================
-- Allows vendors and brides to "delete" bookings from
-- their view without affecting the other party's data
-- =====================================================

-- Add soft delete columns to vendor_bookings
ALTER TABLE vendor_bookings
ADD COLUMN IF NOT EXISTS deleted_by_vendor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_by_bride BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vendor_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bride_deleted_at TIMESTAMPTZ;

-- Add indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_deleted_vendor
  ON vendor_bookings(vendor_id, deleted_by_vendor)
  WHERE deleted_by_vendor = false;

CREATE INDEX IF NOT EXISTS idx_vendor_bookings_deleted_bride
  ON vendor_bookings(bride_id, deleted_by_bride)
  WHERE deleted_by_bride = false;

-- Update wedding_projects to track soft deletes
ALTER TABLE wedding_projects
ADD COLUMN IF NOT EXISTS deleted_by_vendor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vendor_deleted_at TIMESTAMPTZ;

-- =====================================================
-- SOFT DELETE LOGIC:
-- =====================================================
-- 1. Archive: Changes status to 'archived', sets archived_at
--    - Starts 90-day countdown to hard delete
--    - Still visible in "Archived" view
--    - Can be unarchived
--
-- 2. Soft Delete (Vendor): Sets deleted_by_vendor = true
--    - Removes from vendor's view immediately
--    - Does NOT affect bride's view
--    - Preserves all data
--    - Can be restored by admin if needed
--
-- 3. Soft Delete (Bride): Sets deleted_by_bride = true
--    - Removes from bride's view immediately
--    - Does NOT affect vendor's view
--    - Preserves all data
--
-- 4. Hard Delete: Actually deletes the record
--    - Only happens after 90 days from archive
--    - Or manually by admin for cleanup
--    - Permanent and irreversible
-- =====================================================

-- Function to check if booking can be hard deleted
CREATE OR REPLACE FUNCTION can_hard_delete_booking(booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  booking_record RECORD;
BEGIN
  SELECT * INTO booking_record
  FROM vendor_bookings
  WHERE id = booking_id;

  -- Can hard delete if:
  -- 1. Past the auto_delete_at date (from wedding_projects), OR
  -- 2. Deleted by both vendor AND bride
  RETURN (
    EXISTS (
      SELECT 1 FROM wedding_projects
      WHERE booking_id = booking_id
      AND auto_delete_at < NOW()
    )
    OR
    (booking_record.deleted_by_vendor = true AND booking_record.deleted_by_bride = true)
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS! Soft delete system added!
-- =====================================================
-- Vendors and brides can now:
-- - Archive weddings (starts 90-day countdown)
-- - Soft delete from their view (doesn't affect other party)
-- - Hard delete only happens after 90 days or mutual deletion
-- =====================================================
