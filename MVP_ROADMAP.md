# NextShyft MVP Roadmap

**Version:** 1.0  
**Last Updated:** April 17, 2026  
**Target:** Production-Ready MVP for Market Launch

---

## Executive Summary

NextShyft is a modern workforce scheduling SaaS platform built with Next.js 14, targeting restaurants, retail, healthcare, and logistics teams. The codebase is **85% complete** with robust architecture already in place. This roadmap outlines the remaining tasks to launch a market-ready MVP.

### Current State Assessment

**✅ COMPLETE (Production Ready):**
- Core authentication system (NextAuth with email/password + magic links)
- Multi-tenant organization architecture with RBAC (Owner/Manager/Lead/Employee)
- Database models and API layer (79 endpoints)
- Manager dashboard with 14+ feature pages
- Employee mobile-first experience
- Position and availability management
- Shift templates and coverage planning
- Schedule creation and assignment UI
- Swap request workflow
- Announcements and notifications system
- Billing integration (Stripe) with webhook handling
- Invite system with email notifications (Resend)
- Web push notifications (VAPID)
- Audit logging
- Organization suspension/reactivation flows
- Demo mode and seeding scripts
- CI/CD pipelines (GitHub Actions)
- E2E test suite (Playwright)
- PWA capabilities with service worker

**🔧 NEEDS WORK (MVP Blockers):**
1. **AI Schedule Generator** - Currently stub implementation
2. **Production Environment Setup** - Missing deployment configuration
3. **Email Templates** - Need professional polish
4. **Landing Page** - Basic but needs conversion optimization
5. **Documentation** - User-facing docs missing
6. **Performance Testing** - Load testing not done
7. **Security Audit** - Penetration testing needed
8. **Analytics** - No usage tracking implemented
9. **Onboarding Flow** - Quick-start wizard incomplete
10. **Mobile App Polish** - Employee UX needs final touches

---

## Phase 1: Critical MVP Functionality (Pre-Launch Blockers)

**Timeline:** High priority - Must complete before launch  
**Goal:** Close functional gaps that prevent users from core workflows

### 1.1 AI Schedule Generator (HIGH PRIORITY)

**Status:** Stub implementation exists at `lib/scheduler/ilp.ts`  
**Gap:** Greedy algorithm is placeholder; not production-quality

**Tasks:**
- [ ] **T1.1.1** - Enhance ILP solver to handle real-world constraints
  - Current greedy solver in `lib/scheduler/ilp.ts` needs improvement
  - Add constraint validation (max hours, overtime rules, breaks)
  - Implement fairness scoring (distribute hours equitably)
  - Handle conflicts and unfilled shifts gracefully
  - **Files:** `lib/scheduler/ilp.ts`, `lib/scheduler/encode.ts`
  
- [ ] **T1.1.2** - Wire schedule generation to UI
  - Currently `POST /api/schedules/[id]/generate` returns stub response
  - Connect to real ILP solver with org policy
  - Return structured assignment data with warnings/conflicts
  - **Files:** `app/api/schedules/[id]/generate/route.ts`
  
- [ ] **T1.1.3** - Add generation preview and confirmation flow
  - Show proposed assignments before committing
  - Display warnings (unfilled shifts, overtime, conflicts)
  - Allow manager to adjust before finalizing
  - **Files:** `app/org/[org]/(manager)/schedule/page.tsx`
  
- [ ] **T1.1.4** - Create generation settings page
  - Overtime thresholds
  - Fairness vs coverage priority slider
  - Position preference weights
  - **Files:** Create `app/org/[org]/(manager)/generation-settings/page.tsx`

**Acceptance Criteria:**
- Manager can generate a week schedule from templates in < 10 seconds
- Generator respects availability, positions, max hours, and org policy
- Unfilled shifts are clearly flagged with reasons
- Generated schedule achieves >90% fill rate for typical use cases

---

### 1.2 Production Deployment Setup

**Status:** `DEPLOY.md` exists but no live staging/production environment  
**Gap:** No deployed instance; Vercel config incomplete

**Tasks:**
- [ ] **T1.2.1** - Set up Vercel production project
  - Import GitHub repo to Vercel
  - Configure build settings for Next.js 14
  - Set up production domain
  - **Deliverable:** Live production URL
  
- [ ] **T1.2.2** - Set up Vercel staging environment
  - Create preview deployment for `staging` branch
  - Configure staging-specific env vars
  - **Deliverable:** Staging URL for QA
  
- [ ] **T1.2.3** - Configure all environment variables
  - MongoDB Atlas production cluster
  - Resend API (production domain verified)
  - Stripe live keys + webhook endpoint
  - VAPID keys for web push
  - NextAuth production URL and secrets
  - **Files:** Vercel dashboard, `ENV_CHECKLIST.md` (update)
  
- [ ] **T1.2.4** - Set up Stripe webhook endpoints
  - Production: `POST https://YOUR_DOMAIN.com/api/billing/webhook`
  - Staging: `POST https://staging.YOUR_DOMAIN.com/api/billing/webhook`
  - Test webhook events (checkout, subscription changes)
  
- [ ] **T1.2.5** - Configure DNS and SSL
  - Point domain to Vercel
  - Verify SSL certificate
  - Set up www redirect
  
- [ ] **T1.2.6** - Database migration strategy
  - Create MongoDB Atlas production cluster with backups
  - Document index creation
  - Create seeding script for initial positions/templates
  - **Files:** Create `scripts/migrate-prod.ts`

**Acceptance Criteria:**
- Production app loads at custom domain with valid SSL
- All third-party integrations working (email, SMS, payments)
- Staging environment mirrors production for QA
- Zero-downtime deployments via Vercel
- Database backups scheduled daily

---

### 1.3 Email Template Polish

**Status:** Basic templates exist in `emails/` folder  
**Gap:** Need professional design and mobile optimization

**Tasks:**
- [ ] **T1.3.1** - Design professional email templates
  - Invite email (current: basic text)
  - Schedule published notification
  - Swap request decision
  - Password reset
  - Use Resend's React Email or MJML
  - **Files:** `emails/*.tsx` or create new template system
  
- [ ] **T1.3.2** - Add email previews and testing
  - Create `/api/email/preview` endpoint
  - Test rendering on major email clients (Gmail, Outlook, Apple Mail)
  - Ensure mobile-responsive design
  
- [ ] **T1.3.3** - Implement unsubscribe and preference management
  - Add unsubscribe link to all emails
  - Create `/email-preferences` page
  - Store preferences in User model
  - **Files:** `models/User.ts` (add emailPrefs field), create `app/email-preferences/page.tsx`

**Acceptance Criteria:**
- All transactional emails use branded, mobile-responsive templates
- Email deliverability >95% (test with mail-tester.com)
- Unsubscribe links comply with CAN-SPAM
- Preview endpoint works for all template types

---

### 1.4 User Onboarding Wizard

**Status:** Basic signup exists; wizard page at `/org/[org]/(manager)/wizard` is incomplete  
**Gap:** New users don't have guided setup flow

**Tasks:**
- [ ] **T1.4.1** - Complete onboarding wizard UI
  - Step 1: Create first positions (e.g., Server, Bartender, Host)
  - Step 2: Invite initial team members
  - Step 3: Set up shift templates
  - Step 4: Configure scheduling policy (max hours, overtime)
  - Step 5: Generate first schedule
  - **Files:** `app/org/[org]/(manager)/wizard/page.tsx`
  
- [ ] **T1.4.2** - Add wizard progress tracking
  - Store wizard completion state in Org model
  - Show progress bar
  - Allow skipping and returning later
  - **Files:** `models/Org.ts` (add onboardingStep field)
  
- [ ] **T1.4.3** - Create sample data option
  - "Try with demo data" button
  - Pre-populate positions, templates, and sample employees
  - Let users explore before committing real data
  - **Files:** Extend `lib/demoSeed.ts`

**Acceptance Criteria:**
- New org owner completes wizard in <5 minutes
- Wizard creates functional org ready for first schedule
- Skip option available for advanced users
- Sample data provides realistic preview

---

## Phase 2: User Experience & Polish (Pre-Launch Nice-to-Haves)

**Timeline:** Medium priority - Improves user satisfaction  
**Goal:** Professional polish for market-ready product

### 2.1 Landing Page Optimization

**Status:** Basic landing exists at `app/page.tsx`  
**Gap:** Generic copy, no social proof, weak CTAs

**Tasks:**
- [ ] **T2.1.1** - Enhance landing page copy
  - Add customer testimonials section (placeholders if needed)
  - Feature comparison table (Free vs Pro vs Business)
  - Add trust badges (SSL, SOC2 compliance when available)
  - **Files:** `app/page.tsx`
  
- [ ] **T2.1.2** - Add interactive demo preview
  - Embedded video or screenshot carousel
  - Live demo access (use existing `/demo` route)
  - **Files:** `app/page.tsx`, `components/home/DemoCarousel.tsx` (create)
  
- [ ] **T2.1.3** - Optimize for SEO
  - Meta tags (title, description, OG image)
  - Structured data (schema.org)
  - Sitemap.xml generation
  - **Files:** `app/layout.tsx`, create `app/sitemap.ts`
  
- [ ] **T2.1.4** - A/B test different CTAs
  - Track signup conversion with analytics (see Phase 3)
  - Test "Start Free Trial" vs "Get Started" vs "Try Demo"

**Acceptance Criteria:**
- Landing page loads in <2s (Lighthouse score >90)
- Mobile-first design with responsive images
- Clear value proposition above the fold
- At least 3 customer testimonials or case studies

---

### 2.2 Employee Mobile Experience Polish

**Status:** Mobile bottom nav exists; core features work  
**Gap:** Some UI quirks on small screens

**Tasks:**
- [ ] **T2.2.1** - Audit all employee pages on mobile
  - Test on iPhone SE, iPhone 14 Pro, Pixel 7, Galaxy S23
  - Fix layout shifts and overflow issues
  - Ensure tap targets are ≥44x44px
  - **Files:** `app/org/[org]/(employee)/*`
  
- [ ] **T2.2.2** - Optimize calendar and schedule views
  - Month view should scroll smoothly
  - Shift details should use bottom sheet on mobile
  - Add pull-to-refresh for schedule updates
  - **Files:** `app/org/[org]/(employee)/myschedule/page.tsx`
  
- [ ] **T2.2.3** - Improve availability grid UX
  - Make time slot selection easier (larger tap targets)
  - Add "Copy Monday to All" shortcut (already exists, verify UX)
  - **Files:** `app/org/[org]/(employee)/availability/page.tsx`
  
- [ ] **T2.2.4** - Add offline support for schedule viewing
  - Cache last-fetched schedule in IndexedDB
  - Show cached data when offline
  - Sync changes when back online
  - **Files:** `public/service-worker.js`, create `lib/offlineSync.ts`

**Acceptance Criteria:**
- All employee pages score >90 on mobile Lighthouse
- Offline schedule viewing works for last 30 days
- No horizontal scroll on 320px width (iPhone SE)

---

### 2.3 Manager Dashboard Enhancements

**Status:** Functional but could be more insightful  
**Gap:** Missing key metrics and quick actions

**Tasks:**
- [ ] **T2.3.1** - Add dashboard widgets
  - Upcoming shifts requiring approval
  - Labor cost forecast for current period
  - Coverage gaps (unfilled shifts)
  - Recent swap requests
  - **Files:** `app/org/[org]/dashboard/page.tsx`
  
- [ ] **T2.3.2** - Create quick action buttons
  - "Create this week's schedule" (one-click)
  - "Invite new employee"
  - "View pending swaps"
  - **Files:** `app/org/[org]/dashboard/page.tsx`
  
- [ ] **T2.3.3** - Add keyboard shortcuts
  - `G S` - Go to schedule
  - `G P` - Go to people
  - `N` - New announcement
  - `?` - Show shortcuts help modal
  - **Files:** Create `lib/useKeyboardShortcuts.ts` hook

**Acceptance Criteria:**
- Manager sees top 3 action items on dashboard load
- Dashboard loads in <1s with cached data
- Keyboard shortcuts work across all manager pages

---

### 2.4 Notifications and Communication

**Status:** In-app notifications work; push and email implemented  
**Gap:** SMS integration (Twilio) not fully tested

**Tasks:**
- [ ] **T2.4.1** - Test SMS notifications end-to-end
  - Verify Twilio integration works in production
  - Test with international numbers if targeting global markets
  - Add SMS opt-in flow (required for compliance)
  - **Files:** `services/NotificationService.ts`, `app/api/me/phone/*`
  
- [ ] **T2.4.2** - Add notification batching
  - Don't send 10 emails for 10 shifts; batch into one digest
  - Group notifications by type and time window
  - **Files:** `services/NotificationService.ts`
  
- [ ] **T2.4.3** - Create notification preferences page
  - Per-channel toggles (in-app, email, SMS, push)
  - Per-event toggles (schedule published, swap approved, etc.)
  - **Files:** Already exists in User model, add UI at `app/org/[org]/(employee)/notification-settings/page.tsx`

**Acceptance Criteria:**
- SMS delivery confirmed to US numbers
- Notification preferences persist correctly
- No duplicate notifications sent
- Opt-in flow meets TCPA compliance (US)

---

## Phase 3: Marketing & Growth Foundations

**Timeline:** Low priority for MVP launch but needed for growth  
**Goal:** Track metrics and enable marketing campaigns

### 3.1 Analytics Integration

**Status:** No analytics currently implemented  
**Gap:** Can't measure user behavior or conversions

**Tasks:**
- [ ] **T3.1.1** - Integrate analytics provider
  - Choose: PostHog (self-hosted), Plausible (privacy-first), or Google Analytics 4
  - Track page views, signups, schedule creations
  - **Files:** `app/providers.tsx`, create `lib/analytics.ts`
  
- [ ] **T3.1.2** - Define key metrics
  - User activation: Created first schedule within 7 days
  - DAU/WAU/MAU for organizations
  - Feature adoption rates (swap requests, AI generator, etc.)
  - **Files:** Create `docs/METRICS.md`
  
- [ ] **T3.1.3** - Set up conversion funnels
  - Landing page → Signup → Onboarding → First schedule → Invite team
  - Track drop-off at each stage
  
- [ ] **T3.1.4** - Add admin metrics dashboard
  - Page already exists at `app/admin/metrics/page.tsx`
  - Wire to real data (currently shows mock charts)
  - **Files:** `app/admin/metrics/page.tsx`, `app/api/admin/metrics/route.ts`

**Acceptance Criteria:**
- Analytics dashboard shows real-time MAU, signups, and active orgs
- Conversion funnel tracked from landing to first schedule
- GDPR-compliant (cookie consent if using GA)

---

### 3.2 SEO and Content Marketing Setup

**Status:** Basic SEO exists; no blog or content  
**Gap:** No organic search strategy

**Tasks:**
- [ ] **T3.2.1** - Create blog infrastructure
  - Add `/blog` route with MDX support
  - Write 3-5 launch articles (e.g., "10 Shift Scheduling Best Practices")
  - **Files:** Create `app/blog/*`
  
- [ ] **T3.2.2** - Optimize core pages for SEO
  - Landing page targets "workforce scheduling software"
  - Features page targets "employee shift planning"
  - Pricing page (create) targets "scheduling app pricing"
  - **Files:** `app/page.tsx`, create `app/pricing/page.tsx`, `app/features/page.tsx`
  
- [ ] **T3.2.3** - Set up Google Search Console and Bing Webmaster
  - Submit sitemap
  - Monitor indexing status
  - Fix crawl errors

**Acceptance Criteria:**
- Blog supports MDX with syntax highlighting
- At least 5 blog posts published at launch
- Landing page ranks for 1-2 target keywords within 30 days

---

### 3.3 Referral and Affiliate Program (Optional)

**Status:** Not implemented  
**Gap:** No built-in viral growth mechanism

**Tasks:**
- [ ] **T3.3.1** - Add referral link generation
  - Each org gets a unique referral code
  - Track signups via referral code
  - **Files:** `models/Org.ts` (add referralCode), create `app/org/[org]/(manager)/referrals/page.tsx`
  
- [ ] **T3.3.2** - Implement referral rewards
  - Give referrer 1 month free Pro when referee upgrades
  - Show referral dashboard with tracking
  - **Files:** `app/api/referrals/*`, `services/ReferralService.ts` (create)

**Acceptance Criteria:**
- Referral code tracks at least 10% of signups
- Reward credits applied automatically via Stripe
- Referral dashboard shows conversions

---

## Phase 4: Compliance, Security & Scale

**Timeline:** Critical before handling real customer data at scale  
**Goal:** Production-grade security and legal compliance

### 4.1 Security Hardening

**Status:** Basic auth and RBAC in place; needs audit  
**Gap:** No penetration testing or security review

**Tasks:**
- [ ] **T4.1.1** - Conduct security audit
  - Hire third-party pen tester or use automated tools (Snyk, OWASP ZAP)
  - Fix all high/critical vulnerabilities
  - **Deliverable:** Security audit report
  
- [ ] **T4.1.2** - Implement rate limiting at scale
  - Current: `lib/rateLimit.ts` exists (uses Upstash Redis)
  - Add rate limits to all public API endpoints
  - Protect signup, login, password reset from brute force
  - **Files:** `middleware.ts`, `lib/rateLimit.ts`
  
- [ ] **T4.1.3** - Add input validation and sanitization
  - Use Zod schemas for all API inputs
  - Prevent XSS, SQL injection, NoSQL injection
  - **Files:** All `app/api/**/route.ts` files
  
- [ ] **T4.1.4** - Set up security headers
  - CSP, HSTS, X-Frame-Options, etc.
  - Use Next.js security headers config
  - **Files:** `next.config.js`
  
- [ ] **T4.1.5** - Enable 2FA for admin accounts
  - TOTP-based 2FA for Owner and Super Admin roles
  - **Files:** Create `app/org/[org]/(manager)/security/page.tsx`, `app/api/auth/totp/*`

**Acceptance Criteria:**
- Security score of A+ on securityheaders.com
- No critical vulnerabilities in dependency scan
- Rate limiting prevents >10 login attempts per minute
- 2FA enforced for all Owner accounts

---

### 4.2 Legal and Compliance

**Status:** No legal pages exist  
**Gap:** Missing Terms of Service, Privacy Policy, DPA

**Tasks:**
- [ ] **T4.2.1** - Create legal pages
  - Terms of Service
  - Privacy Policy (GDPR, CCPA compliant)
  - Cookie Policy
  - Data Processing Agreement (DPA) for enterprise customers
  - **Files:** Create `app/(legal)/terms/page.tsx`, `app/(legal)/privacy/page.tsx`, etc.
  
- [ ] **T4.2.2** - Implement cookie consent banner
  - Only required if using GA or third-party tracking cookies
  - Use a library like `react-cookie-consent`
  - **Files:** `app/layout.tsx`
  
- [ ] **T4.2.3** - Add data export and deletion
  - GDPR Article 20 (right to data portability)
  - GDPR Article 17 (right to erasure)
  - Create "Download my data" and "Delete account" options
  - **Files:** Create `app/api/me/export/route.ts`, `app/api/me/delete/route.ts`
  
- [ ] **T4.2.4** - Create admin data access logs
  - Track when admins view sensitive user data
  - Log to audit trail (already exists)
  - **Files:** Extend `services/AuditService.ts`

**Acceptance Criteria:**
- Legal pages reviewed by attorney (or use template from Termly/Iubenda)
- Cookie consent works on EU visitors
- Data export delivers JSON within 24 hours
- Data deletion completes within 30 days

---

### 4.3 Performance and Scalability Testing

**Status:** No load testing done  
**Gap:** Unknown how app performs under load

**Tasks:**
- [ ] **T4.3.1** - Set up performance monitoring
  - Use Vercel Analytics or Sentry Performance
  - Track API response times, page load times
  - Alert on p95 latency >1s
  - **Files:** `app/layout.tsx` (add monitoring SDK)
  
- [ ] **T4.3.2** - Conduct load testing
  - Simulate 100 concurrent managers generating schedules
  - Test database query performance
  - Identify bottlenecks (likely ILP generation, DB writes)
  - **Files:** Create `tests/load/schedule-generation.test.ts` (use k6 or Artillery)
  
- [ ] **T4.3.3** - Optimize database queries
  - Add indexes to frequently queried fields (orgId, userId, date ranges)
  - Use MongoDB aggregation pipelines for reports
  - **Files:** Create `scripts/create-indexes.ts`
  
- [ ] **T4.3.4** - Implement caching strategy
  - Cache org settings, positions, templates in Redis (Upstash)
  - Cache user sessions to reduce DB hits
  - **Files:** Create `lib/cache.ts`

**Acceptance Criteria:**
- App handles 500 concurrent users without degradation
- API p95 response time <500ms
- Database indexes reduce query time by 50%
- Page load time <1.5s on 3G connection

---

### 4.4 Backup and Disaster Recovery

**Status:** MongoDB Atlas provides automated backups  
**Gap:** No tested restore procedure

**Tasks:**
- [ ] **T4.4.1** - Document backup strategy
  - MongoDB Atlas: Daily snapshots retained 7 days
  - Continuous backups with point-in-time recovery
  - **Files:** Create `docs/BACKUP_RESTORE.md`
  
- [ ] **T4.4.2** - Test restore procedure
  - Create test restore to verify backups work
  - Document step-by-step restore process
  - **Deliverable:** Successful test restore
  
- [ ] **T4.4.3** - Implement application-level exports
  - Daily export of critical data to S3/Backblaze
  - Export org metadata, users, schedules (not shifts)
  - **Files:** Create `scripts/backup-to-s3.ts`, set up Vercel Cron

**Acceptance Criteria:**
- Restore procedure tested quarterly
- RTO (recovery time objective) <2 hours
- RPO (recovery point objective) <1 hour

---

## Phase 5: Post-Launch Iteration (Post-MVP)

**Timeline:** After initial launch; based on user feedback  
**Goal:** Add features based on real user demand

### 5.1 Advanced Scheduling Features

**Tasks (Backlog):**
- [ ] Multi-week scheduling view
- [ ] Recurring schedules (auto-copy previous week)
- [ ] Shift bidding (employees bid on open shifts)
- [ ] Advanced forecasting (predict busy periods from historical data)
- [ ] Integration with POS systems (import sales data for labor optimization)
- [ ] Time clock integration (track actual hours worked vs scheduled)

---

### 5.2 Team Collaboration Features

**Tasks (Backlog):**
- [ ] Manager-to-manager chat
- [ ] Shift notes and handoff logs
- [ ] Team messaging (per-position channels)
- [ ] File sharing (upload policy documents, training materials)

---

### 5.3 Reporting and Analytics

**Tasks (Backlog):**
- [ ] Labor cost reports (actual vs budgeted)
- [ ] Employee hours trending (who's close to overtime)
- [ ] Position utilization reports
- [ ] Compliance reports (break violations, consecutive shift warnings)
- [ ] Custom report builder

---

### 5.4 Integrations and API

**Tasks (Backlog):**
- [ ] Public REST API for third-party integrations
- [ ] Zapier integration
- [ ] Slack notifications
- [ ] Google Calendar sync
- [ ] Microsoft Teams integration
- [ ] QuickBooks/Gusto payroll export

---

## Success Metrics for MVP Launch

### Launch Readiness Checklist

**Must-Have (Blockers):**
- [ ] AI schedule generator produces usable schedules
- [ ] Production deployment live with custom domain
- [ ] All critical user flows tested E2E
- [ ] Payment processing works (test and live modes)
- [ ] Email notifications deliver reliably
- [ ] Mobile UX tested on iOS and Android
- [ ] Security audit completed with no critical issues
- [ ] Legal pages live (Terms, Privacy)
- [ ] Data export and deletion work (GDPR compliance)

**Nice-to-Have (Polish):**
- [ ] Onboarding wizard guides new users
- [ ] Landing page optimized for conversion
- [ ] Blog with 5+ launch articles
- [ ] Referral program live
- [ ] Analytics tracking signups and retention
- [ ] SMS notifications working

---

### Target Metrics (First 90 Days)

**Acquisition:**
- 100 signups
- 20 paying customers (Pro or Business plan)
- 5% conversion rate (landing page visitor → signup)

**Activation:**
- 70% of signups complete onboarding wizard
- 50% generate first schedule within 7 days
- 30% invite at least 3 team members

**Retention:**
- 60% WAU (weekly active users) in month 1
- 40% retention at day 30
- <5% churn rate per month

**Revenue:**
- $2,000 MRR by end of month 3
- Average plan: $79/month (Pro tier)

---

## Development Priorities

### Critical Path (MVP Blockers)

**Week 1-2:**
1. Complete AI schedule generator (T1.1.1 - T1.1.4)
2. Set up production deployment (T1.2.1 - T1.2.6)
3. Polish email templates (T1.3.1 - T1.3.3)

**Week 3-4:**
4. Complete onboarding wizard (T1.4.1 - T1.4.3)
5. Security hardening (T4.1.1 - T4.1.5)
6. Legal pages and compliance (T4.2.1 - T4.2.3)

**Week 5-6:**
7. Mobile UX polish (T2.2.1 - T2.2.4)
8. Landing page optimization (T2.1.1 - T2.1.4)
9. Final E2E testing and bug fixes

**Week 7-8:**
10. Performance testing and optimization (T4.3.1 - T4.3.4)
11. Analytics integration (T3.1.1 - T3.1.4)
12. Soft launch with beta users

---

## Risk Assessment

### High-Risk Items

**1. AI Schedule Generator Complexity**
- **Risk:** Algorithm doesn't produce acceptable schedules
- **Mitigation:** Implement fallback to manual scheduling; iterate based on user feedback
- **Contingency:** Hire contractor with OR/ILP expertise if needed

**2. Production Deployment Issues**
- **Risk:** Downtime or data loss during migration
- **Mitigation:** Test on staging first; MongoDB Atlas handles backups
- **Contingency:** Keep dev environment running as backup

**3. Low User Adoption**
- **Risk:** Users sign up but don't complete onboarding
- **Mitigation:** User interviews to identify friction points
- **Contingency:** Offer white-glove onboarding for first 20 customers

**4. Payment Processing Failures**
- **Risk:** Stripe webhook issues cause billing errors
- **Mitigation:** Extensive webhook testing; monitor Stripe logs
- **Contingency:** Manual billing reconciliation process

---

## Resource Requirements

### Development Team

**Recommended:**
- 1 Full-stack developer (primary): 40 hours/week
- 1 Frontend specialist (UX polish): 20 hours/week
- 1 DevOps/Security consultant: 10 hours (one-time audit)

**Solo Founder Path:**
- Focus on critical path tasks (Week 1-4)
- Hire contractors for security audit and legal docs
- Use pre-built templates for email and landing page
- Launch with "good enough" UX, iterate post-launch

### Budget (If Outsourcing)

- Security audit: $2,000 - $5,000
- Legal docs (attorney review): $1,500 - $3,000
- Email templates (designer): $500 - $1,000
- Landing page optimization: $1,000 - $2,000
- **Total:** $5,000 - $11,000

### Infrastructure Costs (Monthly)

- Vercel Pro: $20/month
- MongoDB Atlas M10: $57/month
- Resend (10k emails): $20/month
- Stripe fees: 2.9% + $0.30 per transaction
- Upstash Redis: $10/month
- **Total:** ~$110/month base + transaction fees

---

## Next Steps

### Immediate Actions (This Week)

1. **Prioritize tasks:** Review this roadmap and assign priority scores
2. **Set up project management:** Create GitHub issues for all tasks
3. **Deploy staging environment:** Get T1.2.2 done first for testing
4. **Begin work on AI scheduler:** T1.1.1 is the biggest technical lift

### Communication Plan

- **Weekly updates:** Share progress on critical path tasks
- **Monthly roadmap review:** Adjust priorities based on learnings
- **Beta user feedback:** Start collecting waitlist for early access

### Success Criteria

**MVP is "launch-ready" when:**
- All "Must-Have" checklist items complete
- 5 beta users successfully use the app for 2+ weeks
- Zero critical bugs in production
- Legal compliance verified
- Payment flow tested end-to-end

---

## Appendix

### Key Files Reference

**Critical Files for MVP:**
- `lib/scheduler/ilp.ts` - Schedule generation logic
- `app/api/schedules/[id]/generate/route.ts` - Generation endpoint
- `app/org/[org]/(manager)/wizard/page.tsx` - Onboarding wizard
- `emails/*.tsx` - Email templates
- `app/page.tsx` - Landing page
- `middleware.ts` - Auth and rate limiting
- `next.config.js` - Security headers

**Documentation Files:**
- `README.md` - Setup instructions
- `DEPLOY.md` - Deployment guide
- `ENV_CHECKLIST.md` - Environment variables
- `TEST_ACCOUNTS.md` - Test users
- `CONTRIBUTING.md` - Development guidelines
- `PLAYBOOK.md` - Suspension/reactivation process

### Technology Stack Summary

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Material-UI (MUI) v7
- TypeScript
- Framer Motion (animations)

**Backend:**
- Next.js API Routes
- MongoDB (Mongoose ODM)
- NextAuth.js (authentication)
- Tsyringe (dependency injection)

**Third-Party Services:**
- Resend (email)
- Twilio (SMS - optional)
- Stripe (billing)
- MongoDB Atlas (database)
- Vercel (hosting)
- Upstash Redis (rate limiting, caching)

**Testing:**
- Jest (unit tests)
- Playwright (E2E tests)
- GitHub Actions (CI/CD)

---

## Changelog

**v1.0 - April 17, 2026**
- Initial roadmap created
- Based on comprehensive codebase analysis
- Identified 85% feature completeness
- Prioritized AI scheduler and deployment as critical path

---

**Questions or need clarification on any task? See CONTRIBUTING.md or open a GitHub Discussion.**
