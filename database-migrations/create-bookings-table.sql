-- Bookings table for vendor bookings with commission and escrow
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Booking details
  service_type VARCHAR(100) NOT NULL, -- e.g., "Photography", "Catering", etc.
  event_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL, -- Total amount in dollars

  -- Payment split details
  commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.1000 for 10%
  commission_amount DECIMAL(10,2) NOT NULL,
  vendor_net_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL, -- 30% of net
  escrow_amount DECIMAL(10,2) NOT NULL, -- 70% of net

  -- Stripe details
  payment_intent_id VARCHAR(255) UNIQUE,
  vendor_stripe_account_id VARCHAR(255) NOT NULL,

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'paid', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')
  ),
  escrow_status VARCHAR(50) NOT NULL DEFAULT 'held' CHECK (
    escrow_status IN ('held', 'released', 'refunded')
  ),

  -- Timestamps
  paid_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  escrow_released_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_bride ON bookings(bride_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor ON bookings(vendor_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(payment_intent_id);

-- Vendor Stripe Connect accounts table
CREATE TABLE IF NOT EXISTS vendor_stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe Connect details
  stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,

  -- Vendor tier (for commission rate)
  vendor_tier VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (
    vendor_tier IN ('free', 'premium', 'featured', 'elite')
  ),

  -- Timestamps
  onboarded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_stripe_accounts_vendor ON vendor_stripe_accounts(vendor_user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_stripe_accounts_stripe ON vendor_stripe_accounts(stripe_account_id);

-- Escrow releases history table
CREATE TABLE IF NOT EXISTS escrow_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Release details
  amount DECIMAL(10,2) NOT NULL,
  stripe_transfer_id VARCHAR(255) UNIQUE,

  -- Release trigger
  released_by_user_id INTEGER REFERENCES users(id), -- Admin or automated
  release_reason VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_releases_booking ON escrow_releases(booking_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_stripe_accounts_updated_at BEFORE UPDATE ON vendor_stripe_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
