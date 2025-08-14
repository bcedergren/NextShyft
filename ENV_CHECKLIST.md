
# NextShyft — Environment Variables Checklist

## Core
- `MONGODB_URI=` mongodb+srv://admin:***@cluster0.....mongodb.net/nextshyft
- `NEXTAUTH_SECRET=` openssl rand -base64 32
- `NEXTAUTH_URL=` https://your-domain.tld

## Email (Resend)
- `RESEND_API_KEY=` re_************************
- `EMAIL_FROM=` no-reply@your-domain.tld

## App branding
- `APP_NAME=` NextShyft (optional)

## Demo mode (optional)
- `NEXT_PUBLIC_DEMO_MODE=` 1
- `NEXT_PUBLIC_DEMO_ORG_ID=` 689e3862cd3e503e177a5715

## Stripe (Billing)
- `STRIPE_SECRET_KEY=` sk_test_...
- `STRIPE_WEBHOOK_SECRET=` whsec_...
- `STRIPE_PRICE_PRO=` price_...
- `STRIPE_PRICE_BUSINESS=` price_...

## Web Push (VAPID)
- `VAPID_PUBLIC_KEY=`
- `VAPID_PRIVATE_KEY=`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY=`
- `VAPID_CONTACT_EMAIL=` mailto:you@your-domain.tld

## Optional dev seeding
- `SEED_ORG_NAME=` Demo Bar & Grill
