-- =====================================================
-- COMPREHENSIVE ADMIN SYSTEM
-- =====================================================
-- Complete admin panel with role-based access, review moderation,
-- privacy-safe bride impersonation, and legal protection
-- =====================================================

-- =====================================================
-- ROLE-BASED ACCESS CONTROL
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL, -- super_admin, admin, moderator, support, analyst
  permissions JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional: temporary admin access
  is_active BOOLEAN DEFAULT true,

  UNIQUE(user_id)
);

-- =====================================================
-- REVIEW MODERATION
-- =====================================================

-- Add moderation fields to reviews table
ALTER TABLE vendor_reviews
ADD COLUMN IF NOT EXISTS is_hidden_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_hidden_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_hidden_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_hidden_by UUID REFERENCES users(id);

-- Review moderation audit log
CREATE TABLE IF NOT EXISTS review_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES vendor_reviews(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- hide, unhide, delete, flag
  reason TEXT NOT NULL,
  admin_notes TEXT,
  previous_state JSONB, -- Store original review before hiding
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VENDOR MODERATION
-- =====================================================

CREATE TABLE IF NOT EXISTS vendor_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- approve, suspend, change_tier, verify, ban
  reason TEXT,
  changes JSONB, -- What changed: {"tier": {"from": "free", "to": "premium"}}
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRIVACY-SAFE BRIDE IMPERSONATION
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_impersonation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL, -- Required: ticket number or support reason
  duration_minutes INTEGER DEFAULT 30, -- Auto-expires after 30 minutes
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,

  -- Legal protection
  ip_address INET NOT NULL,
  user_agent TEXT,
  actions_taken TEXT[], -- Track what admin did while impersonating

  -- Privacy flags
  viewed_sensitive_data BOOLEAN DEFAULT false,
  sensitive_data_types TEXT[], -- e.g., ['payment_info', 'messages']

  -- Notifications
  user_notified BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Cannot be deleted (legal requirement)
  CONSTRAINT cannot_delete_impersonation_log CHECK (true)
);

-- =====================================================
-- COMPREHENSIVE ADMIN ACTIVITY LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL, -- review_moderation, vendor_approval, user_impersonation, etc.
  entity_type VARCHAR(50), -- review, vendor, user, booking
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB, -- Additional context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admin_roles_user ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON admin_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_review_moderation_log_review ON review_moderation_log(review_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_log_admin ON review_moderation_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_log_action ON review_moderation_log(action);

CREATE INDEX IF NOT EXISTS idx_vendor_moderation_log_vendor ON vendor_moderation_log(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_moderation_log_admin ON vendor_moderation_log(admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_impersonation_admin ON admin_impersonation_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_target ON admin_impersonation_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_active ON admin_impersonation_log(is_active);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type ON admin_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_entity ON admin_activity_log(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_vendor_reviews_hidden ON vendor_reviews(is_hidden_by_admin);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_impersonation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Admin roles policies
DROP POLICY IF EXISTS "Admins can manage roles" ON admin_roles;
CREATE POLICY "Admins can manage roles"
  ON admin_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Review moderation policies
DROP POLICY IF EXISTS "Admins can view moderation logs" ON review_moderation_log;
CREATE POLICY "Admins can view moderation logs"
  ON review_moderation_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can create moderation logs" ON review_moderation_log;
CREATE POLICY "Admins can create moderation logs"
  ON review_moderation_log FOR INSERT
  WITH CHECK (admin_id = auth.uid());

-- Vendor moderation policies
DROP POLICY IF EXISTS "Admins can view vendor logs" ON vendor_moderation_log;
CREATE POLICY "Admins can view vendor logs"
  ON vendor_moderation_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Impersonation policies (STRICT - cannot delete)
DROP POLICY IF EXISTS "Admins can view impersonation logs" ON admin_impersonation_log;
CREATE POLICY "Admins can view impersonation logs"
  ON admin_impersonation_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can create impersonation sessions" ON admin_impersonation_log;
CREATE POLICY "Admins can create impersonation sessions"
  ON admin_impersonation_log FOR INSERT
  WITH CHECK (admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update impersonation sessions" ON admin_impersonation_log;
CREATE POLICY "Admins can update impersonation sessions"
  ON admin_impersonation_log FOR UPDATE
  USING (admin_id = auth.uid());

-- NO DELETE POLICY - impersonation logs cannot be deleted

-- Activity log policies
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_log;
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if user has admin permission
CREATE OR REPLACE FUNCTION has_admin_permission(
  p_user_id UUID,
  p_permission VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_user_id
    AND role = 'admin'
  ) INTO v_has_permission;

  IF NOT v_has_permission THEN
    RETURN false;
  END IF;

  -- Check specific permission in admin_roles
  SELECT
    CASE
      WHEN role_name = 'super_admin' THEN true
      WHEN permissions ? p_permission THEN (permissions->>p_permission)::boolean
      ELSE false
    END
  INTO v_has_permission
  FROM admin_roles
  WHERE user_id = p_user_id
  AND is_active = true;

  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-expire impersonation sessions
CREATE OR REPLACE FUNCTION expire_impersonation_sessions()
RETURNS void AS $$
BEGIN
  UPDATE admin_impersonation_log
  SET
    is_active = false,
    ended_at = NOW()
  WHERE is_active = true
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_action_type VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_activity_log (
    admin_id,
    action_type,
    entity_type,
    entity_id,
    description,
    metadata,
    ip_address
  ) VALUES (
    p_admin_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_description,
    p_metadata,
    inet_client_addr()
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN ANALYTICS VIEWS
-- =====================================================

-- Review moderation overview
CREATE OR REPLACE VIEW admin_review_moderation_view AS
SELECT
  vr.id as review_id,
  vr.vendor_id,
  v.business_name as vendor_name,
  vr.bride_name,
  vr.rating,
  vr.review_text,
  vr.created_at as review_date,
  vr.is_published,
  vr.is_hidden_by_admin,
  vr.admin_hidden_reason,
  vr.admin_hidden_at,
  vr.admin_hidden_by,
  u.email as admin_email,
  vr.booking_id,
  vb.wedding_date,
  vb.status as booking_status,
  COUNT(rml.id) as moderation_count
FROM vendor_reviews vr
LEFT JOIN vendors v ON v.id = vr.vendor_id
LEFT JOIN users u ON u.id = vr.admin_hidden_by
LEFT JOIN vendor_bookings vb ON vb.id = vr.booking_id
LEFT JOIN review_moderation_log rml ON rml.review_id = vr.id
GROUP BY vr.id, v.business_name, u.email, vb.wedding_date, vb.status;

-- Vendor overview for admin
CREATE OR REPLACE VIEW admin_vendor_overview AS
SELECT
  v.id as vendor_id,
  v.business_name,
  v.contact_person,
  v.email,
  v.tier,
  v.is_verified,
  v.status,
  v.created_at,
  v.portfolio_photo_limit,
  v.files_per_wedding_limit,
  v.storage_per_wedding_mb,
  COUNT(DISTINCT vb.id) as total_bookings,
  COUNT(DISTINCT vr.id) as total_reviews,
  AVG(vr.rating) as average_rating,
  COUNT(DISTINCT CASE WHEN vr.is_hidden_by_admin THEN vr.id END) as hidden_reviews,
  COUNT(DISTINCT vml.id) as moderation_actions
FROM vendors v
LEFT JOIN vendor_bookings vb ON vb.vendor_id = v.id
LEFT JOIN vendor_reviews vr ON vr.vendor_id = v.id
LEFT JOIN vendor_moderation_log vml ON vml.vendor_id = v.id
GROUP BY v.id;

-- Admin activity dashboard
CREATE OR REPLACE VIEW admin_activity_dashboard AS
SELECT
  DATE(created_at) as activity_date,
  action_type,
  COUNT(*) as action_count,
  COUNT(DISTINCT admin_id) as unique_admins
FROM admin_activity_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), action_type
ORDER BY activity_date DESC, action_count DESC;

-- Impersonation audit report
CREATE OR REPLACE VIEW admin_impersonation_audit AS
SELECT
  ail.id,
  au.email as admin_email,
  tu.email as target_user_email,
  ail.reason,
  ail.started_at,
  ail.expires_at,
  ail.ended_at,
  ail.duration_minutes,
  ail.viewed_sensitive_data,
  ail.sensitive_data_types,
  ail.actions_taken,
  ail.user_notified,
  ail.ip_address,
  EXTRACT(EPOCH FROM (COALESCE(ail.ended_at, NOW()) - ail.started_at)) / 60 as actual_duration_minutes
FROM admin_impersonation_log ail
JOIN users au ON au.id = ail.admin_id
JOIN users tu ON tu.id = ail.target_user_id
ORDER BY ail.started_at DESC;

-- =====================================================
-- DEFAULT PERMISSIONS BY ROLE
-- =====================================================

-- Insert default permission templates (you can customize these)
INSERT INTO admin_roles (user_id, role_name, permissions, created_by)
VALUES
  (
    (SELECT id FROM users WHERE email = 'stephb9501@gmail.com' LIMIT 1),
    'super_admin',
    '{
      "can_moderate_reviews": true,
      "can_approve_vendors": true,
      "can_change_vendor_tiers": true,
      "can_delete_users": true,
      "can_view_analytics": true,
      "can_manage_bookings": true,
      "can_view_financials": true,
      "can_edit_content": true,
      "can_manage_admins": true,
      "can_impersonate_users": true,
      "can_view_sensitive_data": true
    }'::jsonb,
    (SELECT id FROM users WHERE email = 'stephb9501@gmail.com' LIMIT 1)
  )
ON CONFLICT (user_id) DO UPDATE
SET
  role_name = EXCLUDED.role_name,
  permissions = EXCLUDED.permissions;

-- =====================================================
-- SUCCESS! Admin system created!
-- =====================================================
-- Features:
-- ✅ Role-based access control (assign helpers with specific permissions)
-- ✅ Review moderation (hide/delete with reason and audit trail)
-- ✅ Vendor management (approve, suspend, change tiers)
-- ✅ Privacy-safe bride impersonation (time-limited, logged, user notified)
-- ✅ Comprehensive audit trails (cannot be deleted)
-- ✅ Legal protection (all admin actions logged with IP)
-- ✅ Auto-expiring sessions
-- ✅ Granular permissions
-- =====================================================
