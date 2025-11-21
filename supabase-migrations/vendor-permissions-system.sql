-- =====================================================
-- VENDOR ROLE-BASED PERMISSIONS SYSTEM
-- =====================================================
-- Default permissions by vendor role + custom overrides
-- Vendors can request additional access, brides approve
-- =====================================================

-- =====================================================
-- TABLE: vendor_role_permissions (Default Templates)
-- Defines what each vendor role can access by default
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_role TEXT NOT NULL, -- 'planner', 'dj', 'florist', 'photographer', 'caterer', 'venue', etc.
  tool_name TEXT NOT NULL, -- 'timeline', 'checklist', 'budget', 'guests', 'seating', 'files'
  can_view BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  allowed_categories TEXT[], -- Array of categories they can see (e.g., ['music', 'ceremony'] for DJ)
  access_level TEXT DEFAULT 'none', -- 'none', 'view', 'edit', 'full'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_role, tool_name)
);

-- =====================================================
-- TABLE: collaborator_custom_permissions (Overrides)
-- Bride can grant additional access beyond defaults
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collaborator_custom_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES public.wedding_collaborators(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  allowed_categories TEXT[],
  access_level TEXT DEFAULT 'none',
  granted_by UUID REFERENCES auth.users(id), -- Bride who granted this
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT, -- Why bride granted this access
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collaborator_id, tool_name)
);

-- =====================================================
-- TABLE: access_requests
-- Vendors can request additional permissions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES public.wedding_collaborators(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id), -- Vendor requesting
  tool_name TEXT NOT NULL,
  access_level TEXT NOT NULL, -- 'view' or 'edit'
  reason TEXT NOT NULL, -- Why vendor needs this access
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  reviewed_by UUID REFERENCES auth.users(id), -- Bride who reviewed
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT, -- Bride's response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT PERMISSIONS BY ROLE
-- =====================================================

-- Wedding Planner (FULL ACCESS to everything)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('planner', 'timeline', true, true, 'full', ARRAY['all']),
('planner', 'checklist', true, true, 'full', ARRAY['all']),
('planner', 'budget', true, true, 'full', ARRAY['all']),
('planner', 'guests', true, true, 'full', ARRAY['all']),
('planner', 'seating', true, true, 'full', ARRAY['all']),
('planner', 'files', true, true, 'full', ARRAY['all'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- DJ (Music timeline, music tasks, guest count)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('dj', 'timeline', true, true, 'edit', ARRAY['ceremony', 'reception', 'music', 'dance']),
('dj', 'checklist', true, true, 'edit', ARRAY['music', 'entertainment', 'sound']),
('dj', 'budget', false, false, 'none', ARRAY[]::TEXT[]),
('dj', 'guests', true, false, 'view', ARRAY['count_only']), -- Can see count only
('dj', 'seating', false, false, 'none', ARRAY[]::TEXT[]),
('dj', 'files', true, true, 'edit', ARRAY['music', 'playlists', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- Florist (Decor timeline, floral tasks, floral budget)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('florist', 'timeline', true, true, 'edit', ARRAY['ceremony', 'reception', 'decor', 'setup']),
('florist', 'checklist', true, true, 'edit', ARRAY['flowers', 'decor', 'centerpieces', 'bouquets']),
('florist', 'budget', true, false, 'view', ARRAY['flowers', 'decor']), -- Can see floral budget only
('florist', 'guests', false, false, 'none', ARRAY[]::TEXT[]),
('florist', 'seating', false, false, 'none', ARRAY[]::TEXT[]),
('florist', 'files', true, true, 'edit', ARRAY['flowers', 'decor', 'inspiration', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- Photographer (Full timeline, guest list for names, shot list)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('photographer', 'timeline', true, true, 'edit', ARRAY['all']), -- Needs full timeline for shot planning
('photographer', 'checklist', true, true, 'edit', ARRAY['photography', 'photos', 'portraits']),
('photographer', 'budget', false, false, 'none', ARRAY[]::TEXT[]),
('photographer', 'guests', true, false, 'view', ARRAY['all']), -- Needs names for family photos
('photographer', 'seating', true, false, 'view', ARRAY['all']), -- Helpful for table shots
('photographer', 'files', true, true, 'edit', ARRAY['photography', 'shot-lists', 'inspiration', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- Caterer (Meal times, food tasks, catering budget, dietary restrictions)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('caterer', 'timeline', true, true, 'edit', ARRAY['reception', 'cocktail-hour', 'dinner', 'cake-cutting']),
('caterer', 'checklist', true, true, 'edit', ARRAY['catering', 'food', 'beverages', 'service']),
('caterer', 'budget', true, false, 'view', ARRAY['catering', 'food', 'beverages']),
('caterer', 'guests', true, false, 'view', ARRAY['count', 'dietary']), -- Count + dietary restrictions
('caterer', 'seating', true, false, 'view', ARRAY['all']), -- For service planning
('caterer', 'files', true, true, 'edit', ARRAY['catering', 'menu', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- Venue (Full timeline, venue tasks, count, seating)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('venue', 'timeline', true, true, 'full', ARRAY['all']),
('venue', 'checklist', true, true, 'edit', ARRAY['venue', 'setup', 'breakdown', 'coordination']),
('venue', 'budget', true, false, 'view', ARRAY['venue', 'rental']),
('venue', 'guests', true, false, 'view', ARRAY['count_only']),
('venue', 'seating', true, true, 'edit', ARRAY['all']), -- Often helps with floor plan
('venue', 'files', true, true, 'edit', ARRAY['venue', 'floor-plans', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- Videographer (Same as photographer)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('videographer', 'timeline', true, true, 'edit', ARRAY['all']),
('videographer', 'checklist', true, true, 'edit', ARRAY['videography', 'video', 'films']),
('videographer', 'budget', false, false, 'none', ARRAY[]::TEXT[]),
('videographer', 'guests', true, false, 'view', ARRAY['all']),
('videographer', 'seating', true, false, 'view', ARRAY['all']),
('videographer', 'files', true, true, 'edit', ARRAY['videography', 'shot-lists', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- Hair & Makeup (Timeline for getting ready, checklist)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('hair-makeup', 'timeline', true, true, 'edit', ARRAY['getting-ready', 'ceremony', 'prep']),
('hair-makeup', 'checklist', true, true, 'edit', ARRAY['hair', 'makeup', 'beauty']),
('hair-makeup', 'budget', false, false, 'none', ARRAY[]::TEXT[]),
('hair-makeup', 'guests', true, false, 'view', ARRAY['bridal-party']), -- Just bridal party names
('hair-makeup', 'seating', false, false, 'none', ARRAY[]::TEXT[]),
('hair-makeup', 'files', true, true, 'edit', ARRAY['hair', 'makeup', 'inspiration', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- Transportation (Timeline for pickups/dropoffs, guest count)
INSERT INTO public.vendor_role_permissions (vendor_role, tool_name, can_view, can_edit, access_level, allowed_categories) VALUES
('transportation', 'timeline', true, true, 'edit', ARRAY['ceremony', 'reception', 'transportation', 'shuttle']),
('transportation', 'checklist', true, true, 'edit', ARRAY['transportation', 'logistics']),
('transportation', 'budget', false, false, 'none', ARRAY[]::TEXT[]),
('transportation', 'guests', true, false, 'view', ARRAY['count_only']),
('transportation', 'seating', false, false, 'none', ARRAY[]::TEXT[]),
('transportation', 'files', true, true, 'edit', ARRAY['transportation', 'contracts'])
ON CONFLICT (vendor_role, tool_name) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vendor_role_permissions_role ON public.vendor_role_permissions(vendor_role);
CREATE INDEX IF NOT EXISTS idx_collaborator_custom_permissions_collaborator ON public.collaborator_custom_permissions(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_custom_permissions_wedding ON public.collaborator_custom_permissions(wedding_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_wedding ON public.access_requests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_collaborator ON public.access_requests(collaborator_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.vendor_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_custom_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role manages vendor role permissions"
ON public.vendor_role_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages custom permissions"
ON public.collaborator_custom_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages access requests"
ON public.access_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anyone can view default role permissions (public data)
CREATE POLICY "Anyone can view default role permissions"
ON public.vendor_role_permissions FOR SELECT TO authenticated USING (true);

-- Users can view permissions for their weddings
CREATE POLICY "Users can view custom permissions for their weddings"
ON public.collaborator_custom_permissions FOR SELECT TO authenticated
USING (
  wedding_id IN (
    SELECT wedding_id FROM public.wedding_collaborators
    WHERE user_id = auth.uid() AND invite_status = 'accepted'
  )
);

-- Users can view access requests for their weddings
CREATE POLICY "Users can view access requests for their weddings"
ON public.access_requests FOR SELECT TO authenticated
USING (
  wedding_id IN (
    SELECT wedding_id FROM public.wedding_collaborators
    WHERE user_id = auth.uid() AND invite_status = 'accepted'
  )
);

-- =====================================================
-- HELPER FUNCTION: Get effective permissions
-- Combines default + custom permissions
-- =====================================================
CREATE OR REPLACE FUNCTION get_vendor_permissions(
  p_user_id UUID,
  p_wedding_id UUID,
  p_tool_name TEXT
)
RETURNS TABLE (
  can_view BOOLEAN,
  can_edit BOOLEAN,
  access_level TEXT,
  allowed_categories TEXT[]
) AS $$
DECLARE
  v_vendor_role TEXT;
  v_collaborator_id UUID;
BEGIN
  -- Get vendor's role for this wedding
  SELECT vendor_role, id INTO v_vendor_role, v_collaborator_id
  FROM public.wedding_collaborators
  WHERE user_id = p_user_id
    AND wedding_id = p_wedding_id
    AND invite_status = 'accepted';

  -- If bride (admin), return full access
  IF v_vendor_role IS NULL THEN
    RETURN QUERY SELECT true, true, 'full'::TEXT, ARRAY['all']::TEXT[];
    RETURN;
  END IF;

  -- Check for custom permissions override
  IF EXISTS (
    SELECT 1 FROM public.collaborator_custom_permissions
    WHERE collaborator_id = v_collaborator_id AND tool_name = p_tool_name
  ) THEN
    -- Return custom permissions
    RETURN QUERY
    SELECT cp.can_view, cp.can_edit, cp.access_level, cp.allowed_categories
    FROM public.collaborator_custom_permissions cp
    WHERE cp.collaborator_id = v_collaborator_id AND cp.tool_name = p_tool_name;
  ELSE
    -- Return default role permissions
    RETURN QUERY
    SELECT rp.can_view, rp.can_edit, rp.access_level, rp.allowed_categories
    FROM public.vendor_role_permissions rp
    WHERE rp.vendor_role = v_vendor_role AND rp.tool_name = p_tool_name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.vendor_role_permissions IS 'Default permissions templates for each vendor role';
COMMENT ON TABLE public.collaborator_custom_permissions IS 'Custom permission overrides granted by bride';
COMMENT ON TABLE public.access_requests IS 'Vendor requests for additional access, pending bride approval';
COMMENT ON FUNCTION get_vendor_permissions IS 'Returns effective permissions (custom overrides default)';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Test DJ permissions:
-- SELECT * FROM public.vendor_role_permissions WHERE vendor_role = 'dj';
--
-- Test effective permissions for a vendor:
-- SELECT * FROM get_vendor_permissions('vendor-uuid', 'wedding-uuid', 'timeline');
-- =====================================================
