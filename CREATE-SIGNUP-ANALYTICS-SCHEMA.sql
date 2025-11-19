-- =====================================================
-- SIGNUP ANALYTICS
-- =====================================================
-- Track new vendors (free vs. paid tiers) and new brides
-- Daily, weekly, monthly summaries
-- =====================================================

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Daily vendor signups by tier
CREATE OR REPLACE VIEW daily_vendor_signups AS
SELECT
  DATE(created_at) as signup_date,
  tier,
  COUNT(*) as signup_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
FROM vendors
GROUP BY DATE(created_at), tier
ORDER BY signup_date DESC, tier;

-- Weekly vendor signups
CREATE OR REPLACE VIEW weekly_vendor_signups AS
SELECT
  DATE_TRUNC('week', created_at) as week_start,
  tier,
  COUNT(*) as signup_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM vendors
GROUP BY DATE_TRUNC('week', created_at), tier
ORDER BY week_start DESC, tier;

-- Monthly vendor signups
CREATE OR REPLACE VIEW monthly_vendor_signups AS
SELECT
  DATE_TRUNC('month', created_at) as month_start,
  EXTRACT(YEAR FROM created_at) as year,
  EXTRACT(MONTH FROM created_at) as month,
  tier,
  COUNT(*) as signup_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN is_verified THEN 1 END) as verified_count
FROM vendors
GROUP BY DATE_TRUNC('month', created_at), EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at), tier
ORDER BY month_start DESC, tier;

-- Daily bride signups
CREATE OR REPLACE VIEW daily_bride_signups AS
SELECT
  DATE(created_at) as signup_date,
  COUNT(*) as bride_count,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paying_brides,
  COUNT(CASE WHEN subscription_status IS NULL OR subscription_status = 'free' THEN 1 END) as free_brides
FROM users
WHERE role = 'user' OR role IS NULL
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Weekly bride signups
CREATE OR REPLACE VIEW weekly_bride_signups AS
SELECT
  DATE_TRUNC('week', created_at) as week_start,
  COUNT(*) as bride_count,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paying_brides
FROM users
WHERE role = 'user' OR role IS NULL
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

-- Monthly bride signups
CREATE OR REPLACE VIEW monthly_bride_signups AS
SELECT
  DATE_TRUNC('month', created_at) as month_start,
  EXTRACT(YEAR FROM created_at) as year,
  EXTRACT(MONTH FROM created_at) as month,
  COUNT(*) as bride_count,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paying_brides,
  COUNT(CASE WHEN subscription_status IS NULL OR subscription_status = 'free' THEN 1 END) as free_brides
FROM users
WHERE role = 'user' OR role IS NULL
GROUP BY DATE_TRUNC('month', created_at), EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
ORDER BY month_start DESC;

-- =====================================================
-- COMPREHENSIVE SIGNUP SUMMARY
-- =====================================================

-- Overall signup summary
CREATE OR REPLACE VIEW signup_summary AS
WITH vendor_stats AS (
  SELECT
    COUNT(*) as total_vendors,
    COUNT(CASE WHEN tier = 'free' THEN 1 END) as free_vendors,
    COUNT(CASE WHEN tier = 'premium' THEN 1 END) as premium_vendors,
    COUNT(CASE WHEN tier = 'featured' THEN 1 END) as featured_vendors,
    COUNT(CASE WHEN tier = 'elite' THEN 1 END) as elite_vendors,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_vendors,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
  FROM vendors
),
bride_stats AS (
  SELECT
    COUNT(*) as total_brides,
    COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paying_brides,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
  FROM users
  WHERE role = 'user' OR role IS NULL
)
SELECT
  -- Vendors
  vs.total_vendors,
  vs.free_vendors,
  vs.premium_vendors,
  vs.featured_vendors,
  vs.elite_vendors,
  vs.active_vendors,
  vs.new_this_week as vendors_new_this_week,
  vs.new_this_month as vendors_new_this_month,

  -- Brides
  bs.total_brides,
  bs.paying_brides,
  bs.total_brides - bs.paying_brides as free_brides,
  bs.new_this_week as brides_new_this_week,
  bs.new_this_month as brides_new_this_month,

  -- Conversion rates
  ROUND((vs.premium_vendors + vs.featured_vendors + vs.elite_vendors)::NUMERIC / NULLIF(vs.total_vendors, 0) * 100, 2) as vendor_paid_conversion_rate,
  ROUND(bs.paying_brides::NUMERIC / NULLIF(bs.total_brides, 0) * 100, 2) as bride_paid_conversion_rate

FROM vendor_stats vs, bride_stats bs;

-- =====================================================
-- GROWTH METRICS
-- =====================================================

-- Month-over-month growth
CREATE OR REPLACE VIEW monthly_growth_metrics AS
WITH monthly_data AS (
  SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(CASE WHEN role != 'admin' THEN 1 END) as brides,
    0 as vendors
  FROM users
  GROUP BY DATE_TRUNC('month', created_at)

  UNION ALL

  SELECT
    DATE_TRUNC('month', created_at) as month,
    0 as brides,
    COUNT(*) as vendors
  FROM vendors
  GROUP BY DATE_TRUNC('month', created_at)
),
aggregated AS (
  SELECT
    month,
    SUM(brides) as total_brides,
    SUM(vendors) as total_vendors
  FROM monthly_data
  GROUP BY month
)
SELECT
  month,
  total_brides,
  total_vendors,
  total_brides + total_vendors as total_users,

  -- Growth rates
  total_brides - LAG(total_brides) OVER (ORDER BY month) as bride_growth,
  total_vendors - LAG(total_vendors) OVER (ORDER BY month) as vendor_growth,

  -- Percentage growth
  ROUND((total_brides - LAG(total_brides) OVER (ORDER BY month))::NUMERIC / NULLIF(LAG(total_brides) OVER (ORDER BY month), 0) * 100, 1) as bride_growth_pct,
  ROUND((total_vendors - LAG(total_vendors) OVER (ORDER BY month))::NUMERIC / NULLIF(LAG(total_vendors) OVER (ORDER BY month), 0) * 100, 1) as vendor_growth_pct

FROM aggregated
ORDER BY month DESC;

-- =====================================================
-- RECENT SIGNUPS (Last 30 days detail)
-- =====================================================

CREATE OR REPLACE VIEW recent_vendor_signups_detailed AS
SELECT
  id,
  business_name,
  category,
  tier,
  city,
  state,
  status,
  is_verified,
  created_at as signup_date,
  DATE_PART('day', NOW() - created_at) as days_since_signup
FROM vendors
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW recent_bride_signups_detailed AS
SELECT
  id,
  full_name,
  email,
  subscription_status,
  created_at as signup_date,
  DATE_PART('day', NOW() - created_at) as days_since_signup
FROM users
WHERE (role = 'user' OR role IS NULL)
  AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- =====================================================
-- CONVERSION FUNNEL
-- =====================================================

-- Vendor conversion funnel (free → paid tiers)
CREATE OR REPLACE VIEW vendor_conversion_funnel AS
WITH tier_changes AS (
  SELECT
    vendor_id,
    jsonb_extract_path_text(changes, 'tier', 'from') as from_tier,
    jsonb_extract_path_text(changes, 'tier', 'to') as to_tier,
    created_at as upgrade_date
  FROM vendor_moderation_log
  WHERE action = 'change_tier'
)
SELECT
  from_tier,
  to_tier,
  COUNT(*) as conversion_count,
  AVG(DATE_PART('day', upgrade_date - v.created_at)) as avg_days_to_upgrade
FROM tier_changes tc
JOIN vendors v ON v.id = tc.vendor_id
GROUP BY from_tier, to_tier
ORDER BY conversion_count DESC;

-- =====================================================
-- SUCCESS! Signup analytics created!
-- =====================================================
-- Features:
-- ✅ Daily/Weekly/Monthly vendor signups by tier
-- ✅ Daily/Weekly/Monthly bride signups
-- ✅ Free vs. paid breakdowns
-- ✅ New signups this week/month
-- ✅ Growth metrics (month-over-month)
-- ✅ Conversion funnels (free → paid)
-- ✅ Recent signup details
-- =====================================================
