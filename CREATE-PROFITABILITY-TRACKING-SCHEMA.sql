-- =====================================================
-- PROFITABILITY TRACKING SYSTEM
-- =====================================================
-- Track revenue vs. costs per user
-- Calculate profit margins
-- Identify profitable vs. unprofitable users
-- Break-even analysis
-- =====================================================

-- =====================================================
-- USER REVENUE (What users pay YOU)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User
  user_id UUID NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- vendor, bride
  user_email VARCHAR(255),

  -- Revenue period
  revenue_month DATE NOT NULL, -- First day of month (e.g., 2025-01-01)

  -- Subscription revenue
  subscription_tier VARCHAR(50), -- free, premium, featured, elite
  subscription_mrr DECIMAL(10,2) DEFAULT 0.00, -- Monthly Recurring Revenue
  subscription_payments DECIMAL(10,2) DEFAULT 0.00, -- Actual payments received

  -- Commission revenue (for vendors)
  commission_collected DECIMAL(10,2) DEFAULT 0.00,
  bookings_count INTEGER DEFAULT 0,

  -- Other revenue
  one_time_fees DECIMAL(10,2) DEFAULT 0.00, -- Setup fees, etc.
  addon_revenue DECIMAL(10,2) DEFAULT 0.00, -- Extra features

  -- Total revenue
  total_revenue DECIMAL(10,2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, revenue_month)
);

-- =====================================================
-- USER COST ATTRIBUTION (What each user COSTS you)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_cost_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User
  user_id UUID NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- vendor, bride
  user_email VARCHAR(255),

  -- Cost period
  cost_month DATE NOT NULL, -- First day of month

  -- Storage costs
  storage_used_gb DECIMAL(10,4) DEFAULT 0.00,
  storage_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Email costs
  emails_sent INTEGER DEFAULT 0,
  email_cost DECIMAL(10,2) DEFAULT 0.00,

  -- AI costs
  ai_requests INTEGER DEFAULT 0,
  ai_tokens_used BIGINT DEFAULT 0,
  ai_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Database costs (estimated)
  api_calls INTEGER DEFAULT 0,
  database_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Bandwidth costs
  bandwidth_gb DECIMAL(10,4) DEFAULT 0.00,
  bandwidth_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Total cost for this user
  total_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, cost_month)
);

-- =====================================================
-- USER PROFITABILITY (Revenue - Cost = Profit)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User
  user_id UUID NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- vendor, bride
  user_email VARCHAR(255),
  user_name VARCHAR(255),

  -- Period
  month DATE NOT NULL, -- First day of month

  -- Revenue
  total_revenue DECIMAL(10,2) DEFAULT 0.00,

  -- Costs
  total_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Profit/Loss
  net_profit DECIMAL(10,2) DEFAULT 0.00, -- Revenue - Cost
  profit_margin DECIMAL(5,2) DEFAULT 0.00, -- (Profit / Revenue) * 100

  -- Status
  is_profitable BOOLEAN DEFAULT false,
  profitability_tier VARCHAR(50), -- highly_profitable, profitable, break_even, unprofitable, loss

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, month)
);

-- =====================================================
-- PLATFORM PROFITABILITY (Overall business health)
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_profitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Period
  month DATE NOT NULL UNIQUE, -- First day of month

  -- Users
  total_users INTEGER DEFAULT 0,
  paying_users INTEGER DEFAULT 0,
  free_users INTEGER DEFAULT 0,

  -- Revenue breakdown
  subscription_revenue DECIMAL(10,2) DEFAULT 0.00,
  commission_revenue DECIMAL(10,2) DEFAULT 0.00,
  other_revenue DECIMAL(10,2) DEFAULT 0.00,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,

  -- Cost breakdown
  storage_cost DECIMAL(10,2) DEFAULT 0.00,
  email_cost DECIMAL(10,2) DEFAULT 0.00,
  ai_cost DECIMAL(10,2) DEFAULT 0.00,
  database_cost DECIMAL(10,2) DEFAULT 0.00,
  bandwidth_cost DECIMAL(10,2) DEFAULT 0.00,
  total_variable_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Fixed costs (manual entry)
  fixed_costs DECIMAL(10,2) DEFAULT 0.00, -- Domain, SSL, etc.

  -- Totals
  total_cost DECIMAL(10,2) DEFAULT 0.00,
  net_profit DECIMAL(10,2) DEFAULT 0.00,
  profit_margin DECIMAL(5,2) DEFAULT 0.00,

  -- Metrics
  revenue_per_user DECIMAL(10,2) DEFAULT 0.00,
  cost_per_user DECIMAL(10,2) DEFAULT 0.00,
  profit_per_user DECIMAL(10,2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRICING TIERS (What you charge users)
-- =====================================================

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tier details
  tier_name VARCHAR(50) NOT NULL UNIQUE, -- free, premium, featured, elite
  user_type VARCHAR(50) NOT NULL, -- vendor, bride

  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2), -- If you offer annual plans

  -- Commission rates (for vendors)
  commission_rate DECIMAL(5,2) DEFAULT 0.00, -- e.g., 5.00 = 5%

  -- Limits
  storage_limit_gb INTEGER,
  email_limit INTEGER,
  ai_limit INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_revenue_month ON user_revenue_tracking(revenue_month DESC);
CREATE INDEX IF NOT EXISTS idx_user_revenue_user ON user_revenue_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_user_cost_month ON user_cost_attribution(cost_month DESC);
CREATE INDEX IF NOT EXISTS idx_user_cost_user ON user_cost_attribution(user_id);

CREATE INDEX IF NOT EXISTS idx_user_profitability_month ON user_profitability(month DESC);
CREATE INDEX IF NOT EXISTS idx_user_profitability_user ON user_profitability(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profitability_profitable ON user_profitability(is_profitable);

CREATE INDEX IF NOT EXISTS idx_platform_profitability_month ON platform_profitability(month DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cost_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_profitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Admins can view all profitability data
DROP POLICY IF EXISTS "Admins can view revenue" ON user_revenue_tracking;
CREATE POLICY "Admins can view revenue"
  ON user_revenue_tracking FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view costs" ON user_cost_attribution;
CREATE POLICY "Admins can view costs"
  ON user_cost_attribution FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view profitability" ON user_profitability;
CREATE POLICY "Admins can view profitability"
  ON user_profitability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view platform profitability" ON platform_profitability;
CREATE POLICY "Admins can view platform profitability"
  ON platform_profitability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can view pricing" ON pricing_tiers;
CREATE POLICY "Anyone can view pricing"
  ON pricing_tiers FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage pricing" ON pricing_tiers;
CREATE POLICY "Admins can manage pricing"
  ON pricing_tiers FOR ALL
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

CREATE TRIGGER update_user_revenue_tracking_updated_at
  BEFORE UPDATE ON user_revenue_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cost_attribution_updated_at
  BEFORE UPDATE ON user_cost_attribution
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profitability_updated_at
  BEFORE UPDATE ON user_profitability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_profitability_updated_at
  BEFORE UPDATE ON platform_profitability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Your Pricing)
-- =====================================================

INSERT INTO pricing_tiers (
  tier_name, user_type, monthly_price, commission_rate,
  storage_limit_gb, email_limit, ai_limit
) VALUES
  -- Vendor tiers
  ('free', 'vendor', 0.00, 10.00, 1, 50, 0),
  ('premium', 'vendor', 29.99, 7.00, 10, 500, 100),
  ('featured', 'vendor', 49.99, 5.00, 50, 1000, 300),
  ('elite', 'vendor', 99.99, 3.00, 100, 5000, 1000),

  -- Bride tiers
  ('free', 'bride', 0.00, 0.00, 1, 100, 0),
  ('premium', 'bride', 9.99, 0.00, 5, 500, 50)

ON CONFLICT (tier_name) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate user profitability for a month
CREATE OR REPLACE FUNCTION calculate_user_profitability(
  p_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE
) RETURNS void AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- For each user with revenue or cost this month
  FOR v_user IN
    SELECT DISTINCT
      COALESCE(r.user_id, c.user_id) as user_id,
      COALESCE(r.user_type, c.user_type) as user_type,
      COALESCE(r.user_email, c.user_email) as user_email
    FROM user_revenue_tracking r
    FULL OUTER JOIN user_cost_attribution c ON c.user_id = r.user_id AND c.cost_month = r.revenue_month
    WHERE COALESCE(r.revenue_month, c.cost_month) = p_month
  LOOP
    INSERT INTO user_profitability (
      user_id,
      user_type,
      user_email,
      month,
      total_revenue,
      total_cost,
      net_profit,
      profit_margin,
      is_profitable
    )
    SELECT
      v_user.user_id,
      v_user.user_type,
      v_user.user_email,
      p_month,
      COALESCE(r.total_revenue, 0.00) as total_revenue,
      COALESCE(c.total_cost, 0.00) as total_cost,
      COALESCE(r.total_revenue, 0.00) - COALESCE(c.total_cost, 0.00) as net_profit,
      CASE
        WHEN COALESCE(r.total_revenue, 0.00) > 0 THEN
          ((COALESCE(r.total_revenue, 0.00) - COALESCE(c.total_cost, 0.00)) / r.total_revenue * 100)
        ELSE 0
      END as profit_margin,
      (COALESCE(r.total_revenue, 0.00) - COALESCE(c.total_cost, 0.00)) > 0 as is_profitable
    FROM user_revenue_tracking r
    FULL OUTER JOIN user_cost_attribution c ON c.user_id = r.user_id AND c.cost_month = r.revenue_month
    WHERE v_user.user_id = COALESCE(r.user_id, c.user_id)
      AND COALESCE(r.revenue_month, c.cost_month) = p_month
    ON CONFLICT (user_id, month) DO UPDATE SET
      total_revenue = EXCLUDED.total_revenue,
      total_cost = EXCLUDED.total_cost,
      net_profit = EXCLUDED.net_profit,
      profit_margin = EXCLUDED.profit_margin,
      is_profitable = EXCLUDED.is_profitable;

    -- Set profitability tier
    UPDATE user_profitability
    SET profitability_tier = CASE
      WHEN net_profit > 20.00 THEN 'highly_profitable'
      WHEN net_profit > 5.00 THEN 'profitable'
      WHEN net_profit >= -1.00 THEN 'break_even'
      WHEN net_profit >= -10.00 THEN 'unprofitable'
      ELSE 'loss'
    END
    WHERE user_id = v_user.user_id AND month = p_month;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Calculate platform profitability
CREATE OR REPLACE FUNCTION calculate_platform_profitability(
  p_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE
) RETURNS void AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_total_cost DECIMAL(10,2);
  v_total_users INTEGER;
  v_paying_users INTEGER;
BEGIN
  -- Get totals
  SELECT
    COALESCE(SUM(total_revenue), 0.00),
    COUNT(DISTINCT user_id),
    COUNT(DISTINCT CASE WHEN total_revenue > 0 THEN user_id END)
  INTO v_total_revenue, v_total_users, v_paying_users
  FROM user_revenue_tracking
  WHERE revenue_month = p_month;

  SELECT COALESCE(SUM(total_cost), 0.00)
  INTO v_total_cost
  FROM user_cost_attribution
  WHERE cost_month = p_month;

  -- Insert or update platform profitability
  INSERT INTO platform_profitability (
    month,
    total_users,
    paying_users,
    free_users,
    total_revenue,
    total_variable_cost,
    total_cost,
    net_profit,
    profit_margin,
    revenue_per_user,
    cost_per_user,
    profit_per_user
  ) VALUES (
    p_month,
    v_total_users,
    v_paying_users,
    v_total_users - v_paying_users,
    v_total_revenue,
    v_total_cost,
    v_total_cost, -- Will add fixed costs manually
    v_total_revenue - v_total_cost,
    CASE WHEN v_total_revenue > 0 THEN ((v_total_revenue - v_total_cost) / v_total_revenue * 100) ELSE 0 END,
    CASE WHEN v_total_users > 0 THEN v_total_revenue / v_total_users ELSE 0 END,
    CASE WHEN v_total_users > 0 THEN v_total_cost / v_total_users ELSE 0 END,
    CASE WHEN v_total_users > 0 THEN (v_total_revenue - v_total_cost) / v_total_users ELSE 0 END
  )
  ON CONFLICT (month) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    paying_users = EXCLUDED.paying_users,
    free_users = EXCLUDED.free_users,
    total_revenue = EXCLUDED.total_revenue,
    total_variable_cost = EXCLUDED.total_variable_cost,
    total_cost = EXCLUDED.total_cost,
    net_profit = EXCLUDED.net_profit,
    profit_margin = EXCLUDED.profit_margin,
    revenue_per_user = EXCLUDED.revenue_per_user,
    cost_per_user = EXCLUDED.cost_per_user,
    profit_per_user = EXCLUDED.profit_per_user;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Most profitable users
CREATE OR REPLACE VIEW most_profitable_users AS
SELECT
  up.user_id,
  up.user_type,
  up.user_email,
  up.user_name,
  up.month,
  up.total_revenue,
  up.total_cost,
  up.net_profit,
  up.profit_margin,
  up.profitability_tier
FROM user_profitability up
WHERE up.month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
ORDER BY up.net_profit DESC
LIMIT 50;

-- Unprofitable users (losing you money)
CREATE OR REPLACE VIEW unprofitable_users AS
SELECT
  up.user_id,
  up.user_type,
  up.user_email,
  up.user_name,
  up.month,
  up.total_revenue,
  up.total_cost,
  up.net_profit,
  up.profit_margin,
  uca.storage_used_gb,
  uca.emails_sent,
  uca.ai_requests
FROM user_profitability up
LEFT JOIN user_cost_attribution uca ON uca.user_id = up.user_id AND uca.cost_month = up.month
WHERE up.is_profitable = false
  AND up.month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
ORDER BY up.net_profit ASC
LIMIT 50;

-- Monthly profitability trend
CREATE OR REPLACE VIEW monthly_profitability_trend AS
SELECT
  month,
  total_users,
  paying_users,
  free_users,
  total_revenue,
  total_cost,
  net_profit,
  profit_margin,
  revenue_per_user,
  cost_per_user,
  profit_per_user
FROM platform_profitability
ORDER BY month DESC;

-- Average cost per user type
CREATE OR REPLACE VIEW cost_per_user_type AS
SELECT
  user_type,
  DATE_TRUNC('month', cost_month) as month,
  COUNT(DISTINCT user_id) as user_count,
  AVG(storage_used_gb) as avg_storage_gb,
  AVG(emails_sent) as avg_emails,
  AVG(ai_requests) as avg_ai_requests,
  AVG(total_cost) as avg_cost_per_user,
  SUM(total_cost) as total_cost
FROM user_cost_attribution
WHERE cost_month >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY user_type, DATE_TRUNC('month', cost_month)
ORDER BY month DESC, user_type;

-- =====================================================
-- SUCCESS! Profitability tracking created!
-- =====================================================
-- Features:
-- ✅ Track revenue per user (what they pay you)
-- ✅ Track cost per user (what they cost you)
-- ✅ Calculate profit per user (revenue - cost)
-- ✅ Identify profitable vs unprofitable users
-- ✅ Platform-wide profitability metrics
-- ✅ Break-even analysis
-- ✅ Cost per user type (vendor vs bride)
-- ✅ Pricing tier management
-- =====================================================
