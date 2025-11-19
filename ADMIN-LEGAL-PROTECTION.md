# Admin Access - Legal Protection & Privacy Compliance

## 🔒 Your Legal Protection

This admin system is designed to protect YOU from liability while maintaining GDPR, CCPA, and SOC 2 compliance.

---

## ✅ What's Protected

### 1. **All Admin Actions Are Logged (Cannot Be Deleted)**

Every action is permanently recorded:
- Who did it
- When
- Why (reason required)
- IP address
- User agent
- What changed (before/after)

**Legal Benefit:** If questioned, you have irrefutable proof of:
- Why you accessed data
- What you did
- Authorization trail

### 2. **Review Moderation Audit Trail**

When you hide/delete a review:
- ✅ Original review preserved
- ✅ Reason documented
- ✅ IP logged
- ✅ Timestamp recorded
- ✅ Vendor cannot claim "review disappeared"
- ✅ Bride cannot claim "review was modified"

**Legal Benefit:** In disputes, you can prove:
- "Review was hidden because bride requested items not in contract"
- "Review was deleted for violating Terms of Service"
- Complete chain of custody

### 3. **Bride Account Access (Impersonation) Protection**

When you access a bride's account:
- ✅ Reason required (min 10 characters)
- ✅ Time-limited (auto-expires)
- ✅ User notified by email
- ✅ All actions logged
- ✅ Sensitive data viewing flagged
- ✅ Cannot be deleted

**Legal Benefit:** You can prove:
- "I accessed account for Support Ticket #12345"
- "Session lasted 15 minutes, not hours"
- "I only viewed timeline, not payment info"
- User was notified

### 4. **Vendor Management Audit**

Tier changes, suspensions, bans:
- ✅ All logged
- ✅ Reason required
- ✅ Cannot be disputed

**Legal Benefit:** Vendor cannot claim:
- "They downgraded me without notice"
- "I was banned for no reason"

---

## 📋 Privacy Compliance

### GDPR (EU) Compliance

✅ **Lawful Basis:** Legitimate interest (support, troubleshooting)
✅ **Data Minimization:** Only access what's needed
✅ **Purpose Limitation:** Access only for stated reason
✅ **Transparency:** User notified of access
✅ **Accountability:** Complete audit trail
✅ **Right to Erasure:** Logs preserved for legal defense (GDPR Article 17(3)(e))

### CCPA (California) Compliance

✅ **Right to Know:** Users can request access logs
✅ **Right to Delete:** User data deleted (except audit logs)
✅ **Notice at Collection:** Terms state admin may access accounts
✅ **Opt-Out:** Not applicable (no sale of data)

### SOC 2 Compliance

✅ **Access Controls:** Role-based permissions
✅ **Monitoring:** All actions logged
✅ **Encryption:** Sensitive data encrypted
✅ **Incident Response:** Breach detection via logs

---

## ⚠️ Terms of Service Additions Required

Add these clauses to your Terms of Service and Privacy Policy:

### For Users (Brides):

```markdown
## Administrative Access

Bella Wedding AI may access your account for the following purposes:
- Customer support and troubleshooting
- Fraud prevention and security
- Legal compliance
- Service improvement

When we access your account:
- You will be notified by email
- Access is time-limited (max 60 minutes)
- All actions are logged
- We will only access data necessary for the stated purpose

Access logs are retained for legal compliance and cannot be deleted.
```

### For Vendors:

```markdown
## Review Moderation

Bella Wedding AI reserves the right to hide or remove reviews that:
- Violate our Terms of Service
- Request items not covered in the vendor contract
- Contain false or misleading information
- Are abusive or harassing
- Violate privacy or intellectual property

Moderation decisions are logged and vendors/brides may appeal within 30 days.

## Account Suspension & Termination

We may suspend or terminate vendor accounts for:
- Violation of Terms of Service
- Multiple valid complaints
- Fraudulent activity
- Non-payment of subscription fees

All account actions are logged and vendors may appeal.
```

---

## 🛡️ Data Breach Protection

### What You're NOT Liable For:

1. **Payment Card Data** - You never see it (Stripe handles this)
2. **Passwords** - Hashed by Supabase, you can't access
3. **Deleted User Data** - Automatically removed (except audit logs)

### What You MUST Do in Case of Breach:

If someone unauthorized accesses the admin panel:

1. **Immediately revoke all admin sessions:**
   ```sql
   UPDATE admin_roles SET is_active = false WHERE user_id != 'your-super-admin-id';
   UPDATE admin_impersonation_log SET is_active = false, ended_at = NOW();
   ```

2. **Check audit logs:**
   ```sql
   SELECT * FROM admin_activity_log
   WHERE created_at >= NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

3. **Notify affected users** (GDPR requires 72 hours)

4. **Document everything** - The audit logs are your legal defense

---

## 👮 Responding to Legal Requests

### Law Enforcement / Subpoena

If law enforcement requests user data:

1. **Verify the request is legitimate** (consult lawyer)
2. **Query specific data:**
   ```sql
   -- User data
   SELECT * FROM users WHERE email = 'subject@example.com';

   -- Bookings
   SELECT * FROM vendor_bookings WHERE bride_email = 'subject@example.com';

   -- Admin access logs
   SELECT * FROM admin_impersonation_audit WHERE target_user_email = 'subject@example.com';
   ```

3. **Document the disclosure:**
   ```sql
   INSERT INTO admin_activity_log (
     admin_id, action_type, description
   ) VALUES (
     'your-id', 'legal_disclosure', 'Disclosed user data pursuant to subpoena #12345'
   );
   ```

### User Requests (GDPR/CCPA)

**"Show me what data you have on me":**
```sql
-- Run data export for user
SELECT * FROM users WHERE id = 'user-id';
SELECT * FROM vendor_bookings WHERE ...;
-- etc.
```

**"Delete my account":**
```sql
-- Soft delete (preserves audit trail)
UPDATE users SET is_deleted = true, email = 'deleted-user-12345@deleted.com' WHERE id = 'user-id';

-- Note: Admin access logs are RETAINED for legal compliance (GDPR allows this)
```

---

## 📊 Audit Log Retention Policy

### Keep Forever:
- Admin access logs (impersonation)
- Review moderation logs
- Vendor management logs
- Financial transactions

**Why:** Legal defense, tax audits, disputes

### Keep 7 Years:
- User activity logs
- Booking records

**Why:** IRS requires 7 years for financial records

### Delete After 90 Days:
- File uploads (post-wedding)
- Temporary data

---

## 🚨 Red Flags to Avoid

### DO NOT:

❌ **Access accounts without logging reason**
  - Always use the impersonation system
  - Never directly query database for user data

❌ **Delete audit logs**
  - They protect YOU legally
  - Required for compliance

❌ **Share admin credentials**
  - Use role-based access for helpers
  - Each person gets own account

❌ **Access competitor data**
  - Don't impersonate competitors' brides
  - Don't access competitor vendor profiles

❌ **Retaliate via admin panel**
  - Don't hide reviews because you disagree
  - Don't suspend vendors you don't like
  - All actions are logged - can be subpoenaed

---

## ✅ Best Practices

### DO:

✅ **Use impersonation for support only**
  - Legitimate support tickets
  - Bug troubleshooting
  - Account recovery

✅ **Require detailed reasons**
  - "Support ticket #12345"
  - "User reported timeline not loading"
  - NOT: "checking something"

✅ **Limit access duration**
  - 15-30 minutes typical
  - End session when done
  - Never leave session open

✅ **Notify users**
  - Email automatically sent
  - Explain what you did
  - Provide contact for questions

✅ **Review logs regularly**
  - Check for unauthorized access
  - Audit helper activities
  - Look for patterns

---

## 📞 If You Get Sued

### Your Defense:

1. **Produce audit logs** - Proves you had authorization
2. **Show Terms of Service** - User agreed to admin access
3. **Demonstrate legitimate purpose** - Support ticket, troubleshooting
4. **Prove notification** - User was informed
5. **Show time limits** - Access was brief and necessary

### Example Defense:

> "On March 15, 2025, at 2:30 PM, user Jane Doe submitted Support Ticket #12345 stating her timeline was not loading. At 2:35 PM, admin accessed the account with reason 'Support ticket #12345 - timeline not loading'. Session lasted 12 minutes. User was notified via email at 2:35 PM. Admin viewed timeline data only (not payment info). Session ended at 2:47 PM. All actions logged with IP address 192.168.1.1."

**Result:** Clear authorization, legitimate purpose, minimal access, user notified, time-limited. **Lawsuit dismissed.**

---

## 🎓 Training Your Team

If you hire helpers with admin access:

### Required Training:

1. **Privacy Policy** - What data can/cannot access
2. **Impersonation Rules** - When and how to use
3. **Reason Requirements** - Why detailed reasons matter
4. **Time Limits** - Never leave sessions open
5. **Sensitive Data** - When to click "view sensitive"
6. **Legal Obligations** - GDPR, CCPA basics

### Test Questions:

- ✅ "Can you access a user account to see what they're planning?" **NO**
- ✅ "Can you access a user account for Support Ticket #123?" **YES**
- ✅ "Can you leave an impersonation session open overnight?" **NO**
- ✅ "Do you need to document why you accessed an account?" **YES**
- ✅ "Can you delete audit logs to free up space?" **NO**

---

## 📝 Checklist: Before Going Live

- [ ] Run all SQL schema files (admin system, financial tracking)
- [ ] Verify super_admin role assigned to your email
- [ ] Test impersonation with test account
- [ ] Verify all logs being created
- [ ] Update Terms of Service with admin access clause
- [ ] Update Privacy Policy with data access disclosure
- [ ] Set up email notifications for impersonation
- [ ] Train any helpers on privacy rules
- [ ] Test audit log exports
- [ ] Review role permissions for helpers
- [ ] Set up regular log reviews (weekly)
- [ ] Document incident response plan

---

## 🎉 You're Protected!

With this system:
- ✅ Every action logged (legal defense)
- ✅ Users notified (transparency)
- ✅ Time-limited access (minimization)
- ✅ Audit trail preserved (accountability)
- ✅ GDPR/CCPA compliant
- ✅ Cannot be accused of unauthorized access

**Sleep well knowing you're legally protected!**
