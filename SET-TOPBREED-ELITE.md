# 👑 Set Topbreed Productions to Elite Tier

## Quick Fix - Run this SQL in Supabase:

```sql
-- Give topbreedproductions Elite tier with all features unlocked
UPDATE vendors
SET
  tier = 'elite',
  subscription_tier = 'elite',
  is_featured = true
WHERE business_name = 'topbreedproductions';
```

This gives your business:
- ✅ **Unlimited photos** (999)
- ✅ **Unlimited messages** (999)
- ✅ **3 service regions**
- ✅ **3 service categories**
- ✅ **5 staff members**
- ✅ **0% commission** (no fees!)
- ✅ **Featured placement** on homepage

---

## For Testing Other Vendors

You have 2 options:

### Option A: Give All Test Vendors Elite Access (During Testing Only)
```sql
-- Upgrade all vendors to elite tier for testing
UPDATE vendors
SET
  tier = 'elite',
  subscription_tier = 'elite',
  is_featured = true;
```

### Option B: Keep Tier System, Add "Owner Override" Flag

This lets you mark certain vendors as platform owners who bypass all limits:

```sql
-- Add owner flag column
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_platform_owner BOOLEAN DEFAULT false;

-- Mark your business as owner
UPDATE vendors
SET is_platform_owner = true
WHERE business_name = 'topbreedproductions';
```

Then we update the frontend code to check `is_platform_owner` and bypass all tier limits.

---

## Recommendation:

**For now (testing phase):**
1. Set your business (topbreedproductions) to Elite tier permanently
2. Give a few test vendors Elite access so you can test all features
3. Before launch, downgrade test vendors to Free tier

**For production:**
1. Your business (topbreedproductions) stays Elite/Owner forever (0% commission, unlimited everything)
2. New vendors start at Free tier and can upgrade via the upgrade page

---

Run the first SQL to give your business full access immediately!
