# NextShyft — To-Do List

Evaluation-derived tasks. Update this file as items are completed.

---

## Critical (blocking CI / production)

| # | Item | Status |
|---|------|--------|
| 1 | **Add `GET /api/health`** — CI waits on `wait-on .../api/health`; smoke test expects `{ ok: true }`. Route is missing. Exclude from auth so health checks work unauthenticated. | ☑ |
| 2 | **Fix CI workflow** — Deduplicate `name`/`on`; app lives at root (no `apps/web`). Use `pnpm build` / `pnpm start` / `pnpm e2e` at root. | ☑ |
| 3 | **Update docs for root layout** — README, CONTRIBUTING, DEPLOY, seed comments reference `apps/web` and `.env.local` in `apps/web`. Update to root. | ☑ |
| 4 | **Implement `customer.subscription.deleted` in BillingService** — Find org by `stripeSubscriptionId`, set `suspended: true`; add to webhook allowlist if used. | ☑ |

---

## High priority (features / correctness)

| # | Item | Status |
|---|------|--------|
| 5 | **iCal feed from DB** — `GET /api/ical/[userId]`: replace demo event with real user shifts from DB. | ☑ |
| 6 | **Schedule generation** — `POST /api/schedules/[id]/generate`: replace stub with ILP/greedy scheduler + org policy; persist assignments. | ☑ |
| 7 | **Swap manager email** — Replace `manager@example.com` with real org manager/owner addresses from DB. | ☑ |
| 8 | **ILP / scheduler** — Either integrate real LP solver with `encode` or document that greedy `ilp.ts` is intentional. | ☑ |

---

## Medium priority (cleanup, robustness, ops)

| # | Item | Status |
|---|------|--------|
| 9 | **`packages/shared-types`** — Implement shared types or remove if unused. | ☑ |
| 10 | **`ConstraintBadges`** — Implement (e.g. policy/schedule UI) or remove placeholder. | ☑ |
| 11 | **Remove `public/sw.js`** — Duplicate of `service-worker.js`; only the latter is used. Not removed (project: no file deletion). | — |
| 12 | **Rate limit + Upstash** — `lib/rateLimit` uses custom `/incr`/`/expire` paths; use real Upstash REST API or SDK. | ☑ |
| 13 | **Guard `invoice.payment_succeeded` unsuspend** — Avoid `updateById(found?._id)` when `found` is null. | ☑ |
| 14 | **Document recheck-billing cron** — Add cron setup (e.g. Vercel) for `POST /api/admin/cron/recheck-billing`. | ☑ |

---

## Lower priority (quality, security, maintainability)

| # | Item | Status |
|---|------|--------|
| 15 | **Billing UI copy** — Remove or update “Stubbed checkout…” once Stripe is wired. | ☑ |
| 16 | **Policy page validation** — Address `react-hooks/rules-of-hooks`; consider validation on save/blur instead of `useEffect`. | ☑ |
| 17 | **Health + auth** — Ensure `/api/health` is public (middleware exclude) when added. | ☑ |
| 18 | **`TEST_BYPASS_AUTH`** — Document e2e-only; never enable in production. | ☑ |
| 19 | **`suspendReason`** — Add to org schema and suspension flows (PLAYBOOK). | ☐ |
| 20 | **Unit tests** — Add coverage for billing webhook, swap service, schedule generation, invite accept. | ☐ |
| 21 | **Lint in build** — Re-enable ESLint during builds or document why disabled. | ☐ |

---

## Changelog

- 2025-01-29 — Initial list from evaluation.
- 2025-01-29 — Implemented critical items: health route + middleware exclude, CI workflow fix, docs root layout, BillingService `customer.subscription.deleted` + `findByStripeSubscriptionId`, invoice unsuspend null guard.
- 2025-01-29 — Implemented high-priority: iCal from DB, schedule [id] generate + ILP/greedy fallback, swap manager + requester notifications, ILP note.
- 2025-01-29 — Implemented medium-priority: shared-types, ConstraintBadges + policy page, Upstash rate limit fix, recheck-billing cron docs. sw.js not removed (no file deletion).
- 2025-01-29 — Implemented lower-priority: billing UI copy, policy validation (updatePolicy + validate on load/onChange, removed useEffect), TEST_BYPASS_AUTH docs.
