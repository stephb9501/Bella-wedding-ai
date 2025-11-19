-- =====================================================
-- SALES TAX TRACKING SYSTEM
-- =====================================================
-- For Arkansas and multi-state compliance
-- Monthly sales tax reports for Arkansas DFA
-- =====================================================

-- Sales tax rates by state/county
CREATE TABLE IF NOT EXISTS sales_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(2) NOT NULL, -- AR, TX, CA, etc.
  county VARCHAR(100),
  city VARCHAR(100),

  -- Tax rates (as percentages)
  state_rate DECIMAL(5,3) NOT NULL, -- e.g., 6.500 for Arkansas
  county_rate DECIMAL(5,3) DEFAULT 0.000,
  city_rate DECIMAL(5,3) DEFAULT 0.000,
  special_district_rate DECIMAL(5,3) DEFAULT 0.000,
  total_rate DECIMAL(5,3) NOT NULL,

  -- Effective dates
  effective_from DATE NOT NULL,
  effective_to DATE,

  -- What's taxable
  digital_services_taxable BOOLEAN DEFAULT true,
  saas_taxable BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(state, county, city, effective_from)
);

-- Sales tax collected on transactions
CREATE TABLE IF NOT EXISTS sales_tax_collected (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Transaction reference
  transaction_id UUID REFERENCES platform_transactions(id) ON DELETE CASCADE,
  subscription_payment_id UUID REFERENCES subscription_payments(id) ON DELETE CASCADE,

  -- Tax jurisdiction
  state VARCHAR(2) NOT NULL,
  county VARCHAR(100),
  city VARCHAR(100),

  -- Amounts (in cents)
  taxable_amount_cents BIGINT NOT NULL, -- What tax is calculated on
  state_tax_cents BIGINT NOT NULL,
  county_tax_cents BIGINT DEFAULT 0,
  city_tax_cents BIGINT DEFAULT 0,
  special_district_tax_cents BIGINT DEFAULT 0,
  total_tax_cents BIGINT NOT NULL,

  -- Tax rates used
  state_rate DECIMAL(5,3) NOT NULL,
  county_rate DECIMAL(5,3) DEFAULT 0.000,
  city_rate DECIMAL(5,3) DEFAULT 0.000,
  total_rate DECIMAL(5,3) NOT NULL,

  -- Customer info
  customer_id UUID, -- Vendor who paid
  customer_address TEXT,
  customer_zip VARCHAR(10),

  -- Reporting periods
  tax_year INTEGER NOT NULL,
  tax_month INTEGER NOT NULL, -- 1-12
  tax_quarter INTEGER NOT NULL, -- 1-4

  -- Payment tracking
  remitted_to_state BOOLEAN DEFAULT false,
  remitted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sales_tax_rates_state ON sales_tax_rates(state);
CREATE INDEX IF NOT EXISTS idx_sales_tax_rates_effective ON sales_tax_rates(effective_from, effective_to);

CREATE INDEX IF NOT EXISTS idx_sales_tax_collected_state ON sales_tax_collected(state);
CREATE INDEX IF NOT EXISTS idx_sales_tax_collected_period ON sales_tax_collected(tax_year, tax_month);
CREATE INDEX IF NOT EXISTS idx_sales_tax_collected_remitted ON sales_tax_collected(remitted_to_state);
CREATE INDEX IF NOT EXISTS idx_sales_tax_collected_transaction ON sales_tax_collected(transaction_id);
CREATE INDEX IF NOT EXISTS idx_sales_tax_collected_subscription ON sales_tax_collected(subscription_payment_id);

-- RLS
ALTER TABLE sales_tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_tax_collected ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage tax rates" ON sales_tax_rates;
CREATE POLICY "Admins can manage tax rates"
  ON sales_tax_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view tax collected" ON sales_tax_collected;
CREATE POLICY "Admins can view tax collected"
  ON sales_tax_collected FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- ARKANSAS TAX RATES (Stone County)
-- =====================================================

-- Arkansas state + Stone County rates
INSERT INTO sales_tax_rates (
  state, county, city,
  state_rate, county_rate, total_rate,
  digital_services_taxable, saas_taxable,
  effective_from
) VALUES
  -- Stone County - Mountain View (example)
  ('AR', 'Stone County', 'Mountain View', 6.500, 2.000, 8.500, true, true, '2024-01-01'),

  -- Stone County - Other areas (adjust as needed)
  ('AR', 'Stone County', NULL, 6.500, 1.500, 8.000, true, true, '2024-01-01'),

  -- Out of state - no tax collected (unless nexus)
  ('TX', NULL, NULL, 0.000, 0.000, 0.000, false, false, '2024-01-01'),
  ('CA', NULL, NULL, 0.000, 0.000, 0.000, false, false, '2024-01-01')
ON CONFLICT (state, county, city, effective_from) DO NOTHING;

-- =====================================================
-- MONTHLY SALES TAX REPORTS
-- =====================================================

-- Arkansas monthly sales tax report
CREATE OR REPLACE VIEW arkansas_monthly_sales_tax AS
SELECT
  tax_year,
  tax_month,
  state,
  county,
  city,
  COUNT(*) as transaction_count,

  -- Gross sales (what tax was calculated on)
  SUM(taxable_amount_cents) / 100.0 as gross_taxable_sales_usd,

  -- Tax collected
  SUM(state_tax_cents) / 100.0 as state_tax_collected_usd,
  SUM(county_tax_cents) / 100.0 as county_tax_collected_usd,
  SUM(city_tax_cents) / 100.0 as city_tax_collected_usd,
  SUM(total_tax_cents) / 100.0 as total_tax_collected_usd,

  -- Remitted status
  COUNT(CASE WHEN remitted_to_state THEN 1 END) as remitted_count,
  COUNT(CASE WHEN NOT remitted_to_state THEN 1 END) as unremitted_count

FROM sales_tax_collected
WHERE state = 'AR'
GROUP BY tax_year, tax_month, state, county, city
ORDER BY tax_year DESC, tax_month DESC;

-- All states monthly summary
CREATE OR REPLACE VIEW all_states_monthly_sales_tax AS
SELECT
  tax_year,
  tax_month,
  state,
  COUNT(*) as transaction_count,
  SUM(taxable_amount_cents) / 100.0 as gross_sales_usd,
  SUM(total_tax_cents) / 100.0 as total_tax_collected_usd,
  COUNT(CASE WHEN remitted_to_state THEN 1 END) as remitted_transactions,
  SUM(CASE WHEN remitted_to_state THEN total_tax_cents ELSE 0 END) / 100.0 as remitted_amount_usd,
  SUM(CASE WHEN NOT remitted_to_state THEN total_tax_cents ELSE 0 END) / 100.0 as owed_amount_usd
FROM sales_tax_collected
GROUP BY tax_year, tax_month, state
ORDER BY tax_year DESC, tax_month DESC, state;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get applicable tax rate for a location
CREATE OR REPLACE FUNCTION get_sales_tax_rate(
  p_state VARCHAR,
  p_county VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL AS $$
DECLARE
  v_rate DECIMAL;
BEGIN
  -- Try to find most specific match first (city → county → state)
  SELECT total_rate INTO v_rate
  FROM sales_tax_rates
  WHERE state = p_state
    AND (county = p_county OR (p_county IS NULL AND county IS NULL))
    AND (city = p_city OR (p_city IS NULL AND city IS NULL))
    AND effective_from <= p_date
    AND (effective_to IS NULL OR effective_to >= p_date)
  ORDER BY
    CASE WHEN city IS NOT NULL THEN 3
         WHEN county IS NOT NULL THEN 2
         ELSE 1 END DESC
  LIMIT 1;

  RETURN COALESCE(v_rate, 0.000);
END;
$$ LANGUAGE plpgsql;

-- Calculate and record sales tax
CREATE OR REPLACE FUNCTION record_sales_tax(
  p_transaction_type VARCHAR, -- 'subscription' or 'commission'
  p_transaction_id UUID,
  p_subscription_payment_id UUID DEFAULT NULL,
  p_vendor_id UUID,
  p_taxable_amount_cents BIGINT
) RETURNS UUID AS $$
DECLARE
  v_tax_id UUID;
  v_vendor_state VARCHAR(2);
  v_vendor_county VARCHAR(100);
  v_vendor_city VARCHAR(100);
  v_vendor_zip VARCHAR(10);
  v_total_rate DECIMAL;
  v_state_rate DECIMAL;
  v_county_rate DECIMAL;
  v_total_tax_cents BIGINT;
  v_state_tax_cents BIGINT;
  v_county_tax_cents BIGINT;
BEGIN
  -- Get vendor location
  SELECT state, county, city, zip
  INTO v_vendor_state, v_vendor_county, v_vendor_city, v_vendor_zip
  FROM vendors
  WHERE id = p_vendor_id;

  -- Get tax rates
  SELECT total_rate, state_rate, county_rate
  INTO v_total_rate, v_state_rate, v_county_rate
  FROM sales_tax_rates
  WHERE state = v_vendor_state
    AND (county = v_vendor_county OR (v_vendor_county IS NULL AND county IS NULL))
    AND (city = v_vendor_city OR (v_vendor_city IS NULL AND city IS NULL))
    AND effective_from <= CURRENT_DATE
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    AND saas_taxable = true
  ORDER BY
    CASE WHEN city IS NOT NULL THEN 3
         WHEN county IS NOT NULL THEN 2
         ELSE 1 END DESC
  LIMIT 1;

  -- If no tax rate found, return NULL (no tax)
  IF v_total_rate IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate tax amounts
  v_total_tax_cents := (p_taxable_amount_cents * v_total_rate / 100.0)::BIGINT;
  v_state_tax_cents := (p_taxable_amount_cents * v_state_rate / 100.0)::BIGINT;
  v_county_tax_cents := (p_taxable_amount_cents * v_county_rate / 100.0)::BIGINT;

  -- Record tax collected
  INSERT INTO sales_tax_collected (
    transaction_id,
    subscription_payment_id,
    state,
    county,
    city,
    taxable_amount_cents,
    state_tax_cents,
    county_tax_cents,
    total_tax_cents,
    state_rate,
    county_rate,
    total_rate,
    customer_id,
    customer_zip,
    tax_year,
    tax_month,
    tax_quarter
  ) VALUES (
    p_transaction_id,
    p_subscription_payment_id,
    v_vendor_state,
    v_vendor_county,
    v_vendor_city,
    p_taxable_amount_cents,
    v_state_tax_cents,
    v_county_tax_cents,
    v_total_tax_cents,
    v_state_rate,
    v_county_rate,
    v_total_rate,
    p_vendor_id,
    v_vendor_zip,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(QUARTER FROM NOW())::INTEGER
  )
  RETURNING id INTO v_tax_id;

  RETURN v_tax_id;
END;
$$ LANGUAGE plpgsql;

-- Mark tax as remitted to state
CREATE OR REPLACE FUNCTION mark_tax_remitted(
  p_state VARCHAR,
  p_year INTEGER,
  p_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE sales_tax_collected
  SET
    remitted_to_state = true,
    remitted_at = NOW()
  WHERE state = p_state
    AND tax_year = p_year
    AND tax_month = p_month
    AND remitted_to_state = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ARKANSAS DFA EXPORT FORMAT
-- =====================================================

-- Export for Arkansas Department of Finance & Administration
CREATE OR REPLACE VIEW arkansas_dfa_monthly_export AS
SELECT
  tax_year || '-' || LPAD(tax_month::TEXT, 2, '0') as reporting_period,
  county,
  city,
  COUNT(*) as number_of_transactions,
  SUM(taxable_amount_cents) / 100.0 as gross_sales,
  SUM(state_tax_cents) / 100.0 as state_tax,
  SUM(county_tax_cents) / 100.0 as county_tax,
  SUM(city_tax_cents) / 100.0 as city_tax,
  SUM(total_tax_cents) / 100.0 as total_tax_due,
  CASE WHEN remitted_to_state THEN 'PAID' ELSE 'OWED' END as status
FROM sales_tax_collected
WHERE state = 'AR'
GROUP BY tax_year, tax_month, county, city, remitted_to_state
ORDER BY tax_year DESC, tax_month DESC, county, city;

-- =====================================================
-- SUCCESS! Sales tax tracking created!
-- =====================================================
-- Features:
-- ✅ Arkansas + Stone County tax rates
-- ✅ Multi-state tracking (for when you expand)
-- ✅ Monthly sales tax reports
-- ✅ Arkansas DFA export format
-- ✅ Automatic tax calculation
-- ✅ Track what's remitted vs. owed
-- ✅ Digital services taxable in Arkansas
-- =====================================================

-- =====================================================
-- IMPORTANT ARKANSAS NOTES:
-- =====================================================
-- 1. Arkansas taxes digital services/SaaS: YES
-- 2. You collect tax based on vendor's location
-- 3. File monthly with Arkansas DFA
-- 4. Stone County has local tax (varies by city)
-- 5. Update rates if Arkansas changes rates
-- 6. Consult CPA for final guidance
-- =====================================================
