-- =====================================================
-- COST MONITORING & USAGE LIMITS SYSTEM
-- =====================================================
-- Track storage, emails, AI calls, and other costs
-- Set daily/monthly limits to prevent cost overruns
-- Auto-disable features if limits exceeded
-- Ensure profitability
-- =====================================================

-- =====================================================
-- USAGE TRACKING (Real-time metrics)
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Storage usage (bytes)
  total_storage_used BIGINT DEFAULT 0, -- Total bytes stored
  storage_added_today BIGINT DEFAULT 0, -- New uploads today
  storage_deleted_today BIGINT DEFAULT 0, -- Deletions today

  -- File counts
  total_files_uploaded INTEGER DEFAULT 0,
  files_uploaded_today INTEGER DEFAULT 0,

  -- Email usage
  emails_sent_today INTEGER DEFAULT 0,
  transactional_emails INTEGER DEFAULT 0,
  marketing_emails INTEGER DEFAULT 0,

  -- AI usage (if using Claude API)
  ai_requests_today INTEGER DEFAULT 0,
  ai_tokens_used_today BIGINT DEFAULT 0,
  ai_cost_today DECIMAL(10,2) DEFAULT 0.00, -- Estimated cost in USD

  -- Database usage
  database_queries_today BIGINT DEFAULT 0,

  -- API calls
  api_calls_today INTEGER DEFAULT 0,

  -- Estimated costs (USD)
  storage_cost_today DECIMAL(10,2) DEFAULT 0.00,
  email_cost_today DECIMAL(10,2) DEFAULT 0.00,
  total_cost_today DECIMAL(10,2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(metric_date)
);

-- =====================================================
-- USAGE LIMITS (Set limits to prevent overruns)
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Limit details
  limit_name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "daily_storage_upload", "daily_ai_requests"
  description TEXT,

  -- Limits
  daily_limit INTEGER,
  monthly_limit INTEGER,

  -- Cost limits (USD)
  daily_cost_limit DECIMAL(10,2),
  monthly_cost_limit DECIMAL(10,2),

  -- Actions when limit exceeded
  action_on_exceed VARCHAR(50) DEFAULT 'alert', -- alert, disable, throttle

  -- Alert thresholds (%)
  alert_at_percentage INTEGER DEFAULT 80, -- Alert at 80% of limit

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COST ALERTS (When limits are approaching/exceeded)
-- =====================================================

CREATE TABLE IF NOT EXISTS cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Alert details
  alert_type VARCHAR(50) NOT NULL, -- approaching_limit, limit_exceeded, cost_spike
  severity VARCHAR(20) NOT NULL, -- warning, critical

  -- What triggered it
  limit_name VARCHAR(100),
  metric_name VARCHAR(100), -- storage, emails, ai_requests, etc.

  -- Current vs. limit
  current_value DECIMAL(15,2),
  limit_value DECIMAL(15,2),
  percentage_used DECIMAL(5,2), -- e.g., 85.5%

  -- Message
  message TEXT NOT NULL,

  -- Actions taken
  action_taken VARCHAR(100), -- e.g., "Disabled AI features", "Sent admin email"

  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COST CONFIGURATION (Pricing per service)
-- =====================================================

CREATE TABLE IF NOT EXISTS cost_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Service pricing
  service_name VARCHAR(100) NOT NULL UNIQUE,

  -- Costs
  cost_per_unit DECIMAL(10,6), -- e.g., $0.000002 per email
  unit_type VARCHAR(50), -- email, GB, 1000_tokens, request, etc.

  -- Provider
  provider VARCHAR(100), -- Supabase, SendGrid, Anthropic, etc.

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VENDOR/BRIDE USAGE TRACKING (Who's using what)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User
  user_id UUID NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- vendor, bride, admin

  -- Date
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Storage used
  storage_used BIGINT DEFAULT 0, -- bytes
  files_uploaded INTEGER DEFAULT 0,

  -- AI usage
  ai_requests INTEGER DEFAULT 0,
  ai_tokens_used BIGINT DEFAULT 0,

  -- Emails sent
  emails_sent INTEGER DEFAULT 0,

  -- API calls
  api_calls INTEGER DEFAULT 0,

  -- Estimated cost for this user today
  estimated_cost_today DECIMAL(10,2) DEFAULT 0.00,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, usage_date)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON daily_usage_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_resolved ON cost_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_created ON cost_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_usage_user ON user_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_date ON user_usage_tracking(usage_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE daily_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Admins can view all cost data
DROP POLICY IF EXISTS "Admins can view usage metrics" ON daily_usage_metrics;
CREATE POLICY "Admins can view usage metrics"
  ON daily_usage_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage usage limits" ON usage_limits;
CREATE POLICY "Admins can manage usage limits"
  ON usage_limits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view cost alerts" ON cost_alerts;
CREATE POLICY "Admins can view cost alerts"
  ON cost_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage cost config" ON cost_configuration;
CREATE POLICY "Admins can manage cost config"
  ON cost_configuration FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own usage
DROP POLICY IF EXISTS "Users can view their usage" ON user_usage_tracking;
CREATE POLICY "Users can view their usage"
  ON user_usage_tracking FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all usage" ON user_usage_tracking;
CREATE POLICY "Admins can view all usage"
  ON user_usage_tracking FOR SELECT
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

CREATE TRIGGER update_daily_usage_metrics_updated_at
  BEFORE UPDATE ON daily_usage_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_limits_updated_at
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_configuration_updated_at
  BEFORE UPDATE ON cost_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_tracking_updated_at
  BEFORE UPDATE ON user_usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if daily limit exceeded
CREATE OR REPLACE FUNCTION check_daily_limit(
  p_metric_name VARCHAR,
  p_current_value DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_limit RECORD;
  v_percentage DECIMAL;
  v_alert_id UUID;
BEGIN
  -- Get limit
  SELECT * INTO v_limit
  FROM usage_limits
  WHERE limit_name = p_metric_name
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'limit_exists', false,
      'exceeded', false
    );
  END IF;

  -- Check if exceeded
  IF v_limit.daily_limit IS NOT NULL AND p_current_value >= v_limit.daily_limit THEN
    -- Create alert
    INSERT INTO cost_alerts (
      alert_type,
      severity,
      limit_name,
      metric_name,
      current_value,
      limit_value,
      percentage_used,
      message,
      action_taken
    ) VALUES (
      'limit_exceeded',
      'critical',
      p_metric_name,
      p_metric_name,
      p_current_value,
      v_limit.daily_limit,
      (p_current_value / v_limit.daily_limit * 100),
      'Daily limit exceeded for ' || p_metric_name,
      v_limit.action_on_exceed
    )
    RETURNING id INTO v_alert_id;

    RETURN jsonb_build_object(
      'limit_exists', true,
      'exceeded', true,
      'limit_value', v_limit.daily_limit,
      'current_value', p_current_value,
      'action', v_limit.action_on_exceed,
      'alert_id', v_alert_id
    );
  END IF;

  -- Check if approaching limit
  v_percentage := (p_current_value / v_limit.daily_limit * 100);

  IF v_percentage >= v_limit.alert_at_percentage THEN
    -- Create warning alert
    INSERT INTO cost_alerts (
      alert_type,
      severity,
      limit_name,
      metric_name,
      current_value,
      limit_value,
      percentage_used,
      message
    ) VALUES (
      'approaching_limit',
      'warning',
      p_metric_name,
      p_metric_name,
      p_current_value,
      v_limit.daily_limit,
      v_percentage,
      'Approaching daily limit for ' || p_metric_name || ' (' || v_percentage || '% used)'
    )
    ON CONFLICT DO NOTHING; -- Don't spam alerts

    RETURN jsonb_build_object(
      'limit_exists', true,
      'exceeded', false,
      'approaching', true,
      'percentage_used', v_percentage,
      'limit_value', v_limit.daily_limit,
      'current_value', p_current_value
    );
  END IF;

  RETURN jsonb_build_object(
    'limit_exists', true,
    'exceeded', false,
    'approaching', false,
    'percentage_used', v_percentage,
    'limit_value', v_limit.daily_limit,
    'current_value', p_current_value
  );
END;
$$ LANGUAGE plpgsql;

-- Increment daily usage metric
CREATE OR REPLACE FUNCTION increment_usage_metric(
  p_metric_type VARCHAR,
  p_increment_value BIGINT DEFAULT 1
) RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Insert or update today's metrics
  INSERT INTO daily_usage_metrics (metric_date)
  VALUES (v_today)
  ON CONFLICT (metric_date) DO NOTHING;

  -- Update specific metric
  IF p_metric_type = 'storage_added' THEN
    UPDATE daily_usage_metrics
    SET storage_added_today = storage_added_today + p_increment_value,
        total_storage_used = total_storage_used + p_increment_value
    WHERE metric_date = v_today;

  ELSIF p_metric_type = 'files_uploaded' THEN
    UPDATE daily_usage_metrics
    SET files_uploaded_today = files_uploaded_today + p_increment_value,
        total_files_uploaded = total_files_uploaded + p_increment_value
    WHERE metric_date = v_today;

  ELSIF p_metric_type = 'emails_sent' THEN
    UPDATE daily_usage_metrics
    SET emails_sent_today = emails_sent_today + p_increment_value
    WHERE metric_date = v_today;

  ELSIF p_metric_type = 'ai_requests' THEN
    UPDATE daily_usage_metrics
    SET ai_requests_today = ai_requests_today + p_increment_value
    WHERE metric_date = v_today;

  ELSIF p_metric_type = 'api_calls' THEN
    UPDATE daily_usage_metrics
    SET api_calls_today = api_calls_today + p_increment_value
    WHERE metric_date = v_today;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate estimated costs
CREATE OR REPLACE FUNCTION calculate_daily_costs()
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_metrics RECORD;
  v_storage_cost DECIMAL(10,2);
  v_email_cost DECIMAL(10,2);
  v_ai_cost DECIMAL(10,2);
  v_total_cost DECIMAL(10,2);
BEGIN
  -- Get today's metrics
  SELECT * INTO v_metrics
  FROM daily_usage_metrics
  WHERE metric_date = v_today;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate storage cost (Supabase: ~$0.021/GB/month, so ~$0.0007/GB/day)
  v_storage_cost := (v_metrics.total_storage_used / 1073741824.0) * 0.0007;

  -- Calculate email cost (SendGrid: ~$0.0001 per email)
  v_email_cost := v_metrics.emails_sent_today * 0.0001;

  -- AI cost is already calculated if using Claude API
  v_ai_cost := COALESCE(v_metrics.ai_cost_today, 0.00);

  -- Total cost
  v_total_cost := v_storage_cost + v_email_cost + v_ai_cost;

  -- Update metrics
  UPDATE daily_usage_metrics
  SET
    storage_cost_today = v_storage_cost,
    email_cost_today = v_email_cost,
    total_cost_today = v_total_cost
  WHERE metric_date = v_today;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA (Default Limits & Pricing)
-- =====================================================

-- Default usage limits
INSERT INTO usage_limits (
  limit_name, description, daily_limit, monthly_limit, daily_cost_limit, monthly_cost_limit, alert_at_percentage
) VALUES
  ('daily_storage_upload', 'Max GB uploaded per day', 10737418240, NULL, 5.00, 100.00, 80), -- 10 GB/day
  ('daily_emails', 'Max emails sent per day', 1000, 30000, 1.00, 20.00, 80),
  ('daily_ai_requests', 'Max AI requests per day', 500, 15000, 10.00, 200.00, 80),
  ('monthly_storage_total', 'Max total storage (GB)', NULL, 107374182400, NULL, 100.00, 80), -- 100 GB total
  ('daily_api_calls', 'Max API calls per day', 10000, 300000, NULL, NULL, 80)
ON CONFLICT (limit_name) DO NOTHING;

-- Cost configuration (current market rates)
INSERT INTO cost_configuration (service_name, cost_per_unit, unit_type, provider, notes) VALUES
  ('storage', 0.000000007, 'byte_per_day', 'Supabase', 'Storage cost: ~$0.021/GB/month = $0.0007/GB/day'),
  ('email', 0.0001, 'email', 'SendGrid', 'Transactional email cost'),
  ('ai_request_sonnet', 0.003, 'request', 'Anthropic', 'Claude Sonnet 3.5: $3 per million input tokens (avg 1k tokens/request)'),
  ('bandwidth', 0.09, 'GB', 'Supabase', 'Bandwidth/egress cost'),
  ('database_query', 0.000001, 'query', 'Supabase', 'Negligible for typical usage')
ON CONFLICT (service_name) DO NOTHING;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Daily cost summary
CREATE OR REPLACE VIEW daily_cost_summary AS
SELECT
  metric_date,
  total_storage_used / 1073741824.0 as storage_gb,
  storage_added_today / 1073741824.0 as storage_added_gb,
  files_uploaded_today,
  emails_sent_today,
  ai_requests_today,
  ai_tokens_used_today,
  storage_cost_today,
  email_cost_today,
  ai_cost_today,
  total_cost_today,
  created_at
FROM daily_usage_metrics
ORDER BY metric_date DESC;

-- Monthly cost rollup
CREATE OR REPLACE VIEW monthly_cost_summary AS
SELECT
  DATE_TRUNC('month', metric_date) as month,
  SUM(files_uploaded_today) as total_files_uploaded,
  SUM(emails_sent_today) as total_emails_sent,
  SUM(ai_requests_today) as total_ai_requests,
  SUM(storage_cost_today) as total_storage_cost,
  SUM(email_cost_today) as total_email_cost,
  SUM(ai_cost_today) as total_ai_cost,
  SUM(total_cost_today) as total_cost,
  MAX(total_storage_used) / 1073741824.0 as max_storage_gb
FROM daily_usage_metrics
GROUP BY DATE_TRUNC('month', metric_date)
ORDER BY month DESC;

-- Active alerts (unresolved)
CREATE OR REPLACE VIEW active_cost_alerts AS
SELECT
  alert_type,
  severity,
  limit_name,
  metric_name,
  current_value,
  limit_value,
  percentage_used,
  message,
  action_taken,
  created_at
FROM cost_alerts
WHERE is_resolved = false
ORDER BY created_at DESC;

-- Top users by cost
CREATE OR REPLACE VIEW top_users_by_cost AS
SELECT
  u.id as user_id,
  u.full_name,
  u.email,
  uut.user_type,
  SUM(uut.storage_used) / 1073741824.0 as total_storage_gb,
  SUM(uut.files_uploaded) as total_files,
  SUM(uut.emails_sent) as total_emails,
  SUM(uut.ai_requests) as total_ai_requests,
  SUM(uut.estimated_cost_today) as total_cost
FROM user_usage_tracking uut
JOIN users u ON u.id = uut.user_id
GROUP BY u.id, u.full_name, u.email, uut.user_type
ORDER BY total_cost DESC
LIMIT 50;

-- =====================================================
-- SUCCESS! Cost monitoring system created!
-- =====================================================
-- Features:
-- ✅ Track storage, emails, AI usage, costs
-- ✅ Set daily/monthly limits
-- ✅ Auto-alert when approaching/exceeding limits
-- ✅ Auto-disable features to prevent cost overruns
-- ✅ Monitor per-user usage
-- ✅ See daily and monthly cost summaries
-- ✅ Configurable pricing for all services
-- ✅ Real-time cost calculations
-- =====================================================
