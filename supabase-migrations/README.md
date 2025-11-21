# Bella Wedding AI - Database Setup Guide

This folder contains all SQL migration scripts needed to set up your Supabase database.

## Quick Start - Run These Scripts in Order

### Step 1: Create All Tables
**File:** `complete-database-schema.sql`

Run this first to create all database tables, indexes, and triggers.

**How to run:**
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Copy the contents of `complete-database-schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

**What it creates:**
- 22 database tables
- All necessary indexes for performance
- Triggers for automatic timestamp updates
- Foreign key relationships
- Check constraints for data validation

### Step 2: Enable Row Level Security (RLS)
**File:** `../supabase/migrations/20250116_enable_rls_security.sql`

Run this second to enable RLS policies for data protection.

**How to run:**
1. In the same SQL Editor
2. Copy the contents of `20250116_enable_rls_security.sql`
3. Paste and click **Run**

**What it does:**
- Enables RLS on all tables
- Creates security policies for service role access
- Sets up public/authenticated access rules
- Protects sensitive user data

### Step 3: (Optional) Admin Photo Manager
**File:** `admin-photo-manager.sql`

Only run this if you've already created the `admin_images` table separately. Otherwise, it's already included in Step 1.

---

## Database Schema Overview

### User & Auth Tables
- **users** - Main user/couple profiles
- **brides** - Legacy bride profiles (backward compatibility)
- **vendors** - Vendor business profiles
- **couples** - Couple information

### Planning & Organization
- **checklist_items** - Wedding planning tasks
- **timeline_events** - Wedding day timeline
- **budget_items** - Budget tracking
- **emergency_items_template** - Emergency kit checklist

### Guest Management
- **guests** - Guest list with RSVP tracking
- **notifications** - User notification system

### Vendor Features
- **bookings** - Service booking requests (newer)
- **vendor_bookings** - Vendor booking requests (legacy)
- **messages** - User-vendor messaging
- **conversations** - Message conversation threads
- **favorites** - User saved vendors
- **reviews** - Vendor reviews and ratings
- **vendor_photos** - Vendor portfolio photos

### Media & Files
- **galleries** - Photo galleries for weddings
- **gallery_photos** - Photos within galleries
- **files** - File uploads and documents
- **admin_images** - Admin-managed brand images

### Registry
- **registry_links** - Wedding registry links

---

## Verification

After running the migrations, verify everything was created successfully:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count should be 22 tables with rowsecurity = true
```

---

## Important Notes

### Environment Variables Required
Make sure these are set in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Supabase Auth Integration
All user and vendor tables use `auth.users(id)` as foreign keys. When a user registers:
1. Supabase Auth creates an entry in `auth.users`
2. Application creates a profile in `users` or `vendors` table
3. The `id` must match between auth and profile tables

### Admin Access
To set up admin access for the admin dashboard, update the RLS policies with your admin email or create a `role` column in the `users` table.

---

## Troubleshooting

### "relation does not exist" errors
- Make sure you ran `complete-database-schema.sql` first
- Check for typos in table names

### "permission denied" errors
- Make sure you're using the correct Supabase keys
- Check that RLS policies are correctly applied

### Build failing with environment variable errors
- Rename `env.local` to `.env.local` (with dot prefix)
- Verify all required environment variables are set

---

## Migration History

| Date | File | Description |
|------|------|-------------|
| 2025-01-16 | `20250116_enable_rls_security.sql` | Enable RLS on all tables |
| 2025-11-21 | `complete-database-schema.sql` | Complete database schema with all tables |
| 2025-11-21 | `admin-photo-manager.sql` | Admin photo management system |

---

## Need Help?

- **Supabase Documentation:** https://supabase.com/docs
- **SQL Editor:** https://supabase.com/dashboard/project/YOUR_PROJECT/sql
- **Table Editor:** https://supabase.com/dashboard/project/YOUR_PROJECT/editor

---

*Last updated: November 21, 2025*
