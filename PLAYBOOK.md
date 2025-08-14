
# NextShyft — Suspension & Reactivation Playbook

This playbook outlines how suspensions work, how to diagnose issues, and how to safely reactivate organizations.

## Why an org might be suspended
- **Billing failure**: subscription past-due / unpaid invoice.
- **Abuse / TOS**: spam invites, abusive content, automated scraping.
- **Security**: request by owner, suspicious activity.

## What suspension does
- Server routes gated via `requireManager`/`requireOwner` return **423 Locked** unless explicitly allowed.
- Client shows a **global banner** and **auto-redirects** to `/suspended` (read-only).
- UI elements become **read-only** (form controls disabled) except allowlisted pages:
  - Billing, Org Settings.

## How to reactivate
- **Owner self-serve**:
  1. Go to **Billing** and resolve payment.
  2. If needed, click **“I’m the owner — Unsuspend”** on `/suspended` or Org Settings.
- **Automatic** (webhook):
  - On Stripe `checkout.session.completed`, `invoice.payment_succeeded`, or `customer.subscription.updated`, we **auto-unsuspend** the org.
- **Super Admin**:
  - On `/admin/orgs/[id]`, use **Unsuspend org** button.

## Signals & diagnostics
- `/api/org/status` returns `{ suspended, plan, suspendedAt }` for the current session org.
- Admin drilldown shows **SUSPENDED** tag next to orgs.
- Stripe customer/subscription IDs on the org record can be checked for payment state.

## Manual suspension (Super Admin)
- API: `PUT /api/admin/orgs/:id/suspend { suspended: true }` (already implemented)
- Consider adding `suspendReason` for future audits (not yet persisted).

## Communication templates
- **Banner copy** (in-app): “This organization is suspended. Most actions are disabled. Please contact support or update billing to restore access.”
- **Escalation email** (via `/api/support/escalate`): org name/id, plan, requester email, ISO timestamp.

## Edge cases
- If Stripe webhook fails, owner can still unsuspend from `/suspended`.
- Read-only mode avoids accidental writes from stale tabs.
- Billing/Org Settings remain accessible while suspended.

## Checklist for incidents
- [ ] Confirm `suspended` flag on org.
- [ ] Check Stripe status (customer, subscription, invoices).
- [ ] Review recent audit events for abuse patterns.
- [ ] Communicate next steps to owner (use escalation template if needed).
- [ ] Unsuspend when resolved (owner or admin).


## Scheduled re-check (billing)
- Endpoint: `POST /api/admin/cron/recheck-billing` (super/admin only).
- Recommended: add a **Vercel Cron Job** to POST this endpoint daily.
- What it does: re-reads subscriptions from Stripe and toggles `suspended` accordingly.
