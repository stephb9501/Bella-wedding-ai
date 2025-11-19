-- =====================================================
-- FINANCIAL TRACKING & TAX REPORTING
-- =====================================================
-- Track platform revenue (commissions + subscriptions)
-- NOT vendor money - only what belongs to platform
-- Tax-ready exports
-- =====================================================

-- Commission rates by tier
-- Free: 10%, Premium: 5%, Featured: 2%, Elite: 0%

CREATE TABLE IF NOT EXISTS platform_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Transaction type
  transaction_type VARCHAR(50) NOT NULL, -- commission, subscription, refund, chargeback

  -- Related entities
  vendor_id UUID REFERENCES vendors(id),
  booking_id UUID REFERENCES vendor_bookings(id),

  -- Amounts (in cents to avoid float errors)
  gross_amount_cents BIGINT NOT NULL, -- Total booking/subscription amount
  commission_rate DECIMAL(5,2), -- e.g., 10.00 for 10%
  commission_amount_cents BIGINT NOT NULL, -- What platform earns
  vendor_amount_cents BIGINT, -- What vendor receives (for bookings)

  -- Stripe details
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255), -- Transfer to vendor
  stripe_fee_cents BIGINT, -- Stripe processing fee

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, refunded, failed
  escrow_release_date DATE, -- When to release to vendor (30 days before wedding)
  escrow_released BOOLEAN DEFAULT false,

  -- Tax info
  tax_year INTEGER,
  tax_quarter INTEGER, -- 1-4

  -- Metadata
  description TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),

  -- Subscription details
  tier VARCHAR(20) NOT NULL, -- free, premium, featured, elite
  amount_cents BIGINT NOT NULL, -- Monthly subscription cost

  -- Billing period
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,

  -- Payment status
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),

  -- Tax info
  tax_year INTEGER,
  tax_month INTEGER, -- 1-12

  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_transactions_type ON platform_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_vendor ON platform_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_booking ON platform_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_status ON platform_transactions(status);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_tax_year ON platform_transactions(tax_year, tax_quarter);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_created ON platform_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_vendor ON subscription_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_tax ON subscription_payments(tax_year, tax_month);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_period ON subscription_payments(billing_period_start, billing_period_end);

-- RLS
ALTER TABLE platform_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Only admins can view financial data
DROP POLICY IF EXISTS "Admins can view transactions" ON platform_transactions;
CREATE POLICY "Admins can view transactions"
  ON platform_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view subscription payments" ON subscription_payments;
CREATE POLICY "Admins can view subscription payments"
  ON subscription_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- ANALYTICS VIEWS FOR ADMIN
-- =====================================================

-- Monthly revenue breakdown
CREATE OR REPLACE VIEW admin_monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  transaction_type,
  COUNT(*) as transaction_count,
  SUM(commission_amount_cents) / 100.0 as total_revenue_usd,
  SUM(stripe_fee_cents) / 100.0 as total_stripe_fees_usd,
  (SUM(commission_amount_cents) - SUM(stripe_fee_cents)) / 100.0 as net_revenue_usd
FROM platform_transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at), transaction_type
ORDER BY month DESC;

-- Commission by vendor tier
CREATE OR REPLACE VIEW admin_commission_by_tier AS
SELECT
  v.tier,
  COUNT(DISTINCT pt.id) as transaction_count,
  SUM(pt.gross_amount_cents) / 100.0 as total_booking_value_usd,
  AVG(pt.commission_rate) as avg_commission_rate,
  SUM(pt.commission_amount_cents) / 100.0 as total_commission_earned_usd,
  SUM(pt.vendor_amount_cents) / 100.0 as total_paid_to_vendors_usd
FROM platform_transactions pt
JOIN vendors v ON v.id = pt.vendor_id
WHERE pt.status = 'completed'
AND pt.transaction_type = 'commission'
GROUP BY v.tier
ORDER BY total_commission_earned_usd DESC;

-- Subscription revenue
CREATE OR REPLACE VIEW admin_subscription_revenue AS
SELECT
  tier,
  COUNT(*) as active_subscribers,
  SUM(amount_cents) / 100.0 as monthly_recurring_revenue_usd,
  (SUM(amount_cents) / 100.0) * 12 as annual_recurring_revenue_usd
FROM subscription_payments
WHERE status = 'paid'
AND billing_period_end >= CURRENT_DATE
GROUP BY tier
ORDER BY monthly_recurring_revenue_usd DESC;

-- Tax report (quarterly)
CREATE OR REPLACE VIEW admin_tax_report_quarterly AS
SELECT
  tax_year,
  tax_quarter,
  transaction_type,
  COUNT(*) as transaction_count,
  SUM(gross_amount_cents) / 100.0 as total_gross_usd,
  SUM(commission_amount_cents) / 100.0 as total_commission_usd,
  SUM(stripe_fee_cents) / 100.0 as total_stripe_fees_usd,
  (SUM(commission_amount_cents) - SUM(stripe_fee_cents)) / 100.0 as net_income_usd
FROM platform_transactions
WHERE status IN ('completed', 'refunded')
GROUP BY tax_year, tax_quarter, transaction_type
ORDER BY tax_year DESC, tax_quarter DESC;

-- Escrow schedule (money to release to vendors)
CREATE OR REPLACE VIEW admin_escrow_schedule AS
SELECT
  pt.escrow_release_date,
  COUNT(*) as payments_to_release,
  SUM(pt.vendor_amount_cents) / 100.0 as total_to_release_usd,
  v.business_name,
  v.email as vendor_email,
  pt.vendor_amount_cents / 100.0 as amount_usd,
  vb.bride_name,
  vb.wedding_date
FROM platform_transactions pt
JOIN vendors v ON v.id = pt.vendor_id
JOIN vendor_bookings vb ON vb.id = pt.booking_id
WHERE pt.status = 'completed'
AND pt.escrow_released = false
AND pt.escrow_release_date IS NOT NULL
GROUP BY pt.escrow_release_date, v.business_name, v.email, pt.vendor_amount_cents, vb.bride_name, vb.wedding_date
ORDER BY pt.escrow_release_date ASC;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate commission rate for vendor
CREATE OR REPLACE FUNCTION get_commission_rate(p_vendor_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_tier VARCHAR(20);
  v_commission_rate DECIMAL;
BEGIN
  SELECT tier INTO v_tier
  FROM vendors
  WHERE id = p_vendor_id;

  v_commission_rate := CASE v_tier
    WHEN 'free' THEN 10.00
    WHEN 'premium' THEN 5.00
    WHEN 'featured' THEN 2.00
    WHEN 'elite' THEN 0.00
    ELSE 10.00
  END;

  RETURN v_commission_rate;
END;
$$ LANGUAGE plpgsql;

-- Record commission transaction
CREATE OR REPLACE FUNCTION record_commission_transaction(
  p_vendor_id UUID,
  p_booking_id UUID,
  p_gross_amount_cents BIGINT,
  p_stripe_payment_intent_id VARCHAR
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_commission_rate DECIMAL;
  v_commission_cents BIGINT;
  v_vendor_cents BIGINT;
  v_escrow_release_date DATE;
BEGIN
  -- Get commission rate
  v_commission_rate := get_commission_rate(p_vendor_id);

  -- Calculate amounts
  v_commission_cents := (p_gross_amount_cents * v_commission_rate / 100)::BIGINT;
  v_vendor_cents := p_gross_amount_cents - v_commission_cents;

  -- Calculate escrow release date (30 days before wedding)
  SELECT wedding_date - INTERVAL '30 days'
  INTO v_escrow_release_date
  FROM vendor_bookings
  WHERE id = p_booking_id;

  -- Create transaction record
  INSERT INTO platform_transactions (
    transaction_type,
    vendor_id,
    booking_id,
    gross_amount_cents,
    commission_rate,
    commission_amount_cents,
    vendor_amount_cents,
    stripe_payment_intent_id,
    escrow_release_date,
    status,
    tax_year,
    tax_quarter,
    description
  ) VALUES (
    'commission',
    p_vendor_id,
    p_booking_id,
    p_gross_amount_cents,
    v_commission_rate,
    v_commission_cents,
    v_vendor_cents,
    p_stripe_payment_intent_id,
    v_escrow_release_date,
    'completed',
    EXTRACT(YEAR FROM NOW())::INTEGER,
    EXTRACT(QUARTER FROM NOW())::INTEGER,
    'Booking commission'
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS! Financial tracking created!
-- =====================================================
-- Features:
-- ✅ Commission tracking by tier (10%, 5%, 2%, 0%)
-- ✅ Subscription revenue tracking
-- ✅ Tax reports (quarterly breakdown)
-- ✅ Escrow schedule (release 30 days before wedding)
-- ✅ Only platform revenue (not vendor money)
-- ✅ Stripe integration ready
-- ✅ All amounts in cents (no float errors)
-- =====================================================
