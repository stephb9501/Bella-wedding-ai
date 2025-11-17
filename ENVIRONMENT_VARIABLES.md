# Environment Variables Guide

This document lists all environment variables needed for the Bella Wedding AI application.

## 🚨 CRITICAL (Required for Build)

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe Payment Configuration
```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
```

**Where to find:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Secret key" → `STRIPE_SECRET_KEY`
3. ⚠️ Use `sk_test_` for development, `sk_live_` for production

---

## ⚙️ IMPORTANT (Recommended)

### Stripe Webhook (For Subscription Updates)
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Where to find:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Events to listen: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

### Stripe Price IDs (For Each Subscription Tier)
```bash
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_... # Bride Premium ($29.99/mo)
NEXT_PUBLIC_STRIPE_VENDOR_PREMIUM_PRICE_ID=price_... # Vendor Premium ($49.99/mo)
NEXT_PUBLIC_STRIPE_VENDOR_FEATURED_PRICE_ID=price_... # Vendor Featured ($99.99/mo)
NEXT_PUBLIC_STRIPE_VENDOR_ELITE_PRICE_ID=price_... # Vendor Elite ($199.99/mo)
```

**How to create:**
1. Go to https://dashboard.stripe.com/products/create
2. Create products for each tier with recurring monthly pricing
3. Copy each "Price ID" (starts with `price_`)

---

## 📍 OPTIONAL (Feature-Specific)

### OpenAI Integration (AI Wedding Assistant)
```bash
OPENAI_API_KEY=sk-...
```

**Where to find:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key → `OPENAI_API_KEY`
4. ⚠️ Without this, AI assistant feature will be disabled

### Application URL
```bash
NEXT_PUBLIC_URL=https://your-domain.vercel.app
```

**Usage:**
- Stripe redirect URLs
- Email links
- Social sharing

**Default:** Falls back to `http://localhost:3000` in development

---

## 🔧 Setup Instructions

### Local Development (.env.local)
Create a file `frontend/.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_your_premium
NEXT_PUBLIC_STRIPE_VENDOR_PREMIUM_PRICE_ID=price_your_vendor_premium
NEXT_PUBLIC_STRIPE_VENDOR_FEATURED_PRICE_ID=price_your_vendor_featured
NEXT_PUBLIC_STRIPE_VENDOR_ELITE_PRICE_ID=price_your_vendor_elite

# OpenAI (Optional)
OPENAI_API_KEY=sk-your_openai_key

# App URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### Vercel Production
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add each variable with appropriate scope:
   - ✅ **Production** - for live site
   - ✅ **Preview** - for PR previews
   - ✅ **Development** - for local `vercel dev`

---

## 🚀 Quick Start Checklist

- [ ] Supabase URL and keys configured
- [ ] Stripe secret key added
- [ ] Stripe webhook endpoint created (production only)
- [ ] Stripe products and prices created
- [ ] Price IDs added to environment variables
- [ ] OpenAI key added (if using AI features)
- [ ] Application URL set (production)
- [ ] All variables added to Vercel
- [ ] Redeployed after adding variables

---

## 🔍 Troubleshooting

### Build Failing: "Neither apiKey nor config.authenticator provided"
**Solution:** Add `STRIPE_SECRET_KEY` to Vercel environment variables and redeploy.

### Subscriptions Not Activating
**Solution:**
1. Ensure `STRIPE_WEBHOOK_SECRET` is set
2. Verify webhook endpoint is configured in Stripe dashboard
3. Check webhook delivery in Stripe dashboard

### AI Assistant Not Working
**Solution:** Add `OPENAI_API_KEY` environment variable.

### Wrong Redirect After Payment
**Solution:** Set `NEXT_PUBLIC_URL` to your production domain.

---

## 📊 Current Status

Run this command to check your environment setup:
```bash
npm run check-env
```

Or check manually in development - the app will log missing variables on startup.

---

*Last updated: November 17, 2025*
