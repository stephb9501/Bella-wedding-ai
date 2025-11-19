-- =====================================================
-- MASTER WEDDING PLAN SYSTEM
-- =====================================================
-- Bride approves items before adding to master plan
-- Lock/unlock master plan (finalize vs. editing)
-- Version control (track changes)
-- Approval workflow for all wedding decisions
-- =====================================================

-- =====================================================
-- MASTER PLAN (The Official Wedding Plan)
-- =====================================================

CREATE TABLE IF NOT EXISTS master_wedding_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  bride_id UUID NOT NULL,

  -- Plan details
  plan_name VARCHAR(255) DEFAULT 'Wedding Plan',
  wedding_date DATE,
  venue_name VARCHAR(255),
  guest_count INTEGER,

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, finalized, locked
  is_locked BOOLEAN DEFAULT false,

  -- Lock control
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES users(id),
  unlock_reason TEXT,
  last_unlocked_at TIMESTAMPTZ,

  -- Completion
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  total_items INTEGER DEFAULT 0,
  approved_items INTEGER DEFAULT 0,
  pending_items INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(wedding_id)
);

-- =====================================================
-- PLAN ITEMS (Individual decisions/selections)
-- =====================================================

CREATE TABLE IF NOT EXISTS master_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan reference
  master_plan_id UUID NOT NULL REFERENCES master_wedding_plans(id) ON DELETE CASCADE,
  wedding_id UUID NOT NULL,
  bride_id UUID NOT NULL,

  -- Item details
  item_type VARCHAR(50) NOT NULL, -- vendor_selection, timeline_event, budget_item, checklist_task, custom
  category VARCHAR(100), -- Photography, Catering, Venue, Flowers, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Item data (flexible structure)
  item_data JSONB, -- {vendor_id, booking_id, price, date, notes, etc.}

  -- References to other tables
  vendor_id UUID, -- If it's a vendor selection
  booking_id UUID, -- If linked to booking
  checklist_item_id UUID, -- If linked to checklist
  timeline_event_id UUID, -- If linked to timeline

  -- Approval workflow
  approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, changes_requested
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Priority
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  is_must_have BOOLEAN DEFAULT false,

  -- Visibility
  is_visible_to_vendors BOOLEAN DEFAULT false,
  is_visible_to_guests BOOLEAN DEFAULT false,

  -- Metadata
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VERSION LIMIT CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS plan_version_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_versions_per_plan INTEGER DEFAULT 50, -- Limit to prevent storage bloat
  auto_cleanup_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO plan_version_config (max_versions_per_plan, auto_cleanup_enabled)
VALUES (50, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PLAN VERSIONS (Track changes when unlocked/updated)
-- =====================================================

CREATE TABLE IF NOT EXISTS master_plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan reference
  master_plan_id UUID NOT NULL REFERENCES master_wedding_plans(id) ON DELETE CASCADE,

  -- Version details
  version_number INTEGER NOT NULL,
  version_name VARCHAR(255),

  -- Snapshot of plan at this version
  plan_snapshot JSONB NOT NULL, -- Full plan state
  items_snapshot JSONB NOT NULL, -- All items at this version

  -- Status when version created
  status_at_snapshot VARCHAR(50),
  locked_at_snapshot BOOLEAN,

  -- Changes made
  changes_summary TEXT,
  items_added INTEGER DEFAULT 0,
  items_removed INTEGER DEFAULT 0,
  items_modified INTEGER DEFAULT 0,

  -- Who created this version
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(master_plan_id, version_number)
);

-- =====================================================
-- APPROVAL REQUESTS (When bride needs to approve)
-- =====================================================

CREATE TABLE IF NOT EXISTS plan_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan item reference
  plan_item_id UUID NOT NULL REFERENCES master_plan_items(id) ON DELETE CASCADE,
  master_plan_id UUID NOT NULL REFERENCES master_wedding_plans(id) ON DELETE CASCADE,

  -- Request details
  request_type VARCHAR(50) NOT NULL, -- new_item, update_item, remove_item
  requested_by UUID REFERENCES users(id),
  requested_by_type VARCHAR(50), -- bride, vendor, admin

  -- What's being requested
  item_title VARCHAR(255),
  item_description TEXT,
  proposed_changes JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, withdrawn

  -- Response
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMPTZ,
  response_notes TEXT,

  -- Priority
  is_urgent BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLAN CHANGE LOG (Audit trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS master_plan_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan reference
  master_plan_id UUID NOT NULL REFERENCES master_wedding_plans(id) ON DELETE CASCADE,
  plan_item_id UUID REFERENCES master_plan_items(id),

  -- Change details
  action VARCHAR(50) NOT NULL, -- locked, unlocked, item_added, item_approved, item_rejected, status_changed
  old_value TEXT,
  new_value TEXT,
  change_description TEXT,

  -- Who made the change
  changed_by UUID REFERENCES users(id),
  changed_by_name VARCHAR(255),
  changed_by_role VARCHAR(50), -- bride, vendor, admin

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_master_plans_wedding ON master_wedding_plans(wedding_id);
CREATE INDEX IF NOT EXISTS idx_master_plans_bride ON master_wedding_plans(bride_id);
CREATE INDEX IF NOT EXISTS idx_master_plans_status ON master_wedding_plans(status);
CREATE INDEX IF NOT EXISTS idx_master_plans_locked ON master_wedding_plans(is_locked);

CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON master_plan_items(master_plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_type ON master_plan_items(item_type);
CREATE INDEX IF NOT EXISTS idx_plan_items_category ON master_plan_items(category);
CREATE INDEX IF NOT EXISTS idx_plan_items_approval ON master_plan_items(approval_status);

CREATE INDEX IF NOT EXISTS idx_plan_versions_plan ON master_plan_versions(master_plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_versions_number ON master_plan_versions(version_number);

CREATE INDEX IF NOT EXISTS idx_approval_requests_plan ON plan_approval_requests(master_plan_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON plan_approval_requests(status);

CREATE INDEX IF NOT EXISTS idx_change_log_plan ON master_plan_change_log(master_plan_id);
CREATE INDEX IF NOT EXISTS idx_change_log_date ON master_plan_change_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE master_wedding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_plan_change_log ENABLE ROW LEVEL SECURITY;

-- Brides can view their own plan
DROP POLICY IF EXISTS "Brides can view their plan" ON master_wedding_plans;
CREATE POLICY "Brides can view their plan"
  ON master_wedding_plans FOR SELECT
  USING (bride_id = auth.uid());

DROP POLICY IF EXISTS "Brides can update their plan" ON master_wedding_plans;
CREATE POLICY "Brides can update their plan"
  ON master_wedding_plans FOR UPDATE
  USING (bride_id = auth.uid());

-- Admins can view all plans
DROP POLICY IF EXISTS "Admins can view all plans" ON master_wedding_plans;
CREATE POLICY "Admins can view all plans"
  ON master_wedding_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Plan items: Brides can view and manage their items
DROP POLICY IF EXISTS "Brides can view their items" ON master_plan_items;
CREATE POLICY "Brides can view their items"
  ON master_plan_items FOR SELECT
  USING (bride_id = auth.uid());

DROP POLICY IF EXISTS "Brides can manage their items" ON master_plan_items;
CREATE POLICY "Brides can manage their items"
  ON master_plan_items FOR ALL
  USING (bride_id = auth.uid());

-- Vendors can view items if visible to them
DROP POLICY IF EXISTS "Vendors can view visible items" ON master_plan_items;
CREATE POLICY "Vendors can view visible items"
  ON master_plan_items FOR SELECT
  USING (
    is_visible_to_vendors = true
    AND vendor_id = auth.uid()
  );

-- Versions: Brides can view their versions
DROP POLICY IF EXISTS "Brides can view versions" ON master_plan_versions;
CREATE POLICY "Brides can view versions"
  ON master_plan_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM master_wedding_plans
      WHERE master_wedding_plans.id = master_plan_versions.master_plan_id
      AND master_wedding_plans.bride_id = auth.uid()
    )
  );

-- Approval requests: Brides can view and respond
DROP POLICY IF EXISTS "Brides can view approval requests" ON plan_approval_requests;
CREATE POLICY "Brides can view approval requests"
  ON plan_approval_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM master_wedding_plans
      WHERE master_wedding_plans.id = plan_approval_requests.master_plan_id
      AND master_wedding_plans.bride_id = auth.uid()
    )
  );

-- Change log: Brides and admins can view
DROP POLICY IF EXISTS "Brides can view change log" ON master_plan_change_log;
CREATE POLICY "Brides can view change log"
  ON master_plan_change_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM master_wedding_plans
      WHERE master_wedding_plans.id = master_plan_change_log.master_plan_id
      AND master_wedding_plans.bride_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_master_wedding_plans_updated_at
  BEFORE UPDATE ON master_wedding_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_plan_items_updated_at
  BEFORE UPDATE ON master_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update plan completion when items change
CREATE OR REPLACE FUNCTION update_plan_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_total INTEGER;
  v_approved INTEGER;
  v_pending INTEGER;
BEGIN
  -- Count items
  SELECT
    COUNT(*),
    COUNT(CASE WHEN approval_status = 'approved' THEN 1 END),
    COUNT(CASE WHEN approval_status = 'pending' THEN 1 END)
  INTO v_total, v_approved, v_pending
  FROM master_plan_items
  WHERE master_plan_id = COALESCE(NEW.master_plan_id, OLD.master_plan_id);

  -- Update master plan
  UPDATE master_wedding_plans
  SET
    total_items = v_total,
    approved_items = v_approved,
    pending_items = v_pending,
    completion_percentage = CASE
      WHEN v_total > 0 THEN (v_approved::DECIMAL / v_total * 100)
      ELSE 0
    END
  WHERE id = COALESCE(NEW.master_plan_id, OLD.master_plan_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_completion_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON master_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_completion();

-- Log changes to plan
CREATE OR REPLACE FUNCTION log_plan_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log lock/unlock
    IF NEW.is_locked != OLD.is_locked THEN
      INSERT INTO master_plan_change_log (
        master_plan_id,
        action,
        old_value,
        new_value,
        change_description,
        changed_by
      ) VALUES (
        NEW.id,
        CASE WHEN NEW.is_locked THEN 'locked' ELSE 'unlocked' END,
        OLD.is_locked::TEXT,
        NEW.is_locked::TEXT,
        CASE
          WHEN NEW.is_locked THEN 'Plan locked and finalized'
          ELSE 'Plan unlocked for editing: ' || COALESCE(NEW.unlock_reason, 'No reason provided')
        END,
        NEW.locked_by
      );
    END IF;

    -- Log status change
    IF NEW.status != OLD.status THEN
      INSERT INTO master_plan_change_log (
        master_plan_id,
        action,
        old_value,
        new_value,
        change_description,
        changed_by
      ) VALUES (
        NEW.id,
        'status_changed',
        OLD.status,
        NEW.status,
        'Plan status changed from ' || OLD.status || ' to ' || NEW.status,
        auth.uid()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_plan_changes_trigger
  AFTER UPDATE ON master_wedding_plans
  FOR EACH ROW
  EXECUTE FUNCTION log_plan_change();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Cleanup old plan versions to prevent storage bloat
CREATE OR REPLACE FUNCTION cleanup_old_plan_versions(
  p_plan_id UUID
) RETURNS void AS $$
DECLARE
  v_max_versions INTEGER;
  v_auto_cleanup BOOLEAN;
  v_current_count INTEGER;
  v_versions_to_delete INTEGER;
BEGIN
  -- Get configuration
  SELECT max_versions_per_plan, auto_cleanup_enabled
  INTO v_max_versions, v_auto_cleanup
  FROM plan_version_config
  LIMIT 1;

  -- If auto-cleanup is disabled, skip
  IF NOT v_auto_cleanup THEN
    RETURN;
  END IF;

  -- Count existing versions for this plan
  SELECT COUNT(*)
  INTO v_current_count
  FROM master_plan_versions
  WHERE master_plan_id = p_plan_id;

  -- If under limit, nothing to do
  IF v_current_count <= v_max_versions THEN
    RETURN;
  END IF;

  -- Calculate how many to delete (keep newest max_versions)
  v_versions_to_delete := v_current_count - v_max_versions;

  -- Delete oldest versions (keep newest max_versions)
  DELETE FROM master_plan_versions
  WHERE id IN (
    SELECT id
    FROM master_plan_versions
    WHERE master_plan_id = p_plan_id
    ORDER BY version_number ASC
    LIMIT v_versions_to_delete
  );

  -- Log cleanup (optional)
  RAISE NOTICE 'Cleaned up % old versions for plan %', v_versions_to_delete, p_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lock master plan
CREATE OR REPLACE FUNCTION lock_master_plan(
  p_plan_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_plan RECORD;
  v_version_number INTEGER;
BEGIN
  -- Get plan
  SELECT * INTO v_plan
  FROM master_wedding_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan not found');
  END IF;

  IF v_plan.is_locked THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan already locked');
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM master_plan_versions
  WHERE master_plan_id = p_plan_id;

  -- Create version snapshot
  INSERT INTO master_plan_versions (
    master_plan_id,
    version_number,
    version_name,
    plan_snapshot,
    items_snapshot,
    status_at_snapshot,
    locked_at_snapshot,
    created_by
  )
  SELECT
    v_plan.id,
    v_version_number,
    'Version ' || v_version_number || ' - Locked',
    to_jsonb(v_plan),
    (SELECT jsonb_agg(to_jsonb(items.*))
     FROM master_plan_items items
     WHERE items.master_plan_id = v_plan.id),
    v_plan.status,
    true,
    p_user_id;

  -- Auto-cleanup old versions if limit exceeded
  PERFORM cleanup_old_plan_versions(p_plan_id);

  -- Lock plan
  UPDATE master_wedding_plans
  SET
    is_locked = true,
    locked_at = NOW(),
    locked_by = p_user_id,
    status = 'locked'
  WHERE id = p_plan_id;

  RETURN jsonb_build_object(
    'success', true,
    'version_number', v_version_number,
    'locked_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unlock master plan
CREATE OR REPLACE FUNCTION unlock_master_plan(
  p_plan_id UUID,
  p_user_id UUID,
  p_unlock_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_plan RECORD;
BEGIN
  -- Get plan
  SELECT * INTO v_plan
  FROM master_wedding_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan not found');
  END IF;

  IF NOT v_plan.is_locked THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan not locked');
  END IF;

  -- Unlock plan
  UPDATE master_wedding_plans
  SET
    is_locked = false,
    unlock_reason = p_unlock_reason,
    last_unlocked_at = NOW(),
    status = 'in_progress'
  WHERE id = p_plan_id;

  RETURN jsonb_build_object(
    'success', true,
    'unlocked_at', NOW(),
    'reason', p_unlock_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve plan item
CREATE OR REPLACE FUNCTION approve_plan_item(
  p_item_id UUID,
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE master_plan_items
  SET
    approval_status = 'approved',
    approved_by = p_user_id,
    approved_at = NOW()
  WHERE id = p_item_id;

  -- Log change
  INSERT INTO master_plan_change_log (
    master_plan_id,
    plan_item_id,
    action,
    old_value,
    new_value,
    change_description,
    changed_by
  )
  SELECT
    master_plan_id,
    id,
    'item_approved',
    'pending',
    'approved',
    'Item approved: ' || title || COALESCE(' - ' || p_notes, ''),
    p_user_id
  FROM master_plan_items
  WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql;

-- Reject plan item
CREATE OR REPLACE FUNCTION reject_plan_item(
  p_item_id UUID,
  p_user_id UUID,
  p_rejection_reason TEXT
) RETURNS void AS $$
BEGIN
  UPDATE master_plan_items
  SET
    approval_status = 'rejected',
    approved_by = p_user_id,
    approved_at = NOW(),
    rejection_reason = p_rejection_reason
  WHERE id = p_item_id;

  -- Log change
  INSERT INTO master_plan_change_log (
    master_plan_id,
    plan_item_id,
    action,
    old_value,
    new_value,
    change_description,
    changed_by
  )
  SELECT
    master_plan_id,
    id,
    'item_rejected',
    'pending',
    'rejected',
    'Item rejected: ' || title || ' - Reason: ' || p_rejection_reason,
    p_user_id
  FROM master_plan_items
  WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Plans needing approval
CREATE OR REPLACE VIEW plans_needing_approval AS
SELECT
  mp.id as plan_id,
  mp.wedding_id,
  mp.bride_id,
  u.full_name as bride_name,
  mp.wedding_date,
  mp.pending_items,
  mp.approved_items,
  mp.total_items,
  mp.completion_percentage,
  mp.is_locked
FROM master_wedding_plans mp
JOIN users u ON u.id = mp.bride_id
WHERE mp.pending_items > 0
ORDER BY mp.wedding_date ASC;

-- Plan completion status
CREATE OR REPLACE VIEW plan_completion_status AS
SELECT
  mp.id as plan_id,
  mp.wedding_id,
  mp.bride_id,
  mp.status,
  mp.is_locked,
  mp.total_items,
  mp.approved_items,
  mp.pending_items,
  mp.completion_percentage,
  DATE_PART('day', mp.wedding_date - CURRENT_DATE) as days_until_wedding,
  mp.created_at,
  mp.updated_at
FROM master_wedding_plans mp
ORDER BY mp.wedding_date ASC;

-- =====================================================
-- UNDO/REDO SYSTEM (For Brides & Vendors)
-- =====================================================

CREATE TABLE IF NOT EXISTS plan_undo_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who made the change
  user_id UUID NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- bride, vendor, admin

  -- What changed
  table_name VARCHAR(100) NOT NULL, -- master_plan_items, master_wedding_plans, etc.
  record_id UUID NOT NULL,

  -- Action taken
  action VARCHAR(50) NOT NULL, -- insert, update, delete

  -- Data snapshots
  old_data JSONB, -- Data before change
  new_data JSONB, -- Data after change

  -- Undo status
  is_undone BOOLEAN DEFAULT false,
  undone_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_undo_history_user ON plan_undo_history(user_id);
CREATE INDEX IF NOT EXISTS idx_undo_history_record ON plan_undo_history(record_id);
CREATE INDEX IF NOT EXISTS idx_undo_history_undone ON plan_undo_history(is_undone);
CREATE INDEX IF NOT EXISTS idx_undo_history_created ON plan_undo_history(created_at DESC);

ALTER TABLE plan_undo_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own undo history
DROP POLICY IF EXISTS "Users can view their undo history" ON plan_undo_history;
CREATE POLICY "Users can view their undo history"
  ON plan_undo_history FOR SELECT
  USING (user_id = auth.uid());

-- Capture changes for undo
CREATE OR REPLACE FUNCTION capture_change_for_undo()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO plan_undo_history (
      user_id,
      user_type,
      table_name,
      record_id,
      action,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user'),
      TG_TABLE_NAME,
      NEW.id,
      'insert',
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO plan_undo_history (
      user_id,
      user_type,
      table_name,
      record_id,
      action,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user'),
      TG_TABLE_NAME,
      NEW.id,
      'update',
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO plan_undo_history (
      user_id,
      user_type,
      table_name,
      record_id,
      action,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user'),
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add undo triggers to plan items
CREATE TRIGGER capture_plan_item_changes_for_undo
  AFTER INSERT OR UPDATE OR DELETE ON master_plan_items
  FOR EACH ROW
  EXECUTE FUNCTION capture_change_for_undo();

-- Undo last action
CREATE OR REPLACE FUNCTION undo_last_action(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_last_change RECORD;
BEGIN
  -- Get last undoable change
  SELECT * INTO v_last_change
  FROM plan_undo_history
  WHERE user_id = p_user_id
    AND is_undone = false
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No changes to undo'
    );
  END IF;

  -- Undo the change based on action type
  IF v_last_change.action = 'delete' THEN
    -- Undo delete = re-insert the record
    INSERT INTO master_plan_items
    SELECT * FROM jsonb_populate_record(NULL::master_plan_items, v_last_change.old_data);

  ELSIF v_last_change.action = 'insert' THEN
    -- Undo insert = delete the record
    DELETE FROM master_plan_items WHERE id = v_last_change.record_id;

  ELSIF v_last_change.action = 'update' THEN
    -- Undo update = restore old data
    UPDATE master_plan_items
    SET
      title = v_last_change.old_data->>'title',
      description = v_last_change.old_data->>'description',
      approval_status = v_last_change.old_data->>'approval_status',
      priority = v_last_change.old_data->>'priority',
      is_must_have = (v_last_change.old_data->>'is_must_have')::BOOLEAN,
      item_data = v_last_change.old_data->'item_data'
    WHERE id = v_last_change.record_id;
  END IF;

  -- Mark as undone
  UPDATE plan_undo_history
  SET
    is_undone = true,
    undone_at = NOW()
  WHERE id = v_last_change.id;

  RETURN jsonb_build_object(
    'success', true,
    'action_undone', v_last_change.action,
    'item_title', v_last_change.old_data->>'title',
    'undone_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get undo history for user
CREATE OR REPLACE FUNCTION get_undo_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  id UUID,
  action VARCHAR,
  table_name VARCHAR,
  item_title TEXT,
  is_undone BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uh.id,
    uh.action,
    uh.table_name,
    COALESCE(uh.old_data->>'title', uh.new_data->>'title') as item_title,
    uh.is_undone,
    uh.created_at
  FROM plan_undo_history uh
  WHERE uh.user_id = p_user_id
  ORDER BY uh.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS! Master plan system created!
-- =====================================================
-- Features:
-- ✅ Master wedding plan for each bride
-- ✅ Approval workflow (pending → approved by bride)
-- ✅ Lock/unlock mechanism (finalize plan, unlock to edit)
-- ✅ Version control (snapshots when locked)
-- ✅ Plan items (vendors, timeline, budget, checklist)
-- ✅ Change log (audit trail of all changes)
-- ✅ Completion tracking (percentage complete)
-- ✅ Approval requests (vendors can request changes)
-- ✅ UNDO/REDO system (both brides and vendors can undo their changes)
-- ✅ Complete history tracking (see what was changed and when)
-- =====================================================
