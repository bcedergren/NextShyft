# NextShyft - Production Deployment Guide

**Quick deployment guide for launching NextShyft to production on Vercel**

---

## 📋 Prerequisites

Before deploying, ensure you have:
- [ ] GitHub repository with latest code pushed
- [ ] Vercel account (free tier works for staging)
- [ ] MongoDB Atlas account
- [ ] Stripe account (test mode initially)
- [ ] Resend account for emails
- [ ] Custom domain (optional but recommended)

---

## 🚀 Step 1: Vercel Production Setup (15 minutes)

### 1.1 Import Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `bcedergren/NextShyft` from GitHub
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Output Directory:** `.next` (default)

### 1.2 Configure Environment Variables

Click "Environment Variables" and add ALL of the following:

#### Core Application
```bash
NEXTAUTH_URL=https://app.YOUR_DOMAIN.com
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
```

#### Database
```bash
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/nextshyft
```

#### Email (Resend)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=no-reply@YOUR_DOMAIN.com
```

#### Billing (Stripe)
```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxx
STRIPE_PRICE_BUSINESS=price_xxxxxxxxxxxx
```

#### Push Notifications (VAPID)
```bash
# Generate with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=xxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxx
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxxxxxxxxx  # Same as VAPID_PUBLIC_KEY
VAPID_CONTACT_EMAIL=mailto:support@YOUR_DOMAIN.com
```

#### Optional
```bash
APP_NAME=NextShyft
SUPPORT_EMAIL=support@YOUR_DOMAIN.com
```

### 1.3 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Vercel will provide a URL: `your-project.vercel.app`

---

## 🌐 Step 2: Custom Domain Setup (10 minutes)

### 2.1 Add Domain to Vercel

1. In Vercel dashboard → Settings → Domains
2. Add your domain: `app.YOUR_DOMAIN.com`
3. Vercel will show DNS configuration needed

### 2.2 Configure DNS

Add these records at your DNS provider:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

### 2.3 Update Environment Variables

Go back to Vercel → Settings → Environment Variables:
- Update `NEXTAUTH_URL` to `https://app.YOUR_DOMAIN.com`
- Redeploy: Deployments → Click "..." → Redeploy

---

## 🗄️ Step 3: MongoDB Atlas Production (15 minutes)

### 3.1 Create Production Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster:
   - **Tier:** M10 (minimum for production)
   - **Region:** Choose closest to your users
   - **Cluster Name:** `nextshyft-prod`

### 3.2 Configure Database Access

1. Database Access → Add New Database User
   - **Username:** `nextshyft-prod`
   - **Password:** Generate secure password
   - **Role:** Read and write to any database

2. Network Access → Add IP Address
   - Add `0.0.0.0/0` (allows Vercel)
   - **Note:** Vercel IPs are dynamic, so we allow all

### 3.3 Get Connection String

1. Clusters → Connect → Connect your application
2. Copy connection string:
   ```
   mongodb+srv://nextshyft-prod:<password>@cluster.mongodb.net/nextshyft
   ```
3. Replace `<password>` with your database password
4. Update `MONGODB_URI` in Vercel environment variables

### 3.4 Create Database Indexes

SSH into your local machine and run:
```bash
MONGODB_URI=<production-uri> npm run create:indexes
```

Or deploy to Vercel and run via Vercel CLI:
```bash
vercel env pull
npm run create:indexes
```

---

## 💳 Step 4: Stripe Production Setup (20 minutes)

### 4.1 Switch to Live Mode

1. In Stripe dashboard, toggle to "Live mode" (top right)
2. Get your live secret key: API Keys → Secret key → Reveal

### 4.2 Create Products and Prices

1. Products → Add product:
   - **Name:** NextShyft Pro
   - **Price:** $79/month (or your pricing)
   - **Recurring:** Monthly
   - Copy **Price ID** (starts with `price_`)

2. Repeat for Business tier:
   - **Name:** NextShyft Business
   - **Price:** $149/month
   - Copy **Price ID**

### 4.3 Configure Webhook

1. Developers → Webhooks → Add endpoint
2. **Endpoint URL:** `https://app.YOUR_DOMAIN.com/api/billing/webhook`
3. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Copy **Signing secret** (starts with `whsec_`)

### 4.4 Update Vercel Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxx
STRIPE_PRICE_BUSINESS=price_xxxxxxxxxxxx
```

Redeploy after updating.

---

## 📧 Step 5: Resend Email Setup (10 minutes)

### 5.1 Verify Domain

1. Go to [resend.com](https://resend.com)
2. Domains → Add Domain
3. Enter: `YOUR_DOMAIN.com`
4. Add DNS records shown (SPF, DKIM, DMARC)

**DNS Records:**
```
TXT _dmarc.YOUR_DOMAIN.com = "v=DMARC1; p=none"
TXT resend._domainkey.YOUR_DOMAIN.com = [provided by Resend]
TXT YOUR_DOMAIN.com = [SPF record provided by Resend]
```

### 5.2 Get API Key

1. API Keys → Create API Key
2. Name it "Production"
3. Copy the key (starts with `re_`)

### 5.3 Update Vercel

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=no-reply@YOUR_DOMAIN.com
```

### 5.4 Test Email Delivery

After deploy, test with:
```bash
curl -X POST https://app.YOUR_DOMAIN.com/api/email/test
```

---

## 🔐 Step 6: Generate VAPID Keys for Push (5 minutes)

### 6.1 Generate Keys Locally

```bash
npx web-push generate-vapid-keys
```

Output:
```
Public Key: BH...xxx
Private Key: ab...xyz
```

### 6.2 Add to Vercel

```bash
VAPID_PUBLIC_KEY=BH...xxx
VAPID_PRIVATE_KEY=ab...xyz
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BH...xxx  # Same as public
VAPID_CONTACT_EMAIL=mailto:support@YOUR_DOMAIN.com
```

---

## ✅ Step 7: Post-Deployment Verification (15 minutes)

### 7.1 Smoke Tests

Visit your production URL and test:

- [ ] **Homepage loads:** `https://app.YOUR_DOMAIN.com`
- [ ] **Signup works:** Create test account
- [ ] **Login works:** Sign in with test account
- [ ] **Dashboard loads:** See empty state
- [ ] **Onboarding wizard:** Complete steps
- [ ] **Create position:** Test CRUD operations
- [ ] **Send invite:** Email should arrive
- [ ] **Security headers:** Check with [securityheaders.com](https://securityheaders.com)

### 7.2 Test Stripe Checkout

1. Create test org and upgrade to Pro
2. Complete checkout (use test card: `4242 4242 4242 4242`)
3. Verify webhook processed (check Vercel logs)
4. Verify org plan updated in database

### 7.3 Monitor Logs

1. Vercel dashboard → Deployments → Latest → Runtime Logs
2. Watch for errors
3. Check MongoDB Atlas → Metrics for connection issues

---

## 📊 Step 8: Staging Environment (Optional but Recommended)

### 8.1 Create Staging Project

1. Create new Vercel project from same repo
2. Set git branch: `staging`
3. Use subdomain: `staging.YOUR_DOMAIN.com`

### 8.2 Staging Environment Variables

Use **separate** resources for staging:
- MongoDB cluster: `nextshyft-staging`
- Stripe: Keep in **test mode**
- Resend: Same domain, different API key
- NEXTAUTH_URL: `https://staging.YOUR_DOMAIN.com`

### 8.3 Staging Workflow

1. Merge PRs to `staging` branch first
2. Test on staging environment
3. If all good, merge `staging` → `master`
4. Production auto-deploys from `master`

---

## 🔍 Troubleshooting

### Build Fails

**Error:** `Module not found`
- **Fix:** Run `npm install` locally, commit `package-lock.json`

**Error:** `Type errors`
- **Fix:** Run `npm run typecheck` locally, fix errors

### Database Connection Issues

**Error:** `MongoServerError: Authentication failed`
- **Fix:** Verify username/password in connection string
- **Fix:** Check Database Access user has correct permissions

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`
- **Fix:** Verify IP whitelist includes `0.0.0.0/0`
- **Fix:** Check connection string format

### Stripe Webhook Not Working

**Error:** `Webhook signature verification failed`
- **Fix:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- **Fix:** Check webhook URL is exact: `/api/billing/webhook`

**Error:** `No webhooks received`
- **Fix:** Test webhook in Stripe dashboard → "Send test webhook"
- **Fix:** Check Vercel logs for incoming requests

### Email Not Sending

**Error:** `403 Forbidden from Resend`
- **Fix:** Verify domain is verified in Resend
- **Fix:** Check DNS records are correct

**Error:** `Emails going to spam`
- **Fix:** Verify SPF, DKIM, DMARC records
- **Fix:** Use proper from address (not @gmail.com)

---

## 📈 Monitoring Setup (Post-Launch)

### Enable Vercel Analytics

1. Vercel dashboard → Analytics → Enable
2. Free for personal projects
3. Tracks Web Vitals automatically

### Error Tracking (Optional)

**Option 1: Vercel Speed Insights (Free)**
- Already included

**Option 2: Sentry (Recommended)**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Uptime Monitoring (Optional)

Use [UptimeRobot](https://uptimerobot.com) (free):
- Monitor: `https://app.YOUR_DOMAIN.com/api/health`
- Alert via email if down
- Check every 5 minutes

---

## 🔒 Security Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] No secrets in code (only in env vars)
- [ ] HTTPS enabled (Vercel does this automatically)
- [ ] Security headers configured (already in `next.config.js`)
- [ ] Database IP whitelist configured
- [ ] Stripe webhook secret set
- [ ] Test account deleted
- [ ] Rate limiting enabled (already in middleware)
- [ ] Legal pages accessible (`/terms`, `/privacy`)
- [ ] GDPR endpoints working (`/api/me/export`, `/api/me/delete`)

---

## 🎉 Launch Checklist

Ready to launch? Verify:

- [ ] All smoke tests passing
- [ ] Stripe checkout works end-to-end
- [ ] Email delivery confirmed (inbox, not spam)
- [ ] Mobile responsive (test on real device)
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Database indexes created
- [ ] Backup strategy documented
- [ ] Support email monitored
- [ ] Beta users recruited (3-5 minimum)

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Stripe:** https://stripe.com/docs
- **Resend:** https://resend.com/docs
- **Next.js:** https://nextjs.org/docs

---

## 🔄 Rollback Procedure

If something goes wrong:

1. Vercel dashboard → Deployments
2. Find last known good deployment
3. Click "..." → "Promote to Production"
4. Fix issue locally
5. Redeploy when ready

---

**Estimated Total Time:** 1.5 - 2 hours  
**Difficulty:** Intermediate  
**Cost:** ~$100-150/month (M10 MongoDB + Vercel Pro + Resend)

**Last Updated:** April 17, 2026  
**Questions?** Open GitHub issue or email support@YOUR_DOMAIN.com
