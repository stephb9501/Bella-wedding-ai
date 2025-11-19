-- =====================================================
-- EMERGENCY RECOVERY SCRIPTS
-- =====================================================
-- Use these ONLY if you get locked out of your account
-- Run these directly in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- OPTION 1: Reset Your Account to Super Admin
-- =====================================================
-- Replace 'stephb9501@gmail.com' with your actual email

UPDATE users
SET
  role = 'admin',
  is_active = true
WHERE email = 'stephb9501@gmail.com';

-- Give yourself all admin permissions
INSERT INTO admin_roles (user_id, role_name)
SELECT id, 'super_admin'
FROM users
WHERE email = 'stephb9501@gmail.com'
ON CONFLICT (user_id, role_name) DO NOTHING;

-- =====================================================
-- OPTION 2: Create a New Super Admin Account
-- =====================================================
-- If you can't access your main account, create a backup

-- First, sign up normally through the frontend with a NEW email
-- Then run this with that new email:

UPDATE users
SET role = 'admin'
WHERE email = 'YOUR_BACKUP_EMAIL@gmail.com';

INSERT INTO admin_roles (user_id, role_name)
SELECT id, 'super_admin'
FROM users
WHERE email = 'YOUR_BACKUP_EMAIL@gmail.com'
ON CONFLICT (user_id, role_name) DO NOTHING;

-- =====================================================
-- OPTION 3: View All Admin Accounts
-- =====================================================
-- See who currently has admin access

SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  ar.role_name as admin_role,
  ar.created_at as admin_since
FROM users u
LEFT JOIN admin_roles ar ON ar.user_id = u.id
WHERE u.role = 'admin'
ORDER BY ar.created_at;

-- =====================================================
-- OPTION 4: Disable Bad Actor (if account compromised)
-- =====================================================
-- If someone unauthorized got admin access:

UPDATE users
SET
  is_active = false,
  role = 'user'
WHERE email = 'SUSPICIOUS_EMAIL@example.com';

DELETE FROM admin_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'SUSPICIOUS_EMAIL@example.com');

-- =====================================================
-- OPTION 5: Password Reset via Supabase
-- =====================================================
-- You can also reset your password directly in Supabase:
--
-- 1. Go to https://supabase.com
-- 2. Open your project
-- 3. Go to Authentication > Users
-- 4. Find your user
-- 5. Click "Send password recovery email"
--
-- OR manually reset the password:
-- (This requires generating a password hash - safer to use email reset)

-- =====================================================
-- BACKUP ADMIN CONTACT INFO
-- =====================================================
-- Keep this info somewhere safe (not in the database!):
--
-- Primary Admin Email: stephb9501@gmail.com
-- Backup Admin Email: _______________________ (CREATE ONE!)
-- Supabase Account: __________________________
-- Supabase Project: Bella-wedding-ai
--
-- Emergency Access:
-- - Supabase Dashboard: https://supabase.com/dashboard/project/[your-project-id]
-- - Can always run SQL queries directly in SQL Editor
-- - Can manually reset passwords in Auth > Users
--
-- =====================================================

-- =====================================================
-- PREVENTION: Create a Backup Admin Account NOW
-- =====================================================
-- 1. Use a different email (Gmail, Outlook, etc.)
-- 2. Sign up on your wedding platform
-- 3. Run this SQL to make them admin:

UPDATE users
SET role = 'admin'
WHERE email = 'YOUR_BACKUP_EMAIL@gmail.com';

INSERT INTO admin_roles (user_id, role_name)
SELECT id, 'super_admin'
FROM users
WHERE email = 'YOUR_BACKUP_EMAIL@gmail.com'
ON CONFLICT (user_id, role_name) DO NOTHING;

-- 4. Log in with that backup account to verify it works
-- 5. Keep those credentials somewhere safe (password manager, safe place, etc.)

-- =====================================================
-- AUTOMATED BACKUP REMINDER
-- =====================================================
-- This function will remind you to check your backup admin monthly

CREATE OR REPLACE FUNCTION check_backup_admin_exists()
RETURNS TABLE (
  has_backup_admin BOOLEAN,
  total_admins INTEGER,
  admin_emails TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) > 1 as has_backup_admin,
    COUNT(*)::INTEGER as total_admins,
    ARRAY_AGG(email) as admin_emails
  FROM users
  WHERE role = 'admin' AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Run this to check:
SELECT * FROM check_backup_admin_exists();

-- =====================================================
-- SUCCESS! Emergency recovery scripts created!
-- =====================================================
-- IMPORTANT:
-- 1. Create a backup admin account NOW (don't wait until emergency)
-- 2. Test logging in with backup account
-- 3. Keep backup credentials somewhere safe
-- 4. Remember: You can ALWAYS access via Supabase dashboard
-- =====================================================
