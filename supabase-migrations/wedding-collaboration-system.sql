-- =====================================================
-- WEDDING COLLABORATION SYSTEM
-- =====================================================
-- Allows vendors and brides to collaborate on the same wedding
-- Multiple vendors can work on shared timeline, checklist, budget
-- =====================================================

-- =====================================================
-- TABLE: weddings
-- Central wedding registry
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bride_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_name TEXT, -- e.g., "Sarah & John's Wedding"
  wedding_date DATE,
  venue_name TEXT,
  venue_location TEXT,
  guest_count INTEGER DEFAULT 0,
  budget_total DECIMAL(10, 2),
  status TEXT DEFAULT 'planning', -- 'planning', 'upcoming', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: wedding_collaborators
-- Track who has access to work on this wedding
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wedding_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL, -- 'bride', 'vendor'
  vendor_role TEXT, -- 'planner', 'dj', 'florist', 'photographer', etc.
  permissions TEXT DEFAULT 'edit', -- 'view', 'edit', 'admin'
  invite_status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_id, user_id)
);

-- =====================================================
-- TABLE: vendor_pinned_tools
-- Track which tools each vendor has pinned to their dashboard
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vendor_pinned_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL, -- 'timeline', 'checklist', 'budget', 'guests', 'seating'
  pin_order INTEGER DEFAULT 0, -- Order they appear on dashboard
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, tool_name)
);

-- =====================================================
-- ALTER EXISTING TABLES
-- Add wedding_id to planning tools
-- =====================================================

-- Add wedding_id to timeline_events (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_events' AND column_name = 'wedding_id'
  ) THEN
    ALTER TABLE public.timeline_events ADD COLUMN wedding_id UUID;
  END IF;
END $$;

-- Add wedding_id to checklist_items (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checklist_items' AND column_name = 'wedding_id'
  ) THEN
    ALTER TABLE public.checklist_items ADD COLUMN wedding_id UUID;
  END IF;
END $$;

-- Add wedding_id to budget_items (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budget_items' AND column_name = 'wedding_id'
  ) THEN
    ALTER TABLE public.budget_items ADD COLUMN wedding_id UUID;
  END IF;
END $$;

-- Add created_by to track who created each item
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS created_by_role TEXT; -- 'bride', 'planner', 'dj', etc.

ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS created_by_role TEXT;

ALTER TABLE public.budget_items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.budget_items ADD COLUMN IF NOT EXISTS created_by_role TEXT;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_weddings_bride_id ON public.weddings(bride_id);
CREATE INDEX IF NOT EXISTS idx_weddings_date ON public.weddings(wedding_date);
CREATE INDEX IF NOT EXISTS idx_wedding_collaborators_wedding_id ON public.wedding_collaborators(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_collaborators_user_id ON public.wedding_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_collaborators_status ON public.wedding_collaborators(invite_status);
CREATE INDEX IF NOT EXISTS idx_timeline_wedding_id ON public.timeline_events(wedding_id);
CREATE INDEX IF NOT EXISTS idx_checklist_wedding_id ON public.checklist_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_budget_wedding_id ON public.budget_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pinned_tools_vendor_id ON public.vendor_pinned_tools(vendor_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update weddings.updated_at
DROP TRIGGER IF EXISTS update_weddings_updated_at ON public.weddings;
CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_pinned_tools ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role manages weddings"
ON public.weddings FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages collaborators"
ON public.wedding_collaborators FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages pinned tools"
ON public.vendor_pinned_tools FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Brides can view their own weddings
CREATE POLICY "Brides can view their weddings"
ON public.weddings FOR SELECT TO authenticated
USING (auth.uid() = bride_id);

-- Collaborators can view weddings they're invited to
CREATE POLICY "Collaborators can view their weddings"
ON public.weddings FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_collaborators
    WHERE wedding_collaborators.wedding_id = weddings.id
    AND wedding_collaborators.user_id = auth.uid()
    AND wedding_collaborators.invite_status = 'accepted'
  )
);

-- Users can view their own collaborator records
CREATE POLICY "Users can view their collaborations"
ON public.wedding_collaborators FOR SELECT TO authenticated
USING (user_id = auth.uid() OR invited_by = auth.uid());

-- Vendors can view their own pinned tools
CREATE POLICY "Vendors can manage their pinned tools"
ON public.vendor_pinned_tools FOR ALL TO authenticated
USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- =====================================================
-- HELPER FUNCTION: Auto-create wedding for new brides
-- =====================================================
CREATE OR REPLACE FUNCTION create_wedding_for_new_bride()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create wedding if this is a bride/user (not vendor)
  IF NOT EXISTS (
    SELECT 1 FROM public.vendors WHERE id = NEW.id
  ) THEN
    INSERT INTO public.weddings (
      id,
      bride_id,
      wedding_name,
      wedding_date
    ) VALUES (
      NEW.id, -- Use user ID as wedding ID (one user = one wedding)
      NEW.id,
      NEW.full_name || '''s Wedding',
      NEW.wedding_date
    );

    -- Auto-add bride as collaborator with admin permissions
    INSERT INTO public.wedding_collaborators (
      wedding_id,
      user_id,
      user_type,
      permissions,
      invite_status,
      invited_by,
      accepted_at
    ) VALUES (
      NEW.id,
      NEW.id,
      'bride',
      'admin',
      'accepted',
      NEW.id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user registration
DROP TRIGGER IF EXISTS trigger_create_wedding_for_bride ON public.users;
CREATE TRIGGER trigger_create_wedding_for_bride
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_wedding_for_new_bride();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.weddings IS 'Central registry of weddings';
COMMENT ON TABLE public.wedding_collaborators IS 'Tracks vendors and collaborators who can access wedding planning tools';
COMMENT ON TABLE public.vendor_pinned_tools IS 'Stores which planning tools each vendor has pinned to their dashboard';
COMMENT ON COLUMN public.wedding_collaborators.permissions IS 'view = read-only, edit = can modify, admin = full control';
COMMENT ON COLUMN public.wedding_collaborators.vendor_role IS 'planner, dj, florist, photographer, caterer, etc.';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify:
-- SELECT * FROM public.weddings;
-- SELECT * FROM public.wedding_collaborators;
-- SELECT * FROM public.vendor_pinned_tools;
-- =====================================================
