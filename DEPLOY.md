# NextShyft — Staging Deploy Guide (Vercel + MongoDB Atlas + Resend + Stripe + VAPID)

This gets you to a real, testable staging environment with emails, payments, and web push.

---

## 1) Repos & local prerequisites

- Node 18+, PNPM
- Accounts: **Vercel**, **MongoDB Atlas**, **Resend**, **Stripe**

Clone repo and run locally to confirm:

```bash
pnpm i
pnpm dev
```

---

## 2) MongoDB Atlas

1. Create a free cluster.
2. Create a database user.
3. Get your connection string (**SRV**) and set:
   - `MONGODB_URI=mongodb+srv://...`
4. (Optional) Create a database named `nextshyft` (will be auto-created).

---

## 3) Resend (emails)

1. Create a Resend project and API key.
2. Verify a sending domain (e.g., `mail.nextshyft.app`) and set DNS as instructed.
3. Set env:
   - `RESEND_API_KEY=...`
   - `EMAIL_FROM=no-reply@yourdomain`

Emails used:

- Invites, Schedule Published, Swap Decisions (via templates in `/emails`).

---

## 4) Stripe (billing)

1. Create prices:
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_BUSINESS`
2. Get secret + webhook secret:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
3. Add `NEXTAUTH_URL` to your staging domain (e.g., `https://staging.nextshyft.app`).
4. In Stripe Dashboard → Developers → Webhooks:
   - Add endpoint: `POST https://<your-domain>/api/billing/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.deleted`

---

## 5) Web Push (VAPID)

Generate keys:

```bash
npx web-push generate-vapid-keys
```

Set:

- `VAPID_PUBLIC_KEY=...`
- `VAPID_PRIVATE_KEY=...`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY=...` (use the same public key)
- `VAPID_CONTACT_EMAIL=mailto:you@domain.tld`

---

## 6) NextAuth (auth)

Set the cookie/crypto secrets:

- `NEXTAUTH_SECRET=` (use `openssl rand -base64 32`)
- `NEXTAUTH_URL=https://<your-domain>`

---

## 7) Vercel project

1. **Import** your GitHub repo into Vercel.
2. Add all env vars above in **Project → Settings → Environment Variables**.
3. Configure:
   - Build command: `pnpm --filter apps/web... build` (or just `pnpm build` if monorepo root handles it)
   - Install command: `pnpm i`
4. Deploy.

> After deploy, hit `/api/health` (if you add one) or `/` to ensure it boots.

---

## 8) Post-deploy checks

- **Auth**: Log in / out.
- **DB**: Create org, positions, templates; ensure data persists.
- **Email**: Invite a user → receive in inbox.
- **Stripe**: Run a test checkout to Pro/Business; verify webhook updates org plan.
- **Push**: Click “Enable push” on Dashboard, then publish a schedule and confirm push arrives.
- **Webhooks**: Inspect Vercel logs for `/api/billing/webhook` on test events.

---

## 9) Domains & redirects (optional)

- Point `staging.nextshyft.app` at Vercel.
- Add `www` redirect if you like.

---

## 10) Troubleshooting

- **Webhook errors**: Check `STRIPE_WEBHOOK_SECRET` and that body parsing is disabled (see code).
- **Emails not sending**: Domain not verified, or Resend key missing.
- **Push not working**: Service worker path must be `/service-worker.js`. Check that VAPID public key is present on client.
- **Auth callback URL**: `NEXTAUTH_URL` must match your staging domain exactly (protocol + host).

---

## 11) Recommended staging data

- Seed an org with `signupCode` from Org Settings.
- Invite a few test users with different roles.
- Create a weekly coverage grid, then use the Schedule page to assign and move staff between shifts.
