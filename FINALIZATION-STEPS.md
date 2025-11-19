# 🎯 Step-by-Step Finalization Guide

This guide will walk you through **exactly** what to do to finalize your Bella Wedding AI platform.

---

## ✅ STEP 1: Run SQL Schemas in Supabase

You need to run these SQL files in your Supabase dashboard to create the database tables and functions.

### 1.1 Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: **Bella-wedding-ai**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

---

### 1.2 Run Schema Files (In This Order)

Run each file one at a time. Copy the entire file contents, paste into SQL Editor, and click **RUN**.

---

#### ✅ File 1: CREATE-VENDOR-PHOTO-GALLERY-SCHEMA.sql

**What it does:** Allows vendors to upload multiple portfolio photos

**Steps:**
1. Open `CREATE-VENDOR-PHOTO-GALLERY-SCHEMA.sql` in your code editor
2. Copy **ALL** the contents (Ctrl+A, then Ctrl+C)
3. In Supabase SQL Editor, paste the contents (Ctrl+V)
4. Click **RUN** button (bottom right)
5. Wait for "Success. No rows returned" message
6. ✅ Done!

**Expected result:**
```
Success. No rows returned
```

---

#### ✅ File 2: CREATE-MASTER-PLAN-SCHEMA.sql

**What it does:** Creates master wedding plan with approval workflow, undo system, and version limits

**Steps:**
1. Open `CREATE-MASTER-PLAN-SCHEMA.sql` in your code editor
2. Copy **ALL** the contents (Ctrl+A, then Ctrl+C)
3. In Supabase SQL Editor, click **New Query**
4. Paste the contents (Ctrl+V)
5. Click **RUN** button
6. Wait for "Success. No rows returned" message
7. ✅ Done!

**Expected result:**
```
Success. No rows returned
```

---

#### ✅ File 3: CREATE-PROFITABILITY-TRACKING-SCHEMA.sql

**What it does:** Tracks revenue and costs per user to understand profitability

**Steps:**
1. Open `CREATE-PROFITABILITY-TRACKING-SCHEMA.sql`
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. In Supabase, click **New Query**
4. Paste (Ctrl+V)
5. Click **RUN**
6. Wait for success message
7. ✅ Done!

**Expected result:**
```
Success. No rows returned
```

---

#### ✅ File 4: CREATE-COST-MONITORING-SCHEMA.sql

**What it does:** Monitors platform costs and alerts when approaching $320/month limit

**Steps:**
1. Open `CREATE-COST-MONITORING-SCHEMA.sql`
2. Copy **ALL** contents
3. In Supabase, click **New Query**
4. Paste
5. Click **RUN**
6. ✅ Done!

---

#### ✅ File 5: CREATE-QUESTIONNAIRE-SYSTEM-SCHEMA.sql

**What it does:** Auto-sends questionnaire to bride when she books a vendor

**Steps:**
1. Open `CREATE-QUESTIONNAIRE-SYSTEM-SCHEMA.sql`
2. Copy **ALL** contents
3. In Supabase, click **New Query**
4. Paste
5. Click **RUN**
6. ✅ Done!

---

#### ✅ File 6: CREATE-FEATURE-TOGGLE-SCHEMA.sql

**What it does:** Allows you to enable/disable features without deploying code

**Steps:**
1. Open `CREATE-FEATURE-TOGGLE-SCHEMA.sql`
2. Copy **ALL** contents
3. In Supabase, click **New Query**
4. Paste
5. Click **RUN**
6. ✅ Done!

---

#### ✅ File 7: CREATE-COUPON-SYSTEM-SCHEMA.sql

**What it does:** Allows you to create discount coupons for vendors/brides

**Steps:**
1. Open `CREATE-COUPON-SYSTEM-SCHEMA.sql`
2. Copy **ALL** contents
3. In Supabase, click **New Query**
4. Paste
5. Click **RUN**
6. ✅ Done!

---

#### ✅ File 8: CREATE-DEPENDENCY-MONITORING-SCHEMA.sql

**What it does:** Tracks when Supabase, SendGrid, Claude, etc. need updates

**Steps:**
1. Open `CREATE-DEPENDENCY-MONITORING-SCHEMA.sql`
2. Copy **ALL** contents
3. In Supabase, click **New Query**
4. Paste
5. Click **RUN**
6. ✅ Done!

---

### 1.3 Verify All Schemas Installed

Run this query to check all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables (should include):**
- vendor_photos
- master_wedding_plans
- master_plan_items
- master_plan_versions
- plan_version_config
- plan_undo_history
- user_profitability
- user_revenue_tracking
- user_cost_attribution
- pricing_tiers
- external_services
- npm_packages
- vendor_questionnaires
- questionnaire_responses
- feature_toggles
- coupons
- coupon_usage

---

## ✅ STEP 2: Test Vendor Photo Gallery

### 2.1 Login as Vendor

1. Go to your frontend: http://localhost:3000
2. Login with vendor account credentials
3. Navigate to **Vendor Dashboard**

### 2.2 Upload Photos

1. Go to **My Profile** or **Photo Gallery** section
2. Click **Upload Photo** button
3. Select 4-5 images from your computer
4. Add captions (optional)
5. Click **Upload**

### 2.3 Set Profile Photo

1. Find the photo you want as your main profile pic
2. Click **Set as Profile Photo**
3. Verify it's marked as profile photo

### 2.4 Verify Gallery Display

1. Go to **Bride Dashboard**
2. Search for your vendor
3. Click on vendor profile
4. **VERIFY:** All 4-5 photos are visible in gallery (not just profile pic)

---

## ✅ STEP 3: Test Master Plan Approval System

### 3.1 Create Master Plan (as Bride)

1. Login as bride
2. Go to **Master Plan** section
3. Click **Create Master Plan**
4. Fill in:
   - Plan name: "Sarah's Wedding Plan"
   - Wedding date: (pick a date)
   - Venue: "Grand Ballroom"
   - Guest count: 150

### 3.2 Add Items to Plan

1. Click **Add Item**
2. Fill in:
   - Item type: vendor_selection
   - Category: Photography
   - Title: "Book photographer - John Smith"
   - Description: "Professional wedding photographer"
3. Click **Add to Plan**
4. **VERIFY:** Item shows as **"Pending Approval"**

### 3.3 Approve Items

1. Go to **Pending Approvals** tab
2. See your item waiting for approval
3. Click **Approve**
4. **VERIFY:** Item now shows as **"Approved"**

### 3.4 Lock the Plan

1. Click **Lock Plan** button
2. Confirm you want to finalize
3. **VERIFY:** Plan status changes to **"Locked"**
4. **VERIFY:** Version 1 is created

### 3.5 Unlock and Edit

1. Click **Unlock Plan**
2. Enter unlock reason: "Need to change photographer"
3. Click **Unlock**
4. **VERIFY:** Plan is now editable again
5. **VERIFY:** Version 1 is still saved in history

---

## ✅ STEP 4: Test Undo System

### 4.1 Make a Change

1. Add a new item to your master plan:
   - Title: "Test Item to Delete"
   - Category: Catering
2. Click **Add**

### 4.2 Undo the Change

1. Click **Undo** button (top right)
2. **VERIFY:** "Test Item to Delete" disappears
3. **VERIFY:** You see message: "Action undone successfully"

### 4.3 Check Undo History

1. Click **View History**
2. **VERIFY:** You see recent changes
3. **VERIFY:** Undone actions are marked

---

## ✅ STEP 5: Test Version Limits

### 5.1 Check Current Limit

Run this in Supabase SQL Editor:

```sql
SELECT * FROM plan_version_config;
```

**Expected result:**
```
max_versions_per_plan: 50
auto_cleanup_enabled: true
```

### 5.2 (Optional) Test Auto-Cleanup

**Note:** This would require locking/unlocking a plan 51 times. Skip this unless you want to test it.

To test manually:
1. Lock plan (creates version 1)
2. Unlock plan
3. Lock plan again (creates version 2)
4. Repeat 50 times...
5. On version 51, oldest version (version 1) should be auto-deleted

---

## ✅ STEP 6: Test Profitability Tracking

### 6.1 Check Pricing Tiers

Run this in Supabase:

```sql
SELECT * FROM pricing_tiers ORDER BY monthly_price;
```

**Expected result:**
```
free: $0.00
premium: $29.99
featured: $49.99
elite: $99.99
```

### 6.2 Record Test Revenue

Use Postman or curl to test the API:

```bash
curl -X POST http://localhost:3000/api/admin/profitability \
  -H "Content-Type: application/json" \
  -d '{
    "action": "record_user_revenue",
    "user_id": "YOUR_USER_ID",
    "user_type": "vendor",
    "user_email": "test@vendor.com",
    "revenue_month": "2025-01-01",
    "subscription_tier": "premium",
    "subscription_mrr": 29.99,
    "subscription_payments": 29.99
  }'
```

**Expected response:**
```json
{
  "message": "Revenue recorded successfully",
  "revenue": { ... }
}
```

---

## ✅ STEP 7: Fix Navigation Issue

**Issue:** Vendor logged in but can't find vendor dashboard (stuck in bride view)

### 7.1 Check Current Routing

1. Login as vendor
2. Note the URL after login
3. Check if you can access: `/vendor/dashboard`

### 7.2 Verify Role-Based Redirect

I need to investigate this. Can you tell me:
1. What URL do you land on after logging in as vendor?
2. Is there a navigation menu to switch between dashboards?
3. What's your vendor user's role in the database?

**To check vendor role:**

Run in Supabase:
```sql
SELECT id, email, role FROM users WHERE email = 'YOUR_VENDOR_EMAIL';
```

---

## ✅ STEP 8: Deploy to Production

Once everything works locally:

### 8.1 Commit Your Changes

Already done! ✅ (I pushed everything to your branch)

### 8.2 Merge to Main

```bash
git checkout main
git merge claude/fix-pro-message-018RCcEezSd4po5nSny5bS8z
git push origin main
```

### 8.3 Vercel Auto-Deploy

Vercel will automatically deploy when you push to main.

**Check deployment:**
1. Go to https://vercel.com/dashboard
2. See your latest deployment
3. Click to view logs
4. Verify successful deployment

### 8.4 Run SQL in Production Supabase

**IMPORTANT:** You need to run all the SQL files again in your PRODUCTION Supabase instance (not just local).

Repeat STEP 1 for production Supabase.

---

## ✅ STEP 9: Final Verification Checklist

### Database:
- [ ] All SQL schemas run successfully
- [ ] No errors in Supabase logs
- [ ] Tables exist: vendor_photos, master_plan_*, pricing_tiers, etc.

### Vendor Photos:
- [ ] Vendors can upload multiple photos
- [ ] Can set profile photo
- [ ] All photos visible in gallery (not just profile)

### Master Plan:
- [ ] Bride can create plan
- [ ] Items start as "pending"
- [ ] Bride can approve/reject items
- [ ] Can lock plan (creates version)
- [ ] Can unlock plan (preserves versions)
- [ ] Version limit (50) works

### Undo System:
- [ ] Undo button works
- [ ] Can undo add/edit/delete
- [ ] History shows recent changes

### Navigation:
- [ ] Vendor can access vendor dashboard
- [ ] Bride can access bride dashboard
- [ ] No stuck in wrong dashboard

### Production:
- [ ] Code deployed to Vercel
- [ ] SQL run in production Supabase
- [ ] Live site works

---

## 🆘 Troubleshooting

### Problem: SQL file gives error

**Solution:**
1. Check for missing tables (run dependencies first)
2. Look at error message - tells you what's wrong
3. Some tables might already exist - that's OK

### Problem: "Table already exists"

**Solution:**
This is fine! The SQL uses `CREATE TABLE IF NOT EXISTS`, so it won't break anything.

### Problem: Can't upload photos

**Solution:**
1. Check Supabase storage bucket exists
2. Check RLS policies allow vendor uploads
3. Check file size limits

### Problem: Undo button doesn't work

**Solution:**
1. Check `plan_undo_history` table exists
2. Check trigger is installed: `capture_plan_item_changes_for_undo`
3. Check browser console for errors

---

## 📞 Need Help?

If you get stuck on any step:
1. Copy the error message
2. Tell me which step you're on
3. Send screenshot if helpful

---

## ✅ Summary

**You need to:**
1. ✅ Run 8 SQL files in Supabase (copy-paste each one)
2. ✅ Test vendor photo gallery (upload 4+ photos)
3. ✅ Test master plan approval (create, approve, lock)
4. ✅ Test undo button (add item, then undo)
5. ✅ Fix vendor navigation (we'll do this together)
6. ✅ Deploy to production

**I've already done:**
- ✅ Written all the code
- ✅ Created all the SQL schemas
- ✅ Committed and pushed to git
- ✅ Created API endpoints

**You're almost done!** 🎉
