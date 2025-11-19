# 🚀 VENDOR ACQUISITION SYSTEM - IMPLEMENTATION GUIDE

## ✅ What's Been Built

Your vendor acquisition system is **99% complete**! Here's what's ready:

### 1. **Database Schema** ✅
- Lightweight vendor listings table
- Vendor invitations tracking
- Bride vendor suggestions
- Referral system
- All with Row Level Security (RLS)

### 2. **Admin Tools** ✅
- Bulk vendor import (CSV & JSON)
- Incomplete vendors dashboard
- Auto-invite emails via Resend
- Duplicate detection

### 3. **Bride Features** ✅
- "Suggest a Vendor" button on vendors page
- Auto-creates listings from suggestions
- Auto-sends invite emails to suggested vendors

### 4. **APIs** ✅
- `/api/admin/vendor-import` - Bulk import
- `/api/admin/incomplete-vendors` - Find & fix incomplete vendors
- `/api/bride-suggest-vendor` - Bride suggestions
- `/api/vendors/search` - Search by location

---

## 🔧 FINAL SETUP STEPS

### Step 1: Run SQL Schema in Supabase

**⚠️ CRITICAL: You must do this first!**

1. Go to https://supabase.com/dashboard
2. Select your Bella Wedding project
3. Click "SQL Editor" in the left sidebar
4. Click "+ New query"
5. Open this file: `CREATE-VENDOR-ACQUISITION-SYSTEM.sql`
6. Copy **ALL** the contents
7. Paste into Supabase SQL Editor
8. Click "Run" (or Ctrl/Cmd + Enter)
9. Wait for "Success. No rows returned"

**Verify it worked:**
- Go to "Table Editor" in Supabase
- You should see these new tables:
  - ✅ `vendor_listings`
  - ✅ `vendor_invitations`
  - ✅ `bride_vendor_suggestions`
  - ✅ `vendor_referrals`

---

### Step 2: Test the "Suggest a Vendor" Feature

1. Go to your vendors page: `/vendors`
2. Scroll down below the filters
3. You should see a blue/purple button: **"Don't see who you're looking for? Suggest a Vendor!"**
4. Click it and test the form
5. Fill in a vendor's info (use real email to test invite)
6. Submit
7. Check that:
   - Vendor was added to `vendor_listings` table
   - Invite email was sent (check Resend dashboard)
   - Modal closed and vendors page refreshed

---

### Step 3: Test Bulk Vendor Import

1. Go to admin dashboard: `/admin/dashboard`
2. Click **"📥 Bulk Import Vendors"**
3. You'll see two tabs: **CSV Upload** and **JSON Paste**

**Option A: CSV Upload**
1. Click "Download Template" to get example CSV
2. Add your vendors to the CSV file
3. Drag & drop the file or click to browse
4. Check "Send invite emails?" if you want
5. Click "Import Vendors"

**Option B: JSON Paste**
1. Copy this example:
```json
[
  {
    "business_name": "Elegant Events Photography",
    "category": "Photography",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90210",
    "email": "contact@elegantevents.com",
    "phone": "555-1234",
    "website": "https://elegantevents.com",
    "description": "Professional wedding photography"
  }
]
```
2. Paste in the textarea
3. Check "Send invite emails?" if you want
4. Click "Import Vendors"

**Verify:**
- Check import results (success count, errors)
- Go to `vendor_listings` table in Supabase
- Verify vendors were created
- If you sent invites, check Resend dashboard

---

### Step 4: Test Incomplete Vendors Dashboard

1. Go to admin dashboard: `/admin/dashboard`
2. Click **"⚠️ Incomplete Vendors"**
3. You'll see:
   - Stats cards showing missing info counts
   - Filter buttons (All, No Email, No Phone, etc.)
   - List of vendors with missing fields
4. Click "Add Info" on a vendor
5. Fill in missing information
6. Click "Save Changes"
7. Vendor should disappear from the list (or update)

**Features:**
- Filter by what's missing
- Search by business name
- Export to CSV for offline work
- Quick edit modal

---

## 📋 HOW TO USE THE SYSTEM

### Strategy 1: Bulk Import from Google

1. Google: "wedding photographers in [your city]"
2. Copy vendor names, emails, phone numbers, websites
3. Format as CSV or JSON
4. Paste into bulk import tool
5. Send mass invites
6. **Result:** Hundreds of vendors in minutes!

### Strategy 2: Bride-Powered Growth

1. Brides search for vendors on your site
2. Don't find who they're looking for
3. Click "Suggest a Vendor"
4. Fill in vendor info
5. System auto-creates listing + sends invite
6. Vendor sees "A bride recommended you!"
7. **Result:** Organic, high-conversion growth!

### Strategy 3: Fix Incomplete Vendors

1. Import vendors quickly (even with minimal info)
2. Use "Incomplete Vendors" dashboard to find gaps
3. Filter by what's missing
4. Fill in info manually or export CSV
5. Research missing info offline
6. Import updates
7. **Result:** High-quality, complete listings!

---

## 📊 STORAGE EFFICIENCY

**Your System:**
- 1 vendor = ~2KB (text only)
- 1,000 vendors = ~2MB
- 10,000 vendors = ~20MB
- **Cost:** Pennies!

**vs. Photo-Heavy System:**
- 1 vendor = ~10MB (with photos)
- 1,000 vendors = ~10GB
- **Cost:** $$$$

**Upgrade Path:**
- Vendors start with basic listing (free)
- When they claim/pay, they can add photos
- You still show them to brides!

---

## 🎯 CATEGORIES SUPPORTED

All 15 wedding vendor categories:
1. Venue
2. Catering
3. Photography
4. Videography
5. Florist
6. DJ/Music
7. Hair & Makeup
8. Wedding Planner
9. Cake
10. Transportation
11. Officiant
12. Invitations
13. Dress & Attire
14. Rentals
15. **Other** (catch-all)

---

## 📧 INVITE EMAIL FLOW

When vendors receive invites:

**Subject:** "[Business Name] - You're Invited to Bella Wedding! 🎉"

**Body includes:**
- Personalized greeting
- Why they're being invited
- Benefits of joining (connect with couples, free to start)
- Big "Claim Your Profile" button
- 30-day expiration warning

**Tracking:**
- Sent count
- Email opens (if you add tracking pixels)
- Link clicks
- Registration conversion

---

## 🔒 SECURITY & PERMISSIONS

**Who Can Do What:**

| Action | Admin | Bride | Vendor | Public |
|--------|-------|-------|--------|--------|
| Bulk import vendors | ✅ | ❌ | ❌ | ❌ |
| Suggest vendor | ✅ | ✅ | ❌ | ❌ |
| Edit unclaimed listing | ✅ | ❌ | ❌ | ❌ |
| Claim listing | ❌ | ❌ | ✅ | ❌ |
| Edit claimed listing | ❌ | ❌ | ✅ (owner only) | ❌ |
| View vendors | ✅ | ✅ | ✅ | ✅ |

**RLS Policies:**
- Admins can do everything
- Brides can suggest vendors
- Vendors can only edit their own claimed listings
- Public can view (but not edit)

---

## 🚀 NEXT STEPS (OPTIONAL ENHANCEMENTS)

### 1. **Vendor Claim System**
Allow vendors to claim their listings:
- Create `/vendor-claim/[token]` page
- Vendor clicks invite link
- Fills in password, accepts terms
- Links `vendor_listings.claimed_by_vendor_id` to `vendors.id`
- Sets `is_claimed = true`
- Now they can edit their listing

### 2. **Bride Suggestion Approval**
Add admin approval for bride suggestions:
- Create `/admin/vendor-suggestions` page
- Show pending suggestions
- Admin clicks "Approve" or "Reject"
- If approved, send invite email
- Track suggestion quality per bride

### 3. **Zip Code Radius Search**
Enhanced location search:
- Add geocoding (lat/lng) to `vendor_listings`
- Use Haversine formula for radius search
- "Find vendors within 50 miles of 90210"

### 4. **Vendor Referral Program**
Already in schema, just needs UI:
- Vendors get unique referral code
- Invite other vendors
- Earn rewards (free months, credits)
- Track in `vendor_referrals` table

---

## 📞 TROUBLESHOOTING

### Issue: "Table 'vendor_listings' does not exist"
**Fix:** You didn't run the SQL schema. Go to Step 1 above.

### Issue: "Unauthorized" when importing vendors
**Fix:** Make sure your user has `role = 'admin'` in the `users` table.

### Issue: Invite emails not sending
**Fix:** Check that `RESEND_API_KEY` is set in `.env.local`

### Issue: Duplicate vendors being imported
**Fix:** System should auto-detect duplicates. Check that business_name + city + state match exactly.

### Issue: Can't see "Suggest a Vendor" button
**Fix:** Clear browser cache and refresh. Button is at `/vendors` page.

---

## 📈 SUCCESS METRICS TO TRACK

**Week 1:**
- Import 500 vendors via bulk tool
- Get 50 bride suggestions
- 10% vendor registration rate = 55 vendors

**Month 1:**
- 2,000 vendors in marketplace
- 200 claimed profiles
- 50 paying vendors

**Month 3:**
- 10,000+ vendors nationwide
- 1,000+ claimed profiles
- 200+ paying vendors
- Self-sustaining through bride suggestions

---

## 🎉 YOU'RE READY TO LAUNCH!

Everything is built and ready to go. Just:
1. ✅ Run SQL schema in Supabase
2. ✅ Test suggest vendor button
3. ✅ Test bulk import
4. ✅ Test incomplete vendors
5. 🚀 Start importing vendors!

**Questions?**
- Check the API routes for usage examples
- SQL schema has comments explaining each table
- UI components are self-contained and reusable

---

**Built with ❤️ for Bella Wedding AI**
