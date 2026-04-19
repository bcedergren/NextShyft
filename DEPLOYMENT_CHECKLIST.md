# NextShyft Deployment Checklist

**Use this checklist to track your deployment progress**

---

## 📋 Pre-Deployment Preparation

### Accounts Needed (Create These First)

- [ ] **Vercel Account**
  - [ ] Sign up at [vercel.com](https://vercel.com)
  - [ ] Connect GitHub account
  - [ ] Verify email

- [ ] **MongoDB Atlas Account**
  - [ ] Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
  - [ ] Verify email
  - [ ] Have credit card ready (required even for free tier)

- [ ] **Stripe Account**
  - [ ] Sign up at [stripe.com](https://stripe.com)
  - [ ] Complete business verification (can take 1-2 days)
  - [ ] Have bank account info ready

- [ ] **Resend Account**
  - [ ] Sign up at [resend.com](https://resend.com)
  - [ ] Verify email
  - [ ] Have DNS access ready

- [ ] **Domain Name** (Optional but recommended)
  - [ ] Purchase domain (e.g., namecheap.com, godaddy.com)
  - [ ] Have DNS access ready

---

## 🚀 Phase 1: Vercel Deployment (30 min)

### Step 1: Import Repository

- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Click "Import Git Repository"
- [ ] Select `bcedergren/NextShyft`
- [ ] Click "Import"

### Step 2: Configure Build Settings

- [ ] Framework Preset: **Next.js** (should auto-detect)
- [ ] Root Directory: `./` (leave default)
- [ ] Build Command: `npm run build` (leave default)
- [ ] Install Command: `npm install` (leave default)
- [ ] Output Directory: `.next` (leave default)

### Step 3: Add Environment Variables

Click "Environment Variables" and add each variable from `.env.production.template`

**For now, use placeholder values:**
- [ ] `NEXTAUTH_URL` = `https://your-project.vercel.app` (use Vercel URL for now)
- [ ] `NEXTAUTH_SECRET` = Generate with: `openssl rand -base64 32`
- [ ] `MONGODB_URI` = Add after creating MongoDB cluster (Step 4)
- [ ] All other variables = Add after setting up services (Steps 5-7)

### Step 4: Initial Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Note your Vercel URL: `https://YOUR_PROJECT.vercel.app`
- [ ] Click "Visit" to see the app (will show errors until env vars are complete)

---

## 🗄️ Phase 2: MongoDB Atlas Setup (20 min)

### Step 1: Create Cluster

- [ ] Go to [cloud.mongodb.com](https://cloud.mongodb.com)
- [ ] Click "Build a Database"
- [ ] Choose: **M10** (minimum for production) or **M0** (free for testing)
- [ ] Provider: **AWS** (recommended)
- [ ] Region: Choose closest to your users
- [ ] Cluster Name: `nextshyft-prod`
- [ ] Click "Create Cluster"
- [ ] Wait 3-5 minutes for cluster to provision

### Step 2: Create Database User

- [ ] Click "Database Access" (left sidebar)
- [ ] Click "Add New Database User"
- [ ] Authentication Method: **Password**
- [ ] Username: `nextshyft-prod`
- [ ] Password: Click "Autogenerate Secure Password" (SAVE THIS!)
- [ ] Built-in Role: **Read and write to any database**
- [ ] Click "Add User"

### Step 3: Configure Network Access

- [ ] Click "Network Access" (left sidebar)
- [ ] Click "Add IP Address"
- [ ] Click "Allow Access from Anywhere" (needed for Vercel)
- [ ] Confirm: `0.0.0.0/0` is added
- [ ] Click "Confirm"

### Step 4: Get Connection String

- [ ] Go back to "Database" (left sidebar)
- [ ] Click "Connect" on your cluster
- [ ] Click "Connect your application"
- [ ] Driver: **Node.js**
- [ ] Version: **5.5 or later**
- [ ] Copy the connection string
- [ ] Replace `<password>` with your database password
- [ ] Replace `myFirstDatabase` with `nextshyft`
- [ ] Final format: `mongodb+srv://nextshyft-prod:PASSWORD@cluster.mongodb.net/nextshyft?retryWrites=true&w=majority`

### Step 5: Update Vercel Environment Variables

- [ ] Go to Vercel dashboard → Settings → Environment Variables
- [ ] Add `MONGODB_URI` with your connection string
- [ ] Click "Save"

### Step 6: Create Database Indexes

After Vercel redeploys, run locally:

```bash
# Set production MongoDB URI
export MONGODB_URI="your-production-connection-string"

# Run index creation script
npm run create:indexes
```

- [ ] Run the above commands
- [ ] Verify indexes created (check MongoDB Atlas → Collections → Indexes)

---

## 💳 Phase 3: Stripe Setup (30 min)

### Step 1: Switch to Live Mode

- [ ] Go to [dashboard.stripe.com](https://dashboard.stripe.com)
- [ ] Toggle to **Live mode** (top right corner)
- [ ] Complete business verification if not done

### Step 2: Get API Keys

- [ ] Click "Developers" → "API keys"
- [ ] Copy **Secret key** (starts with `sk_live_`)
- [ ] Save this key securely

### Step 3: Create Products

**Pro Plan:**
- [ ] Go to "Products" → "Add product"
- [ ] Name: `NextShyft Pro`
- [ ] Description: `Professional scheduling for small teams`
- [ ] Pricing model: **Recurring**
- [ ] Price: `$79` (or your price)
- [ ] Billing period: **Monthly**
- [ ] Click "Save product"
- [ ] Copy **Price ID** (starts with `price_`)

**Business Plan:**
- [ ] Click "Add product" again
- [ ] Name: `NextShyft Business`
- [ ] Description: `Advanced features for larger teams`
- [ ] Pricing model: **Recurring**
- [ ] Price: `$149` (or your price)
- [ ] Billing period: **Monthly**
- [ ] Click "Save product"
- [ ] Copy **Price ID** (starts with `price_`)

### Step 4: Create Webhook

- [ ] Go to "Developers" → "Webhooks"
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://YOUR_PROJECT.vercel.app/api/billing/webhook`
- [ ] Description: `Production webhook`
- [ ] Events to send: Click "Select events"
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Click "Add events"
- [ ] Click "Add endpoint"
- [ ] Click "Reveal" on Signing secret
- [ ] Copy **Signing secret** (starts with `whsec_`)

### Step 5: Update Vercel Environment Variables

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Add `STRIPE_SECRET_KEY` = `sk_live_...`
- [ ] Add `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- [ ] Add `STRIPE_PRICE_PRO` = `price_...` (from Pro product)
- [ ] Add `STRIPE_PRICE_BUSINESS` = `price_...` (from Business product)
- [ ] Click "Save"

---

## 📧 Phase 4: Resend Email Setup (25 min)

### Step 1: Create API Key

- [ ] Go to [resend.com](https://resend.com)
- [ ] Click "API Keys"
- [ ] Click "Create API Key"
- [ ] Name: `Production`
- [ ] Permission: **Full access**
- [ ] Click "Add"
- [ ] Copy API key (starts with `re_`)

### Step 2: Add Domain

- [ ] Click "Domains" → "Add Domain"
- [ ] Enter your domain: `YOUR_DOMAIN.com` (not including subdomain)
- [ ] Click "Add"
- [ ] Resend will show DNS records to add

### Step 3: Configure DNS Records

Go to your domain provider (Namecheap, GoDaddy, etc.):

**SPF Record:**
- [ ] Type: `TXT`
- [ ] Name: `@` (or your root domain)
- [ ] Value: Copy from Resend (looks like `v=spf1 include:...`)
- [ ] TTL: `3600`

**DKIM Record:**
- [ ] Type: `TXT`
- [ ] Name: `resend._domainkey` (or as shown in Resend)
- [ ] Value: Copy from Resend (long string)
- [ ] TTL: `3600`

**DMARC Record:**
- [ ] Type: `TXT`
- [ ] Name: `_dmarc`
- [ ] Value: `v=DMARC1; p=none;`
- [ ] TTL: `3600`

### Step 4: Verify Domain

- [ ] Go back to Resend → Domains
- [ ] Click "Verify DNS Records"
- [ ] Wait for verification (can take 5-60 minutes)
- [ ] Status should show: ✅ Verified

### Step 5: Update Vercel Environment Variables

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Add `RESEND_API_KEY` = `re_...`
- [ ] Add `EMAIL_FROM` = `no-reply@YOUR_DOMAIN.com`
- [ ] Click "Save"

---

## 🔔 Phase 5: VAPID Keys for Push Notifications (5 min)

### Step 1: Generate Keys Locally

Run this command on your computer:

```bash
npx web-push generate-vapid-keys
```

- [ ] Copy the **Public Key**
- [ ] Copy the **Private Key**

### Step 2: Update Vercel Environment Variables

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Add `VAPID_PUBLIC_KEY` = (paste public key)
- [ ] Add `VAPID_PRIVATE_KEY` = (paste private key)
- [ ] Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = (paste public key again)
- [ ] Add `VAPID_CONTACT_EMAIL` = `mailto:support@YOUR_DOMAIN.com`
- [ ] Click "Save"

---

## 🌐 Phase 6: Custom Domain (Optional - 15 min)

### Step 1: Add Domain in Vercel

- [ ] Go to Vercel → Settings → Domains
- [ ] Click "Add"
- [ ] Enter: `app.YOUR_DOMAIN.com`
- [ ] Click "Add"

### Step 2: Configure DNS

Vercel will show which record to add. Usually:

- [ ] Type: `CNAME`
- [ ] Name: `app`
- [ ] Value: `cname.vercel-dns.com`
- [ ] TTL: `3600`

### Step 3: Wait for SSL

- [ ] Wait for SSL certificate to provision (2-10 minutes)
- [ ] Status should show: ✅ Valid

### Step 4: Update NEXTAUTH_URL

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Edit `NEXTAUTH_URL`
- [ ] Change to: `https://app.YOUR_DOMAIN.com`
- [ ] Click "Save"

### Step 5: Update Stripe Webhook URL

- [ ] Go to Stripe → Developers → Webhooks
- [ ] Click on your webhook endpoint
- [ ] Update URL to: `https://app.YOUR_DOMAIN.com/api/billing/webhook`
- [ ] Click "Update endpoint"

---

## 🔄 Phase 7: Redeploy and Test (20 min)

### Step 1: Trigger Redeploy

- [ ] Go to Vercel → Deployments
- [ ] Click "..." on latest deployment
- [ ] Click "Redeploy"
- [ ] Check "Use existing Build Cache": **OFF**
- [ ] Click "Redeploy"
- [ ] Wait for deployment to complete

### Step 2: Smoke Tests

Visit your production URL and test:

- [ ] Homepage loads without errors
- [ ] Click "Sign Up" → Create account works
- [ ] Email verification received (check inbox/spam)
- [ ] Sign in works
- [ ] Dashboard loads
- [ ] Onboarding wizard appears
- [ ] Can create a position
- [ ] Can send an invite (email arrives)
- [ ] Legal pages load (`/terms`, `/privacy`)
- [ ] Security headers present (check devtools → Network)

### Step 3: Test Stripe Checkout

- [ ] Create test organization
- [ ] Go to Billing page
- [ ] Click "Upgrade to Pro"
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify webhook received (Vercel → Deployment → Runtime Logs)
- [ ] Verify org plan updated (check in dashboard)

### Step 4: Test Email Delivery

- [ ] Send yourself a test invite
- [ ] Check email arrives in inbox (not spam)
- [ ] Click invite link → works
- [ ] Check email formatting looks good

### Step 5: Test Schedule Generation

- [ ] Complete onboarding wizard
- [ ] Create a few positions
- [ ] Create shift templates
- [ ] Click "Generate Schedule"
- [ ] Verify AI generates assignments
- [ ] Check preview modal shows correctly

---

## ✅ Post-Deployment

### Step 1: Monitor

- [ ] Vercel → Analytics → Enable
- [ ] Check Runtime Logs for errors
- [ ] Monitor MongoDB Atlas metrics

### Step 2: Backups

- [ ] MongoDB Atlas → Backup → Verify daily backups enabled
- [ ] Document restore procedure

### Step 3: Support

- [ ] Set up support email: `support@YOUR_DOMAIN.com`
- [ ] Monitor for user questions
- [ ] Create help documentation

---

## 🎯 Success Criteria

Your deployment is successful when:

- [ ] ✅ All environment variables set
- [ ] ✅ Production URL loads without errors
- [ ] ✅ Can create account and sign in
- [ ] ✅ Emails deliver to inbox (not spam)
- [ ] ✅ Stripe checkout works
- [ ] ✅ Schedule generation works
- [ ] ✅ No critical errors in logs
- [ ] ✅ Security headers score A on securityheaders.com
- [ ] ✅ Performance Lighthouse score >80

---

## 📊 Estimated Timeline

- **Phase 1 (Vercel):** 30 minutes
- **Phase 2 (MongoDB):** 20 minutes
- **Phase 3 (Stripe):** 30 minutes
- **Phase 4 (Resend):** 25 minutes
- **Phase 5 (VAPID):** 5 minutes
- **Phase 6 (Domain):** 15 minutes (optional)
- **Phase 7 (Testing):** 20 minutes

**Total: ~2.5 hours** (or 2 hours without custom domain)

---

## 🆘 Need Help?

If you get stuck:

1. Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. Check Vercel Runtime Logs for errors
3. Verify all environment variables are set correctly
4. Check DNS propagation with [whatsmydns.net](https://www.whatsmydns.net)
5. Open GitHub issue in your repository

---

**Good luck with your deployment! 🚀**
