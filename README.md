# NextShyft Scaffold

NextShyft is a Next.js 14 app scaffold for workforce scheduling and shift management.

![CI](https://github.com/bcedergren/NextShyft/actions/workflows/ci.yml/badge.svg)

Run `pnpm install && pnpm dev` inside `apps/web`

## Setup Instructions

### 1. Install Dependencies
Make sure you have [pnpm](https://pnpm.io/) installed. Then run:

```bash
cd apps/web
pnpm install
pnpm dev
```

### 2. Environment Variables

Create a `.env.local` file in `apps/web` with the following keys:

```env
MONGODB_URI=your-mongodb-uri
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+1yourtwilionumber
```

### 3. MongoDB Setup

- Use [MongoDB Atlas](https://www.mongodb.com/atlas/database) to create a cluster.
- Add a database named `nextshyft` and collections for `users`, `organizations`, `positions`, etc.

### 4. Auth Setup

This scaffold uses **NextAuth.js**. Email magic link is the default.
You can later add Google or Microsoft auth if needed.

### 5. Resend (Email Notifications)

- Go to [resend.com](https://resend.com/), sign up, and create an API key.
- Add your domain or use sandbox for now.

### 6. Twilio (SMS Notifications)

- [Sign up for Twilio](https://www.twilio.com/).
- Get a verified phone number, then add your credentials to `.env.local`.

### 7. Build Roadmap

✅ Org-based auth with roles (Employee, Manager, Owner, Super Admin)  
✅ Availability & positions  
✅ Swap requests & PTO  
🔄 ILP-based schedule generator (stub ready in `lib/scheduler/`)  
📆 Drag-and-drop UI for shift planning  
🛠️ Email + SMS via Resend + Twilio  

---

You’re ready to start building **NextShyft** 🚀  

## App Shell & Auth
- AppBar with logo + dark-mode toggle is wired via `components/AppShell.tsx` and `app/providers.tsx`.
- Head icons & PWA manifest are prelinked in `app/layout.tsx`.

## Run the app
```bash
cd apps/web
pnpm install
pnpm dev
```
Open http://localhost:3000

> Note: Email auth uses NextAuth Email provider stub. Add `EMAIL_SERVER` and `EMAIL_FROM` or switch to Resend provider.

## Notifications
- Email via Resend: set `RESEND_API_KEY` and `EMAIL_FROM`.
- SMS via Twilio: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.

## Publish flow
`POST /api/schedules/[id]/publish` will notify assigned staff (mock data until DB wired).

## iCal export
GET `/api/ical/:userId` returns an `.ics` calendar for a user's shifts (demo event for now).

## Coverage heatmap
See **Reports** at `/org/demo/(manager)/reports` for a simple coverage heatmap.

## Auth (Email magic link via Resend)
- Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env.local`.
- NextAuth Email provider is configured to send verification emails using Resend.

## ILP
- Real LP model encoder at `lib/scheduler/encode.ts` (uses `javascript-lp-solver` if installed).
- Endpoint: `POST /api/schedules/lp/generate` returns model + solution.

## Swaps
- `/api/swaps` supports GET (list by org), POST (create), PUT (approve/deny). Protected by session.
- Manager queue UI at `/org/demo/(manager)/swaps`.

## iCal & Publish
- iCal feed: `/api/ical/:userId`
- Publish & notify: `POST /api/schedules/[id]/publish`

## ⚠️ Security Note
- `.env.local` has been generated with your provided creds. **Do not commit** it to git. Rotate keys if shared outside your team.

## New Features
- **Invites:** Manager sends invites at `/org/demo/(manager)/people` → email via Resend → user accepts at `/accept?token=...`.
- **Positions:** CRUD at `/org/demo/(manager)/positions`.
- **Shift Templates:** CRUD at `/org/demo/(manager)/templates`.
- **Schedules:** `POST /api/schedules` seeds a new draft from templates; `/api/shifts` lists shifts; `/api/shifts/assign` assigns staff.
- **Policy:** Edit constraints at `/org/demo/(manager)/policy` and run the solver.

## RBAC
- Edge middleware checks auth; API routes enforce org + role via `withGuard`.
- Manager/Owner required for modifying positions/templates/policy/schedules.

## Coverage Planning
- Coverage editor at `/org/demo/(manager)/coverage` lets you set required staff per hour, per day, per position.
- Saves into Shift Templates; heatmap visualizes demand.

## Coverage-driven generation
- Coverage Editor writes hourly requirements into Shift Templates.
- Creating a schedule (`POST /api/schedules`) seeds shifts from templates; the LP generator now uses **real Users + Availabilities**.

## People Directory
- Manager directory at `/org/demo/(manager)/directory` with filters by role, position, and search.

## Schedule Board power moves
- **Shift selection**: Shift-click and drag to select multiple shifts; use sidebar to bulk-assign or clear.
- **Undo**: Revert last assignment change.
- **Overtime**: Chips show `• OT` when a staff member exceeds 40hrs in the current period.

## Billing (stub)
- Manager Billing page at `/org/demo/(manager)/billing` with plan selection.
- `POST /api/billing/checkout` returns a placeholder URL; replace with real Stripe Checkout Session creation.
- Env placeholders to add: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`.

## Employee UX
- **Mobile bottom nav** across employee pages (Home, Schedule, Inbox, Profile).
- **Dashboard cards**: next shift + unread notifications.
- **Schedule**: month calendar + upcoming list; request swap inline; iCal button.
- **Inbox**: notifications list + mark all read.
- **Availability**: quick actions to copy Monday to all and clear week.
- **API**: `/api/my/shifts` for the signed-in user's assignments.
- Notifications get created on **publish** and **swap decisions**.

Tip: Use small-screen devtools to verify the bottom nav & layouts.

## My Hours (employee)
- Detail page at `/org/demo/(employee)/hours` with daily totals and **CSV export** at `/api/my/hours/export?month=YYYY-MM`.

## Notifications bell
- App header shows a bell with **unread badge** (auto-refreshes). Click to go to Inbox.

## Web Push (optional)
- Service worker in `/public/service-worker.js`.
- Client opt-in via a button on **Dashboard**.
- Save subscriptions: `POST /api/push/subscribe`.
- Server sends pushes on **schedule publish** and **swap decisions** (if VAPID keys exist).
- Set these envs to enable:
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (same public key, exposed to client)
  - `VAPID_CONTACT_EMAIL`

## Staff self-signup
- Manager can rotate a **Signup Code** in **Org Settings** `/org/demo/(manager)/org-settings`.
- Employees can join at `/join` using the code; they’ll receive an invite link via email.

## Announcements
- Manager page: `/org/demo/(manager)/announcements` to post/pin.
- Employee page: `/org/demo/(employee)/announcements` to read.

## Billing (Stripe) — real Checkout + webhook
- Set env: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_WEBHOOK_SECRET`, `NEXTAUTH_URL`.
- Checkout: `POST /api/billing/checkout` -> returns Stripe Checkout URL.
- Webhook: `POST /api/billing/webhook` (disable body parsing; set endpoint in Stripe).
- Events handled:
  - `checkout.session.completed` → set org plan to **pro**
  - `customer.subscription.deleted` → fallback to **free**


### Suspension & Read-only
- Org suspension trips a **read-only UI** (buttons/inputs disabled) and redirects to `/suspended`.
- Owners can self-serve unsuspension after fixing billing.
- Webhook auto-unsuspends on Stripe **invoice.payment_succeeded** or **subscription updates**.
- Set `SUPPORT_EMAIL` to route escalation emails.


### Stripe webhook allowlist
Set `STRIPE_WEBHOOK_EVENT_ALLOWLIST` (comma-separated) to restrict which Stripe events are processed. Default: `checkout.session.completed,customer.subscription.updated,invoice.payment_succeeded`.


### DI (tsyringe)
- We now use **tsyringe**. `lib/di/registry.ts` registers adapters/services and exposes a shared `container`.
- Legacy `lib/di/container.ts` is still available; it resolves from tsyringe under the hood, so routes don’t need changes.

### E2E (Playwright)
- Local: in one terminal `pnpm --filter apps/web dev`, then in another `pnpm --filter apps/web e2e` (set `PLAYWRIGHT_BASE_URL` if not default).
- CI: workflow builds, starts the server, waits for `/api/health`, then runs tests.
