# 🔍 Verify Elite Status

## Check Current Tier Status

Run this SQL to see your current tier:

```sql
SELECT business_name, tier, subscription_tier, is_featured
FROM vendors
WHERE business_name LIKE '%Topbreed%';
```

---

## If Still Not Elite, Run This:

### Option 1: Update by business name
```sql
UPDATE vendors
SET
  tier = 'elite',
  subscription_tier = 'elite',
  is_featured = true
WHERE business_name ILIKE '%topbreed%';
```

### Option 2: Update by your user ID (guaranteed to work)
First, find your user ID:
```sql
SELECT id, business_name, email, tier
FROM vendors
ORDER BY created_at DESC
LIMIT 10;
```

Then update using your ID (replace YOUR_USER_ID_HERE):
```sql
UPDATE vendors
SET
  tier = 'elite',
  subscription_tier = 'elite',
  is_featured = true
WHERE id = 'YOUR_USER_ID_HERE';
```

---

## After Update

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Your dashboard should now show:
   - **Elite** badge (gold/amber icon)
   - **0%** commission rate
   - **∞ or 999** photos allowed

---

## If Still Showing Old Data

Try logging out and back in:
1. Click **Logout** button
2. Log back in
3. Dashboard should load fresh data

---

The issue might be browser caching or the business name not matching exactly.
