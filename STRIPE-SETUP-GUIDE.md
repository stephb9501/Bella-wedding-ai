# Stripe Setup Guide - Quick Start

## 🚀 Get Your Platform Taking Payments in 30 Minutes

Follow these steps to connect Stripe and start accepting payments!

---

## Step 1: Create Stripe Account (5 min)

1. Go to **https://stripe.com**
2. Click **"Start now"** (top right)
3. Fill out registration form
4. Verify your email
5. Complete business details

**Note:** Start in TEST MODE - you can switch to LIVE later

---

## Step 2: Get Your API Keys (2 min)

1. In Stripe Dashboard → **Developers** → **API keys**
2. Copy these keys:

```
Publishable key (starts with pk_test_...)
Secret key (starts with sk_test_...)
```

3. Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

---

## Step 3: Create Products & Prices (10 min)

### A. Bride Subscriptions

In Stripe Dashboard → **Products** → **Add product**

#### Product 1: Standard Plan
- **Name:** Bella Wedding AI - Standard
- **Description:** Full wedding planning suite
- **Pricing:**
  - Price 1 (Monthly): $19.99/month, recurring
  - Price 2 (Yearly): $199/year, recurring

#### Product 2: Premium Plan
- **Name:** Bella Wedding AI - Premium
- **Description:** Advanced planning with website builder
- **Pricing:**
  - Price 1 (Monthly): $39.99/month, recurring
  - Price 2 (Yearly): $399/year, recurring

### B. Vendor Subscriptions

#### Product 3: Silver Plan
- **Name:** Bella Vendor - Silver
- **Description:** Enhanced vendor visibility
- **Pricing:**
  - Price 1 (Monthly): $49/month, recurring
  - Price 2 (Yearly): $490/year, recurring

#### Product 4: Gold Plan
- **Name:** Bella Vendor - Gold
- **Description:** Maximum exposure and leads
- **Pricing:**
  - Price 1 (Monthly): $99/month, recurring
  - Price 2 (Yearly): $990/year, recurring

#### Product 5: Platinum Plan
- **Name:** Bella Vendor - Platinum
- **Description:** Ultimate visibility and premium placement
- **Pricing:**
  - Price 1 (Monthly): $199/month, recurring
  - Price 2 (Yearly): $1990/year, recurring

---

## Step 4: Copy Price IDs (5 min)

After creating each price, copy the **Price ID** (starts with `price_...`)

Add to `.env.local`:

```env
# Bride Plans
NEXT_PUBLIC_STRIPE_STANDARD_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_STANDARD_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxx

# Vendor Plans
NEXT_PUBLIC_STRIPE_SILVER_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_SILVER_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_GOLD_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_GOLD_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PLATINUM_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PLATINUM_YEARLY_PRICE_ID=price_xxx
```

---

## Step 5: Set Up Webhook (5 min)

### Development (Local Testing)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook secret (starts with `whsec_...`)
5. Add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Production (After Deploy)

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to send:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy webhook signing secret
7. Update `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx_NEW_PRODUCTION_SECRET
```

---

## Step 6: Test Payment Flow (5 min)

1. Start your dev server: `npm run dev`
2. Go to `/pricing`
3. Click **"Start Planning"** on Standard or Premium
4. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Exp: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. You should:
   - Be redirected to success page
   - See subscription in Stripe dashboard
   - See subscription in your database (check `bride_subscriptions` table)

---

## Step 7: Test Webhook Events (Optional)

1. In Stripe Dashboard → **Developers** → **Events**
2. You should see events like:
   - `checkout.session.completed`
   - `customer.subscription.created`
3. Click on any event → **Send test webhook**
4. Verify it reaches your endpoint

---

## Step 8: Enable Customer Portal (3 min)

1. In Stripe Dashboard → **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link**
3. Configure:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing information
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans
4. Click **Save**

---

## Step 9: Go Live! (When Ready)

### Switch to Live Mode

1. In Stripe Dashboard → Toggle **Test mode** OFF (top right)
2. Get LIVE API keys:
   - Stripe Dashboard → **Developers** → **API keys**
   - Copy `pk_live_...` and `sk_live_...`
3. Create same products/prices in LIVE mode
4. Update `.env.local` with LIVE keys
5. Set up LIVE webhook (same steps as Step 5)
6. Update Stripe Customer Portal in LIVE mode

### Final Checklist
- ✅ Live API keys in production environment
- ✅ Live webhook configured
- ✅ Live products/prices created
- ✅ Customer portal activated
- ✅ Test a live payment (use real card!)
- ✅ Verify subscription created
- ✅ Check webhook logs

---

## 🎯 Quick Reference

### Environment Variables Needed

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx  # or sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # or pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Bride Price IDs
NEXT_PUBLIC_STRIPE_STANDARD_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_STANDARD_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxx

# Vendor Price IDs
NEXT_PUBLIC_STRIPE_SILVER_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_SILVER_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_GOLD_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_GOLD_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PLATINUM_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PLATINUM_YEARLY_PRICE_ID=price_xxx

# Other
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or https://yourdomain.com
```

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires 3D Secure: 4000 0025 0000 3155
```

### Webhook Events

```
✅ checkout.session.completed - New subscription
✅ customer.subscription.created - Activate features
✅ customer.subscription.updated - Plan changes
✅ customer.subscription.deleted - Cancel subscription
✅ invoice.payment_succeeded - Successful renewal
✅ invoice.payment_failed - Failed payment
```

---

## 🐛 Troubleshooting

### Webhook not receiving events?

1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check Stripe webhook logs for errors
4. Make sure endpoint is publicly accessible (use ngrok for local testing)

### Subscription not creating in database?

1. Check webhook is firing
2. Check Supabase logs
3. Verify database table exists (run migration)
4. Check webhook handler for errors

### Customer portal not working?

1. Verify customer has `stripe_customer_id`
2. Check API logs for errors
3. Ensure customer portal is activated in Stripe

### Payment failing?

1. Check card is valid test card
2. Verify price IDs are correct
3. Check browser console for errors
4. Check Stripe logs in dashboard

---

## 📚 Helpful Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Docs:** https://stripe.com/docs
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Test Cards:** https://stripe.com/docs/testing
- **Webhooks Guide:** https://stripe.com/docs/webhooks

---

## ✅ Success!

Once you complete these steps, your platform will:
- ✅ Accept real payments
- ✅ Create subscriptions automatically
- ✅ Handle billing lifecycle
- ✅ Allow users to manage subscriptions
- ✅ Send email confirmations
- ✅ Track revenue in Stripe

**You're ready to make money! 💰**

---

## 🎯 Next Steps After Stripe Setup

1. **Configure Email** (optional but recommended)
   - See email provider docs
   - Add API keys to `.env.local`

2. **Run Database Migrations**
   - Execute `create-subscriptions-table.sql` in Supabase

3. **Test Everything**
   - Complete payment flow
   - Subscription management
   - Webhook handling
   - Email sending

4. **Deploy to Production**
   - Push to Vercel/your host
   - Add environment variables
   - Test in production
   - Monitor Stripe dashboard

5. **Start Marketing!**
   - Your platform is revenue-ready
   - Share on social media
   - Run ads
   - Get your first paying customer! 🎉

---

**Questions? Everything is documented in the code. Good luck! 🚀**
