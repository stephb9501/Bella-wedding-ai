-- =====================================================
-- DEPENDENCY & SERVICE UPDATE MONITORING SYSTEM
-- =====================================================
-- Track all external services and dependencies
-- Get notified when updates are available
-- Track security vulnerabilities
-- Monitor API versions
-- =====================================================

-- =====================================================
-- EXTERNAL SERVICES (Third-party providers)
-- =====================================================

CREATE TABLE IF NOT EXISTS external_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Service details
  service_name VARCHAR(100) NOT NULL UNIQUE, -- Supabase, SendGrid, Anthropic, Stripe, etc.
  service_category VARCHAR(50) NOT NULL, -- database, email, ai, payment, storage, etc.
  provider VARCHAR(100) NOT NULL, -- Supabase Inc., Twilio (SendGrid), Anthropic, etc.

  -- Current version in use
  current_version VARCHAR(50), -- e.g., "2.38.0"
  current_api_version VARCHAR(50), -- e.g., "v1", "2023-10-01"

  -- Latest available version
  latest_version VARCHAR(50),
  latest_api_version VARCHAR(50),

  -- Status
  update_available BOOLEAN DEFAULT false,
  update_priority VARCHAR(20), -- low, medium, high, critical
  update_type VARCHAR(50), -- feature, security_patch, breaking_change, deprecation

  -- Links
  documentation_url TEXT,
  changelog_url TEXT,
  status_page_url TEXT,

  -- Notifications
  last_checked TIMESTAMPTZ,
  next_check TIMESTAMPTZ,
  notify_on_update BOOLEAN DEFAULT true,

  -- Cost
  current_plan VARCHAR(100), -- Free, Pro, Enterprise, etc.
  monthly_cost DECIMAL(10,2),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NPM PACKAGES (Frontend dependencies)
-- =====================================================

CREATE TABLE IF NOT EXISTS npm_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Package details
  package_name VARCHAR(200) NOT NULL, -- @supabase/auth-helpers-nextjs, next, react, etc.
  package_type VARCHAR(50) NOT NULL, -- dependency, devDependency

  -- Versions
  current_version VARCHAR(50) NOT NULL,
  latest_version VARCHAR(50),
  latest_stable_version VARCHAR(50),

  -- Update info
  update_available BOOLEAN DEFAULT false,
  version_diff VARCHAR(20), -- major, minor, patch
  breaking_changes BOOLEAN DEFAULT false,

  -- Security
  has_vulnerability BOOLEAN DEFAULT false,
  vulnerability_severity VARCHAR(20), -- low, moderate, high, critical
  vulnerability_count INTEGER DEFAULT 0,

  -- Links
  npm_url TEXT,
  github_url TEXT,
  changelog_url TEXT,

  -- Usage
  is_critical BOOLEAN DEFAULT false, -- Critical to app functionality
  last_updated TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(package_name)
);

-- =====================================================
-- UPDATE NOTIFICATIONS (When updates are available)
-- =====================================================

CREATE TABLE IF NOT EXISTS update_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What needs updating
  update_type VARCHAR(50) NOT NULL, -- service, npm_package, api_version
  service_id UUID REFERENCES external_services(id),
  package_name VARCHAR(200),

  -- Update details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL, -- info, warning, critical

  -- Version info
  current_version VARCHAR(50),
  new_version VARCHAR(50),

  -- Update type
  is_security_update BOOLEAN DEFAULT false,
  is_breaking_change BOOLEAN DEFAULT false,
  requires_action BOOLEAN DEFAULT false,

  -- Actions to take
  action_required TEXT, -- "Update package.json and run npm install"
  migration_guide_url TEXT,

  -- Status
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,

  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECURITY VULNERABILITIES (CVEs, npm audit)
-- =====================================================

CREATE TABLE IF NOT EXISTS security_vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vulnerability details
  cve_id VARCHAR(50), -- CVE-2024-12345
  vulnerability_title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Affected package/service
  affected_package VARCHAR(200),
  affected_service VARCHAR(100),
  affected_versions TEXT, -- ">=1.0.0 <2.5.3"

  -- Severity
  severity VARCHAR(20) NOT NULL, -- low, moderate, high, critical
  cvss_score DECIMAL(3,1), -- 0.0 to 10.0

  -- Fix
  fixed_in_version VARCHAR(50),
  patch_available BOOLEAN DEFAULT false,
  workaround TEXT,

  -- Status
  is_patched BOOLEAN DEFAULT false,
  patched_at TIMESTAMPTZ,
  patched_by UUID REFERENCES users(id),

  -- Links
  cve_url TEXT,
  advisory_url TEXT,

  -- Metadata
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- API VERSION CHANGES (Track API deprecations)
-- =====================================================

CREATE TABLE IF NOT EXISTS api_version_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Service
  service_name VARCHAR(100) NOT NULL,

  -- Version change
  old_version VARCHAR(50),
  new_version VARCHAR(50) NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- deprecation, new_version, breaking_change

  -- Timeline
  announced_at TIMESTAMPTZ,
  effective_date DATE, -- When old version stops working
  sunset_date DATE, -- Final deadline

  -- Details
  change_description TEXT,
  breaking_changes TEXT,
  migration_guide_url TEXT,

  -- Status
  is_migrated BOOLEAN DEFAULT false,
  migrated_at TIMESTAMPTZ,
  migrated_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_external_services_update_available ON external_services(update_available);
CREATE INDEX IF NOT EXISTS idx_external_services_category ON external_services(service_category);

CREATE INDEX IF NOT EXISTS idx_npm_packages_update_available ON npm_packages(update_available);
CREATE INDEX IF NOT EXISTS idx_npm_packages_vulnerability ON npm_packages(has_vulnerability);

CREATE INDEX IF NOT EXISTS idx_update_notifications_resolved ON update_notifications(is_resolved);
CREATE INDEX IF NOT EXISTS idx_update_notifications_severity ON update_notifications(severity);

CREATE INDEX IF NOT EXISTS idx_security_vulnerabilities_patched ON security_vulnerabilities(is_patched);
CREATE INDEX IF NOT EXISTS idx_security_vulnerabilities_severity ON security_vulnerabilities(severity);

CREATE INDEX IF NOT EXISTS idx_api_version_changes_migrated ON api_version_changes(is_migrated);
CREATE INDEX IF NOT EXISTS idx_api_version_changes_effective_date ON api_version_changes(effective_date);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE external_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE npm_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_version_changes ENABLE ROW LEVEL SECURITY;

-- Admins can view all dependency data
DROP POLICY IF EXISTS "Admins can view services" ON external_services;
CREATE POLICY "Admins can view services"
  ON external_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage services" ON external_services;
CREATE POLICY "Admins can manage services"
  ON external_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view packages" ON npm_packages;
CREATE POLICY "Admins can view packages"
  ON npm_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view notifications" ON update_notifications;
CREATE POLICY "Admins can view notifications"
  ON update_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view vulnerabilities" ON security_vulnerabilities;
CREATE POLICY "Admins can view vulnerabilities"
  ON security_vulnerabilities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view API changes" ON api_version_changes;
CREATE POLICY "Admins can view API changes"
  ON api_version_changes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_external_services_updated_at
  BEFORE UPDATE ON external_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_npm_packages_updated_at
  BEFORE UPDATE ON npm_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_vulnerabilities_updated_at
  BEFORE UPDATE ON security_vulnerabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_version_changes_updated_at
  BEFORE UPDATE ON api_version_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Your Current Stack)
-- =====================================================

-- External services you're using
INSERT INTO external_services (
  service_name, service_category, provider, current_version, current_api_version,
  documentation_url, changelog_url, status_page_url, current_plan, monthly_cost, notify_on_update
) VALUES
  ('Supabase', 'database', 'Supabase Inc.', '2.38.0', 'v1',
   'https://supabase.com/docs', 'https://github.com/supabase/supabase/releases', 'https://status.supabase.com',
   'Free', 0.00, true),

  ('SendGrid', 'email', 'Twilio Inc.', 'v3', 'v3',
   'https://docs.sendgrid.com', 'https://sendgrid.com/changelog', 'https://status.sendgrid.com',
   'Free', 0.00, true),

  ('Anthropic Claude', 'ai', 'Anthropic', '3.5', '2023-06-01',
   'https://docs.anthropic.com', 'https://docs.anthropic.com/claude/changelog', 'https://status.anthropic.com',
   'Pay-as-you-go', 10.00, true),

  ('Vercel', 'hosting', 'Vercel Inc.', 'latest', 'latest',
   'https://vercel.com/docs', 'https://vercel.com/changelog', 'https://www.vercel-status.com',
   'Hobby', 0.00, true),

  ('Stripe', 'payment', 'Stripe Inc.', 'latest', '2023-10-16',
   'https://stripe.com/docs', 'https://stripe.com/docs/upgrades', 'https://status.stripe.com',
   'Not configured', 0.00, false)

ON CONFLICT (service_name) DO NOTHING;

-- Critical npm packages
INSERT INTO npm_packages (
  package_name, package_type, current_version, is_critical
) VALUES
  ('next', 'dependency', '14.0.0', true),
  ('react', 'dependency', '18.2.0', true),
  ('react-dom', 'dependency', '18.2.0', true),
  ('@supabase/auth-helpers-nextjs', 'dependency', '0.8.0', true),
  ('@supabase/supabase-js', 'dependency', '2.38.0', true),
  ('typescript', 'devDependency', '5.2.2', true)
ON CONFLICT (package_name) DO NOTHING;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Services needing updates
CREATE OR REPLACE VIEW services_needing_updates AS
SELECT
  service_name,
  service_category,
  current_version,
  latest_version,
  update_priority,
  update_type,
  documentation_url,
  changelog_url
FROM external_services
WHERE update_available = true
ORDER BY
  CASE update_priority
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
    ELSE 5
  END,
  service_name;

-- Packages with vulnerabilities
CREATE OR REPLACE VIEW vulnerable_packages AS
SELECT
  package_name,
  current_version,
  latest_version,
  vulnerability_severity,
  vulnerability_count,
  is_critical,
  npm_url
FROM npm_packages
WHERE has_vulnerability = true
ORDER BY
  CASE vulnerability_severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'moderate' THEN 3
    WHEN 'low' THEN 4
    ELSE 5
  END,
  vulnerability_count DESC;

-- Active update notifications
CREATE OR REPLACE VIEW active_update_notifications AS
SELECT
  update_type,
  title,
  description,
  severity,
  current_version,
  new_version,
  is_security_update,
  is_breaking_change,
  requires_action,
  action_required,
  created_at
FROM update_notifications
WHERE is_resolved = false
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'warning' THEN 2
    WHEN 'info' THEN 3
    ELSE 4
  END,
  created_at DESC;

-- Upcoming API deprecations
CREATE OR REPLACE VIEW upcoming_api_deprecations AS
SELECT
  service_name,
  old_version,
  new_version,
  change_type,
  effective_date,
  sunset_date,
  DATE_PART('day', effective_date - CURRENT_DATE) as days_until_effective,
  change_description,
  migration_guide_url,
  is_migrated
FROM api_version_changes
WHERE is_migrated = false
  AND (effective_date >= CURRENT_DATE OR sunset_date >= CURRENT_DATE)
ORDER BY effective_date ASC;

-- Security summary
CREATE OR REPLACE VIEW security_summary AS
SELECT
  COUNT(*) as total_vulnerabilities,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_count,
  COUNT(CASE WHEN severity = 'moderate' THEN 1 END) as moderate_count,
  COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_count,
  COUNT(CASE WHEN is_patched = false THEN 1 END) as unpatched_count
FROM security_vulnerabilities;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check for service updates (manual trigger)
CREATE OR REPLACE FUNCTION check_service_updates()
RETURNS TABLE (
  service_name VARCHAR,
  current_version VARCHAR,
  latest_version VARCHAR,
  update_available BOOLEAN
) AS $$
BEGIN
  -- This would call external APIs to check for updates
  -- For now, it returns current data
  RETURN QUERY
  SELECT
    es.service_name,
    es.current_version,
    es.latest_version,
    es.update_available
  FROM external_services es
  WHERE es.notify_on_update = true;
END;
$$ LANGUAGE plpgsql;

-- Mark update as resolved
CREATE OR REPLACE FUNCTION resolve_update_notification(
  p_notification_id UUID,
  p_user_id UUID,
  p_resolution_notes TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE update_notifications
  SET
    is_resolved = true,
    resolved_at = NOW(),
    resolved_by = p_user_id,
    resolution_notes = p_resolution_notes
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Mark vulnerability as patched
CREATE OR REPLACE FUNCTION mark_vulnerability_patched(
  p_vulnerability_id UUID,
  p_user_id UUID
) RETURNS void AS $$
BEGIN
  UPDATE security_vulnerabilities
  SET
    is_patched = true,
    patched_at = NOW(),
    patched_by = p_user_id
  WHERE id = p_vulnerability_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS! Dependency monitoring system created!
-- =====================================================
-- Features:
-- ✅ Track all external services (Supabase, SendGrid, Claude, etc.)
-- ✅ Monitor npm packages for updates
-- ✅ Track security vulnerabilities (CVEs)
-- ✅ Monitor API version changes and deprecations
-- ✅ Get notified when updates are available
-- ✅ Prioritize critical updates
-- ✅ Track what versions you're using
-- ✅ Monitor service costs
-- =====================================================
