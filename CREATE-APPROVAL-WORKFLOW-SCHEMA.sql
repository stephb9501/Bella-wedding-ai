-- =====================================================
-- APPROVAL WORKFLOW SYSTEM
-- =====================================================
-- Bride or Planner can approve vendor timeline entries
-- Approved items auto-add to master timeline
-- =====================================================

-- Add approval tracking to timeline
ALTER TABLE wedding_timeline
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS approval_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID,
ADD COLUMN IF NOT EXISTS approved_by_role VARCHAR(50), -- bride, planner, vendor
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS auto_added_to_master BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS master_timeline_id UUID REFERENCES master_wedding_timeline(id);

-- Add approval tracking to playlists
ALTER TABLE music_playlists
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add approval tracking to shot lists
ALTER TABLE shot_lists
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Table to track who can approve what
CREATE TABLE IF NOT EXISTS wedding_approvers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Could be bride_id or planner vendor_id
  user_role VARCHAR(50) NOT NULL, -- bride, planner, coordinator

  can_approve_timeline BOOLEAN DEFAULT true,
  can_approve_playlists BOOLEAN DEFAULT false,
  can_approve_shot_lists BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications for approval requests
CREATE TABLE IF NOT EXISTS approval_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,

  item_type VARCHAR(50) NOT NULL, -- timeline, playlist, shotlist
  item_id UUID NOT NULL,

  requesting_vendor_id UUID NOT NULL REFERENCES vendors(id),
  requesting_vendor_name VARCHAR(255),

  awaiting_approval_from UUID, -- bride_id or planner_id
  awaiting_role VARCHAR(50), -- bride, planner

  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, auto_approved
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to auto-add approved timeline to master
CREATE OR REPLACE FUNCTION auto_add_approved_timeline_to_master()
RETURNS TRIGGER AS $$
DECLARE
  vendor_record RECORD;
  master_id UUID;
BEGIN
  -- Only proceed if status changed to 'approved' and not already in master
  IF NEW.approval_status = 'approved' AND
     (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') AND
     NEW.auto_added_to_master = false THEN

    -- Get vendor info
    SELECT id, business_name, category INTO vendor_record
    FROM vendors
    WHERE id = NEW.vendor_id;

    -- Insert into master timeline
    INSERT INTO master_wedding_timeline (
      booking_id,
      time_slot,
      activity,
      duration_minutes,
      location,
      notes,
      contributed_by_vendor_id,
      contributed_by_category,
      status,
      approved_by_bride
    ) VALUES (
      (SELECT booking_id FROM wedding_projects WHERE id = NEW.project_id),
      NEW.time_slot,
      NEW.activity,
      NEW.duration_minutes,
      NEW.location,
      NEW.notes,
      NEW.vendor_id,
      vendor_record.category,
      'approved',
      true
    )
    RETURNING id INTO master_id;

    -- Update original timeline entry
    NEW.auto_added_to_master = true;
    NEW.master_timeline_id = master_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-add to master on approval
CREATE TRIGGER timeline_approval_trigger
  BEFORE UPDATE ON wedding_timeline
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_approved_timeline_to_master();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wedding_approvers_booking ON wedding_approvers(booking_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_booking ON approval_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_status ON approval_notifications(status);
CREATE INDEX IF NOT EXISTS idx_timeline_approval_status ON wedding_timeline(approval_status);

-- RLS
ALTER TABLE wedding_approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approvers can view their approver status"
  ON wedding_approvers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Vendors can view notifications"
  ON approval_notifications FOR SELECT
  USING (requesting_vendor_id = auth.uid() OR awaiting_approval_from = auth.uid());

-- =====================================================
-- APPROVAL WORKFLOW:
-- =====================================================
-- 1. DJ creates timeline entry: "Arrival Time: 5:00 PM"
--    - Status: draft
--    - Visible only to DJ
--
-- 2. DJ requests approval from bride
--    - Sets approval_status = 'pending_approval'
--    - Creates notification for bride
--    - Bride sees in her dashboard
--
-- 3. Bride approves
--    - Updates approval_status = 'approved'
--    - Trigger fires automatically
--    - Entry added to master_wedding_timeline
--    - All vendors with permission now see it
--    - Notification sent to DJ
--
-- 4. OR Wedding Planner approves (if authorized)
--    - Same flow as bride approval
--    - Planner must be in wedding_approvers table
--
-- 5. Auto-coordination
--    - Photographer sees DJ arrives at 5pm
--    - Knows to be ready for dancing photos
--    - All vendors work from same timeline
-- =====================================================

-- =====================================================
-- SUCCESS! Approval workflow system created!
-- =====================================================
-- Now when bride/planner approves timeline entries:
-- - Automatically added to master timeline
-- - All vendors see coordinated schedule
-- - No manual copying needed
-- - Everyone works from approved plan
-- =====================================================
