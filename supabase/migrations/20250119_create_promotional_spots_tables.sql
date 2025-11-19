-- Create promotional spots system for managing free spots and discount codes

CREATE TABLE IF NOT EXISTS promotional_spots (
  id SERIAL PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  spot_type TEXT CHECK (spot_type IN ('free', 'discount')) NOT NULL,
  total_spots INTEGER NOT NULL,
  spots_remaining INTEGER NOT NULL,
  discount_percentage INTEGER,
  code TEXT UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spot_redemptions (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES promotional_spots(id) ON DELETE CASCADE,
  user_id INTEGER,
  email TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_promotional_spots_active ON promotional_spots(active);
CREATE INDEX idx_promotional_spots_code ON promotional_spots(code);
CREATE INDEX idx_spot_redemptions_campaign ON spot_redemptions(campaign_id);
CREATE INDEX idx_spot_redemptions_email ON spot_redemptions(email);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotional_spots_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
CREATE TRIGGER promotional_spots_updated_at
  BEFORE UPDATE ON promotional_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_promotional_spots_timestamp();

-- Create function to automatically decrement spots_remaining when redeemed
CREATE OR REPLACE FUNCTION decrement_promotional_spots()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE promotional_spots
  SET spots_remaining = spots_remaining - 1
  WHERE id = NEW.campaign_id;

  -- Auto-disable campaign when spots run out
  UPDATE promotional_spots
  SET active = FALSE
  WHERE id = NEW.campaign_id AND spots_remaining <= 0;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-decrementing spots
CREATE TRIGGER spot_redemption_decrement
  AFTER INSERT ON spot_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION decrement_promotional_spots();

-- Insert a sample campaign
INSERT INTO promotional_spots (campaign_name, spot_type, total_spots, spots_remaining, code, active, expires_at)
VALUES
  ('Launch Promo - 100 Free Spots', 'free', 100, 100, 'LAUNCH100', TRUE, NOW() + INTERVAL '90 days'),
  ('Early Bird 20% Off', 'discount', 50, 50, 'EARLY20', TRUE, NOW() + INTERVAL '60 days');

-- Enable RLS
ALTER TABLE promotional_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_redemptions ENABLE ROW LEVEL SECURITY;

-- Allow public to read active promotional spots
CREATE POLICY "Allow public read of active promotional spots"
  ON promotional_spots
  FOR SELECT
  TO public
  USING (active = TRUE);

-- Allow authenticated users to read their own redemptions
CREATE POLICY "Users can read their own redemptions"
  ON spot_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::integer = user_id OR email = auth.email());

-- Allow service role to manage everything
CREATE POLICY "Service role can manage promotional spots"
  ON promotional_spots
  FOR ALL
  TO service_role
  USING (TRUE);

CREATE POLICY "Service role can manage redemptions"
  ON spot_redemptions
  FOR ALL
  TO service_role
  USING (TRUE);
