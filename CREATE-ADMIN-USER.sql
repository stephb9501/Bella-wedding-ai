-- =====================================================
-- CREATE ADMIN USER FOR stephb9501@gmail.com
-- =====================================================
-- This creates a user record and sets you as admin
-- Note: This is the CORRECTED version matching actual users table schema
-- =====================================================

-- Create or update user record
-- Note: users.id is auto-increment INTEGER, not UUID
INSERT INTO users (
  email,
  first_name,
  password_hash,
  role,
  subscription_tier,
  subscription_status,
  created_at,
  updated_at
) VALUES (
  'stephb9501@gmail.com',
  'Stephanie',
  'supabase_auth_user',
  'admin',
  'premium',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  subscription_tier = 'premium',
  subscription_status = 'active',
  updated_at = NOW();

-- Verify it worked
SELECT id, email, first_name, role, subscription_tier, subscription_status, created_at
FROM users
WHERE email = 'stephb9501@gmail.com';

-- =====================================================
-- NOTE: You already ran this successfully!
-- This updated version is saved for reference
-- =====================================================
