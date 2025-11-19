# Bella Wedding AI - Complete Admin Manual
## Master Reference Guide

**Version:** 1.0
**Last Updated:** November 2025
**Your Location:** Stone County, Arkansas
**Admin:** stephb9501@gmail.com

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Database Setup](#database-setup)
3. [Sales Tax (Arkansas)](#sales-tax-arkansas)
4. [Review Moderation](#review-moderation)
5. [Vendor Management](#vendor-management)
6. [Team Management (Assign Helpers)](#team-management)
7. [Bride Account Access](#bride-account-access)
8. [Financial Reports](#financial-reports)
9. [Signup Analytics](#signup-analytics)
10. [Monthly Tasks](#monthly-tasks)
11. [Quarterly Tasks](#quarterly-tasks)
12. [Annual Tasks](#annual-tasks)
13. [Legal Protection](#legal-protection)
14. [Troubleshooting](#troubleshooting)

---

## Getting Started

### 🚀 Initial Setup (One-Time)

1. **Run Database Schemas in Supabase**

   Go to: Supabase Dashboard → SQL Editor

   Run these files IN ORDER:

   - `CREATE-ADMIN-SYSTEM-SCHEMA.sql` - Admin roles, moderation, impersonation
   - `CREATE-FINANCIAL-TRACKING-SCHEMA.sql` - Commission & tax tracking
   - `CREATE-SALES-TAX-SCHEMA.sql` - Arkansas sales tax tracking
   - `CREATE-SIGNUP-ANALYTICS-SCHEMA.sql` - Vendor/bride signup tracking

2. **Create Storage Buckets**

   Go to: Supabase Dashboard → Storage → New Bucket

   Create these:
   - `wedding-files` (Private, 50MB limit)
   - `vendor-portfolios` (Public, 10MB limit)
   - `profile-images` (Public, 5MB limit)

3. **Verify Super Admin Access**

   Your email `stephb9501@gmail.com` is automatically granted super admin.

4. **Access Admin Panel**

   Go to: `https://your-site.com/admin/dashboard`

---

## Database Setup

### SQL Files Reference

| File | Purpose | Run When |
|------|---------|----------|
| `CREATE-ADMIN-SYSTEM-SCHEMA.sql` | Admin roles, moderation, impersonation | Once (setup) |
| `CREATE-FINANCIAL-TRACKING-SCHEMA.sql` | Commission tracking, tax reports | Once (setup) |
| `CREATE-SALES-TAX-SCHEMA.sql` | Arkansas sales tax | Once (setup) |
| `CREATE-SIGNUP-ANALYTICS-SCHEMA.sql` | Vendor/bride analytics | Once (setup) |

### Important Tables

- `admin_roles` - Who has admin access and what permissions
- `vendor_reviews` - All reviews (including hidden ones)
- `review_moderation_log` - Audit trail of review actions
- `vendor_moderation_log` - Audit trail of vendor actions
- `admin_impersonation_log` - Audit trail of account access
- `platform_transactions` - Your commission revenue
- `sales_tax_collected` - Sales tax owed to Arkansas
- `vendors` - All vendor accounts
- `users` - All bride/user accounts

---

## Sales Tax (Arkansas)

### 📋 What You Need to Know

**Arkansas Taxes Digital Services:** YES
**You Must Collect Sales Tax On:**
- Vendor subscription fees ($34.99, $49.99, $79.99/month)
- Commission on bookings (if Arkansas vendor)

**Your Rates (Stone County):**
- State: 6.5%
- Stone County: ~1.5-2% (varies by city)
- **Total: ~8-8.5%**

### Monthly Sales Tax Process

**Due Date:** 20th of the month following collection

#### Step 1: Generate Monthly Report

```
GET /api/admin/sales-tax?report_type=arkansas_monthly&year=2025&month=11
```

Or in admin dashboard: **Financials → Sales Tax → Arkansas Monthly**

#### Step 2: Review Report

Check:
- Gross taxable sales
- State tax collected
- County tax collected
- Total tax due

#### Step 3: Export for Filing

```
POST /api/admin/sales-tax
{
  "year": 2025,
  "month": 11,
  "report_type": "arkansas_dfa"
}
```

Downloads CSV file.

#### Step 4: File with Arkansas DFA

1. Go to: https://atap.arkansas.gov/
2. Login with your account
3. File Sales & Use Tax Return (Form ST-1)
4. Enter amounts from report
5. Pay electronically

#### Step 5: Mark as Remitted

```
PUT /api/admin/sales-tax
{
  "state": "AR",
  "year": 2025,
  "month": 11
}
```

This marks transactions as "PAID" in your system.

### Sales Tax Reports Available

| Report | API Endpoint | What It Shows |
|--------|-------------|---------------|
| Arkansas Monthly | `?report_type=arkansas_monthly` | Breakdown by county/city |
| All States Summary | `?report_type=all_states` | Multi-state overview |
| DFA Export | `?report_type=dfa_export` | Arkansas filing format |
| Taxes Owed | `?report_type=owed` | What you haven't paid yet |

### Important Notes

⚠️ **Sales tax is based on VENDOR location**, not yours
⚠️ **Only Arkansas vendors are taxed** (unless you expand to other states)
⚠️ **Free tier is $0/month = no sales tax** (but commission IS taxed)
⚠️ **Keep records for 7 years** (Arkansas requirement)

---

## Review Moderation

### When to Hide a Review

✅ **Hide if:**
- Bride requested items not in vendor contract
- False or misleading information
- Personal attacks/harassment
- Violates Terms of Service
- Unrelated to actual service

❌ **Do NOT hide if:**
- You disagree with review
- Vendor complains but review is factual
- Negative but honest feedback

### How to Hide a Review

**API:**
```
POST /api/admin/reviews/moderate
{
  "review_id": "review-uuid-here",
  "action": "hide",
  "reason": "Bride requested centerpieces which were not in vendor's contract. Reviewed contract - vendor was correct.",
  "admin_notes": "Ticket #12345 - Vendor provided contract showing no centerpieces included"
}
```

**Admin Dashboard:**
1. Go to: Reviews → Moderation
2. Filter: "Flagged" or "All"
3. Find review
4. Click "Hide"
5. Enter detailed reason
6. Click "Confirm"

### Actions Available

| Action | What It Does | When to Use |
|--------|-------------|-------------|
| **Hide** | Removes from public, keeps in database | Most common - unfair review |
| **Unhide** | Makes public again | If you made a mistake |
| **Delete** | Marks as deleted (still in audit log) | Severe violations only |

### Review Context Checking

Before hiding, check:
1. **Vendor Contract** - What was promised?
2. **Booking Details** - Was service delivered?
3. **Communication Log** - Any disputes?
4. **Wedding Date** - Did wedding happen?

### Legal Protection

Every moderation is logged with:
- Your user ID
- Reason (required, min 10 characters)
- IP address
- Timestamp
- Original review content (preserved)

**Cannot be deleted** - protects you in disputes.

### View Reviews for Moderation

**All Reviews:**
```
GET /api/admin/reviews/moderate?filter=all
```

**Hidden Reviews:**
```
GET /api/admin/reviews/moderate?filter=hidden
```

**Flagged Reviews (low ratings or complaints):**
```
GET /api/admin/reviews/moderate?filter=flagged
```

**Recent Reviews (last 7 days):**
```
GET /api/admin/reviews/moderate?filter=recent
```

---

## Vendor Management

### Approve New Vendor

When vendor registers, they start as "pending". You must approve.

**API:**
```
POST /api/admin/vendors/manage
{
  "vendor_id": "vendor-uuid",
  "action": "approve",
  "reason": "Verified business license #12345"
}
```

**Admin Dashboard:**
1. Vendors → Pending Approvals
2. Click vendor name
3. Review profile, category, license
4. Click "Approve" or "Reject"

### Actions Available

| Action | What It Does | When to Use |
|--------|-------------|-------------|
| **Approve** | Activates vendor account | After verification |
| **Suspend** | Temporarily deactivates | Multiple complaints, investigation |
| **Ban** | Permanently blocks | Fraud, TOS violations |
| **Activate** | Reactivates suspended vendor | After issue resolved |
| **Verify** | Adds verification badge | Premium vendors, verified identity |
| **Unverify** | Removes badge | If verification expires |
| **Change Tier** | Upgrade/downgrade subscription | Billing issues, upgrades |

### Change Vendor Tier

**API:**
```
POST /api/admin/vendors/manage
{
  "vendor_id": "vendor-uuid",
  "action": "change_tier",
  "changes": {
    "new_tier": "premium"
  },
  "reason": "Vendor requested upgrade, payment confirmed"
}
```

**Automatic Limit Updates:**
When you change tier, these update automatically:
- Portfolio photo limit
- Files per wedding limit
- Storage per wedding limit
- Commission rate

| Tier | Photos | Files/Wedding | Storage | Commission |
|------|--------|---------------|---------|------------|
| Free | 1 | 25 | 250MB | 10% |
| Premium | 15 | 50 | 500MB | 5% |
| Featured | 30 | 100 | 1GB | 2% |
| Elite | 75 | 200 | 2GB | 0% |

### Suspend Vendor

**API:**
```
POST /api/admin/vendors/manage
{
  "vendor_id": "vendor-uuid",
  "action": "suspend",
  "reason": "Multiple bride complaints - investigating"
}
```

Suspended vendors:
- Cannot be found in search
- Cannot receive new bookings
- Existing bookings continue
- Profile hidden from public

### Ban Vendor (Permanent)

**API:**
```
POST /api/admin/vendors/manage
{
  "vendor_id": "vendor-uuid",
  "action": "ban",
  "reason": "Fraudulent activity confirmed - fake reviews"
}
```

Banned vendors:
- Account permanently disabled
- Cannot create new account with same email
- Refunds processed if applicable

### View Vendors

**All Vendors:**
```
GET /api/admin/vendors/manage?filter=all
```

**Pending Approval:**
```
GET /api/admin/vendors/manage?filter=pending
```

**Active:**
```
GET /api/admin/vendors/manage?filter=active
```

**Suspended:**
```
GET /api/admin/vendors/manage?filter=suspended
```

**Verified Only:**
```
GET /api/admin/vendors/manage?filter=verified
```

**Search:**
```
GET /api/admin/vendors/manage?search=photography
```

---

## Team Management (Assign Helpers)

### Roles Available

| Role | Permissions | Best For |
|------|------------|----------|
| **Super Admin** | Everything (you) | Owner only |
| **Admin** | Everything except managing admins | Co-owner, manager |
| **Moderator** | Review moderation, content editing | Content manager |
| **Support** | Help users, view data, impersonate | Customer support |
| **Analyst** | Read-only analytics | Bookkeeper, reports |
| **Custom** | Pick specific permissions | Specialized roles |

### Assign Helper

**API:**
```
POST /api/admin/roles
{
  "target_email": "helper@example.com",
  "role_name": "support"
}
```

**With Temporary Access:**
```
POST /api/admin/roles
{
  "target_email": "temp-help@example.com",
  "role_name": "support",
  "expires_in_days": 30
}
```

### Custom Permissions

```
POST /api/admin/roles
{
  "target_email": "custom@example.com",
  "role_name": "custom",
  "custom_permissions": {
    "can_moderate_reviews": true,
    "can_approve_vendors": false,
    "can_change_vendor_tiers": false,
    "can_delete_users": false,
    "can_view_analytics": true,
    "can_manage_bookings": true,
    "can_view_financials": false,
    "can_edit_content": false,
    "can_manage_admins": false,
    "can_impersonate_users": false,
    "can_view_sensitive_data": false
  }
}
```

### View All Admins

```
GET /api/admin/roles
```

Returns:
- All admin users
- Their roles
- Permissions
- Who assigned them
- Expiration dates

### Revoke Admin Access

```
DELETE /api/admin/roles?user_id={user-id}
```

**Important:** You cannot revoke your own super admin access.

---

## Bride Account Access

### When to Access Bride Accounts

✅ **Valid Reasons:**
- Support ticket ("my timeline won't load")
- Bug troubleshooting
- Account recovery (forgot password)
- Data correction request
- Billing issues

❌ **NEVER Access For:**
- Curiosity
- Competitor research
- Personal reasons
- Without documented reason

### How to Impersonate (Privacy-Safe)

**API:**
```
POST /api/admin/impersonate
{
  "target_email": "bride@example.com",
  "reason": "Support ticket #12345 - timeline not loading, need to investigate",
  "duration_minutes": 30
}
```

**Returns:**
```json
{
  "success": true,
  "session": {
    "id": "session-uuid",
    "target_email": "bride@example.com",
    "expires_at": "2025-11-19T15:30:00Z",
    "duration_minutes": 30
  },
  "warning": "⚠️ All actions are logged. User will be notified."
}
```

### What Happens When You Impersonate

1. **Session Created** - Time-limited (max 60 min)
2. **User Notified** - Email sent immediately
3. **Actions Logged** - Everything you do is recorded
4. **Auto-Expires** - Session ends automatically
5. **Audit Trail** - Cannot be deleted (legal protection)

### While Impersonating

If you view sensitive data, log it:

```
PUT /api/admin/impersonate
{
  "session_id": "session-uuid",
  "viewed_sensitive_data": true,
  "sensitive_data_type": "payment_info"
}
```

Sensitive data types:
- `payment_info`
- `messages`
- `personal_documents`
- `vendor_communications`

### End Session Early

```
DELETE /api/admin/impersonate?session_id={session-uuid}
```

Or wait for auto-expiration.

### View Impersonation History

```
GET /api/admin/impersonate
```

Shows all sessions (last 50).

### Legal Compliance

Every impersonation logs:
- ✅ Who (your admin ID)
- ✅ When (timestamp)
- ✅ Why (reason - required)
- ✅ How long (duration)
- ✅ What was accessed (actions taken)
- ✅ IP address
- ✅ User notification sent

**This protects YOU legally if questioned.**

---

## Financial Reports

### Your Revenue Streams

1. **Commissions** - % of vendor bookings
   - Free: 10%
   - Premium: 5%
   - Featured: 2%
   - Elite: 0%

2. **Subscriptions** - Monthly vendor fees
   - Free: $0
   - Premium: $34.99
   - Featured: $49.99
   - Elite: $79.99

### Monthly Revenue Report

```
GET /api/admin/financials?report_type=overview
```

Returns:
- Monthly recurring revenue (MRR)
- Annual recurring revenue (ARR)
- Total commission earned
- Breakdown by tier

### Tax Report (Quarterly)

```
GET /api/admin/financials?report_type=tax_quarterly&year=2025&quarter=1
```

Returns IRS-ready data:
- Total gross income
- Commission earned
- Stripe fees (deductible)
- Net income

### Export for Accountant

```
POST /api/admin/financials
{
  "year": 2025,
  "quarter": 1
}
```

Downloads CSV for your CPA.

### Escrow Schedule

```
GET /api/admin/financials?report_type=escrow_schedule
```

Shows vendor payments to release (held until 30 days before wedding).

**Important:** This is VENDOR money, NOT yours. You only get commission.

### Commission Tracking

All commissions automatically tracked when vendor gets booking.

**Do NOT** manually adjust commissions - system calculates based on tier.

---

## Signup Analytics

### Overview Dashboard

```
GET /api/admin/analytics/signups?report_type=summary
```

Returns:
- Total vendors (by tier)
- Total brides (free vs. paid)
- New this week
- New this month
- Conversion rates

### Daily Vendor Signups

```
GET /api/admin/analytics/signups?report_type=daily_vendors&days=30
```

Shows daily breakdown by tier (last 30 days).

### Daily Bride Signups

```
GET /api/admin/analytics/signups?report_type=daily_brides&days=30
```

Shows daily bride signups.

### Monthly Trends

```
GET /api/admin/analytics/signups?report_type=monthly&months=12
```

Shows month-over-month trends (last 12 months).

### Growth Metrics

```
GET /api/admin/analytics/signups?report_type=growth&months=6
```

Shows:
- Month-over-month growth
- Growth percentage
- Bride vs. vendor growth

### Recent Signups (Detailed)

**Vendors:**
```
GET /api/admin/analytics/signups?report_type=recent_vendors&limit=50
```

**Brides:**
```
GET /api/admin/analytics/signups?report_type=recent_brides&limit=50
```

### Conversion Funnel

```
GET /api/admin/analytics/signups?report_type=conversion_funnel
```

Shows how many vendors upgraded (free → premium → featured → elite).

---

## Monthly Tasks

### 📅 Do These Every Month

#### Day 1-5: Review Last Month
- [ ] Check vendor signups
- [ ] Check bride signups
- [ ] Review revenue report
- [ ] Check for suspended vendors

#### Day 10-15: Sales Tax Prep
- [ ] Generate Arkansas sales tax report
- [ ] Review for accuracy
- [ ] Calculate total owed

#### Day 18-20: File Sales Tax
- [ ] File with Arkansas DFA (due 20th)
- [ ] Pay electronically
- [ ] Mark as remitted in system
- [ ] Save confirmation

#### Day 20-25: Vendor Management
- [ ] Review pending vendor approvals
- [ ] Check for flagged reviews
- [ ] Handle support tickets requiring impersonation

#### Day 25-End: Financial Close
- [ ] Export financial report
- [ ] Review commission payouts
- [ ] Check escrow schedule
- [ ] File receipts

---

## Quarterly Tasks

### 📅 Do These Every Quarter

#### Tax Reporting (15th of Jan, Apr, Jul, Oct)
- [ ] Generate quarterly tax report
- [ ] Export CSV for CPA
- [ ] Calculate estimated taxes
- [ ] Pay quarterly estimated taxes (IRS Form 1040-ES)

#### Analytics Review
- [ ] Review growth metrics
- [ ] Analyze conversion rates
- [ ] Check tier distribution
- [ ] Review pricing strategy

#### Admin Audit
- [ ] Review admin activity logs
- [ ] Review impersonation sessions
- [ ] Check for unauthorized access
- [ ] Verify admin role assignments

#### Legal/Compliance
- [ ] Review Terms of Service (any updates?)
- [ ] Check privacy policy compliance
- [ ] Review data retention
- [ ] Audit vendor suspensions/bans

---

## Annual Tasks

### 📅 Do These Every Year

#### Tax Time (January-April)
- [ ] Export full year financial report
- [ ] Send to CPA/accountant
- [ ] File IRS Form 1099 for vendors (if applicable)
- [ ] File business tax return
- [ ] File personal tax return

#### Arkansas Business License
- [ ] Renew business license (varies by county)
- [ ] Update registered agent if needed

#### Legal Review
- [ ] Review all Terms of Service
- [ ] Update Privacy Policy
- [ ] Review vendor contracts
- [ ] Update sales tax rates (if Arkansas changed)

#### Platform Audit
- [ ] Review all admin logs
- [ ] Export all financial data (backup)
- [ ] Review data retention policy
- [ ] Check for stale data to delete

#### Strategic Planning
- [ ] Review year-over-year growth
- [ ] Analyze revenue trends
- [ ] Plan pricing changes (if needed)
- [ ] Set goals for next year

---

## Legal Protection

### What's Logged (Cannot Be Deleted)

1. **All Review Moderation**
   - Who hid/deleted
   - When
   - Why
   - Original review content
   - IP address

2. **All Vendor Management**
   - Approvals, suspensions, bans
   - Tier changes
   - Reasons
   - IP address

3. **All Account Impersonation**
   - Every session
   - Duration
   - Reason
   - What was accessed
   - User notifications

4. **All Admin Actions**
   - What was done
   - By whom
   - When
   - IP address

### If You Get Questioned

**You:** "Here's the complete audit log showing I accessed the account for Support Ticket #12345 on March 15, 2025 at 2:30 PM. Session lasted 12 minutes. User was notified by email at 2:35 PM. I only viewed timeline data, not payment info. IP address 192.168.1.1."

**Result:** Complete legal defense.

### GDPR/CCPA Compliance

✅ Lawful basis for processing
✅ Data minimization
✅ User notifications
✅ Audit trails
✅ Right to erasure (except logs)

### Data Retention

**Keep Forever:**
- Admin logs
- Financial transactions
- Sales tax records

**Keep 7 Years:**
- User data
- Booking records
- Tax documents

**Delete After 90 Days:**
- File uploads (post-wedding)
- Temporary session data

---

## Troubleshooting

### "I Can't Access Admin Panel"

1. Check your email is `stephb9501@gmail.com`
2. Verify database schema `CREATE-ADMIN-SYSTEM-SCHEMA.sql` was run
3. Check `admin_roles` table has your user_id
4. Clear browser cache
5. Try incognito mode

### "Sales Tax Report Shows $0"

1. Check if you have vendors in Arkansas
2. Verify sales tax schema was run
3. Check if subscription payments are being recorded
4. Look for errors in API logs

### "Review Won't Hide"

1. Verify review_id is correct
2. Check you have `can_moderate_reviews` permission
3. Make sure reason is at least 10 characters
4. Check API error message

### "Impersonation Session Won't Start"

1. Check target user exists
2. Verify they're not an admin (can't impersonate admins)
3. Check if you have active session already (end it first)
4. Make sure reason is at least 10 characters

### "Financial Report Empty"

1. Check if bookings exist
2. Verify commission function is working
3. Check Stripe integration
4. Look for errors in transaction logs

---

## Quick Reference: All API Endpoints

| Feature | Method | Endpoint |
|---------|--------|----------|
| **Reviews** |
| Moderate Review | POST | `/api/admin/reviews/moderate` |
| Get Reviews | GET | `/api/admin/reviews/moderate?filter=all` |
| **Vendors** |
| Manage Vendor | POST | `/api/admin/vendors/manage` |
| Get Vendors | GET | `/api/admin/vendors/manage?filter=all` |
| **Team** |
| Assign Role | POST | `/api/admin/roles` |
| List Roles | GET | `/api/admin/roles` |
| Revoke Role | DELETE | `/api/admin/roles?user_id={id}` |
| **Impersonation** |
| Start Session | POST | `/api/admin/impersonate` |
| Update Session | PUT | `/api/admin/impersonate` |
| End Session | DELETE | `/api/admin/impersonate?session_id={id}` |
| Get Sessions | GET | `/api/admin/impersonate` |
| **Financials** |
| Get Reports | GET | `/api/admin/financials?report_type=overview` |
| Export Tax CSV | POST | `/api/admin/financials` |
| **Sales Tax** |
| Get AR Report | GET | `/api/admin/sales-tax?report_type=arkansas_monthly` |
| Export CSV | POST | `/api/admin/sales-tax` |
| Mark Remitted | PUT | `/api/admin/sales-tax` |
| **Analytics** |
| Signup Summary | GET | `/api/admin/analytics/signups?report_type=summary` |
| Daily Vendors | GET | `/api/admin/analytics/signups?report_type=daily_vendors` |
| Monthly Trends | GET | `/api/admin/analytics/signups?report_type=monthly` |

---

## Support & Updates

### Where to Get Help

- **Documentation:** This manual (update as needed)
- **Legal Guide:** `ADMIN-LEGAL-PROTECTION.md`
- **Control Panel Guide:** `ADMIN-CONTROL-PANEL-GUIDE.md`
- **Code:** Check API files for detailed parameters

### Updating This Manual

This manual is version-controlled. To update:

1. Edit `ADMIN-MASTER-MANUAL.md`
2. Update "Last Updated" date
3. Increment version number
4. Commit changes

### Version History

- **v1.0** (Nov 2025) - Initial comprehensive manual

---

## Emergency Contacts

**IRS (Tax Questions):**
Phone: 1-800-829-4933
Website: https://www.irs.gov/

**Arkansas DFA (Sales Tax):**
Phone: (501) 682-7104
Website: https://www.dfa.arkansas.gov/

**Stripe Support (Payment Issues):**
Website: https://support.stripe.com/

**Supabase Support (Database Issues):**
Website: https://supabase.com/support

**Your CPA/Accountant:**
[Add your accountant's contact info here]

---

**End of Manual**

*Remember: This manual grows with your business. Update it as you add features!*
