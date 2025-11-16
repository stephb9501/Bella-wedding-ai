-- Bride Subscriptions Table
CREATE TABLE IF NOT EXISTS bride_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  plan_tier VARCHAR(50) NOT NULL CHECK (plan_tier IN ('free', 'standard', 'premium')),
  status VARCHAR(50) NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add stripe_customer_id to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';

-- Update vendor_subscriptions to include stripe fields
ALTER TABLE vendor_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bride_subscriptions_user ON bride_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_bride_subscriptions_stripe_sub ON bride_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_bride_subscriptions_status ON bride_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_stripe_sub ON vendor_subscriptions(stripe_subscription_id);

-- Disable RLS for service role access
ALTER TABLE bride_subscriptions DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE bride_subscriptions IS 'Stores Stripe subscription data for bride users';
COMMENT ON COLUMN bride_subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN bride_subscriptions.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN bride_subscriptions.plan_tier IS 'Subscription tier: free, standard, or premium';
COMMENT ON COLUMN bride_subscriptions.status IS 'Stripe subscription status (active, canceled, past_due, etc.)';
COMMENT ON COLUMN bride_subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at end of period';
