# 🚀 Deploy NextShyft NOW - Quick Start

**This guide gets you from code to production in ~2 hours**

---

## ⚡ Super Quick Deployment (Follow These Links in Order)

I've prepared everything for you. Just click these links and follow the steps:

### ☑️ Step 1: Create Accounts (15 min)

Open these in separate tabs and create accounts:

1. **Vercel** (hosting): https://vercel.com/signup
2. **MongoDB Atlas** (database): https://www.mongodb.com/cloud/atlas/register
3. **Stripe** (payments): https://dashboard.stripe.com/register
4. **Resend** (email): https://resend.com/signup

### ☑️ Step 2: Deploy to Vercel (5 min)

1. Go to: https://vercel.com/new
2. Import `bcedergren/NextShyft` from GitHub
3. **DON'T ADD ENV VARS YET** - Just click "Deploy"
4. Wait 2-3 minutes
5. Copy your Vercel URL (e.g., `nextshyft.vercel.app`)

**✅ Checkpoint:** You should see the app (with errors - that's OK!)

---

### ☑️ Step 3: Set Up MongoDB (10 min)

1. In MongoDB Atlas, click "Build a Database"
2. Choose **M0** (Free tier) for testing OR **M10** ($57/mo) for production
3. Provider: AWS, Region: closest to you
4. Cluster Name: `nextshyft-prod`
5. Click "Create"
6. While waiting, go to "Database Access" → Add user:
   - Username: `nextshyft`
   - Password: Click "Autogenerate" (SAVE THIS!)
   - Role: Read and write to any database
7. Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (`0.0.0.0/0`)
8. Go back to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your saved password
   - Replace `myFirstDatabase` with `nextshyft`

**Your connection string should look like:**
```
mongodb+srv://nextshyft:YOUR_PASSWORD@cluster.mongodb.net/nextshyft?retryWrites=true&w=majority
```

**✅ Checkpoint:** Save this connection string - you'll need it in Step 6!

---

### ☑️ Step 4: Set Up Stripe (15 min)

#### 4.1 Get API Key
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_`)

#### 4.2 Create Products
1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Name: `NextShyft Pro`, Price: $79/month, Recurring
4. Click "Save" → Copy **Price ID** (starts with `price_`)
5. Repeat: Name: `NextShyft Business`, Price: $149/month
6. Copy second **Price ID**

#### 4.3 Create Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://YOUR_VERCEL_URL.vercel.app/api/billing/webhook`
4. Events: Select these:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Click "Add endpoint"
6. Click "Reveal" on signing secret → Copy it (starts with `whsec_`)

**✅ Checkpoint:** You should have 4 values: API key, 2 Price IDs, Webhook secret

---

### ☑️ Step 5: Set Up Resend (10 min)

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name: Production, Permission: Full access
4. Copy key (starts with `re_`)

**For now, skip domain verification** - you can send from `onboarding@resend.dev`

**✅ Checkpoint:** You have Resend API key

---

### ☑️ Step 6: Generate VAPID Keys (2 min)

On your computer, run:

```bash
npx web-push generate-vapid-keys
```

Copy both the Public and Private keys.

**✅ Checkpoint:** You have 2 VAPID keys

---

### ☑️ Step 7: Add All Environment Variables to Vercel (10 min)

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Click "Add" for each variable below:

**Copy-paste these (replace values with yours):**

```bash
# Core
NEXTAUTH_URL=https://YOUR_VERCEL_URL.vercel.app
NEXTAUTH_SECRET=run-this-command-locally: openssl rand -base64 32

# Database
MONGODB_URI=mongodb+srv://nextshyft:PASSWORD@cluster.mongodb.net/nextshyft

# Email
RESEND_API_KEY=re_YOUR_KEY
EMAIL_FROM=onboarding@resend.dev

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
STRIPE_PRICE_PRO=price_YOUR_PRO_ID
STRIPE_PRICE_BUSINESS=price_YOUR_BUSINESS_ID

# VAPID (paste your generated keys)
VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY
VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY
VAPID_CONTACT_EMAIL=mailto:support@YOUR_DOMAIN.com
```

3. For `NEXTAUTH_SECRET`, run this locally to generate:
```bash
openssl rand -base64 32
```

**✅ Checkpoint:** All 13 environment variables added

---

### ☑️ Step 8: Redeploy (5 min)

1. Go to Vercel → Deployments
2. Click "..." on latest → "Redeploy"
3. Uncheck "Use existing Build Cache"
4. Click "Redeploy"
5. Wait 2-3 minutes

**✅ Checkpoint:** Deployment succeeds (green checkmark)

---

### ☑️ Step 9: Test Your App! (15 min)

Visit your Vercel URL and test:

1. **Homepage loads** ✅
   - Visit `https://YOUR_VERCEL_URL.vercel.app`
   - Should see NextShyft landing page

2. **Create account** ✅
   - Click "Get Started" or "Sign Up"
   - Enter email and password
   - Should create account successfully

3. **Sign in** ✅
   - Go to "Sign In"
   - Enter your credentials
   - Should see dashboard

4. **Onboarding wizard** ✅
   - Should automatically show wizard
   - Click "Try with Demo Data" for quick test
   - Should create sample positions

5. **Send test email** ✅
   - Go to People → Invite
   - Enter test email
   - Check if email arrives

6. **Test Stripe** ✅
   - Go to Billing
   - Click "Upgrade to Pro"
   - Use test card: `4242 4242 4242 4242`
   - Should complete checkout

**✅ Checkpoint:** All tests passing? You're LIVE! 🎉

---

## 🎉 Congratulations! Your App is Live!

If all tests passed, your app is now running in production!

### Share Your App
- **Your URL:** `https://YOUR_VERCEL_URL.vercel.app`
- **Share with:** Friends, beta testers, social media

### Next Steps
1. Recruit 3-5 beta users to test
2. Monitor Vercel logs for errors
3. Set up custom domain (optional)
4. Gather feedback and iterate

---

## 🆘 Troubleshooting

### "Can't connect to database"
- Check MongoDB URI in Vercel env vars
- Verify password is correct (no special chars issue)
- Check MongoDB Network Access allows `0.0.0.0/0`

### "Email not sending"
- Check RESEND_API_KEY is set
- Try using `onboarding@resend.dev` for EMAIL_FROM
- Check Vercel logs for Resend errors

### "Stripe checkout fails"
- Check all 4 Stripe env vars are set
- Verify webhook URL matches your Vercel URL
- Use test card: `4242 4242 4242 4242`

### "Build fails"
- Check Vercel build logs
- Usually: missing env var or TypeScript error
- Try: Clear build cache and redeploy

---

## 📞 Get Help

- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md`
- **Checklist:** See `DEPLOYMENT_CHECKLIST.md`
- **Environment Template:** See `.env.production.template`

---

## 🔒 Security Note

**You're using TEST MODE Stripe** - This is safe for testing!
- No real money charged
- Use test cards only
- Switch to LIVE mode before public launch

**To switch to LIVE mode later:**
1. Stripe dashboard → Toggle "Live mode"
2. Get new API keys and Price IDs
3. Update Vercel env vars
4. Update webhook URL

---

## ⏱️ Deployment Time Tracker

Track your progress:

- [ ] Accounts created: _____ minutes
- [ ] Vercel initial deploy: _____ minutes
- [ ] MongoDB setup: _____ minutes
- [ ] Stripe setup: _____ minutes
- [ ] Resend setup: _____ minutes
- [ ] VAPID keys: _____ minutes
- [ ] Environment variables: _____ minutes
- [ ] Redeploy: _____ minutes
- [ ] Testing: _____ minutes

**Total time: _____ minutes**

**Target: 120 minutes (2 hours)**

---

## 🎯 You're Ready!

Everything is prepared for you. Just follow the steps above in order and you'll have a live app in ~2 hours.

**Good luck! 🚀**

**Questions?** Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
