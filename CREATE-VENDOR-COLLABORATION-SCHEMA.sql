-- =====================================================
-- VENDOR COLLABORATION & SHARING SYSTEM
-- =====================================================
-- Allows multiple vendors to work on same wedding
-- with bride-controlled permissions and visibility
-- =====================================================

-- Add sharing and visibility controls to timeline
ALTER TABLE wedding_timeline
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS visible_to_bride BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visible_to_all_vendors BOOLEAN DEFAULT false;

-- Add sharing controls to playlists
ALTER TABLE music_playlists
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS visible_to_bride BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visible_to_all_vendors BOOLEAN DEFAULT false;

-- Add sharing controls to shot lists
ALTER TABLE shot_lists
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS visible_to_bride BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visible_to_all_vendors BOOLEAN DEFAULT false;

-- Add sharing controls to notes (vendor can share notes with bride)
ALTER TABLE project_notes
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS visible_to_bride BOOLEAN DEFAULT false;

-- Table to track all vendors working on a wedding
CREATE TABLE IF NOT EXISTS wedding_vendor_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_category VARCHAR(100), -- DJ, Photographer, Planner, etc.

  -- Permissions granted by bride
  can_view_other_vendors BOOLEAN DEFAULT false,
  can_view_master_timeline BOOLEAN DEFAULT true,

  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(booking_id, vendor_id)
);

-- Master timeline view that consolidates all vendors
CREATE TABLE IF NOT EXISTS master_wedding_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,

  time_slot TIME NOT NULL,
  activity VARCHAR(255) NOT NULL,
  duration_minutes INTEGER,
  location VARCHAR(255),
  notes TEXT,

  -- Track which vendor contributed this
  contributed_by_vendor_id UUID REFERENCES vendors(id),
  contributed_by_category VARCHAR(100),

  -- Approval workflow
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, approved_by_bride
  approved_by_bride BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor collaboration requests (vendor asks to see other vendors' work)
CREATE TABLE IF NOT EXISTS vendor_collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  requesting_vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  target_vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE, -- NULL means "all vendors"

  request_type VARCHAR(50) NOT NULL, -- view_timeline, view_playlists, view_all
  reason TEXT,

  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, denied
  reviewed_by VARCHAR(50), -- bride or target_vendor
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wedding_vendor_team_booking ON wedding_vendor_team(booking_id);
CREATE INDEX IF NOT EXISTS idx_wedding_vendor_team_vendor ON wedding_vendor_team(vendor_id);
CREATE INDEX IF NOT EXISTS idx_master_timeline_booking ON master_wedding_timeline(booking_id);
CREATE INDEX IF NOT EXISTS idx_master_timeline_time ON master_wedding_timeline(booking_id, time_slot);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_booking ON vendor_collaboration_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status ON vendor_collaboration_requests(status);

-- RLS Policies
ALTER TABLE wedding_vendor_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_wedding_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_collaboration_requests ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own team memberships
CREATE POLICY "Vendors can view their team memberships"
  ON wedding_vendor_team FOR SELECT
  USING (vendor_id = auth.uid());

-- Vendors can view master timeline if they're on the team
CREATE POLICY "Vendors can view master timeline"
  ON master_wedding_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wedding_vendor_team
      WHERE wedding_vendor_team.booking_id = master_wedding_timeline.booking_id
      AND wedding_vendor_team.vendor_id = auth.uid()
      AND wedding_vendor_team.can_view_master_timeline = true
    )
  );

-- Vendors can contribute to master timeline
CREATE POLICY "Vendors can add to master timeline"
  ON master_wedding_timeline FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_vendor_team
      WHERE wedding_vendor_team.booking_id = master_wedding_timeline.booking_id
      AND wedding_vendor_team.vendor_id = auth.uid()
    )
    AND contributed_by_vendor_id = auth.uid()
  );

-- Vendors can update their own contributions
CREATE POLICY "Vendors can update their timeline contributions"
  ON master_wedding_timeline FOR UPDATE
  USING (contributed_by_vendor_id = auth.uid());

-- Vendors can create collaboration requests
CREATE POLICY "Vendors can create collaboration requests"
  ON vendor_collaboration_requests FOR INSERT
  WITH CHECK (requesting_vendor_id = auth.uid());

-- Vendors can view their own requests
CREATE POLICY "Vendors can view their requests"
  ON vendor_collaboration_requests FOR SELECT
  USING (requesting_vendor_id = auth.uid() OR target_vendor_id = auth.uid());

-- Triggers
CREATE TRIGGER update_master_timeline_updated_at
  BEFORE UPDATE ON master_wedding_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COLLABORATION WORKFLOW:
-- =====================================================
-- 1. Vendor creates timeline in their workspace
--    - Only they can see it initially
--
-- 2. Vendor publishes to bride
--    - Sets is_published = true, visible_to_bride = true
--    - Bride can now see it in her wedding dashboard
--
-- 3. Vendor publishes to master timeline
--    - Creates entry in master_wedding_timeline
--    - All vendors with permission can see it
--
-- 4. Vendor requests to see other vendors' work
--    - Creates collaboration_request
--    - Bride approves/denies
--    - If approved, vendor can see shared items
--
-- 5. Bride can enable "Team View" for all vendors
--    - Updates wedding_vendor_team.can_view_other_vendors
--    - All vendors can now see each other's work
-- =====================================================

-- =====================================================
-- SUCCESS! Vendor collaboration system created!
-- =====================================================
-- Multiple vendors can now work together on weddings:
-- - Each vendor has private workspace
-- - Vendors can publish work to bride
-- - Vendors can publish to master timeline
-- - Bride controls who sees what
-- - Vendors can request to view each other's work
-- - Master timeline consolidates all vendors
-- =====================================================
