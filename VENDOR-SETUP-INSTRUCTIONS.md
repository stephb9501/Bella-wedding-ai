# 🎉 Vendor Discovery System - Complete Setup Guide

**Time Required:** 30-45 minutes
**Cost:** FREE for first 150 vendors (under Google's $200/month free credit)

---

## 📋 Overview

You now have a complete vendor discovery system that:
1. ✅ Uses FREE local ZIP database for distance calculations (zero ongoing cost)
2. ✅ Uses Google Places to discover vendors (free tier covers ~150 vendors/month)
3. ✅ Admin tool to search, preview, and import vendors
4. ✅ Automatic coordinate lookup when vendors register

---

## 🚀 STEP 1: Setup Free ZIP Code Database

### 1.1 Download Free ZIP Database

**Option A: SimpleMaps (Recommended)**
1. Visit: https://simplemaps.com/data/us-zips
2. Click "Download Free"
3. Get the free CSV (42,000+ US ZIP codes with coordinates)
4. Save file as `uszips.csv`

**Option B: UnitedStatesZipCodes.org**
1. Visit: https://www.unitedstateszipcodes.org/zip-code-database/
2. Download the free database
3. Save as CSV

### 1.2 Prepare the CSV

Open the CSV and make sure it has these columns (rename if needed):
```
zip, city, state_id, state_name, latitude, longitude, timezone
```

Example row:
```
32548,Fort Walton Beach,FL,Florida,30.4063,-86.6140,America/Chicago
```

### 1.3 Create ZIP Codes Table in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Run this file: database-migrations/create-zip-codes-table.sql
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

CREATE INDEX IF NOT EXISTS idx_zip_codes_zip ON zip_codes(zip);
CREATE INDEX IF NOT EXISTS idx_zip_codes_state ON zip_codes(state_code);
```

4. Click "Run"
5. You should see: "Success. No rows returned"

### 1.4 Upload ZIP Codes to Supabase

**Option A: Using Supabase Table Editor (Easiest)**
1. Go to Supabase → Table Editor
2. Select "zip_codes" table
3. Click "Insert" → "Insert via CSV"
4. Upload your `uszips.csv` file
5. Map columns:
   - zip → zip
   - city → city
   - state_id → state_code
   - state_name → state_name
   - lat → latitude
   - lng → longitude
   - timezone → timezone
6. Click "Import"
7. Wait 2-3 minutes for 42,000 rows to upload

**Option B: Using SQL Import**
1. Go to Supabase → SQL Editor
2. Click "New Query"
3. Paste:
```sql
-- You'll need to modify this based on your CSV location
-- Contact Supabase support for bulk import help if needed
```

### 1.5 Verify ZIP Database Works

1. Go to Supabase → SQL Editor
2. Run this test query:
```sql
SELECT * FROM zip_codes WHERE zip = '32548';
```

3. You should see Fort Walton Beach data
4. ✅ ZIP database is ready!

---

## 🔑 STEP 2: Setup Google Places API

### 2.1 Create Google Cloud Project

1. Visit: https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name it: "Bella Wedding AI"
4. Click "Create"

### 2.2 Enable Places API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Places API"
3. Click on "Places API (New)"
4. Click "Enable"

### 2.3 Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key (looks like: `AIzaSyC...`)
4. Click "Edit API key" (pencil icon)
5. Under "API restrictions":
   - Select "Restrict key"
   - Check "Places API"
6. Click "Save"

### 2.4 Add API Key to Your Project

1. Open your project folder
2. Find or create `.env.local` file
3. Add this line:
```env
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC_YOUR_KEY_HERE
```

4. Replace `AIzaSyC_YOUR_KEY_HERE` with your actual key
5. Save the file

### 2.5 Verify API Key Works

1. Go to: https://maps.googleapis.com/maps/api/place/textsearch/json?query=wedding+photographer&location=30.4063,-86.6140&radius=40000&key=YOUR_KEY
2. Replace YOUR_KEY with your actual key
3. You should see JSON results with wedding businesses
4. ✅ Google Places API is ready!

---

## 🗄️ STEP 3: Update Vendors Table

### 3.1 Run Database Migration

1. Go to Supabase → SQL Editor
2. Click "New Query"
3. Copy and paste from: `database-migrations/add-vendor-search-fields.sql`

```sql
-- This adds ZIP code, pricing, and location fields to vendors table
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS travel_radius INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS starting_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_tier VARCHAR(20) CHECK (price_tier IN ('Affordable', 'Moderate', 'Premium', 'Luxury')),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS response_rate INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_profile_view_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_inquiries INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_vendors_zip_code ON vendors(zip_code);
CREATE INDEX IF NOT EXISTS idx_vendors_price_tier ON vendors(price_tier);
CREATE INDEX IF NOT EXISTS idx_vendors_category_tier ON vendors(category, tier);
```

4. Click "Run"
5. ✅ Vendors table is updated!

---

## 🎯 STEP 4: Discover and Import Vendors

### 4.1 Access Vendor Discovery Tool

1. Start your Next.js app: `npm run dev`
2. Go to: http://localhost:3000/admin/vendor-discovery
3. You should see the Vendor Discovery Tool

### 4.2 Search for Vendors

**Example: Find photographers in Fort Walton Beach**
1. Category: Select "photographer"
2. ZIP Code: Enter "32548"
3. Radius: Select "25 miles"
4. Click "Search"

Wait 3-5 seconds...

You should see 10-20 local wedding photographers!

### 4.3 Review and Select Vendors

1. Review the list - you'll see:
   - Business name
   - Address
   - Phone number
   - Website
   - Star rating
   - Review count

2. Click on vendors you want to import (checkboxes)
3. Or click "Select All" to import all

### 4.4 Import Vendors

1. Click "Import (X)" button
2. Wait for confirmation
3. ✅ Vendors are now in your database!

### 4.5 Verify Import

1. Go to: http://localhost:3000/vendors
2. You should see the imported vendors
3. Try the ZIP search with the same ZIP code
4. Vendors should appear with distance calculations

---

## 🎨 STEP 5: Bootstrap Your Database

### 5.1 Search Multiple Categories

Repeat Step 4 for each category:

**High Priority (do these first):**
- photographer (32548)
- venue (32548)
- caterer (32548)
- florist (32548)
- videographer (32548)

**Medium Priority:**
- dj
- hair salon
- makeup artist
- baker
- wedding planner

**Target:** 10-15 vendors per category = 100-150 total

### 5.2 Search Multiple ZIP Codes

If you want to cover a wider area:
- 32548 (Fort Walton Beach)
- 32541 (Destin)
- 30A areas
- Pensacola

### 5.3 Cost Tracking

Each search = 1 API call
Each vendor result = 0 extra cost (already included)

**Example costs:**
- 10 categories × 3 ZIP codes = 30 searches
- 30 searches = ~$0.15
- **Well under the $200/month free tier!**

---

## ✅ STEP 6: Testing Everything

### 6.1 Test ZIP Search

1. Go to: http://localhost:3000/vendors
2. Enter ZIP: "32548"
3. Select radius: "25 miles"
4. Select category: "Photography"
5. You should see vendors sorted by tier, then distance

### 6.2 Test Price Filtering

1. Click different price tiers
2. Vendors should filter accordingly

### 6.3 Test Vendor Registration

1. Go to: http://localhost:3000/vendor-register
2. Register a test vendor with ZIP code
3. Their coordinates should auto-populate
4. They should appear in search results

---

## 💰 Cost Summary

**Setup Costs:**
- ZIP Database: **$0** (free download)
- Supabase Storage: **$0** (free tier)
- Google Places API: **$0-10** for initial 150 vendors

**Ongoing Costs:**
- ZIP Lookups: **$0** (local database)
- Distance Calculations: **$0** (local Haversine formula)
- Vendor Discovery: **$0** (only use it once for seeding)

**Total Cost: ~$0-10 one-time, then $0 forever**

---

## 🚨 Troubleshooting

### "ZIP not found" Error
- Check that zip_codes table has data
- Run: `SELECT COUNT(*) FROM zip_codes;` should return ~42,000

### "Google Places API error"
- Check API key is correct in `.env.local`
- Verify Places API is enabled in Google Cloud
- Check you haven't exceeded free tier ($200/month)

### "No vendors found"
- Try different ZIP codes
- Try wider radius (50 miles)
- Check category spelling

### Distance Not Showing
- Check vendors have latitude/longitude
- Check ZIP codes table has correct coordinates
- Clear browser cache and refresh

---

## 📞 Need Help?

If you get stuck:
1. Check console for errors (F12 in browser)
2. Check Supabase logs
3. Verify API key works in browser
4. Make sure .env.local is in the right location

---

## 🎉 You're Done!

You now have:
- ✅ FREE ZIP code database for distance calculations
- ✅ Google Places vendor discovery
- ✅ 100+ vendors to launch with
- ✅ ZIP + radius search working
- ✅ Price filtering working
- ✅ $0 ongoing costs

**Ready to launch! 🚀**
