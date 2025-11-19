-- =====================================================
-- FIX RLS ON USERS TABLE FOR LOGIN ROUTING
-- =====================================================
-- This allows the login page to check user roles
-- =====================================================

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can read user roles for login" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Allow authenticated users to read user data for role checking during login
-- This is needed for the login page to check if user is admin/bride
CREATE POLICY "Authenticated users can read user roles for login"
ON users FOR SELECT
TO authenticated
USING (
  -- Allow users to read their own data OR allow checking any user's role for routing
  auth.uid()::text = email OR true
);

-- Allow users to read and update their own data
CREATE POLICY "Users can read their own data"
ON users FOR SELECT
TO authenticated
USING (email = auth.email());

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- Admins can manage all users
CREATE POLICY "Admins can manage all users"
ON users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.email = auth.email()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
