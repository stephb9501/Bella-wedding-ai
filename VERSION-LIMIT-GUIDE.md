# Master Plan Version Limit System

## Overview

The master plan version system automatically limits the number of saved versions to **50 per plan** to prevent excessive storage usage.

---

## How It Works

### Default Settings:
- **Max versions per plan**: 50
- **Auto-cleanup**: Enabled
- **Cleanup strategy**: Keep newest 50, delete oldest

### When Cleanup Happens:
Every time a new version is created (when plan is locked), the system automatically:
1. Checks total version count for that plan
2. If count > 50, deletes oldest versions
3. Keeps newest 50 versions

### Example:
```
Plan has 52 versions
User locks plan → creates version 53
Auto-cleanup triggered:
  - Total: 53 versions
  - Limit: 50 versions
  - Action: Delete 3 oldest versions (keep newest 50)
```

---

## Configuration

### View Current Settings:
```sql
SELECT * FROM plan_version_config;
```

### Change Version Limit:
```sql
UPDATE plan_version_config
SET max_versions_per_plan = 100  -- Change to 100 versions
WHERE id = (SELECT id FROM plan_version_config LIMIT 1);
```

### Disable Auto-Cleanup:
```sql
UPDATE plan_version_config
SET auto_cleanup_enabled = false
WHERE id = (SELECT id FROM plan_version_config LIMIT 1);
```

### Re-Enable Auto-Cleanup:
```sql
UPDATE plan_version_config
SET auto_cleanup_enabled = true
WHERE id = (SELECT id FROM plan_version_config LIMIT 1);
```

---

## Storage Impact

### Version Size Estimation:
- Each version stores: Plan data + all items (JSONB)
- Average version size: ~10-50 KB (depends on plan complexity)
- 50 versions: ~500 KB - 2.5 MB per plan

### Without Limit:
If bride locks/unlocks plan 500 times:
- 500 versions × 50 KB = **25 MB per plan**
- 100 brides doing this = **2.5 GB storage**

### With Limit (50 versions):
- Maximum storage per plan: **2.5 MB**
- 100 brides: **250 MB storage** ✅

---

## Manual Cleanup

If you need to manually clean up old versions for a specific plan:

```sql
SELECT cleanup_old_plan_versions('PLAN_ID_HERE');
```

Or clean up all plans:

```sql
DO $$
DECLARE
  v_plan RECORD;
BEGIN
  FOR v_plan IN SELECT id FROM master_wedding_plans LOOP
    PERFORM cleanup_old_plan_versions(v_plan.id);
  END LOOP;
END $$;
```

---

## Version History

Brides can still see version history, but only the most recent 50 versions are saved.

### Check Version Count:
```sql
SELECT
  mwp.plan_name,
  mwp.bride_id,
  COUNT(mpv.id) as version_count
FROM master_wedding_plans mwp
LEFT JOIN master_plan_versions mpv ON mpv.master_plan_id = mwp.id
GROUP BY mwp.id, mwp.plan_name, mwp.bride_id
ORDER BY version_count DESC;
```

---

## FAQ

### Q: Can I increase the limit?
**A:** Yes, update `max_versions_per_plan` in `plan_version_config` table.

### Q: What happens to deleted versions?
**A:** They are permanently deleted to free up storage. Only newest versions are kept.

### Q: Can I disable auto-cleanup?
**A:** Yes, but not recommended. Storage could grow indefinitely.

### Q: Are profile photos/documents affected?
**A:** No, only plan version snapshots are limited. Photos and documents are separate.

### Q: Can I restore a deleted old version?
**A:** No, deleted versions are gone. That's why we keep 50 versions (plenty of history).

---

## Monitoring

### Check Plans Approaching Limit:
```sql
SELECT
  mwp.id,
  mwp.plan_name,
  COUNT(mpv.id) as version_count,
  (SELECT max_versions_per_plan FROM plan_version_config LIMIT 1) as max_allowed
FROM master_wedding_plans mwp
JOIN master_plan_versions mpv ON mpv.master_plan_id = mwp.id
GROUP BY mwp.id, mwp.plan_name
HAVING COUNT(mpv.id) > 40  -- Alert when approaching limit
ORDER BY version_count DESC;
```

---

## Recommendations

1. **Keep default limit (50 versions)**: More than enough for normal use
2. **Keep auto-cleanup enabled**: Prevents storage bloat
3. **Monitor version counts**: Alert brides if they're creating too many versions
4. **Educate users**: Explain that locking/unlocking creates new versions

---

## Cost Impact

### With Version Limits:
- Max 50 versions per plan
- 1000 plans × 50 versions × 50 KB = **2.5 GB total**
- Storage cost: **$0.05/month** ✅

### Without Version Limits:
- Could create 1000+ versions per plan
- 1000 plans × 1000 versions × 50 KB = **50 GB total**
- Storage cost: **$1.05/month** ❌

**Savings: $1.00/month or 95% reduction!**

---

## Summary

- ✅ Prevents storage bloat from excessive versions
- ✅ Automatic cleanup (no manual intervention)
- ✅ Keeps 50 newest versions (plenty of history)
- ✅ Reduces storage costs by 95%
- ✅ Configurable limits
- ✅ Can disable if needed

**Your storage is protected!** 🎉
