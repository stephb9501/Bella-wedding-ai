-- =====================================================
-- SIMPLE RLS FIX FOR LOGIN - Run this in Supabase SQL Editor
-- =====================================================
-- This allows authenticated users to read user data needed for login routing
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing SELECT policies to start clean
DROP POLICY IF EXISTS "Authenticated users can read user roles for login" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read all user data" ON users;

-- Create ONE simple policy: authenticated users can read all user data
-- This is needed for login routing to check roles
CREATE POLICY "Allow authenticated users to read all user data"
ON users FOR SELECT
TO authenticated
USING (true);

-- Keep the update policy (users can only update their own data)
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
TO authenticated
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- Keep admin policy for full access
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
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

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
