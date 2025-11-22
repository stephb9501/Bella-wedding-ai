-- =====================================================
-- DRAFT/PUBLISH + AUDIT TRAIL SYSTEM
-- =====================================================
-- Vendors work in draft mode, publish when ready
-- Full audit trail of who did what and when
-- =====================================================

-- =====================================================
-- ADD STATUS TRACKING TO PLANNING TOOLS
-- =====================================================

-- Add status, publishing, and audit columns to timeline_events
ALTER TABLE public.timeline_events
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published', -- 'draft', 'published', 'archived'
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_visible_to_team BOOLEAN DEFAULT true;

-- Add status, publishing, and audit columns to checklist_items
ALTER TABLE public.checklist_items
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_visible_to_team BOOLEAN DEFAULT true;

-- Add status, publishing, and audit columns to budget_items
ALTER TABLE public.budget_items
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_visible_to_team BOOLEAN DEFAULT true;

-- =====================================================
-- TABLE: activity_log (Full Audit Trail)
-- Track every action taken in the system
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL, -- Cache name for display
  user_role TEXT NOT NULL, -- 'bride', 'planner', 'dj', etc.

  -- What happened
  action_type TEXT NOT NULL, -- 'created', 'edited', 'published', 'archived', 'deleted', 'access_granted', 'access_requested'
  entity_type TEXT NOT NULL, -- 'timeline', 'checklist', 'budget', 'guest', 'permission'
  entity_id UUID, -- ID of the thing that changed
  entity_name TEXT, -- Name/title for display

  -- Details
  changes JSONB, -- What changed (old value → new value)
  reason TEXT, -- Optional reason for change

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: item_versions (Version History)
-- Keep full history of all edits
-- =====================================================
CREATE TABLE IF NOT EXISTS public.item_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type TEXT NOT NULL, -- 'timeline_event', 'checklist_item', 'budget_item'
  item_id UUID NOT NULL, -- Original item ID
  version_number INTEGER NOT NULL,

  -- Who made this version
  edited_by UUID NOT NULL REFERENCES auth.users(id),
  edited_by_name TEXT NOT NULL,
  edited_by_role TEXT NOT NULL,

  -- Snapshot of data at this version
  data JSONB NOT NULL, -- Full item data at this point in time
  change_summary TEXT, -- What changed in this version

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_type, item_id, version_number)
);

-- =====================================================
-- TABLE: draft_notes (Private Notes on Drafts)
-- Vendors can add notes while working on drafts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.draft_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_timeline_status ON public.timeline_events(status);
CREATE INDEX IF NOT EXISTS idx_timeline_visible ON public.timeline_events(is_visible_to_team);
CREATE INDEX IF NOT EXISTS idx_timeline_created_by ON public.timeline_events(created_by);

CREATE INDEX IF NOT EXISTS idx_checklist_status ON public.checklist_items(status);
CREATE INDEX IF NOT EXISTS idx_checklist_visible ON public.checklist_items(is_visible_to_team);
CREATE INDEX IF NOT EXISTS idx_checklist_created_by ON public.checklist_items(created_by);

CREATE INDEX IF NOT EXISTS idx_budget_status ON public.budget_items(status);
CREATE INDEX IF NOT EXISTS idx_budget_visible ON public.budget_items(is_visible_to_team);
CREATE INDEX IF NOT EXISTS idx_budget_created_by ON public.budget_items(created_by);

CREATE INDEX IF NOT EXISTS idx_activity_log_wedding ON public.activity_log(wedding_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_item_versions_item ON public.item_versions(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_item_versions_user ON public.item_versions(edited_by);

CREATE INDEX IF NOT EXISTS idx_draft_notes_item ON public.draft_notes(item_type, item_id);

-- =====================================================
-- FUNCTION: Log Activity (Auto-tracking)
-- =====================================================
CREATE OR REPLACE FUNCTION log_activity(
  p_wedding_id UUID,
  p_user_id UUID,
  p_user_name TEXT,
  p_user_role TEXT,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_name TEXT,
  p_changes JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.activity_log (
    wedding_id, user_id, user_name, user_role,
    action_type, entity_type, entity_id, entity_name,
    changes, reason
  ) VALUES (
    p_wedding_id, p_user_id, p_user_name, p_user_role,
    p_action_type, p_entity_type, p_entity_id, p_entity_name,
    p_changes, p_reason
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Create Version Snapshot
-- =====================================================
CREATE OR REPLACE FUNCTION create_version_snapshot(
  p_item_type TEXT,
  p_item_id UUID,
  p_data JSONB,
  p_edited_by UUID,
  p_edited_by_name TEXT,
  p_edited_by_role TEXT,
  p_change_summary TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_version_number INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM public.item_versions
  WHERE item_type = p_item_type AND item_id = p_item_id;

  -- Create version snapshot
  INSERT INTO public.item_versions (
    item_type, item_id, version_number,
    edited_by, edited_by_name, edited_by_role,
    data, change_summary
  ) VALUES (
    p_item_type, p_item_id, v_version_number,
    p_edited_by, p_edited_by_name, p_edited_by_role,
    p_data, p_change_summary
  );

  RETURN v_version_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-log timeline changes
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_log_timeline_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT (created)
  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(
      NEW.wedding_id,
      NEW.created_by,
      '', -- Name will be filled by API
      NEW.created_by_role,
      'created',
      'timeline',
      NEW.id,
      NEW.title,
      jsonb_build_object('event_time', NEW.event_time, 'status', NEW.status),
      NULL
    );
  END IF;

  -- On UPDATE (edited or published)
  IF TG_OP = 'UPDATE' THEN
    -- Status changed to published
    IF OLD.status = 'draft' AND NEW.status = 'published' THEN
      PERFORM log_activity(
        NEW.wedding_id,
        NEW.published_by,
        '',
        NEW.created_by_role,
        'published',
        'timeline',
        NEW.id,
        NEW.title,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
        NULL
      );
    -- Regular edit
    ELSIF OLD.title != NEW.title OR OLD.event_time != NEW.event_time OR OLD.description != NEW.description THEN
      PERFORM log_activity(
        NEW.wedding_id,
        NEW.last_edited_by,
        '',
        NEW.created_by_role,
        'edited',
        'timeline',
        NEW.id,
        NEW.title,
        jsonb_build_object(
          'old_title', OLD.title,
          'new_title', NEW.title,
          'old_time', OLD.event_time,
          'new_time', NEW.event_time
        ),
        NULL
      );
    END IF;
  END IF;

  -- On DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM log_activity(
      OLD.wedding_id,
      auth.uid(),
      '',
      OLD.created_by_role,
      'deleted',
      'timeline',
      OLD.id,
      OLD.title,
      NULL,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_timeline_activity_log ON public.timeline_events;
CREATE TRIGGER trigger_timeline_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_timeline_changes();

-- =====================================================
-- TRIGGER: Auto-log checklist changes
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_log_checklist_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(
      NEW.wedding_id, NEW.created_by, '', NEW.created_by_role,
      'created', 'checklist', NEW.id, NEW.task,
      jsonb_build_object('category', NEW.category, 'status', NEW.status), NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'draft' AND NEW.status = 'published' THEN
      PERFORM log_activity(
        NEW.wedding_id, NEW.published_by, '', NEW.created_by_role,
        'published', 'checklist', NEW.id, NEW.task,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status), NULL
      );
    ELSIF OLD.task != NEW.task OR OLD.completed != NEW.completed THEN
      PERFORM log_activity(
        NEW.wedding_id, NEW.last_edited_by, '', NEW.created_by_role,
        'edited', 'checklist', NEW.id, NEW.task,
        jsonb_build_object('completed', NEW.completed), NULL
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_activity(
      OLD.wedding_id, auth.uid(), '', OLD.created_by_role,
      'deleted', 'checklist', OLD.id, OLD.task, NULL, NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_checklist_activity_log ON public.checklist_items;
CREATE TRIGGER trigger_checklist_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_checklist_changes();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_notes ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role manages activity log"
ON public.activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages versions"
ON public.item_versions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages draft notes"
ON public.draft_notes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Collaborators can view activity for their weddings
CREATE POLICY "Collaborators can view activity log"
ON public.activity_log FOR SELECT TO authenticated
USING (
  wedding_id IN (
    SELECT wedding_id FROM public.wedding_collaborators
    WHERE user_id = auth.uid() AND invite_status = 'accepted'
  )
);

-- Users can view versions of items they can access
CREATE POLICY "Collaborators can view item versions"
ON public.item_versions FOR SELECT TO authenticated
USING (true); -- Will be filtered by item access policies

-- Users can manage their own draft notes
CREATE POLICY "Users can manage their draft notes"
ON public.draft_notes FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- UPDATE VISIBILITY POLICIES FOR DRAFT ITEMS
-- =====================================================

-- Timeline: Only show published items OR user's own drafts
DROP POLICY IF EXISTS "Service role manages timeline events" ON public.timeline_events;
CREATE POLICY "Service role manages timeline events"
ON public.timeline_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users see published timeline or own drafts"
ON public.timeline_events FOR SELECT TO authenticated
USING (
  (status = 'published' AND is_visible_to_team = true)
  OR created_by = auth.uid()
);

-- Checklist: Only show published items OR user's own drafts
DROP POLICY IF EXISTS "Service role manages checklist items" ON public.checklist_items;
CREATE POLICY "Service role manages checklist items"
ON public.checklist_items FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users see published checklist or own drafts"
ON public.checklist_items FOR SELECT TO authenticated
USING (
  (status = 'published' AND is_visible_to_team = true)
  OR created_by = auth.uid()
);

-- Budget: Only show published items OR user's own drafts
DROP POLICY IF EXISTS "Service role manages budget items" ON public.budget_items;
CREATE POLICY "Service role manages budget items"
ON public.budget_items FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users see published budget or own drafts"
ON public.budget_items FOR SELECT TO authenticated
USING (
  (status = 'published' AND is_visible_to_team = true)
  OR created_by = auth.uid()
);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.activity_log IS 'Full audit trail of all actions in the wedding planning system';
COMMENT ON TABLE public.item_versions IS 'Version history of all timeline/checklist/budget items';
COMMENT ON TABLE public.draft_notes IS 'Private notes vendors can add to draft items';
COMMENT ON COLUMN public.timeline_events.status IS 'draft = only creator sees, published = team sees, archived = hidden';
COMMENT ON COLUMN public.timeline_events.is_visible_to_team IS 'False = hidden from team even if published';

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- View: Recent activity feed
CREATE OR REPLACE VIEW recent_wedding_activity AS
SELECT
  al.*,
  u.full_name as user_full_name,
  w.wedding_name
FROM public.activity_log al
JOIN auth.users u ON u.id = al.user_id
JOIN public.weddings w ON w.id = al.wedding_id
ORDER BY al.created_at DESC;

COMMENT ON VIEW recent_wedding_activity IS 'Recent activity feed with user and wedding details';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- View all activity for a wedding:
-- SELECT * FROM public.activity_log WHERE wedding_id = 'uuid' ORDER BY created_at DESC;
--
-- View timeline item history:
-- SELECT * FROM public.item_versions WHERE item_type = 'timeline_event' AND item_id = 'uuid';
--
-- See who created/published/edited an item:
-- SELECT title, created_by, created_by_role, published_by, last_edited_by
-- FROM public.timeline_events WHERE id = 'uuid';
-- =====================================================
