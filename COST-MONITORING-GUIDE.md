# Cost Monitoring & Usage Limits Guide

## 🎯 Purpose
Prevent your costs from skyrocketing by tracking and limiting usage of:
- **Storage** (file uploads to Supabase)
- **Emails** (transactional emails)
- **AI** (Claude API calls, if using)
- **Database** (queries)
- **Bandwidth** (data transfer)

---

## 📊 What Gets Tracked

### Daily Metrics:
- Storage used (GB)
- Files uploaded
- Emails sent
- AI requests made
- API calls
- **Estimated daily cost in USD**

### Monthly Rollups:
- Total files, emails, AI requests
- Max storage used
- **Total monthly cost**

---

## 🚨 Default Limits (To Protect You)

| Service | Daily Limit | Monthly Limit | Alert At |
|---------|-------------|---------------|----------|
| **Storage Upload** | 10 GB/day | 100 GB total | 80% (8 GB) |
| **Emails Sent** | 1,000/day | 30,000/month | 80% (800) |
| **AI Requests** | 500/day | 15,000/month | 80% (400) |
| **Daily Cost** | $5/day | $320/month | 80% ($4) |

**What happens when limit exceeded:**
- ✅ You get an **automatic alert** at 80% usage
- ⚠️ At 100%, the feature is **auto-disabled** until next day
- 📧 Admin email sent (if configured)

---

## 💰 Current Pricing (Market Rates)

| Service | Cost | Provider |
|---------|------|----------|
| **Storage** | $0.021/GB/month (~$0.0007/GB/day) | Supabase |
| **Emails** | $0.0001/email | SendGrid |
| **Claude AI** | $0.003/request (avg) | Anthropic |
| **Bandwidth** | $0.09/GB | Supabase |

**You can update these prices if you find better deals!**

---

## 🔧 Setup Instructions

### 1. Run the SQL Schema
In **Supabase SQL Editor**, run:
```
CREATE-COST-MONITORING-SCHEMA.sql
```

This creates:
- Usage tracking tables
- Default limits
- Pricing configuration
- Alert system

### 2. Check Today's Usage
```bash
GET /api/admin/cost-monitoring?report_type=current
```

Returns:
```json
{
  "current_usage": {
    "storage_added_today": 5368709120,  // 5 GB uploaded today
    "files_uploaded_today": 150,
    "emails_sent_today": 42,
    "ai_requests_today": 12,
    "total_cost_today": 2.15  // $2.15 so far today
  },
  "limits": [
    {
      "limit_name": "daily_storage_upload",
      "daily_limit": 10737418240,  // 10 GB limit
      "alert_at_percentage": 80
    }
  ]
}
```

### 3. View Active Alerts
```bash
GET /api/admin/cost-monitoring?report_type=alerts
```

See if you're approaching any limits:
```json
{
  "alerts": [
    {
      "severity": "warning",
      "message": "Approaching daily limit for daily_emails (85% used)",
      "current_value": 850,
      "limit_value": 1000
    }
  ]
}
```

### 4. View Daily Costs (Last 30 Days)
```bash
GET /api/admin/cost-monitoring?report_type=daily&days=30
```

### 5. View Monthly Costs
```bash
GET /api/admin/cost-monitoring?report_type=monthly&months=12
```

### 6. See Top Users by Cost
```bash
GET /api/admin/cost-monitoring?report_type=top_users&limit=50
```

Find out which vendors/brides are using the most resources.

---

## 🛠️ Adjust Limits

### Increase Daily Email Limit
```bash
PUT /api/admin/cost-monitoring
```
```json
{
  "limit_name": "daily_emails",
  "daily_limit": 2000,
  "alert_at_percentage": 80
}
```

### Add Cost Limit for AI
```bash
PUT /api/admin/cost-monitoring
```
```json
{
  "limit_name": "daily_ai_requests",
  "daily_cost_limit": 20.00,
  "action_on_exceed": "disable"
}
```

**Actions on exceed:**
- `alert` - Just send an alert, don't disable
- `disable` - Auto-disable the feature
- `throttle` - Slow down requests

---

## 💵 Update Pricing (If Costs Change)

### Update Claude AI Pricing
```bash
POST /api/admin/cost-monitoring
```
```json
{
  "action": "update_pricing",
  "service_name": "ai_request_sonnet",
  "cost_per_unit": 0.004,
  "unit_type": "request",
  "provider": "Anthropic",
  "notes": "Price increased to $4 per request"
}
```

### Add New Service (e.g., SMS)
```json
{
  "action": "update_pricing",
  "service_name": "sms",
  "cost_per_unit": 0.0075,
  "unit_type": "message",
  "provider": "Twilio",
  "notes": "SMS notifications"
}
```

---

## 📈 How It Works Automatically

### When a File is Uploaded:
```typescript
// Your file upload API automatically calls:
await fetch('/api/admin/cost-monitoring', {
  method: 'POST',
  body: JSON.stringify({
    action: 'track_usage',
    metric_type: 'storage_added',
    increment_value: fileSizeInBytes,
    user_id: userId
  })
});

// If limit exceeded, API returns 429 error:
{
  "limit_exceeded": true,
  "action": "disable",
  "message": "Daily storage limit exceeded"
}
```

### When an Email is Sent:
```typescript
// After sending email:
await fetch('/api/admin/cost-monitoring', {
  method: 'POST',
  body: JSON.stringify({
    action: 'track_usage',
    metric_type: 'emails_sent',
    increment_value: 1,
    user_id: vendorId
  })
});
```

### When Claude AI is Called:
```typescript
// After AI request:
await fetch('/api/admin/cost-monitoring', {
  method: 'POST',
  body: JSON.stringify({
    action: 'track_usage',
    metric_type: 'ai_requests',
    increment_value: 1,
    user_id: brideId
  })
});
```

---

## 🎯 Best Practices

### 1. Check Daily Usage Every Morning
```bash
GET /api/admin/cost-monitoring?report_type=current
```

### 2. Review Monthly Costs at End of Month
```bash
GET /api/admin/cost-monitoring?report_type=monthly&months=1
```

### 3. Monitor Top Users
If one vendor is using 90% of your storage, contact them:
```bash
GET /api/admin/cost-monitoring?report_type=top_users
```

### 4. Set Email Alerts
Get notified when costs spike (configure in Supabase):
```sql
-- Create a function to send you an email when alert is created
-- (You can use Supabase Edge Functions for this)
```

### 5. Review Pricing Quarterly
Check if Supabase/SendGrid/Anthropic prices changed:
```bash
GET /api/admin/cost-monitoring?report_type=pricing
```

---

## 🔍 Example: Finding Cost Spikes

**Scenario:** Your daily cost jumped from $2/day to $50/day!

### Step 1: Check Today's Usage
```bash
GET /api/admin/cost-monitoring?report_type=current
```

### Step 2: Check Alerts
```bash
GET /api/admin/cost-monitoring?report_type=alerts
```

### Step 3: Find the Culprit
```bash
GET /api/admin/cost-monitoring?report_type=top_users
```

### Step 4: Check Which Service
```bash
GET /api/admin/cost-monitoring?report_type=daily&days=7
```

Look for spike in:
- `storage_cost_today`
- `email_cost_today`
- `ai_cost_today`

---

## 📞 Emergency: Costs Out of Control

### Immediate Actions:

1. **Lower All Limits**
```bash
PUT /api/admin/cost-monitoring
{
  "limit_name": "daily_storage_upload",
  "daily_limit": 1073741824,  // 1 GB instead of 10 GB
  "action_on_exceed": "disable"
}
```

2. **Disable AI Features**
```bash
PUT /api/admin/cost-monitoring
{
  "limit_name": "daily_ai_requests",
  "daily_limit": 0,  // No AI requests allowed
  "action_on_exceed": "disable"
}
```

3. **Check Who's Abusing**
```bash
GET /api/admin/cost-monitoring?report_type=top_users
```

4. **Disable Bad Actor**
If one user is uploading 100 GB/day:
- Go to Admin > Manage Vendors
- Suspend their account
- Contact them

---

## 💡 Tips to Save Money

### Storage:
- Set max file size limits (already done in CREATE-STORAGE-LIMITS-SCHEMA.sql)
- Delete old files after 1 year
- Compress images before upload

### Emails:
- Batch emails instead of sending individually
- Use in-app notifications instead of emails when possible

### AI:
- Cache AI responses (don't regenerate same answer)
- Use cheaper AI models for simple tasks
- Set daily AI request limits per user

### Database:
- Use Supabase views instead of complex queries
- Enable caching
- Optimize slow queries

---

## ✅ Success Metrics

### Good (Profitable):
- Daily cost: $2-5/day
- Monthly cost: $60-150/month
- No alerts
- Storage growing slowly
- Email usage stable

### Warning (Monitor):
- Daily cost: $5-10/day
- Getting alerts at 80% usage
- Storage growing fast
- One user using 50% of resources

### Critical (Take Action):
- Daily cost: $10+/day
- Limits being exceeded
- Multiple alerts
- Cost spike with no new users

---

## 🎉 Summary

You now have:
- ✅ Real-time cost tracking
- ✅ Automatic alerts at 80% usage
- ✅ Auto-disable features when limit exceeded
- ✅ Per-user cost attribution
- ✅ Daily and monthly cost reports
- ✅ Configurable limits
- ✅ Configurable pricing

**Check costs daily, adjust limits monthly, stay profitable!**
