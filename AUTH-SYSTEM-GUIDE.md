# 🔐 AUTH SYSTEM - COMPLETE GUIDE

## ✅ WHAT'S BEEN FIXED

### 1. **Smart Login Routing** ✅
Login now properly routes users based on their role:

**Priority Order:**
1. **Admin** → `/admin/dashboard`
2. **Vendor** → `/vendor-dashboard`
3. **Bride** → `/dashboard`

**How it works:**
```typescript
// On login:
1. Check users.role === 'admin' → Admin Dashboard
2. Check vendors table has user → Vendor Dashboard
3. Default → Bride Dashboard
```

### 2. **Forgot Password Flow** ✅
Complete password reset system:

**Flow:**
1. User goes to `/auth/forgot-password`
2. Enters email
3. Receives reset link via email
4. Clicks link → redirects to `/auth/reset-password`
5. Sets new password
6. Redirects to `/auth/login?reset=success`
7. Sees green success message
8. Logs in with new password

### 3. **Phone Verification** ⏭️
**Status:** Skipped for now (costs money via SMS services)
**Future Enhancement:** Add for **paid tiers only**:
- Premium/Elite vendors
- Admin accounts
- Free users don't get phone verification

---

## 🔑 HOW TO ACCESS ADMIN

### Option 1: Set Your User as Admin (EASIEST)

1. **Log into Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select Bella Wedding project

2. **Open Table Editor**
   - Click "Table Editor" in left sidebar
   - Find the `users` table

3. **Find Your User**
   - Look for your email in the list
   - Click on the row

4. **Set Role to Admin**
   - Find the `role` column
   - Change value from `null` or `bride` to `admin`
   - Save changes

5. **Log Out and Back In**
   - Log out of your app
   - Go to `/auth/login`
   - Log in with your credentials
   - **You'll automatically go to `/admin/dashboard`**

### Option 2: SQL Query (FASTER)

Run this in Supabase SQL Editor:
```sql
-- Replace with your actual email
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 👥 USER ROLES & ROUTING

### Admin Users
- **Table:** `users` with `role = 'admin'`
- **Login redirects to:** `/admin/dashboard`
- **Can access:**
  - All admin tools
  - Bulk vendor import
  - Incomplete vendors dashboard
  - User management
  - Analytics

### Vendor Users
- **Table:** `vendors` (has a record with user's id)
- **Login redirects to:** `/vendor-dashboard`
- **Can access:**
  - Vendor dashboard
  - Manage their listings
  - View bookings
  - Upload photos

### Bride Users
- **Table:** `users` (no special role or vendor record)
- **Login redirects to:** `/dashboard`
- **Can access:**
  - Planning tools
  - Vendor search
  - Master plan
  - Save favorites
  - Message vendors

---

## 🔐 COMPLETE AUTH PAGES

### `/auth/login` - Login Page
- Email + password
- "Remember me" checkbox
- "Forgot password?" link
- Smart routing after login
- Shows green success message after password reset

### `/auth/register` - Bride Registration
- Full name, email, password
- Wedding date (optional)
- Creates user with `role = 'bride'` (default)

### `/auth/forgot-password` - Request Reset
- Enter email
- Sends reset link via Resend
- Shows success confirmation

### `/auth/reset-password` - Set New Password
- Validates reset token
- New password + confirm
- Min 6 characters
- Redirects to login with success message

### `/vendor-register` - Vendor Registration
- Separate flow for vendors
- Creates both `users` and `vendors` records
- Different dashboard access

---

## 📧 FORGOT PASSWORD - TECHNICAL DETAILS

### How It Works

1. **User requests reset:**
```typescript
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`
})
```

2. **Supabase sends email with magic link:**
   - Email template from Supabase settings
   - Link contains one-time token
   - Expires in 1 hour (configurable)

3. **User clicks link:**
   - Supabase validates token
   - Creates temporary session
   - Redirects to `/auth/reset-password`

4. **Reset page validates session:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Invalid/expired token
}
```

5. **User sets new password:**
```typescript
await supabase.auth.updateUser({
  password: newPassword
})
```

6. **Success:**
   - Redirects to `/auth/login?reset=success`
   - Shows green banner
   - User logs in normally

### Email Configuration

**IMPORTANT:** Make sure Resend is configured in Supabase:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Configure "Reset Password" template
3. Ensure `RESEND_API_KEY` is set in environment variables
4. Test email delivery

---

## 🚨 TROUBLESHOOTING

### "I can't access admin dashboard"

**Check:**
1. Is your `role` set to `admin` in the `users` table?
2. Did you log out and back in after setting role?
3. Check browser console for errors

**Quick Fix:**
```sql
-- Run in Supabase SQL Editor
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
-- If role is not 'admin', update it:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### "Forgot password email not arriving"

**Check:**
1. Spam/junk folder
2. Email is correct in Supabase `users` table
3. Resend API key is configured
4. Check Resend dashboard for delivery status

**Workaround:**
Reset password via SQL:
```sql
-- This won't work - must use auth system
-- Instead, create new admin user via Supabase dashboard
```

### "Reset link says invalid/expired"

**Causes:**
- Link older than 1 hour
- Already used once
- Session expired

**Fix:**
Go back to `/auth/forgot-password` and request new link

### "Login takes me to wrong dashboard"

**Check:**
1. Clear browser cache
2. Check `users.role` value
3. Check if user exists in `vendors` table
4. Look at browser console for errors

**Expected Behavior:**
- Admin role → Admin dashboard (even if also a vendor)
- Vendor (no admin role) → Vendor dashboard
- Neither → Bride dashboard

---

## 🔧 FUTURE ENHANCEMENTS (Optional)

### Phone Verification for PAID TIERS ONLY
Add 2FA for premium users who pay:

**Who gets it:**
- ✅ Premium vendors ($49/month)
- ✅ Elite vendors ($99/month)
- ✅ Admin accounts
- ❌ Free vendors (no phone verification)
- ❌ Brides (no phone verification)

**Services to use:**
- Twilio (SMS)
- AWS SNS (SMS)
- Auth0 (includes SMS)

**Cost:** ~$0.01-0.05 per SMS (paid users cover this in their subscription)

**Implementation:**
1. Add `phone_verified` boolean to users/vendors table
2. Check vendor tier before requiring phone verification
3. Add API endpoint to send verification code
4. Add phone verification step after password login
5. Only require for `tier IN ('premium', 'elite')` or `role = 'admin'`

### Social Login (Google, Facebook)
Supabase supports this natively:

1. Enable in Supabase Dashboard → Authentication → Providers
2. Add OAuth credentials
3. Add social login buttons to `/auth/login`

### Email Verification
Force email verification before access:

1. Enable in Supabase → Authentication → Settings
2. Users must click email link before login works

---

## 📝 TESTING CHECKLIST

### ✅ Login Flow
- [ ] Bride login → `/dashboard`
- [ ] Vendor login → `/vendor-dashboard`
- [ ] Admin login → `/admin/dashboard`
- [ ] Wrong password shows error
- [ ] "Remember me" persists session

### ✅ Forgot Password
- [ ] Email sent successfully
- [ ] Reset link opens `/auth/reset-password`
- [ ] Can set new password
- [ ] Redirects to login with success message
- [ ] Green banner shows on login page
- [ ] Can log in with new password

### ✅ Registration
- [ ] Bride registration creates user
- [ ] Vendor registration creates user + vendor record
- [ ] Password requirements enforced (min 6 chars)
- [ ] Email validation works

---

## 🎯 QUICK START FOR ADMIN ACCESS

**Fastest way to get admin access RIGHT NOW:**

1. Open Supabase → Table Editor → `users`
2. Find your email
3. Set `role` to `admin`
4. Log out of your app
5. Log back in at `/auth/login`
6. **You're now in the admin dashboard!**

**OR run this SQL:**
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE';
```

Then log out and back in.

---

## 📞 SUPPORT

All auth code is in:
- `frontend/app/auth/login/page.tsx` - Login with smart routing
- `frontend/app/auth/forgot-password/page.tsx` - Request reset
- `frontend/app/auth/reset-password/page.tsx` - Set new password
- `frontend/app/auth/register/page.tsx` - Bride registration
- `frontend/app/vendor-register/page.tsx` - Vendor registration

The login routing logic checks roles in this order:
1. Admin (users.role = 'admin')
2. Vendor (exists in vendors table)
3. Bride (default)

**Built and fixed for Bella Wedding AI** ✨
