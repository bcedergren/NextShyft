# NextShyft MVP - GitHub Issues Template

**Instructions:** Copy each section below as a separate GitHub issue.  
**Labels:** Apply suggested labels to each issue for easier tracking.

---

## 🚨 CRITICAL PATH ISSUES

### Issue #1: Enhance AI Schedule Generator with Production-Quality Constraints

**Labels:** `critical`, `feature`, `scheduler`  
**Milestone:** MVP Launch  
**Assignee:** [Your Name]

**Description:**
Current greedy algorithm in `lib/scheduler/ilp.ts` is a placeholder. Need production-quality solver that handles real-world constraints.

**Requirements:**
- Respect employee max hours and overtime rules
- Enforce availability matching (shift times must overlap with employee availability)
- Implement fairness scoring (distribute hours equitably across team)
- Handle position requirements (employees must be qualified for position)
- Return structured warnings for unfilled shifts and conflicts

**Acceptance Criteria:**
- [ ] Generator achieves >90% fill rate for schedules with adequate coverage requirements
- [ ] Overtime violations prevented (respects org policy max hours)
- [ ] Unfilled shifts return reason codes (no availability, no qualified staff, etc.)
- [ ] Performance: Generate 50-shift week in <10 seconds

**Files to Modify:**
- `lib/scheduler/ilp.ts`
- `lib/scheduler/encode.ts`

**Test Cases:**
- Schedule with 20 employees, 50 shifts → should achieve 95%+ fill
- Schedule with overtime constraints → should respect 40hr limit
- Schedule with 1 qualified employee → should show warning if overbooked

---

### Issue #2: Wire Schedule Generation API to Real Solver

**Labels:** `critical`, `backend`, `scheduler`  
**Milestone:** MVP Launch  
**Depends on:** #1

**Description:**
`POST /api/schedules/[id]/generate` currently returns stub response. Connect to real ILP solver.

**Requirements:**
- Load org policy (max hours, overtime rules, break requirements)
- Fetch all employees with availability and positions
- Fetch shift templates for date range
- Call ILP solver with constraints
- Return structured assignment data with warnings
- Handle edge cases (no employees, no templates, all unavailable)

**Acceptance Criteria:**
- [ ] API returns real schedule assignments (not stub data)
- [ ] Response includes warnings array (unfilled shifts, overtime, etc.)
- [ ] API handles empty employee list gracefully (returns error)
- [ ] Performance: <10s for typical org (20 employees, 50 shifts)

**Files to Modify:**
- `app/api/schedules/[id]/generate/route.ts`

**Test Cases:**
- Valid org with employees and templates → returns assignments
- Org with no employees → returns 400 error
- Schedule with unfilled shifts → returns warnings in response

---

### Issue #3: Add Schedule Generation Preview UI

**Labels:** `critical`, `frontend`, `scheduler`  
**Milestone:** MVP Launch  
**Depends on:** #2

**Description:**
After generating schedule, show preview before committing. Allow manager to review warnings and adjust.

**Requirements:**
- Show proposed assignments in read-only view
- Display warnings prominently (unfilled shifts, overtime alerts)
- Add "Confirm" and "Cancel" buttons
- Add "Regenerate with adjustments" option
- Show comparison: coverage required vs filled

**Acceptance Criteria:**
- [ ] Preview shows all proposed assignments
- [ ] Warnings displayed with severity (error, warning, info)
- [ ] Manager can confirm and commit to database
- [ ] Manager can cancel and return to manual assignment

**Files to Modify:**
- `app/org/[org]/(manager)/schedule/page.tsx`

**Design Notes:**
- Use Material-UI Alert component for warnings
- Show coverage heatmap (green = filled, yellow = partial, red = unfilled)

---

### Issue #4: Create Schedule Generation Settings Page

**Labels:** `critical`, `frontend`, `settings`  
**Milestone:** MVP Launch

**Description:**
Allow managers to configure AI generation preferences.

**Requirements:**
- Overtime threshold (default: 40 hours)
- Fairness vs coverage priority slider
- Position preference weights (e.g., prioritize senior staff)
- Save settings to org policy

**Acceptance Criteria:**
- [ ] Settings persist in database (use `OrgPolicy` model)
- [ ] Settings affect schedule generation
- [ ] Defaults work for new orgs

**Files to Create:**
- `app/org/[org]/(manager)/generation-settings/page.tsx`

**Files to Modify:**
- `models/OrgPolicy.ts` (add generationSettings field)
- `app/api/policy/route.ts` (handle new fields)

---

### Issue #5: Set Up Vercel Production Environment

**Labels:** `critical`, `devops`, `infrastructure`  
**Milestone:** MVP Launch

**Description:**
Deploy NextShyft to production on Vercel with custom domain.

**Tasks:**
- [ ] Import GitHub repo to Vercel
- [ ] Configure build command: `npm run build`
- [ ] Set root directory if needed
- [ ] Add custom domain (e.g., app.nextshyft.com)
- [ ] Configure SSL certificate
- [ ] Add all environment variables (see ENV_CHECKLIST.md)

**Environment Variables Required:**
- MONGODB_URI (production cluster)
- NEXTAUTH_SECRET, NEXTAUTH_URL
- RESEND_API_KEY, EMAIL_FROM
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO, STRIPE_PRICE_BUSINESS
- VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_CONTACT_EMAIL

**Acceptance Criteria:**
- [ ] Production URL accessible with custom domain
- [ ] SSL certificate active (HTTPS)
- [ ] App loads without errors
- [ ] Health check endpoint returns 200: `/api/health`

**Verification:**
```bash
curl https://YOUR_DOMAIN.com/api/health
# Should return: {"status":"ok"}
```

---

### Issue #6: Set Up Vercel Staging Environment

**Labels:** `critical`, `devops`, `infrastructure`  
**Milestone:** MVP Launch

**Description:**
Create staging environment for QA before production deploys.

**Tasks:**
- [ ] Create `staging` branch
- [ ] Configure Vercel preview deployment
- [ ] Add staging-specific env vars
- [ ] Use staging domain (e.g., staging.nextshyft.com)

**Acceptance Criteria:**
- [ ] Staging URL accessible
- [ ] Deploys automatically on push to `staging` branch
- [ ] Uses separate MongoDB database (nextshyft_staging)
- [ ] Stripe test mode enabled

---

### Issue #7: Configure Stripe Production Webhooks

**Labels:** `critical`, `backend`, `billing`  
**Milestone:** MVP Launch  
**Depends on:** #5

**Description:**
Set up Stripe webhook endpoints for production and staging.

**Tasks:**
- [ ] Create webhook endpoint in Stripe dashboard (production)
- [ ] URL: `https://YOUR_DOMAIN.com/api/billing/webhook`
- [ ] Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
- [ ] Copy webhook secret to Vercel env vars
- [ ] Repeat for staging

**Acceptance Criteria:**
- [ ] Webhook delivers events successfully
- [ ] Org plan updates on checkout completion
- [ ] Org unsuspends on payment success

**Test:**
1. Run test checkout in Stripe
2. Verify webhook received in Vercel logs
3. Verify org plan updated in database

---

### Issue #8: Design Professional Email Templates

**Labels:** `critical`, `design`, `email`  
**Milestone:** MVP Launch

**Description:**
Current email templates are plain text. Need branded, mobile-responsive HTML templates.

**Templates Needed:**
1. **Invite Email** - When manager invites employee
2. **Schedule Published** - When schedule is published
3. **Swap Decision** - When swap approved/denied
4. **Password Reset** - Forgot password flow
5. **Welcome Email** - After signup

**Requirements:**
- Use Resend's React Email or MJML
- Match brand colors (use Material-UI theme)
- Mobile-responsive design
- Include unsubscribe link
- Test on Gmail, Outlook, Apple Mail

**Acceptance Criteria:**
- [ ] All 5 templates designed and implemented
- [ ] Templates render correctly in email clients
- [ ] Unsubscribe link works
- [ ] Deliverability test passes (mail-tester.com score >8/10)

**Files to Create:**
- `emails/InviteEmail.tsx`
- `emails/SchedulePublishedEmail.tsx`
- `emails/SwapDecisionEmail.tsx`
- `emails/PasswordResetEmail.tsx`
- `emails/WelcomeEmail.tsx`

**Files to Modify:**
- `lib/emailTemplates.ts` (update to use new templates)

---

### Issue #9: Implement Email Unsubscribe and Preferences

**Labels:** `critical`, `backend`, `compliance`  
**Milestone:** MVP Launch

**Description:**
Add unsubscribe functionality for CAN-SPAM compliance.

**Requirements:**
- Add unsubscribe token to all email links
- Create `/email-preferences` page
- Allow users to toggle email categories (schedule updates, swap notifications, etc.)
- Store preferences in User model

**Acceptance Criteria:**
- [ ] Unsubscribe link in all emails
- [ ] Preferences page loads and saves
- [ ] Unsubscribed users don't receive emails

**Files to Create:**
- `app/email-preferences/page.tsx`
- `app/api/email-preferences/route.ts`

**Files to Modify:**
- `models/User.ts` (add emailPreferences field)
- `services/NotificationService.ts` (check preferences before sending)

---

### Issue #10: Complete Onboarding Wizard UI

**Labels:** `critical`, `frontend`, `onboarding`  
**Milestone:** MVP Launch

**Description:**
`/org/[org]/(manager)/wizard` page exists but is incomplete. Build full step-by-step wizard.

**Wizard Steps:**
1. **Welcome** - Explain what happens in wizard
2. **Positions** - Create first 3-5 positions (Server, Bartender, etc.)
3. **Invite Team** - Send invites to first employees
4. **Shift Templates** - Create typical shift templates
5. **Policy** - Set max hours, overtime rules
6. **Generate** - Create first schedule with AI
7. **Done** - Show success message, link to dashboard

**Requirements:**
- Stepper UI showing progress
- Each step saves to database
- Can skip and return later
- "Try with demo data" option

**Acceptance Criteria:**
- [ ] New user completes wizard in <5 minutes
- [ ] Each step persists data
- [ ] Can navigate back/forward between steps
- [ ] Wizard completion tracked in Org model

**Files to Modify:**
- `app/org/[org]/(manager)/wizard/page.tsx`
- `models/Org.ts` (add onboardingStep field)

---

### Issue #11: Security Audit and Vulnerability Scan

**Labels:** `critical`, `security`, `devops`  
**Milestone:** MVP Launch

**Description:**
Run security audit before production launch.

**Tasks:**
- [ ] Run Snyk scan: `npm audit`
- [ ] Fix all critical and high vulnerabilities
- [ ] Run OWASP ZAP scan on staging environment
- [ ] Fix identified issues
- [ ] (Optional) Hire third-party pen tester

**Acceptance Criteria:**
- [ ] No critical vulnerabilities in dependencies
- [ ] OWASP ZAP scan shows no high-risk issues
- [ ] Security headers score A+ on securityheaders.com

**Deliverable:**
- Security audit report (PDF)

---

### Issue #12: Implement Rate Limiting on Public Endpoints

**Labels:** `critical`, `security`, `backend`  
**Milestone:** MVP Launch

**Description:**
Protect public endpoints from brute force attacks.

**Requirements:**
- Rate limit login: 5 attempts per 15 minutes per IP
- Rate limit signup: 10 attempts per hour per IP
- Rate limit password reset: 3 attempts per hour per email
- Use Upstash Redis for rate limit storage

**Acceptance Criteria:**
- [ ] Login blocked after 5 failed attempts
- [ ] Rate limit error returns 429 status
- [ ] Rate limit resets after time window

**Files to Modify:**
- `middleware.ts` (add rate limit check)
- `lib/rateLimit.ts` (verify implementation)

**Test:**
```bash
# Should fail after 5 attempts
for i in {1..10}; do
  curl -X POST https://staging.YOUR_DOMAIN.com/api/auth/signin \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

---

### Issue #13: Add Input Validation with Zod Schemas

**Labels:** `critical`, `security`, `backend`  
**Milestone:** MVP Launch

**Description:**
Validate all API inputs to prevent injection attacks and bad data.

**Requirements:**
- Create Zod schemas for all API endpoints
- Validate request body, query params, and path params
- Return 400 error with clear message on validation failure

**Acceptance Criteria:**
- [ ] All API routes use Zod validation
- [ ] Invalid inputs return 400 with validation errors
- [ ] XSS and injection attacks blocked

**Files to Modify:**
- All `app/api/**/route.ts` files

**Example:**
```typescript
// app/api/positions/route.ts
import { z } from 'zod';

const createPositionSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validation = createPositionSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
  }
  // ... rest of handler
}
```

---

### Issue #14: Configure Security Headers in Next.js

**Labels:** `critical`, `security`, `devops`  
**Milestone:** MVP Launch

**Description:**
Add security headers to protect against common web vulnerabilities.

**Headers to Add:**
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin

**Acceptance Criteria:**
- [ ] Security headers present in all responses
- [ ] securityheaders.com score: A+
- [ ] CSP doesn't break app functionality

**Files to Modify:**
- `next.config.js`

**Example:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // ... more headers
        ],
      },
    ];
  },
};
```

---

### Issue #15: Create Legal Pages (Terms, Privacy, Cookie Policy)

**Labels:** `critical`, `legal`, `compliance`  
**Milestone:** MVP Launch

**Description:**
Add required legal pages for GDPR and CAN-SPAM compliance.

**Pages Needed:**
1. **Terms of Service** - `/terms`
2. **Privacy Policy** - `/privacy`
3. **Cookie Policy** - `/cookies`
4. **Data Processing Agreement** - `/dpa` (for enterprise)

**Requirements:**
- Use template from Termly, Iubenda, or similar
- Customize for NextShyft (company name, contact info)
- Include GDPR rights (access, deletion, portability)
- Include CCPA disclosures if targeting California

**Acceptance Criteria:**
- [ ] All 4 pages live and linked in footer
- [ ] Privacy policy covers data collection, storage, and sharing
- [ ] Terms include acceptable use, liability, termination

**Files to Create:**
- `app/(legal)/terms/page.tsx`
- `app/(legal)/privacy/page.tsx`
- `app/(legal)/cookies/page.tsx`
- `app/(legal)/dpa/page.tsx`
- `app/(legal)/layout.tsx` (simple layout)

---

### Issue #16: Implement GDPR Data Export Endpoint

**Labels:** `critical`, `backend`, `compliance`  
**Milestone:** MVP Launch

**Description:**
Allow users to download all their data (GDPR Article 20).

**Requirements:**
- `GET /api/me/export` returns ZIP file with all user data
- Include: user profile, shifts, availability, notifications, audit logs
- Format: JSON files in ZIP
- Complete within 24 hours (for large datasets, send email when ready)

**Acceptance Criteria:**
- [ ] Endpoint returns ZIP file with all user data
- [ ] Data includes all personally identifiable information
- [ ] Export completes in <1 minute for typical user

**Files to Create:**
- `app/api/me/export/route.ts`

**Example Response:**
```
nextshyft-export-2026-04-17.zip
├── profile.json
├── shifts.json
├── availability.json
├── notifications.json
└── audit-log.json
```

---

### Issue #17: Implement GDPR Account Deletion Endpoint

**Labels:** `critical`, `backend`, `compliance`  
**Milestone:** MVP Launch

**Description:**
Allow users to delete their account and all data (GDPR Article 17).

**Requirements:**
- `DELETE /api/me/delete` initiates account deletion
- Soft delete (mark as deleted, anonymize data)
- Delete after 30-day grace period (allow recovery)
- Notify user via email when deletion starts
- Remove from all org schedules and assignments

**Acceptance Criteria:**
- [ ] User can request deletion from profile page
- [ ] Email confirmation sent before deletion
- [ ] 30-day grace period for recovery
- [ ] All PII anonymized after grace period

**Files to Create:**
- `app/api/me/delete/route.ts`

**Files to Modify:**
- `app/org/[org]/(employee)/profile/page.tsx` (add "Delete account" button)

---

## 🎨 POLISH & UX ISSUES

### Issue #18: Mobile UX Audit and Fixes

**Labels:** `high-priority`, `frontend`, `mobile`  
**Milestone:** MVP Launch

**Description:**
Audit all employee pages on mobile devices and fix UX issues.

**Testing Devices:**
- iPhone SE (smallest screen)
- iPhone 14 Pro
- Google Pixel 7
- Samsung Galaxy S23

**Issues to Check:**
- Layout shifts and overflows
- Tap targets <44x44px
- Text readability (font size <16px)
- Horizontal scroll
- Bottom nav overlap with content

**Acceptance Criteria:**
- [ ] No horizontal scroll on 320px width
- [ ] All tap targets ≥44x44px
- [ ] Lighthouse mobile score >90 on all pages
- [ ] Bottom nav doesn't obscure content

**Files to Audit:**
- `app/org/[org]/(employee)/*`

---

### Issue #19: Add Offline Support for Schedule Viewing

**Labels:** `medium-priority`, `frontend`, `pwa`  
**Milestone:** MVP Launch

**Description:**
Allow employees to view schedule when offline.

**Requirements:**
- Cache last-fetched schedule in IndexedDB
- Show cached data with "Last updated" timestamp
- Sync when back online

**Acceptance Criteria:**
- [ ] Schedule loads from cache when offline
- [ ] Changes sync when reconnected
- [ ] Cache expires after 7 days

**Files to Modify:**
- `public/service-worker.js`

**Files to Create:**
- `lib/offlineSync.ts`

---

### Issue #20: Landing Page Optimization

**Labels:** `high-priority`, `frontend`, `marketing`  
**Milestone:** MVP Launch

**Description:**
Enhance landing page for better conversion.

**Improvements:**
- Add customer testimonials (3-5 quotes)
- Add feature comparison table (Free vs Pro vs Business)
- Add trust badges (SSL, SOC2 when available)
- Add demo video or screenshot carousel
- Optimize for SEO (meta tags, structured data)

**Acceptance Criteria:**
- [ ] Page loads in <2s (Lighthouse >90)
- [ ] At least 3 testimonials
- [ ] Feature comparison table with clear CTAs
- [ ] Meta tags and OG image set

**Files to Modify:**
- `app/page.tsx`

**Files to Create:**
- `components/home/Testimonials.tsx`
- `components/home/FeatureComparison.tsx`

---

### Issue #21: Add Analytics Tracking

**Labels:** `high-priority`, `analytics`, `marketing`  
**Milestone:** MVP Launch

**Description:**
Integrate analytics to track user behavior and conversions.

**Provider Options:**
- PostHog (self-hosted, privacy-first)
- Plausible (simple, GDPR-compliant)
- Google Analytics 4 (free, requires cookie consent)

**Events to Track:**
- Page views
- Signups
- Onboarding completion
- Schedule creation
- Invite sent
- Upgrade to paid plan

**Acceptance Criteria:**
- [ ] Analytics provider integrated
- [ ] Events tracked correctly
- [ ] Conversion funnel set up: Landing → Signup → Onboarding → First Schedule

**Files to Modify:**
- `app/providers.tsx` (add analytics provider)

**Files to Create:**
- `lib/analytics.ts` (wrapper for tracking calls)

---

## 📊 MONITORING & PERFORMANCE ISSUES

### Issue #22: Set Up Performance Monitoring

**Labels:** `high-priority`, `devops`, `monitoring`  
**Milestone:** MVP Launch

**Description:**
Monitor production performance and errors.

**Tools:**
- Vercel Analytics (free with Pro plan)
- Sentry (error tracking - optional)

**Metrics to Track:**
- API response times (p50, p95, p99)
- Page load times
- Error rate
- Uptime

**Acceptance Criteria:**
- [ ] Vercel Analytics enabled
- [ ] API p95 response time visible
- [ ] Alerts set for p95 >1s

---

### Issue #23: Load Testing for Schedule Generation

**Labels:** `high-priority`, `performance`, `testing`  
**Milestone:** MVP Launch

**Description:**
Test how system handles concurrent schedule generations.

**Test Scenarios:**
- 10 concurrent generations (typical load)
- 100 concurrent generations (peak load)
- 1000 shifts in single schedule (stress test)

**Tools:**
- k6 or Artillery

**Acceptance Criteria:**
- [ ] 10 concurrent generations: <10s each
- [ ] 100 concurrent generations: no failures
- [ ] Database queries remain <200ms

**Files to Create:**
- `tests/load/schedule-generation.test.ts`

---

### Issue #24: Add Database Indexes

**Labels:** `high-priority`, `database`, `performance`  
**Milestone:** MVP Launch

**Description:**
Create indexes for frequently queried fields.

**Indexes Needed:**
- Users: `orgId`, `email`, `roles`
- Shifts: `orgId`, `scheduleId`, `assignedTo`, `date`
- Availability: `userId`, `orgId`
- Positions: `orgId`

**Acceptance Criteria:**
- [ ] Indexes created in production
- [ ] Query performance improves by >50%
- [ ] Explain plans show index usage

**Files to Create:**
- `scripts/create-indexes.ts`

**Example:**
```typescript
// scripts/create-indexes.ts
import mongoose from 'mongoose';
import User from '../models/User';

await User.collection.createIndex({ orgId: 1, roles: 1 });
await User.collection.createIndex({ email: 1 }, { unique: true });
// ... more indexes
```

---

### Issue #25: Implement Caching Strategy

**Labels:** `medium-priority`, `performance`, `backend`  
**Milestone:** MVP Launch

**Description:**
Cache frequently accessed data to reduce database load.

**Data to Cache:**
- Org settings (TTL: 1 hour)
- Positions (TTL: 1 hour)
- Shift templates (TTL: 1 hour)
- User sessions (TTL: 1 day)

**Cache Provider:**
- Upstash Redis

**Acceptance Criteria:**
- [ ] Org settings cached after first fetch
- [ ] Cache invalidates on update
- [ ] Database queries reduced by >30%

**Files to Create:**
- `lib/cache.ts`

**Example:**
```typescript
// lib/cache.ts
export async function getCachedOrg(orgId: string) {
  const cached = await redis.get(`org:${orgId}`);
  if (cached) return JSON.parse(cached);
  
  const org = await Org.findById(orgId);
  await redis.set(`org:${orgId}`, JSON.stringify(org), { ex: 3600 });
  return org;
}
```

---

## 🧪 TESTING ISSUES

### Issue #26: E2E Test Coverage for Critical Flows

**Labels:** `high-priority`, `testing`, `quality`  
**Milestone:** MVP Launch

**Description:**
Ensure E2E tests cover all critical user flows.

**Flows to Test:**
1. Signup → Onboarding → First schedule
2. Invite employee → Accept → Set availability
3. Generate schedule → Publish → Notify
4. Request swap → Approve → Notify
5. Upgrade to Pro → Checkout → Webhook

**Acceptance Criteria:**
- [ ] All 5 flows have E2E tests
- [ ] Tests run in CI on every PR
- [ ] Tests use realistic test data

**Files to Modify:**
- `tests/e2e/*.spec.ts`

---

### Issue #27: Create Backup and Restore Documentation

**Labels:** `medium-priority`, `devops`, `documentation`  
**Milestone:** MVP Launch

**Description:**
Document backup strategy and restore procedure.

**Content:**
- MongoDB Atlas automated backups (daily, 7-day retention)
- Point-in-time recovery process
- Step-by-step restore instructions
- Test restore checklist

**Acceptance Criteria:**
- [ ] Documentation created
- [ ] Restore procedure tested once

**Files to Create:**
- `docs/BACKUP_RESTORE.md`

---

## 🚀 POST-MVP BACKLOG

### Issue #28: Add Keyboard Shortcuts

**Labels:** `enhancement`, `ux`, `manager`

**Description:**
Add keyboard shortcuts for common manager actions.

**Shortcuts:**
- `G S` - Go to schedule
- `G P` - Go to people
- `N` - New announcement
- `?` - Show help modal

**Files to Create:**
- `lib/useKeyboardShortcuts.ts`

---

### Issue #29: Referral Program

**Labels:** `enhancement`, `growth`, `marketing`

**Description:**
Allow orgs to refer other orgs for rewards.

**Reward:**
- Referrer gets 1 month free Pro when referee upgrades

**Files to Create:**
- `app/org/[org]/(manager)/referrals/page.tsx`
- `app/api/referrals/*`
- `services/ReferralService.ts`

---

### Issue #30: Multi-Week Schedule View

**Labels:** `enhancement`, `feature`, `manager`

**Description:**
Allow managers to view and edit schedules for multiple weeks at once.

**Files to Modify:**
- `app/org/[org]/(manager)/schedule/page.tsx`

---

### Issue #31: Zapier Integration

**Labels:** `enhancement`, `integration`, `api`

**Description:**
Allow users to connect NextShyft to 5000+ apps via Zapier.

**Triggers:**
- Schedule published
- Shift assigned
- Swap requested

**Actions:**
- Create shift
- Assign employee

**Files to Create:**
- `app/api/zapier/*` (webhook endpoints)

---

## 📝 NOTES

**How to Use This File:**
1. Copy each issue section into GitHub Issues
2. Apply suggested labels
3. Assign to team members
4. Link dependencies (e.g., #2 depends on #1)
5. Track in GitHub Projects board

**Suggested Board Columns:**
- Backlog
- Ready
- In Progress
- In Review
- Done

**Priority Guide:**
- `critical` = Must have for MVP launch
- `high-priority` = Important for good UX
- `medium-priority` = Nice to have
- `enhancement` = Post-MVP

---

**Last Updated:** April 17, 2026
