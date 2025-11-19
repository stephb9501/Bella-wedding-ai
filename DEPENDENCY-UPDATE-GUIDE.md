# Dependency & Service Update Monitoring Guide

## 🎯 What This Does

Tracks when your external services and code libraries need updates, so you don't get surprised by:
- ❌ Breaking changes
- 🔒 Security vulnerabilities
- 💰 Service price increases
- 📅 API deprecations (when old APIs stop working)

---

## 📊 What Gets Tracked

### External Services:
- **Supabase** (your database)
- **SendGrid** (email service)
- **Claude AI** (Anthropic)
- **Vercel** (hosting)
- **Stripe** (payments - when you add it)

### Code Packages (npm):
- Next.js
- React
- Supabase libraries
- TypeScript
- All your dependencies

### Security:
- CVE vulnerabilities
- npm security audits
- Patch availability

---

## 🔧 Setup

### Step 1: Run the SQL Schema
In **Supabase SQL Editor**, run:
```
CREATE-DEPENDENCY-MONITORING-SCHEMA.sql
```

This automatically tracks:
- Supabase
- SendGrid
- Claude AI
- Vercel
- Critical npm packages

### Step 2: Check Current Status
```bash
GET /api/admin/dependencies?report_type=summary
```

Returns:
```json
{
  "services": [...],
  "packages_needing_update": [...],
  "vulnerable_packages": [...],
  "security_summary": {
    "total_vulnerabilities": 2,
    "critical_count": 0,
    "high_count": 1,
    "unpatched_count": 2
  },
  "total_updates_available": 5
}
```

---

## 📋 Common Tasks

### Check if Services Need Updates
```bash
GET /api/admin/dependencies?report_type=services_needing_updates
```

Example response:
```json
{
  "services": [
    {
      "service_name": "Supabase",
      "current_version": "2.38.0",
      "latest_version": "2.39.0",
      "update_priority": "medium",
      "update_type": "feature",
      "changelog_url": "https://github.com/supabase/supabase/releases"
    }
  ]
}
```

### Check for Security Vulnerabilities
```bash
GET /api/admin/dependencies?report_type=vulnerabilities
```

Example response:
```json
{
  "vulnerabilities": [
    {
      "cve_id": "CVE-2024-12345",
      "vulnerability_title": "XSS vulnerability in react-dom",
      "severity": "high",
      "affected_package": "react-dom",
      "affected_versions": ">=18.0.0 <18.2.1",
      "fixed_in_version": "18.2.1"
    }
  ]
}
```

### Check Upcoming API Deprecations
```bash
GET /api/admin/dependencies?report_type=api_deprecations
```

Example response:
```json
{
  "deprecations": [
    {
      "service_name": "Anthropic Claude",
      "old_version": "2023-01-01",
      "new_version": "2023-06-01",
      "effective_date": "2025-03-01",
      "days_until_effective": 45,
      "migration_guide_url": "https://docs.anthropic.com/migrations"
    }
  ]
}
```

---

## 🚨 When You Get an Alert

### Security Vulnerability Alert

**What it means:** A package has a security flaw.

**What to do:**
1. Check severity (critical = urgent, low = can wait)
2. Read the CVE details
3. Update the package:
   ```bash
   npm update [package-name]
   ```
4. Mark as patched:
   ```bash
   POST /api/admin/dependencies
   {
     "action": "mark_vulnerability_patched",
     "vulnerability_id": "uuid-here"
   }
   ```

### Service Update Available

**What it means:** Supabase (or another service) has a new version.

**What to do:**
1. Read the changelog
2. Check if it's a breaking change
3. If it's just bug fixes → safe to ignore
4. If it's a security update → update ASAP
5. Mark as resolved:
   ```bash
   POST /api/admin/dependencies
   {
     "action": "update_service_version",
     "service_name": "Supabase",
     "current_version": "2.39.0"
   }
   ```

### API Deprecation Warning

**What it means:** An old API version will stop working soon.

**Example:** Claude API 2023-01-01 stops working on March 1, 2025.

**What to do:**
1. Check days until deadline
2. Read migration guide
3. Update your code to use new API
4. Test in development
5. Deploy before deadline

---

## ➕ Adding New Services to Track

### Add a New Service (e.g., Twilio SMS)
```bash
POST /api/admin/dependencies
```
```json
{
  "action": "add_service",
  "service_name": "Twilio SMS",
  "service_category": "sms",
  "provider": "Twilio Inc.",
  "current_version": "2024-01-01",
  "current_api_version": "2024-01-01",
  "documentation_url": "https://www.twilio.com/docs",
  "current_plan": "Pay-as-you-go",
  "monthly_cost": 5.00
}
```

### Add a New npm Package to Track
```bash
POST /api/admin/dependencies
```
```json
{
  "action": "add_package",
  "package_name": "@stripe/stripe-js",
  "package_type": "dependency",
  "current_version": "2.1.0",
  "is_critical": true
}
```

---

## 📊 Regular Maintenance Schedule

### Weekly (Every Monday):
```bash
GET /api/admin/dependencies?report_type=summary
```

Check for:
- Critical security vulnerabilities (patch immediately)
- High-priority service updates
- New notifications

### Monthly (First of Month):
```bash
GET /api/admin/dependencies?report_type=vulnerabilities
GET /api/admin/dependencies?report_type=api_deprecations
```

Check for:
- Unpatched vulnerabilities
- Upcoming API deprecations
- Service cost changes

### Quarterly (Every 3 Months):
1. Run `npm audit` in your project
2. Update all packages:
   ```bash
   npm update
   ```
3. Test everything
4. Update service versions in database

---

## 🔔 Automatic Notifications (Optional)

You can set up email alerts when critical updates are available. This requires configuring Supabase Edge Functions to send emails when:
- Critical security vulnerability is detected
- API deprecation deadline is < 30 days away
- Service has breaking change available

(We can build this later if you want!)

---

## 💡 Best Practices

### Security Vulnerabilities:
- **Critical** → Patch within 24 hours
- **High** → Patch within 1 week
- **Moderate** → Patch within 1 month
- **Low** → Patch in next regular update

### Service Updates:
- **Breaking changes** → Test thoroughly before updating
- **Security patches** → Update ASAP
- **Feature releases** → Update when convenient
- **Deprecations** → Update before deadline

### npm Packages:
- Don't update everything at once (test incrementally)
- Read changelogs before updating
- Keep major dependencies (React, Next.js) current
- Run `npm audit` weekly

---

## 🛠️ How to Update Things

### Update npm Package:
```bash
# Update one package
npm update react

# Update all packages
npm update

# Force update to latest (even if major version)
npm install react@latest
```

After updating, mark in system:
```bash
POST /api/admin/dependencies
{
  "action": "add_package",
  "package_name": "react",
  "current_version": "18.3.0"
}
```

### Update Service API Version:
```bash
POST /api/admin/dependencies
{
  "action": "update_service_version",
  "service_name": "Anthropic Claude",
  "current_api_version": "2023-06-01"
}
```

---

## 📞 Emergency: Critical Vulnerability

If you get a **CRITICAL** security alert:

### Step 1: Don't Panic
Check what's affected:
```bash
GET /api/admin/dependencies?report_type=vulnerabilities
```

### Step 2: Assess Risk
- Is it in production?
- Is it exploitable?
- Is there a patch available?

### Step 3: Quick Fix
If patch available:
```bash
npm update [vulnerable-package]
npm audit fix
```

### Step 4: Deploy
```bash
git add package.json package-lock.json
git commit -m "Security patch: Fix CVE-XXXX"
git push
```

### Step 5: Mark as Patched
```bash
POST /api/admin/dependencies
{
  "action": "mark_vulnerability_patched",
  "vulnerability_id": "uuid"
}
```

---

## 🎯 What You Should See

### Good (All Clear):
- ✅ No critical vulnerabilities
- ✅ All services up to date
- ✅ No API deprecations < 90 days away
- ✅ No pending notifications

### Warning (Take Action Soon):
- ⚠️ 1-2 moderate vulnerabilities
- ⚠️ Some packages out of date
- ⚠️ API deprecation in 60-90 days

### Critical (Take Action Now):
- 🚨 Critical security vulnerability
- 🚨 API deprecation < 30 days away
- 🚨 Breaking change deployed in production
- 🚨 Service down (check status page)

---

## 🔗 Important Links

### Service Status Pages:
- Supabase: https://status.supabase.com
- SendGrid: https://status.sendgrid.com
- Anthropic: https://status.anthropic.com
- Vercel: https://www.vercel-status.com

### Changelogs:
- Supabase: https://github.com/supabase/supabase/releases
- Next.js: https://github.com/vercel/next.js/releases
- React: https://github.com/facebook/react/releases

### Security:
- npm audit: Run `npm audit` in your project
- CVE Database: https://cve.mitre.org
- GitHub Security Advisories: https://github.com/advisories

---

## ✅ Summary

You now have:
- ✅ Automatic tracking of all services (Supabase, SendGrid, Claude, etc.)
- ✅ npm package version monitoring
- ✅ Security vulnerability tracking
- ✅ API deprecation warnings
- ✅ Update priority system
- ✅ One dashboard to see everything

**Check weekly, update monthly, never get surprised!**
