-- =====================================================
-- ROLE-BASED TOOL ACCESS SYSTEM
-- =====================================================
-- Vendors select which roles they're fulfilling per wedding
-- Example: Venue might do just venue OR venue + catering + coordination
-- Shows only relevant tools based on selected roles
-- Storage-efficient design using JSONB
-- =====================================================

-- Define what tools each role unlocks
CREATE TABLE IF NOT EXISTS vendor_role_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(100) UNIQUE NOT NULL,
  role_display_name VARCHAR(255) NOT NULL,
  parent_category VARCHAR(100), -- venue, catering, photography, etc.

  -- Tools this role unlocks (compact array)
  tools_enabled TEXT[] NOT NULL,

  -- Common for category
  is_default_for_category BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor selects roles for EACH wedding
CREATE TABLE IF NOT EXISTS wedding_vendor_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Selected roles for THIS wedding (compact JSONB)
  selected_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: ["venue_only", "catering", "day_of_coordination"]

  -- Auto-calculated enabled tools (for quick queries)
  enabled_tools TEXT[] GENERATED ALWAYS AS (
    ARRAY(SELECT jsonb_array_elements_text(selected_roles))
  ) STORED,

  -- Export preferences (what to include in PDF)
  export_preferences JSONB DEFAULT '{
    "include_timeline": true,
    "include_checklist": true,
    "include_role_specific": true
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_id, vendor_id)
);

-- Insert standard role definitions
INSERT INTO vendor_role_definitions (role_name, role_display_name, parent_category, tools_enabled, is_default_for_category) VALUES

-- VENUE ROLES
('venue_only', 'Venue Only', 'venue', ARRAY['venue_logistics', 'timeline'], true),
('venue_catering', 'Venue + Catering', 'venue', ARRAY['venue_logistics', 'catering_menu', 'timeline']),
('venue_coordination', 'Venue + Day-of Coordination', 'venue', ARRAY['venue_logistics', 'timeline', 'vendor_coordination', 'checklist']),
('venue_full_service', 'Full Service Venue', 'venue', ARRAY['venue_logistics', 'catering_menu', 'timeline', 'vendor_coordination', 'rentals', 'checklist']),

-- DJ/ENTERTAINMENT ROLES
('dj_only', 'DJ Only', 'dj', ARRAY['music_playlists', 'timeline'], true),
('dj_mc', 'DJ + MC', 'dj', ARRAY['music_playlists', 'announcements', 'timeline']),
('dj_lighting', 'DJ + Lighting', 'dj', ARRAY['music_playlists', 'lighting_plan', 'timeline']),
('dj_full_entertainment', 'Full Entertainment Package', 'dj', ARRAY['music_playlists', 'announcements', 'lighting_plan', 'timeline']),

-- PHOTOGRAPHY ROLES
('photography_only', 'Photography Only', 'photography', ARRAY['shot_lists', 'timeline'], true),
('photography_video', 'Photo + Video', 'photography', ARRAY['shot_lists', 'video_shot_lists', 'timeline']),
('photography_album', 'Photo + Album Design', 'photography', ARRAY['shot_lists', 'album_design', 'timeline']),

-- PLANNER ROLES
('planner_partial', 'Partial Planning', 'planner', ARRAY['checklist', 'timeline', 'vendor_coordination'], true),
('planner_full', 'Full Service Planning', 'planner', ARRAY['checklist', 'timeline', 'vendor_coordination', 'budget_tracking', 'all_tools']),
('planner_day_of', 'Day-of Coordination', 'planner', ARRAY['timeline', 'vendor_coordination']),

-- CATERING ROLES
('catering_only', 'Catering Only', 'catering', ARRAY['catering_menu', 'timeline'], true),
('catering_bartending', 'Catering + Bar Service', 'catering', ARRAY['catering_menu', 'bar_menu', 'timeline']),
('catering_rentals', 'Catering + Rentals', 'catering', ARRAY['catering_menu', 'rentals', 'timeline']),

-- FLORIST ROLES
('florist_bouquets', 'Bouquets & Boutonnieres', 'florist', ARRAY['floral_designs', 'timeline'], true),
('florist_ceremony', 'Ceremony Florals', 'florist', ARRAY['floral_designs', 'ceremony_decor', 'timeline']),
('florist_full', 'Full Floral Design', 'florist', ARRAY['floral_designs', 'ceremony_decor', 'reception_decor', 'timeline']),

-- HAIR & MAKEUP ROLES
('hair_only', 'Hair Only', 'beauty', ARRAY['beauty_schedules', 'timeline']),
('makeup_only', 'Makeup Only', 'beauty', ARRAY['beauty_schedules', 'timeline']),
('hair_makeup', 'Hair + Makeup', 'beauty', ARRAY['beauty_schedules', 'timeline'], true),

-- CAKE ROLES
('cake_only', 'Wedding Cake', 'cake', ARRAY['cake_designs', 'timeline'], true),
('cake_dessert_bar', 'Cake + Dessert Bar', 'cake', ARRAY['cake_designs', 'dessert_menu', 'timeline']),

-- OFFICIANT ROLES
('officiant_ceremony', 'Ceremony Only', 'officiant', ARRAY['ceremony_scripts', 'timeline'], true),
('officiant_premarital', 'Ceremony + Premarital Counseling', 'officiant', ARRAY['ceremony_scripts', 'counseling_notes', 'timeline']),

-- TRANSPORTATION ROLES
('transport_basic', 'Basic Transportation', 'transportation', ARRAY['transportation_plans', 'timeline'], true),
('transport_shuttle', 'Guest Shuttle Service', 'transportation', ARRAY['transportation_plans', 'shuttle_schedule', 'timeline']),

-- STATIONERY ROLES
('stationery_invites', 'Invitations Only', 'stationery', ARRAY['stationery_orders', 'timeline'], true),
('stationery_full', 'Full Stationery Suite', 'stationery', ARRAY['stationery_orders', 'day_of_paper', 'timeline']),

-- RENTALS
('rentals_basic', 'Basic Rentals', 'rentals', ARRAY['rental_orders', 'timeline'], true),
('rentals_setup', 'Rentals + Setup', 'rentals', ARRAY['rental_orders', 'setup_plan', 'timeline']);

-- Function to get enabled tools for a wedding
CREATE OR REPLACE FUNCTION get_enabled_tools_for_wedding(
  p_booking_id UUID,
  p_vendor_id UUID
) RETURNS TEXT[] AS $$
DECLARE
  roles_array JSONB;
  tools TEXT[] := ARRAY[]::TEXT[];
  role_text TEXT;
BEGIN
  -- Get selected roles
  SELECT selected_roles INTO roles_array
  FROM wedding_vendor_roles
  WHERE booking_id = p_booking_id
  AND vendor_id = p_vendor_id;

  -- If no roles selected yet, return default based on vendor category
  IF roles_array IS NULL THEN
    SELECT ARRAY['timeline', 'checklist'] INTO tools;
    RETURN tools;
  END IF;

  -- Collect tools from all selected roles
  FOR role_text IN SELECT jsonb_array_elements_text(roles_array)
  LOOP
    SELECT tools || vrd.tools_enabled INTO tools
    FROM vendor_role_definitions vrd
    WHERE vrd.role_name = role_text;
  END LOOP;

  -- Remove duplicates
  SELECT ARRAY(SELECT DISTINCT unnest(tools)) INTO tools;

  RETURN tools;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_vendor_roles_booking ON wedding_vendor_roles(booking_id);
CREATE INDEX IF NOT EXISTS idx_wedding_vendor_roles_vendor ON wedding_vendor_roles(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_role_definitions_category ON vendor_role_definitions(parent_category);

-- RLS
ALTER TABLE vendor_role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_vendor_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can view role definitions (public reference data)
CREATE POLICY "Anyone can view role definitions"
  ON vendor_role_definitions FOR SELECT
  USING (true);

-- Vendors can view their own role selections
CREATE POLICY "Vendors can view their roles"
  ON wedding_vendor_roles FOR SELECT
  USING (vendor_id = auth.uid());

-- Vendors can insert their own role selections
CREATE POLICY "Vendors can set their roles"
  ON wedding_vendor_roles FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own role selections
CREATE POLICY "Vendors can update their roles"
  ON wedding_vendor_roles FOR UPDATE
  USING (vendor_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_wedding_vendor_roles_updated_at
  BEFORE UPDATE ON wedding_vendor_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPACT STORAGE DESIGN:
-- =====================================================
-- Instead of creating separate permission tables for each tool,
-- we use JSONB arrays to store role selections.
-- This saves massive amounts of storage vs traditional join tables.
--
-- Traditional approach (WASTEFUL):
-- - wedding_permissions table with 10+ rows per wedding
-- - Separate tables for each permission type
-- - Lots of JOIN queries
--
-- Our approach (EFFICIENT):
-- - Single JSONB array: ["venue_only", "catering"]
-- - One row per wedding-vendor combination
-- - Fast array operations
-- - Minimal storage footprint
-- =====================================================

-- =====================================================
-- USAGE EXAMPLES:
-- =====================================================

-- EXAMPLE 1: Venue sets roles for a wedding
-- INSERT INTO wedding_vendor_roles (booking_id, vendor_id, selected_roles)
-- VALUES ('booking-123', 'vendor-456', '["venue_only"]'::jsonb);
-- → Shows only: venue_logistics, timeline

-- EXAMPLE 2: Same venue, different wedding with more services
-- INSERT INTO wedding_vendor_roles (booking_id, vendor_id, selected_roles)
-- VALUES ('booking-789', 'vendor-456', '["venue_full_service"]'::jsonb);
-- → Shows: venue_logistics, catering_menu, timeline, vendor_coordination, rentals, checklist

-- EXAMPLE 3: DJ selects multiple roles
-- INSERT INTO wedding_vendor_roles (booking_id, vendor_id, selected_roles)
-- VALUES ('booking-abc', 'dj-vendor-xyz', '["dj_only", "dj_lighting"]'::jsonb);
-- → Shows: music_playlists, lighting_plan, timeline (combined from both roles)

-- EXAMPLE 4: Query what tools vendor should see
-- SELECT get_enabled_tools_for_wedding('booking-123', 'vendor-456');
-- → Returns: {venue_logistics, timeline}

-- EXAMPLE 5: Update roles mid-planning
-- UPDATE wedding_vendor_roles
-- SET selected_roles = '["venue_catering", "venue_coordination"]'::jsonb
-- WHERE booking_id = 'booking-123' AND vendor_id = 'vendor-456';
-- → Now shows: venue_logistics, catering_menu, timeline, vendor_coordination, checklist

-- =====================================================
-- SMART EXPORT SYSTEM:
-- =====================================================
-- Export preferences stored in JSONB per wedding
-- Default includes everything, but vendor can customize:
--
-- UPDATE wedding_vendor_roles
-- SET export_preferences = '{
--   "include_timeline": true,
--   "include_checklist": false,
--   "include_catering_menu": true,
--   "include_venue_logistics": true
-- }'::jsonb
-- WHERE booking_id = 'xxx';
--
-- PDF export will read export_preferences and only
-- generate sections that are set to true.
-- Saves paper, ink, and shows bride only what's relevant.
-- =====================================================

-- =====================================================
-- SUCCESS! Role-based tool access created!
-- =====================================================
-- Now vendors can:
-- - Select different roles for each wedding
-- - See only relevant tools
-- - Customize what appears in exports
-- - Save storage with compact JSONB design
-- - Change roles as wedding planning evolves
-- =====================================================
