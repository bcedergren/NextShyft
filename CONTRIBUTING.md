
# Contributing to NextShyft

Thanks for helping make scheduling less painful! This doc keeps PRs smooth and productive.

## TL;DR
- **Branch:** `feature/<short-name>`
- **Commits:** Conventional Commit style (e.g., `feat: add swap decision service`)
- **PRs:** Small, focused, with screenshots/GIFs for UI changes
- **Tests:** Add/adjust unit tests for services; run `pnpm test`
- **Typecheck & Lint:** Make sure `pnpm typecheck` passes; lint if present

## Design principles
- **SOLID** everywhere: thin routes, services use repos, repos wrap Mongoose.
- **Dependency inversion**: routes depend on interfaces; no hard-coding vendors.
- **Small interfaces**: `IEmailSender`, `IPushSender`, `I*Repository`.
- **Mobile-first**: Polish small screens first.

## Code style
- **TypeScript** strict-ish (no `any` unless unavoidable).
- Keep React components presentational; push logic to hooks/services.
- **Naming**: `Service` for use cases, `Repository` for persistence adapters.

## Commits (Conventional)
- `feat:` new user-visible features
- `fix:` bug fix
- `chore:` tooling / deps
- `refactor:` code movement without behavior change
- `test:` tests only
- `docs:` docs only

## PR checklist
- [ ] Descriptive title + issue link
- [ ] Screenshots/GIFs for UI changes
- [ ] Unit tests for new services, integration tests when touching DB flows
- [ ] `pnpm test` and `pnpm typecheck` pass
- [ ] No hard-coded secrets; env vars documented
- [ ] If adding routes: manager/owner guard applied where needed
- [ ] If touching limits/billing: soft-cap UX and checkout still work

## Running the app
```bash
pnpm i
pnpm dev
```
Run tests:
```bash
pnpm --filter apps/web test
```

## Env quickstart (see ENV_CHECKLIST.md for details)
- `MONGODB_URI` (Atlas)
- `RESEND_API_KEY`, `EMAIL_FROM`
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`, `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- **Optional:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` for rate limit at scale

---

Questions? Open a Discussion or tag `@maintainers` in your PR.
