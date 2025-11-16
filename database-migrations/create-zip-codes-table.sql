-- Create ZIP codes table for free distance calculations
-- Run this in Supabase SQL Editor FIRST

CREATE TABLE IF NOT EXISTS zip_codes (
  zip VARCHAR(5) PRIMARY KEY,
  city VARCHAR(100),
  state_code VARCHAR(2),
  state_name VARCHAR(50),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_zip_codes_zip ON zip_codes(zip);
CREATE INDEX IF NOT EXISTS idx_zip_codes_state ON zip_codes(state_code);

-- Add comment
COMMENT ON TABLE zip_codes IS 'Free ZIP code database for distance calculations - no API costs';
