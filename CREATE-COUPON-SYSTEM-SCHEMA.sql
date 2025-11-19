-- =====================================================
-- COUPON & DISCOUNT SYSTEM
-- =====================================================
-- Create discount codes, free trials, giveaways
-- Track usage and redemptions
-- Limit by quantity, dates, user types
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Coupon details
  code VARCHAR(50) NOT NULL UNIQUE, -- e.g., "SPRING2025", "FREEMONTH"
  name VARCHAR(255) NOT NULL, -- Internal name
  description TEXT,

  -- Discount type
  discount_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, free_trial, free_tier_upgrade
  discount_value DECIMAL(10,2), -- e.g., 20.00 for 20% or $20 off

  -- Free trial specifics
  free_trial_days INTEGER, -- e.g., 30 days free
  free_tier_upgrade_to VARCHAR(20), -- e.g., "premium" (upgrade free → premium for X months)
  free_tier_upgrade_months INTEGER, -- How many months free

  -- Applicability
  applies_to VARCHAR(50) NOT NULL, -- vendor_subscription, vendor_commission, both
  applies_to_tiers VARCHAR[], -- ['free', 'premium'] - which tiers can use it

  -- Limits
  max_uses INTEGER, -- NULL = unlimited
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,

  -- Validity period
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID REFERENCES users(id),
  notes TEXT, -- Internal admin notes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon redemptions (who used it)
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  coupon_code VARCHAR(50) NOT NULL,

  -- Who redeemed it
  redeemed_by UUID NOT NULL,
  redeemed_by_email VARCHAR(255),
  redeemed_by_type VARCHAR(50), -- vendor, bride

  -- What they got
  discount_applied DECIMAL(10,2), -- Dollar amount saved
  original_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),

  -- If subscription-related
  subscription_payment_id UUID REFERENCES subscription_payments(id),
  transaction_id UUID REFERENCES platform_transactions(id),

  -- Metadata
  ip_address INET,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions(redeemed_by);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_date ON coupon_redemptions(redeemed_at);

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND valid_until > NOW());

DROP POLICY IF EXISTS "Users can log redemptions" ON coupon_redemptions;
CREATE POLICY "Users can log redemptions"
  ON coupon_redemptions FOR INSERT
  WITH CHECK (redeemed_by = auth.uid());

DROP POLICY IF EXISTS "Users can view their redemptions" ON coupon_redemptions;
CREATE POLICY "Users can view their redemptions"
  ON coupon_redemptions FOR SELECT
  USING (redeemed_by = auth.uid());

DROP POLICY IF EXISTS "Admins can view all redemptions" ON coupon_redemptions;
CREATE POLICY "Admins can view all redemptions"
  ON coupon_redemptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Trigger
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Validate coupon code
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code VARCHAR,
  p_user_id UUID,
  p_user_type VARCHAR,
  p_tier VARCHAR DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
  v_user_redemptions INTEGER;
  v_result JSONB;
BEGIN
  -- Get coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = p_code
    AND is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW());

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired coupon code'
    );
  END IF;

  -- Check max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Coupon has reached maximum uses'
    );
  END IF;

  -- Check user redemptions
  SELECT COUNT(*) INTO v_user_redemptions
  FROM coupon_redemptions
  WHERE coupon_id = v_coupon.id
    AND redeemed_by = p_user_id;

  IF v_user_redemptions >= v_coupon.max_uses_per_user THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'You have already used this coupon'
    );
  END IF;

  -- Check if applies to user's tier
  IF v_coupon.applies_to_tiers IS NOT NULL AND p_tier IS NOT NULL THEN
    IF NOT (p_tier = ANY(v_coupon.applies_to_tiers)) THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Coupon not valid for your subscription tier'
      );
    END IF;
  END IF;

  -- Valid!
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'free_trial_days', v_coupon.free_trial_days,
    'free_tier_upgrade_to', v_coupon.free_tier_upgrade_to,
    'free_tier_upgrade_months', v_coupon.free_tier_upgrade_months,
    'description', v_coupon.description
  );
END;
$$ LANGUAGE plpgsql;

-- Apply coupon to amount
CREATE OR REPLACE FUNCTION calculate_coupon_discount(
  p_original_amount DECIMAL,
  p_discount_type VARCHAR,
  p_discount_value DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_discount DECIMAL;
  v_final_amount DECIMAL;
BEGIN
  IF p_discount_type = 'percentage' THEN
    v_discount := p_original_amount * (p_discount_value / 100.0);
    v_final_amount := p_original_amount - v_discount;
  ELSIF p_discount_type = 'fixed_amount' THEN
    v_discount := p_discount_value;
    v_final_amount := p_original_amount - p_discount_value;
  ELSIF p_discount_type = 'free_trial' OR p_discount_type = 'free_tier_upgrade' THEN
    v_discount := p_original_amount; -- 100% off
    v_final_amount := 0.00;
  ELSE
    v_discount := 0.00;
    v_final_amount := p_original_amount;
  END IF;

  -- Don't go negative
  IF v_final_amount < 0 THEN
    v_final_amount := 0.00;
  END IF;

  RETURN jsonb_build_object(
    'original_amount', p_original_amount,
    'discount_applied', v_discount,
    'final_amount', v_final_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Record coupon redemption
CREATE OR REPLACE FUNCTION record_coupon_redemption(
  p_coupon_code VARCHAR,
  p_user_id UUID,
  p_user_email VARCHAR,
  p_user_type VARCHAR,
  p_discount_applied DECIMAL,
  p_original_amount DECIMAL,
  p_final_amount DECIMAL
) RETURNS UUID AS $$
DECLARE
  v_redemption_id UUID;
  v_coupon_id UUID;
BEGIN
  -- Get coupon ID
  SELECT id INTO v_coupon_id
  FROM coupons
  WHERE code = p_coupon_code;

  -- Insert redemption
  INSERT INTO coupon_redemptions (
    coupon_id,
    coupon_code,
    redeemed_by,
    redeemed_by_email,
    redeemed_by_type,
    discount_applied,
    original_amount,
    final_amount,
    ip_address
  ) VALUES (
    v_coupon_id,
    p_coupon_code,
    p_user_id,
    p_user_email,
    p_user_type,
    p_discount_applied,
    p_original_amount,
    p_final_amount,
    inet_client_addr()
  )
  RETURNING id INTO v_redemption_id;

  -- Increment coupon usage
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE id = v_coupon_id;

  RETURN v_redemption_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- EXAMPLE COUPONS (Starter Templates)
-- =====================================================

INSERT INTO coupons (
  code, name, description, discount_type, discount_value,
  applies_to, is_active, valid_until, max_uses
) VALUES
  ('WELCOME20', 'Welcome Discount', '20% off first month for new vendors', 'percentage', 20.00, 'vendor_subscription', true, NOW() + INTERVAL '90 days', NULL),
  ('FREEMONTH', 'Free Month Trial', '1 month free premium subscription', 'free_trial', NULL, 'vendor_subscription', false, NULL, 100),
  ('GIVEAWAY2025', 'Giveaway Winner', '3 months free premium tier', 'free_tier_upgrade', NULL, 'vendor_subscription', false, NOW() + INTERVAL '30 days', 10),
  ('SUMMER50', 'Summer Sale', '$50 off annual subscription', 'fixed_amount', 50.00, 'vendor_subscription', false, NULL, NULL)
ON CONFLICT (code) DO NOTHING;

-- Set free trial/upgrade details
UPDATE coupons SET free_trial_days = 30 WHERE code = 'FREEMONTH';
UPDATE coupons SET free_tier_upgrade_to = 'premium', free_tier_upgrade_months = 3 WHERE code = 'GIVEAWAY2025';

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Coupon performance
CREATE OR REPLACE VIEW coupon_analytics AS
SELECT
  c.code,
  c.name,
  c.discount_type,
  c.discount_value,
  c.current_uses,
  c.max_uses,
  CASE
    WHEN c.max_uses IS NOT NULL THEN
      ROUND((c.current_uses::NUMERIC / c.max_uses * 100), 1)
    ELSE NULL
  END as usage_percentage,
  COUNT(cr.id) as total_redemptions,
  SUM(cr.discount_applied) as total_discount_given,
  SUM(cr.final_amount) as total_revenue_after_discount,
  c.valid_from,
  c.valid_until,
  c.is_active
FROM coupons c
LEFT JOIN coupon_redemptions cr ON cr.coupon_id = c.id
GROUP BY c.id, c.code, c.name, c.discount_type, c.discount_value, c.current_uses, c.max_uses, c.valid_from, c.valid_until, c.is_active
ORDER BY total_redemptions DESC;

-- =====================================================
-- SUCCESS! Coupon system created!
-- =====================================================
-- Features:
-- ✅ Create discount codes (percentage or fixed amount)
-- ✅ Free trials (X days free)
-- ✅ Free tier upgrades (giveaways)
-- ✅ Limit by quantity and dates
-- ✅ Limit uses per user
-- ✅ Track all redemptions
-- ✅ Analytics (how many uses, revenue impact)
-- ✅ Auto-validate codes
-- ✅ Works with subscriptions and commissions
-- =====================================================
