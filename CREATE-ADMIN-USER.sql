-- =====================================================
-- CREATE ADMIN USER FOR stephb9501@gmail.com
-- =====================================================
-- This creates a user record and sets you as admin
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get your auth UUID
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'stephb9501@gmail.com';

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'No auth user found for stephb9501@gmail.com';
  END IF;

  -- Create or update user record
  INSERT INTO users (
    id,
    email,
    full_name,
    role,
    subscription_tier,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    'stephb9501@gmail.com',
    'Stephanie',
    'admin',
    'premium',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

  RAISE NOTICE 'Admin user created successfully!';
END $$;

-- Verify it worked
SELECT id, email, full_name, role, subscription_tier, created_at
FROM users
WHERE email = 'stephb9501@gmail.com';

-- =====================================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy and paste this ENTIRE script
-- 3. Click "Run"
-- 4. You should see your user record displayed
-- 5. Log out of your app
-- 6. Log back in at https://www.bellaweddingai.com/auth/login
-- 7. You'll automatically go to /admin/dashboard!
-- =====================================================
