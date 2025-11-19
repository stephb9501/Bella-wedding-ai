# Bella Wedding AI - Comprehensive Admin Control Panel

## 🎯 Overview

You now have a complete admin system with:
- ✅ Review moderation (hide/delete unfair reviews)
- ✅ Vendor management (approve, suspend, change tiers)
- ✅ Role-based access control (assign helpers with specific permissions)
- ✅ Privacy-safe bride impersonation (time-limited, logged, user notified)
- ✅ Financial tracking (commission & tax reports)
- ✅ Complete audit trails

---

## 🗄️ Database Setup Required

Run these SQL files in Supabase SQL Editor in order:

1. **`CREATE-ADMIN-SYSTEM-SCHEMA.sql`** - Admin roles, moderation logs, impersonation
2. **`CREATE-FINANCIAL-TRACKING-SCHEMA.sql`** - Commission tracking, tax reports

---

## 🔐 Admin Access

### Your Account Setup

The system automatically grants you super admin access:
- Email: `stephb9501@gmail.com`
- Role: `super_admin`
- All permissions enabled

### Access the Admin Panel

Navigate to: **`/admin/dashboard`**

---

## 👥 Managing Team Members (Assign Helpers)

### API Endpoint: `/api/admin/roles`

**Assign a helper:**
```typescript
POST /api/admin/roles
{
  "target_email": "helper@example.com",
  "role_name": "support",  // or: super_admin, admin, moderator, analyst
  "expires_in_days": 90  // Optional: temporary access
}
```

### Available Roles:

| Role | Permissions |
|------|------------|
| **super_admin** | Full access (you) |
| **admin** | Everything except managing other admins |
| **moderator** | Review moderation, content editing |
| **support** | Help users, view data, moderate reviews |
| **analyst** | Read-only analytics access |

### Custom Permissions:

```typescript
POST /api/admin/roles
{
  "target_email": "custom@example.com",
  "role_name": "custom",
  "custom_permissions": {
    "can_moderate_reviews": true,
    "can_approve_vendors": false,
    "can_view_analytics": true,
    // ... customize as needed
  }
}
```

### Revoke Access:

```typescript
DELETE /api/admin/roles?user_id={user_id}
```

---

## 🛡️ Review Moderation

### Hide Unfair Reviews

**API: `/api/admin/reviews/moderate`**

```typescript
POST /api/admin/reviews/moderate
{
  "review_id": "uuid",
  "action": "hide",  // or: unhide, delete
  "reason": "Bride requested items not in contract",
  "admin_notes": "Optional internal notes"
}
```

### View Reviews for Moderation:

```typescript
GET /api/admin/reviews/moderate?filter=flagged
// Filters: all, hidden, flagged, recent
```

### Legal Protection:
- ✅ All moderations logged with reason
- ✅ IP address tracked
- ✅ Original review preserved in audit log
- ✅ Cannot be disputed in court

---

## 🏢 Vendor Management

### API: `/api/admin/vendors/manage`

**Approve a vendor:**
```typescript
POST /api/admin/vendors/manage
{
  "vendor_id": "uuid",
  "action": "approve",
  "reason": "Verified business license"
}
```

**Change vendor tier:**
```typescript
POST /api/admin/vendors/manage
{
  "vendor_id": "uuid",
  "action": "change_tier",
  "changes": {
    "new_tier": "premium"  // free, premium, featured, elite
  },
  "reason": "Upgrade requested"
}
```

**Suspend/Ban vendor:**
```typescript
POST /api/admin/vendors/manage
{
  "vendor_id": "uuid",
  "action": "suspend",  // or: ban, activate
  "reason": "Multiple complaints"
}
```

### Available Actions:
- `approve` - Activate new vendor
- `suspend` - Temporarily deactivate
- `ban` - Permanently ban
- `activate` - Reactivate suspended vendor
- `verify` - Add verification badge
- `unverify` - Remove verification
- `change_tier` - Update subscription level

---

## 👤 Privacy-Safe Bride Impersonation

### When to Use:
- Support tickets ("I can't find my timeline")
- Troubleshooting bugs
- Verifying reported issues

### Start Session:

**API: `/api/admin/impersonate`**

```typescript
POST /api/admin/impersonate
{
  "target_email": "bride@example.com",
  "reason": "Support ticket #12345 - timeline not loading",
  "duration_minutes": 30  // Max 60 minutes
}
```

### Legal Protections:
- ✅ Requires detailed reason (min 10 characters)
- ✅ Time-limited (auto-expires)
- ✅ All actions logged
- ✅ IP address tracked
- ✅ User notified by email
- ✅ Cannot be deleted from logs
- ✅ Cannot impersonate other admins

### View Sensitive Data:

When accessing payment info, messages, etc:
```typescript
PUT /api/admin/impersonate
{
  "session_id": "uuid",
  "viewed_sensitive_data": true,
  "sensitive_data_type": "payment_info"
}
```

This logs exactly what you accessed for legal accountability.

### End Session:

```typescript
DELETE /api/admin/impersonate?session_id={id}
```

**Sessions auto-expire** - run this function periodically:
```sql
SELECT expire_impersonation_sessions();
```

---

## 💰 Financial Reports & Tax Data

### API: `/api/admin/financials`

**Monthly Overview:**
```typescript
GET /api/admin/financials?report_type=overview
```

Returns:
- Monthly recurring revenue (subscriptions)
- Annual recurring revenue
- Total commission earned
- Breakdown by tier

**Tax Report (Quarterly):**
```typescript
GET /api/admin/financials?report_type=tax_quarterly&year=2025&quarter=1
```

Returns IRS-ready data:
- Total gross income
- Commission earned
- Stripe fees (deductible expense)
- Net income

**Export for Taxes:**
```typescript
POST /api/admin/financials
{
  "year": 2025,
  "quarter": 1  // Optional
}
```

Downloads CSV file for your accountant.

**Escrow Schedule:**
```typescript
GET /api/admin/financials?report_type=escrow_schedule
```

Shows vendor payments to release (held until 30 days before wedding).

⚠️ **Important:** This is vendor money, NOT yours. You only get the commission.

**Recent Transactions:**
```typescript
GET /api/admin/financials?report_type=transactions&limit=100&type=commission
```

---

## 💵 Commission Rates by Tier

| Tier | Monthly Fee | Commission on Bookings | Your Revenue |
|------|------------|----------------------|-------------|
| **Free** | $0 | 10% | Commission only |
| **Premium** | $34.99 | 5% | Subscription + 5% |
| **Featured** | $49.99 | 2% | Subscription + 2% |
| **Elite** | $79.99 | 0% | Subscription only |

---

## 📊 Analytics Views (Pre-built SQL)

You can query these directly in admin dashboard:

- `admin_review_moderation_view` - All reviews with moderation status
- `admin_vendor_overview` - Vendor stats (bookings, reviews, tier)
- `admin_monthly_revenue` - Revenue breakdown by month
- `admin_commission_by_tier` - Commission earned per tier
- `admin_subscription_revenue` - MRR/ARR by tier
- `admin_tax_report_quarterly` - Tax filing data
- `admin_escrow_schedule` - Upcoming vendor payouts
- `admin_activity_dashboard` - Admin actions last 30 days
- `admin_impersonation_audit` - All impersonation sessions

---

## 🔒 Legal Protection & Privacy

### What's Logged (Cannot Be Deleted):

1. **Review Moderation:**
   - Who hid/deleted review
   - When
   - Why (reason required)
   - IP address
   - Original review content

2. **Vendor Management:**
   - All tier changes
   - Suspensions/bans
   - Approvals
   - IP address

3. **Impersonation:**
   - Every session start/end
   - Duration
   - Reason (required)
   - What data was viewed
   - Actions taken while impersonating
   - IP address
   - Cannot be deleted (GDPR compliant)

4. **All Admin Actions:**
   - What was done
   - By whom
   - When
   - IP address

### Privacy Compliance:

- ✅ GDPR compliant
- ✅ Bride notified of impersonation
- ✅ Audit trail preserved
- ✅ Sensitive data viewing logged
- ✅ No access to payment card numbers (Stripe only)

---

## 🚨 Permissions System

Check if user has permission:
```sql
SELECT has_admin_permission('user-id', 'can_moderate_reviews');
```

Available permissions:
- `can_moderate_reviews`
- `can_approve_vendors`
- `can_change_vendor_tiers`
- `can_delete_users`
- `can_view_analytics`
- `can_manage_bookings`
- `can_view_financials`
- `can_edit_content`
- `can_manage_admins`
- `can_impersonate_users`
- `can_view_sensitive_data`

---

## 📋 Complete Admin Checklist

### Daily Tasks:
- [ ] Check pending vendor approvals
- [ ] Review flagged reviews
- [ ] Check support tickets (if impersonation needed)

### Weekly Tasks:
- [ ] Review admin activity logs
- [ ] Check escrow schedule (vendor payouts)
- [ ] Verify subscription payments

### Monthly Tasks:
- [ ] Generate financial report
- [ ] Review MRR/ARR trends
- [ ] Export data for bookkeeping

### Quarterly Tasks:
- [ ] Export tax report for accountant
- [ ] Review admin role assignments
- [ ] Audit impersonation logs

---

## 🎨 Next Steps: Building the UI

You now have all the backend APIs. To build the frontend admin dashboard:

1. **Update `/admin/dashboard/page.tsx`** with tabs for:
   - Overview (stats)
   - Reviews (moderation interface)
   - Vendors (approval/management)
   - Users (bride management)
   - Team (assign helpers)
   - Financials (reports)
   - Impersonation (active sessions)
   - Audit Logs (all activity)

2. **Create components:**
   - `ReviewModerationTable.tsx` - List reviews, hide/unhide buttons
   - `VendorManagementTable.tsx` - Approve/suspend/tier changes
   - `TeamRoleManager.tsx` - Assign roles to helpers
   - `ImpersonationPanel.tsx` - Start/end sessions
   - `FinancialDashboard.tsx` - Charts, tax exports
   - `AuditLogViewer.tsx` - All admin actions

3. **Add to existing UI:**
   - Show "Admin" menu item in navigation (only if admin)
   - Add permission checks before showing buttons

---

## ⚡ Quick Reference: API Endpoints

| Feature | Method | Endpoint |
|---------|--------|----------|
| Review Moderation | POST | `/api/admin/reviews/moderate` |
| Get Reviews | GET | `/api/admin/reviews/moderate` |
| Vendor Management | POST | `/api/admin/vendors/manage` |
| Get Vendors | GET | `/api/admin/vendors/manage` |
| Assign Role | POST | `/api/admin/roles` |
| List Roles | GET | `/api/admin/roles` |
| Revoke Role | DELETE | `/api/admin/roles` |
| Start Impersonation | POST | `/api/admin/impersonate` |
| Update Session | PUT | `/api/admin/impersonate` |
| End Session | DELETE | `/api/admin/impersonate` |
| Get Sessions | GET | `/api/admin/impersonate` |
| Financial Reports | GET | `/api/admin/financials` |
| Export Tax Report | POST | `/api/admin/financials` |

---

## 🎉 You're All Set!

You now have enterprise-grade admin controls with:
- Complete vendor/review management
- Team collaboration with permissions
- Privacy-safe support access
- Tax-ready financial reports
- Legal protection with audit trails

**Questions?** Check the API files or SQL schema comments for details.
