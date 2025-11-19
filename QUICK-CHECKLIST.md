# ⚡ Quick Setup Checklist

Use this as a quick reference. See `FINALIZATION-STEPS.md` for detailed instructions.

---

## 📋 SQL Files to Run (In Order)

Open Supabase SQL Editor and run these files one by one:

- [ ] 1. `CREATE-VENDOR-PHOTO-GALLERY-SCHEMA.sql`
- [ ] 2. `CREATE-MASTER-PLAN-SCHEMA.sql`
- [ ] 3. `CREATE-PROFITABILITY-TRACKING-SCHEMA.sql`
- [ ] 4. `CREATE-COST-MONITORING-SCHEMA.sql`
- [ ] 5. `CREATE-QUESTIONNAIRE-SYSTEM-SCHEMA.sql`
- [ ] 6. `CREATE-FEATURE-TOGGLE-SCHEMA.sql`
- [ ] 7. `CREATE-COUPON-SYSTEM-SCHEMA.sql`
- [ ] 8. `CREATE-DEPENDENCY-MONITORING-SCHEMA.sql`

**How to run each file:**
1. Copy entire file contents (Ctrl+A, Ctrl+C)
2. Open Supabase → SQL Editor → New Query
3. Paste (Ctrl+V)
4. Click RUN
5. Wait for "Success. No rows returned"
6. ✅ Move to next file

---

## 🧪 Tests to Run

### Test 1: Vendor Photo Gallery
- [ ] Login as vendor
- [ ] Upload 4+ photos
- [ ] Set one as profile photo
- [ ] View vendor profile as bride
- [ ] Verify all photos show (not just profile pic)

### Test 2: Master Plan
- [ ] Login as bride
- [ ] Create master plan
- [ ] Add item (should be "pending")
- [ ] Approve item
- [ ] Lock plan (creates version)
- [ ] Unlock plan (version preserved)

### Test 3: Undo Button
- [ ] Add item to plan
- [ ] Click Undo
- [ ] Verify item disappears

### Test 4: Navigation
- [ ] Login as vendor
- [ ] Find vendor dashboard link
- [ ] Can access vendor dashboard (not stuck in bride view)

---

## 🚀 Deployment

- [ ] All tests pass locally
- [ ] Merge branch to main
- [ ] Vercel auto-deploys
- [ ] Run all SQL files in PRODUCTION Supabase
- [ ] Test live site

---

## 📊 Verification Queries

Run these in Supabase to verify everything installed:

### Check all tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check pricing tiers:
```sql
SELECT * FROM pricing_tiers;
```

### Check version config:
```sql
SELECT * FROM plan_version_config;
```

### Check your admin account:
```sql
SELECT email, role, is_active FROM users WHERE email = 'YOUR_EMAIL';
```

---

## 🎯 Quick Commands

### Git commands (if needed):
```bash
# Merge to main
git checkout main
git merge claude/fix-pro-message-018RCcEezSd4po5nSny5bS8z
git push origin main

# Check status
git status
git log --oneline -5
```

### Test API endpoints:
```bash
# Get vendor photos
curl http://localhost:3000/api/vendor/photos?action=get_my_photos

# Get master plan
curl http://localhost:3000/api/master-plan?action=get_plan

# Get profitability summary
curl http://localhost:3000/api/admin/profitability?report_type=summary
```

---

## ✅ Done When:

- [x] All 8 SQL files run successfully ✅
- [x] All tests pass ✅
- [x] Navigation works ✅
- [x] Deployed to production ✅
- [x] Production SQL files run ✅

---

**Need detailed steps?** See `FINALIZATION-STEPS.md`

**Got errors?** Check the Troubleshooting section in `FINALIZATION-STEPS.md`
