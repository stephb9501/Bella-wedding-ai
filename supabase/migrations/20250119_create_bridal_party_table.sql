-- Bridal Party Members Table
-- Migration: 20250119_create_bridal_party_table.sql
-- Purpose: Track bridal party members, their roles, services, and costs

CREATE TABLE IF NOT EXISTS bridal_party_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100) NOT NULL, -- e.g., "Maid of Honor", "Best Man", "Bridesmaid", "Groomsman"
  category VARCHAR(50) NOT NULL CHECK (category IN ('Bridesmaids', 'Groomsmen', 'Flower Girls', 'Ring Bearers', 'Ushers', 'Parents', 'Officiant')),
  relationship VARCHAR(255), -- e.g., "Best Friend", "Sister", "Brother"

  -- Sizing information
  dress_size VARCHAR(20),
  suit_size VARCHAR(20),

  -- Photo
  photo_url TEXT,

  -- Services needed
  needs_hair BOOLEAN DEFAULT FALSE,
  needs_makeup BOOLEAN DEFAULT FALSE,
  needs_alterations BOOLEAN DEFAULT FALSE,
  needs_transportation BOOLEAN DEFAULT FALSE,

  -- Service costs
  hair_cost DECIMAL(10, 2) DEFAULT 0.00,
  makeup_cost DECIMAL(10, 2) DEFAULT 0.00,
  alterations_cost DECIMAL(10, 2) DEFAULT 0.00,
  transportation_cost DECIMAL(10, 2) DEFAULT 0.00,

  -- Payment status
  hair_paid BOOLEAN DEFAULT FALSE,
  makeup_paid BOOLEAN DEFAULT FALSE,
  alterations_paid BOOLEAN DEFAULT FALSE,
  transportation_paid BOOLEAN DEFAULT FALSE,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_bridal_party_user_id ON bridal_party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_bridal_party_category ON bridal_party_members(category);
CREATE INDEX IF NOT EXISTS idx_bridal_party_created_at ON bridal_party_members(created_at DESC);

-- Add comment
COMMENT ON TABLE bridal_party_members IS 'Tracks bridal party members with their roles, services needed, and payment status';

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_bridal_party_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bridal_party_members_updated_at
  BEFORE UPDATE ON bridal_party_members
  FOR EACH ROW
  EXECUTE FUNCTION update_bridal_party_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE bridal_party_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own bridal party members
CREATE POLICY bridal_party_select_policy ON bridal_party_members
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = auth.email()));

-- Policy: Users can insert their own bridal party members
CREATE POLICY bridal_party_insert_policy ON bridal_party_members
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = auth.email()));

-- Policy: Users can update their own bridal party members
CREATE POLICY bridal_party_update_policy ON bridal_party_members
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = auth.email()));

-- Policy: Users can delete their own bridal_party members
CREATE POLICY bridal_party_delete_policy ON bridal_party_members
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = auth.email()));
